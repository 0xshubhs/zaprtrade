"use client";

import { useRef, useEffect, useState, useMemo, useContext } from "react";
import { Box, Text } from "@chakra-ui/react";
import { fetchHbarPrice } from "../../lib/hbarPrice";
import { useSelectedToken } from "../../contexts/SelectedTokenContext";

const POLL_MS = 15_000;
const MAX_POINTS = 120;
const PAST_DURATION_SEC = 5 * 60;
const PIXELS_PER_SECOND = 0.85;
const GRID_INTERVAL_MS = 60_000;
const FLOW_BASE_RANGE = 0.0025;
const DRIFT_PER_SEC = 0.00003;
const BOTTOM_PAD = 26;

const STROKE_FOREGROUND = "rgba(0, 0, 0, 0.2)";
const STROKE_PRIMARY = "#043BCB";
const FILL_PRIMARY = "#043BCB";
const TRADE_UP = "#22c55e";
const TRADE_DOWN = "#ef4444";
const FROZEN_PATTERN = "rgba(113, 113, 122, 0.2)";

/** Compute dynamic PRICE_INTERVAL and PRICE_VIEW_HALF based on current price. */
function getPriceScales(price: number) {
  if (price <= 0) return { interval: 0.003, viewHalf: 0.012 };
  // ~0.2% of price per band, rounded to a nice number
  const raw = price * 0.002;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  let nice: number;
  if (normalized <= 1.5) nice = 1;
  else if (normalized <= 3.5) nice = 2.5;
  else if (normalized <= 7.5) nice = 5;
  else nice = 10;
  const interval = nice * magnitude;
  const viewHalf = interval * 4; // 8 bands visible
  return { interval, viewHalf };
}

interface PricePoint {
  timestamp: number;
  price: number;
}

interface Cell {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  multiplier: number;
  probability: number;
  isUp: boolean;
  status: "future" | "active" | "won" | "lost";
  priceTop: number;
  priceBottom: number;
  hasDemoBet?: boolean;
  demoPayout?: number;
}

export interface CellBetInfo {
  cellId: string;
  direction: "UP" | "DOWN";
  multiplier: number;
  priceTop: number;
  priceBottom: number;
}

interface TradeChartBoxProps {
  compact?: boolean;
  onCellClick?: (cell: CellBetInfo) => void;
  betAmount?: number;
  pendingCellIds?: Set<string>;
  resolvedCells?: Map<string, { won: boolean; multiplier: number }>;
  demo?: boolean;
}

const DEMO_TICK_MS = 350;

const BET_GREEN = "#22c55e";
const BET_RED = "#ef4444";

export function TradeChartBox({
  compact = false,
  onCellClick,
  betAmount = 0,
  pendingCellIds,
  resolvedCells,
  demo = false,
}: TradeChartBoxProps) {
  const { token } = useSelectedToken();
  const DEMO_BASE_PRICE = token.demoBasePrice;
  const DEMO_STEP = DEMO_BASE_PRICE * 0.02;

  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackH = compact ? 320 : 360;
  const [dimensions, setDimensions] = useState({ width: 600, height: fallbackH });
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [now, setNow] = useState(() => Date.now());
  const startTimeRef = useRef(Date.now());
  const yDomainRef = useRef({ min: 0, max: 100, initialized: false });
  const driftRef = useRef(0);
  const lastAnimTsRef = useRef(Date.now());
  const lastHitCellIdRef = useRef<string | null>(null);
  const [hitEffects, setHitEffects] = useState<{ key: string; amount: number; x: number; y: number }[]>([]);

  // Reset chart state when token changes
  useEffect(() => {
    setPoints([]);
    setCurrentPrice(0);
    yDomainRef.current = { min: 0, max: 100, initialized: false };
    driftRef.current = 0;
  }, [token.id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const w = width > 0 ? width : 600;
      const h = height > 0 ? height : fallbackH;
      setDimensions({ width: w, height: h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallbackH]);

  const demoPriceRef = useRef(DEMO_BASE_PRICE);
  useEffect(() => {
    if (!demo) return;
    demoPriceRef.current = DEMO_BASE_PRICE;
    const seedPoints: PricePoint[] = [];
    const t0 = Date.now();
    for (let i = 0; i < 25; i++) {
      const t = t0 - (25 - i) * 200;
      const p = DEMO_BASE_PRICE + (Math.random() - 0.5) * DEMO_BASE_PRICE * 0.12;
      demoPriceRef.current = p;
      seedPoints.push({ timestamp: t, price: p });
    }
    setCurrentPrice(demoPriceRef.current);
    setPoints(seedPoints);

    const id = setInterval(() => {
      const prev = demoPriceRef.current;
      const minP = DEMO_BASE_PRICE * 0.9;
      const maxP = DEMO_BASE_PRICE * 1.1;
      const next = Math.max(minP, Math.min(maxP, prev + (Math.random() - 0.5) * 2 * DEMO_STEP));
      demoPriceRef.current = next;
      const timestamp = Date.now();
      setCurrentPrice(next);
      setPoints((prev) => {
        const nextArr = [...prev, { timestamp, price: next }];
        if (nextArr.length > MAX_POINTS) return nextArr.slice(-MAX_POINTS);
        return nextArr;
      });
    }, DEMO_TICK_MS);
    return () => clearInterval(id);
  }, [demo, DEMO_BASE_PRICE, DEMO_STEP]);

  useEffect(() => {
    if (demo) return;
    const coingeckoId = token.coingeckoId;
    const poll = async () => {
      const data = await fetchHbarPrice(coingeckoId);
      if (!data || data.usd <= 0) return;
      const timestamp = Date.now();
      setCurrentPrice(data.usd);
      setPoints((prev) => {
        const next = [...prev, { timestamp, price: data.usd }];
        if (next.length > MAX_POINTS) return next.slice(-MAX_POINTS);
        return next;
      });
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [demo, token.coingeckoId]);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      const t = Date.now();
      setNow(t);
      if (currentPrice > 0) {
        const dt = (t - lastAnimTsRef.current) / 1000;
        lastAnimTsRef.current = t;
        driftRef.current += (Math.random() - 0.5) * 2 * DRIFT_PER_SEC * dt * currentPrice;
        driftRef.current *= 0.995;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [currentPrice]);

  const tipX = demo
    ? dimensions.width * 0.2
    : PAST_DURATION_SEC * PIXELS_PER_SECOND;

  const { interval: PRICE_INTERVAL, viewHalf: PRICE_VIEW_HALF } = useMemo(
    () => getPriceScales(currentPrice),
    [currentPrice]
  );

  const priceDecimals = useMemo(() => {
    if (PRICE_INTERVAL >= 1) return 0;
    if (PRICE_INTERVAL >= 0.1) return 1;
    if (PRICE_INTERVAL >= 0.01) return 2;
    if (PRICE_INTERVAL >= 0.001) return 3;
    if (PRICE_INTERVAL >= 0.0001) return 4;
    if (PRICE_INTERVAL >= 0.00001) return 5;
    if (PRICE_INTERVAL >= 0.000001) return 6;
    return 8;
  }, [PRICE_INTERVAL]);

  const scales = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || currentPrice <= 0) return null;
    const rawMin = currentPrice - PRICE_VIEW_HALF;
    const rawMax = currentPrice + PRICE_VIEW_HALF;
    const minY = Math.floor(rawMin / PRICE_INTERVAL) * PRICE_INTERVAL;
    const maxY = Math.ceil(rawMax / PRICE_INTERVAL) * PRICE_INTERVAL;
    if (!yDomainRef.current.initialized && currentPrice > 0) {
      yDomainRef.current = { min: minY, max: maxY, initialized: true };
    } else {
      const lerp = 0.08;
      yDomainRef.current.min += (minY - yDomainRef.current.min) * lerp;
      yDomainRef.current.max += (maxY - yDomainRef.current.max) * lerp;
    }
    const { min: minYFinal, max: maxYFinal } = yDomainRef.current;
    const contentHeight = dimensions.height - BOTTOM_PAD;
    const yScale = (price: number) =>
      contentHeight - ((price - minYFinal) / (maxYFinal - minYFinal)) * contentHeight;
    const xScale = (timestamp: number) => {
      const diffSec = (timestamp - now) / 1000;
      return tipX + diffSec * PIXELS_PER_SECOND;
    };
    return { yScale, xScale, tipX, minY: minYFinal, maxY: maxYFinal, contentHeight };
  }, [dimensions, currentPrice, now, tipX, PRICE_INTERVAL, PRICE_VIEW_HALF]);

  const displayPrice = currentPrice + driftRef.current;

  const { chartPath, areaPath } = useMemo(() => {
    if (!scales || currentPrice <= 0) return { chartPath: "", areaPath: "" };
    const priceY = scales.yScale(displayPrice);
    const nowX = scales.tipX;
    const visible = points.filter((p) => {
      const x = scales.xScale(p.timestamp);
      return x >= -30 && x <= dimensions.width + 30;
    });
    const toRender = [...visible];
    toRender.push({ timestamp: now, price: displayPrice });
    let pts = toRender.map((pt) => ({
      x: scales.xScale(pt.timestamp),
      y: scales.yScale(pt.price),
    }));
    if (pts.length < 2) {
      pts = [{ x: 0, y: priceY }, { x: nowX, y: priceY }];
    } else if (pts[0].x > 0) {
      pts = [{ x: 0, y: pts[0].y }, ...pts];
    }
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const first = pts[0];
    const last = pts[pts.length - 1];
    const bottom = scales.contentHeight ?? dimensions.height;
    const area = `M ${first.x} ${bottom} L ${first.x} ${first.y} ${pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")} L ${last.x} ${bottom} Z`;
    return { chartPath: d, areaPath: area };
  }, [scales, points, currentPrice, now, displayPrice, dimensions.height, dimensions.width]);

  const { timeSteps, priceSteps, priceStep } = useMemo(() => {
    if (!scales) return { timeSteps: [] as number[], priceSteps: [] as number[], priceStep: PRICE_INTERVAL };
    const step = PRICE_INTERVAL;
    const gridMaxY = scales.maxY;
    const gridMinY = scales.minY;
    const startPrice = Math.floor(gridMaxY / step) * step;
    const endPrice = Math.ceil(gridMinY / step) * step;
    const leftDurationMs = (scales.tipX / PIXELS_PER_SECOND) * 1000;
    const startTime = Math.floor((now - leftDurationMs) / GRID_INTERVAL_MS) * GRID_INTERVAL_MS - GRID_INTERVAL_MS;
    const endTime = now + ((dimensions.width - scales.tipX) / PIXELS_PER_SECOND) * 1000 + GRID_INTERVAL_MS * 2;
    const timeSteps: number[] = [];
    for (let t = startTime; t <= endTime; t += GRID_INTERVAL_MS) timeSteps.push(t);
    const priceSteps: number[] = [];
    for (let p = startPrice; p >= endPrice; p -= step) priceSteps.push(p);
    return { timeSteps, priceSteps, priceStep: step };
  }, [scales, dimensions.width, now, PRICE_INTERVAL]);

  const cells = useMemo((): Cell[] => {
    if (!scales || dimensions.height === 0) return [];
    const colWidth = (GRID_INTERVAL_MS / 1000) * PIXELS_PER_SECOND;
    const priceRange = scales.maxY - scales.minY;
    const gridMaxY = scales.maxY;
    const gridMinY = scales.minY;
    const startPrice = Math.floor(gridMaxY / priceStep) * priceStep;
    const endPrice = Math.ceil(gridMinY / priceStep) * priceStep;
    const leftDurationMs = (scales.tipX / PIXELS_PER_SECOND) * 1000;
    const startTime = Math.floor((now - leftDurationMs) / GRID_INTERVAL_MS) * GRID_INTERVAL_MS - GRID_INTERVAL_MS;
    const endTime = now + ((dimensions.width - scales.tipX) / PIXELS_PER_SECOND) * 1000 + GRID_INTERVAL_MS * 2;
    const out: Cell[] = [];

    for (let colTs = startTime; colTs <= endTime; colTs += GRID_INTERVAL_MS) {
      const colX = scales.xScale(colTs);
      if (colX + colWidth < 0 || colX > dimensions.width + 50) continue;
      const isCrossing = colX <= scales.tipX && colX + colWidth > scales.tipX;
      const isPast = colX + colWidth <= scales.tipX;

      for (let rowPriceTop = startPrice; rowPriceTop >= endPrice; rowPriceTop -= priceStep) {
        const rowPriceBottom = rowPriceTop - priceStep;
        const rowPriceCenter = (rowPriceTop + rowPriceBottom) / 2;
        const priceLevelIndex = Math.round(rowPriceTop / priceStep);
        const y = scales.yScale(rowPriceTop);
        const cellBottom = scales.yScale(rowPriceBottom);
        const rowHeight = cellBottom - y;
        const contentH = scales.contentHeight ?? dimensions.height;
        if (y > contentH + 20 || cellBottom < -20) continue;

        let status: "future" | "active" | "won" | "lost" = "future";
        if (isCrossing) {
          status =
            displayPrice <= rowPriceTop && displayPrice >= rowPriceBottom ? "won" : "active";
        } else if (isPast) {
          status = "lost";
        }

        const isUp = rowPriceCenter > displayPrice;
        const priceInRow =
          displayPrice <= rowPriceTop && displayPrice >= rowPriceBottom;
        let baseMultiplier: number;
        if (priceInRow) {
          baseMultiplier = 1.01;
        } else {
          const priceDist = Math.abs(rowPriceCenter - displayPrice);
          const normalizedDist = Math.min(priceDist / (priceRange * 0.8), 1);
          baseMultiplier = 1.05 + Math.pow(normalizedDist, 1.3) * 3.95;
        }
        const timeBonus = Math.max(0, (colX - scales.tipX) / 800) * 0.25;
        const mult = Math.min(baseMultiplier + timeBonus, 10);
        const probability = Math.min(0.99, 1 / mult);

        const currentLevelIndex = Math.round(displayPrice / priceStep);
        const isNearPrice = Math.abs(priceLevelIndex - currentLevelIndex) <= 2;
        const isLiveOrNextCol = isCrossing || (colX > scales.tipX && colX <= scales.tipX + colWidth * 1.5);
        const hasDemoBet = demo && isNearPrice && isLiveOrNextCol && (status === "active" || status === "future" || status === "won");
        const demoPayout = hasDemoBet ? ((colTs + priceLevelIndex) % 2 === 0 ? 1 : 2) : undefined;

        out.push({
          id: `cell-${colTs}-${priceLevelIndex}`,
          x: colX,
          y,
          width: colWidth - 2,
          height: Math.max(rowHeight - 2, 4),
          multiplier: mult,
          probability,
          isUp,
          status,
          priceTop: rowPriceTop,
          priceBottom: rowPriceBottom,
          ...(hasDemoBet && { hasDemoBet: true, demoPayout }),
        });
      }
    }
    return out;
  }, [scales, dimensions, now, currentPrice, displayPrice, priceStep, demo]);

  // Demo: when price enters a demo-bet cell, show +1/+2 hit effect
  useEffect(() => {
    if (!demo || !cells.length) return;
    const wonCell = cells.find((c) => c.status === "won");
    if (wonCell?.hasDemoBet && wonCell.id !== lastHitCellIdRef.current) {
      lastHitCellIdRef.current = wonCell.id;
      const key = `hit-${wonCell.id}-${Date.now()}`;
      const amount = wonCell.demoPayout ?? 1;
      const x = wonCell.x + wonCell.width / 2;
      const y = wonCell.y + wonCell.height / 2;
      setHitEffects((prev) => [...prev, { key, amount, x, y }]);
      const t = setTimeout(() => {
        setHitEffects((prev) => prev.filter((e) => e.key !== key));
      }, 1400);
      return () => clearTimeout(t);
    }
    if (!wonCell?.hasDemoBet) {
      const t = setTimeout(() => {
        lastHitCellIdRef.current = null;
      }, 300);
      return () => clearTimeout(t);
    }
  }, [demo, cells, displayPrice]);

  if (!demo && currentPrice <= 0 && points.length === 0) {
    return (
      <Box ref={containerRef} w="100%" h="100%" minH={0} bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Text color="brand.textPrimary">Loading {token.symbol} price…</Text>
      </Box>
    );
  }

  const priceY = scales ? scales.yScale(displayPrice) : 0;

  return (
    <Box
      ref={containerRef}
      position="relative"
      w="100%"
      h="100%"
      minH={0}
      bg="white"
      overflow="hidden"
      borderWidth="0"
      borderColor="transparent"
      borderRadius="lg"
    >
      {scales && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="none"
          style={{ display: "block", background: "white" }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FILL_PRIMARY} stopOpacity="0.2" />
              <stop offset="100%" stopColor={FILL_PRIMARY} stopOpacity="0" />
            </linearGradient>
            <pattern id="frozenPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke={FROZEN_PATTERN} strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid background */}
          {timeSteps.map((t) => {
            const x = scales.xScale(t);
            const contentH = scales.contentHeight ?? dimensions.height;
            if (!isFinite(x) || x < -20 || x > dimensions.width + 20) return null;
            return (
              <g key={`vt-${t}`}>
                <line x1={x} y1={0} x2={x} y2={contentH} stroke={STROKE_FOREGROUND} strokeWidth="1" strokeDasharray="4 4" />
                {contentH > 20 && (
                  <text x={x + 5} y={contentH + 14} fontSize="10" fill="#000" fontFamily="var(--chakra-fonts-mono)" fontWeight="bold">
                    {new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </text>
                )}
              </g>
            );
          })}
          {priceSteps.map((p) => {
            const y = scales.yScale(p);
            const contentH = scales.contentHeight ?? dimensions.height;
            if (!isFinite(y) || y < -20 || y > contentH + 20) return null;
            return (
              <g key={`hp-${p}`}>
                <line x1={0} y1={y} x2={dimensions.width} y2={y} stroke={STROKE_FOREGROUND} strokeWidth="1" strokeDasharray="4 4" />
                {dimensions.width > 40 && (
                  <text x={10} y={y - 5} fontSize="10" textAnchor="start" fill="#000" fontFamily="var(--chakra-fonts-mono)" fontWeight="bold">
                    {p.toFixed(priceDecimals)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Grid cells */}
          {cells.map((cell) => {
            const isPast = cell.status === "lost";
            const isWon = cell.status === "won";
            const isActive = cell.status === "active";
            const isFuture = cell.status === "future";
            const isPlayable = !demo && (isFuture || isActive) && onCellClick && betAmount > 0;
            const showPricing = (isFuture || isActive) && cell.width > 28 && cell.height > 22;

            const hasMyBet = !demo && pendingCellIds?.has(cell.id);
            const resolvedInfo = !demo ? resolvedCells?.get(cell.id) : undefined;
            const myBetWon = resolvedInfo?.won === true;
            const myBetLost = resolvedInfo?.won === false;
            const resolvedMultiplier = resolvedInfo?.multiplier;

            let fill = "transparent";
            let stroke = STROKE_FOREGROUND;
            let strokeW = 1;
            if (demo) {
              if (isWon) {
                fill = `${TRADE_UP}66`;
                stroke = TRADE_UP;
                strokeW = 2;
              } else if (isPast) {
                fill = "rgba(4, 59, 203, 0.06)";
                stroke = "rgba(0, 0, 0, 0.08)";
              } else if (isActive) {
                fill = "rgba(4, 59, 203, 0.12)";
                stroke = STROKE_PRIMARY;
              } else if (isFuture) {
                fill = "url(#frozenPattern)";
                stroke = "rgba(0,0,0,0.15)";
              }
              if (cell.hasDemoBet) {
                stroke = "var(--chakra-colors-brand-accentOnBlue)";
                strokeW = 2;
              }
            } else {
              if (myBetLost) {
                fill = "rgba(239, 68, 68, 0.2)";
                stroke = BET_RED;
                strokeW = 2;
              } else if (myBetWon) {
                fill = `${BET_GREEN}66`;
                stroke = BET_GREEN;
                strokeW = 2;
              } else if (hasMyBet) {
                fill = "rgba(34, 197, 94, 0.18)";
                stroke = BET_GREEN;
                strokeW = 2;
              } else if (isWon) {
                fill = `${TRADE_UP}66`;
                stroke = TRADE_UP;
                strokeW = 2;
              } else if (isPast) {
                fill = "rgba(4, 59, 203, 0.06)";
                stroke = "rgba(0, 0, 0, 0.08)";
              } else if (isActive) {
                fill = "rgba(4, 59, 203, 0.12)";
                stroke = STROKE_PRIMARY;
              } else if (isFuture) {
                fill = "url(#frozenPattern)";
                stroke = "rgba(0,0,0,0.15)";
              }
            }

            const textColor = demo ? "#002583" : hasMyBet ? BET_GREEN : myBetWon ? BET_GREEN : myBetLost ? BET_RED : "#002583";
            const multColor = demo ? FILL_PRIMARY : hasMyBet ? BET_GREEN : myBetWon ? BET_GREEN : myBetLost ? BET_RED : FILL_PRIMARY;

            const handleClick = () => {
              if (!isPlayable || !onCellClick) return;
              onCellClick({
                cellId: cell.id,
                direction: cell.isUp ? "UP" : "DOWN",
                multiplier: cell.multiplier,
                priceTop: cell.priceTop,
                priceBottom: cell.priceBottom,
              });
            };
            return (
              <g key={cell.id}>
                <rect
                  x={cell.x}
                  y={cell.y}
                  width={cell.width}
                  height={cell.height}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  style={{
                    transition: "fill 0.2s, stroke 0.2s",
                    cursor: isPlayable ? "pointer" : "default",
                  }}
                  onClick={handleClick}
                  onKeyDown={(e) => isPlayable && (e.key === "Enter" || e.key === " ") && handleClick()}
                  role={isPlayable ? "button" : undefined}
                  aria-label={isPlayable ? `Bet ${cell.isUp ? "up" : "down"} ${cell.multiplier}x` : undefined}
                />
                {demo ? (
                  showPricing && (
                    <>
                      <text
                        x={cell.x + cell.width / 2}
                        y={cell.y + cell.height / 2 - 5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={textColor}
                        style={{ fontFamily: "var(--chakra-fonts-mono)", fontSize: "9px" }}
                      >
                        {(cell.probability * 100).toFixed(0)}%
                      </text>
                      <text
                        x={cell.x + cell.width / 2}
                        y={cell.y + cell.height / 2 + 6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={multColor}
                        style={{ fontFamily: "var(--chakra-fonts-mono)", fontSize: "10px", fontWeight: "bold" }}
                      >
                        {cell.multiplier.toFixed(1)}x
                      </text>
                    </>
                  )
                ) : (
                  (showPricing || myBetWon || myBetLost) && (
                    <>
                      {myBetWon && (
                        <text
                          x={cell.x + cell.width / 2}
                          y={cell.y + cell.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={BET_GREEN}
                          style={{ fontFamily: "var(--chakra-fonts-mono)", fontSize: "11px", fontWeight: "bold" }}
                        >
                          +{resolvedMultiplier != null ? resolvedMultiplier.toFixed(1) : "1"}
                        </text>
                      )}
                      {myBetLost && (
                        <text
                          x={cell.x + cell.width / 2}
                          y={cell.y + cell.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={BET_RED}
                          style={{ fontFamily: "var(--chakra-fonts-mono)", fontSize: "12px", fontWeight: "bold" }}
                        >
                          −
                        </text>
                      )}
                      {!myBetWon && !myBetLost && showPricing && (
                        <>
                          <text
                            x={cell.x + cell.width / 2}
                            y={cell.y + cell.height / 2 - 5}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={textColor}
                            style={{ fontFamily: "var(--chakra-fonts-mono)", fontSize: "9px" }}
                          >
                            {(cell.probability * 100).toFixed(0)}%
                          </text>
                          <text
                            x={cell.x + cell.width / 2}
                            y={cell.y + cell.height / 2 + 6}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={multColor}
                            style={{ fontFamily: "var(--chakra-fonts-mono)", fontSize: "10px", fontWeight: "bold" }}
                          >
                            {cell.multiplier.toFixed(1)}x
                          </text>
                        </>
                      )}
                    </>
                  )
                )}
              </g>
            );
          })}

          {/* Price chart on top */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
          {chartPath && (
            <path d={chartPath} fill="none" stroke={STROKE_PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Vertical "now" line + circle */}
          <line
            x1={tipX}
            x2={tipX}
            y1={0}
            y2={scales.contentHeight ?? dimensions.height}
            stroke={STROKE_PRIMARY}
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          <circle cx={tipX} cy={priceY} r="4" fill={FILL_PRIMARY} stroke="white" strokeWidth="1.5" />

          {/* Current price indicator */}
          <line
            x1={0}
            x2={dimensions.width}
            y1={priceY}
            y2={priceY}
            stroke={STROKE_PRIMARY}
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          <g transform={`translate(${dimensions.width - 55}, ${priceY - 11})`}>
            <path
              d="M0 2C0 0.895431 0.895431 0 2 0H55V22H2C0.895431 22 0 21.1046 0 20V2Z"
              fill={FILL_PRIMARY}
            />
            <text
              x="27.5"
              y="15"
              fill="white"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              style={{ fontFamily: "monospace" }}
            >
              {displayPrice > 0 ? displayPrice.toFixed(priceDecimals) : "—"}
            </text>
          </g>

          {/* Demo hit effects */}
          {demo &&
            hitEffects.map((e) => (
              <g key={e.key} opacity={1}>
                <animate
                  attributeName="opacity"
                  values="1;0"
                  dur="1.4s"
                  fill="freeze"
                  begin="0s"
                />
                <text
                  x={e.x}
                  y={e.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#22c55e"
                  fontSize="14"
                  fontWeight="bold"
                  style={{ fontFamily: "var(--chakra-fonts-mono)" }}
                >
                  +{e.amount}
                </text>
              </g>
            ))}
        </svg>
      )}
    </Box>
  );
}
