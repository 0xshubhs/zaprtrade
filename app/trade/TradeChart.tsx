"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { fetchHbarPrice } from "../../lib/hbarPrice";
import { useSelectedToken } from "../../contexts/SelectedTokenContext";

const POLL_MS = 15_000; // Real price every 15s (rate limit safe)
const POLL_MS_COMPACT = 10_000; // Landing: poll every 10s for 5-min chart
const FIVE_MIN_SEC = 300;
const MAX_POINTS = 60;
const PRICE_BAND_COUNT = 10;
const LANDING_BOXES = 6; // 3 past, 1 live, 2 future

interface Point {
  t: number;
  price: number;
}

interface TradeChartProps {
  compact?: boolean;
}

export function TradeChart({ compact = false }: TradeChartProps) {
  const { token } = useSelectedToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartH = compact ? 200 : 280;
  const [size, setSize] = useState({ w: 600, h: chartH });
  const [points, setPoints] = useState<Point[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width } = el.getBoundingClientRect();
      setSize((s) => ({ w: width || s.w, h: chartH }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build history from real API price
  useEffect(() => {
    const interval = compact ? POLL_MS_COMPACT : POLL_MS;
    const poll = async () => {
      const data = await fetchHbarPrice(token.coingeckoId);
      if (!data || data.usd <= 0) return;
      const t = (Date.now() - startTime.current) / 1000;
      setCurrentPrice(data.usd);
      setPoints((prev) => {
        const next = [...prev, { t, price: data.usd }];
        if (next.length > MAX_POINTS) return next.slice(-MAX_POINTS);
        return next;
      });
    };
    poll();
    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [compact, token.coingeckoId]);

  // In compact mode use 5-min sliding window
  const windowedPoints = useMemo(() => {
    if (!compact || points.length < 2) return points;
    const maxT = points[points.length - 1].t;
    const minT = Math.max(0, maxT - FIVE_MIN_SEC);
    return points.filter((pt) => pt.t >= minT);
  }, [compact, points]);

  const { path, minY, maxY, tipX, tipY } = useMemo(() => {
    const pts = compact ? windowedPoints : points;
    if (pts.length < 2) {
      const p = currentPrice ?? 1;
      return { path: "", minY: p * 0.99, maxY: p * 1.01, tipX: 0, tipY: size.h / 2 };
    }
    const prices = pts.map((p) => p.price);
    const minY = Math.min(...prices);
    const maxY = Math.max(...prices);
    const pad = (maxY - minY) * 0.1 || 0.001;
    const yMin = minY - pad;
    const yMax = maxY + pad;
    const xMin = pts[0].t;
    const xMax = pts[pts.length - 1].t || 1;
    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin;

    const toX = (t: number) => ((t - xMin) / xSpan) * size.w;
    const toY = (p: number) => size.h - ((p - yMin) / ySpan) * size.h;

    const d = pts
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${toX(pt.t)} ${toY(pt.price)}`)
      .join(" ");
    const last = pts[pts.length - 1];
    const tipX = toX(last.t);
    const tipY = toY(last.price);
    return { path: d, minY: yMin, maxY: yMax, tipX, tipY };
  }, [compact, points, windowedPoints, size.w, size.h, currentPrice]);

  const gridLines = useMemo(() => {
    const cols = 6;
    const rows = 5;
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i <= cols; i++) {
      const x = (size.w / cols) * i;
      lines.push({ x1: x, y1: 0, x2: x, y2: size.h });
    }
    for (let i = 0; i <= rows; i++) {
      const y = (size.h / rows) * i;
      lines.push({ x1: 0, y1: y, x2: size.w, y2: y });
    }
    return lines;
  }, [size.w, size.h]);

  const displayPrice = currentPrice ?? (points.length ? points[points.length - 1].price : null);

  // Price band blocks: PRICE_BAND_COUNT cells from minY to maxY (or around current price)
  const bandRange = useMemo(() => {
    if (points.length >= 2) return { lo: minY, hi: maxY };
    const p = currentPrice ?? 1;
    const spread = Math.max(p * 0.02, 0.01);
    return { lo: p - spread, hi: p + spread };
  }, [points.length, minY, maxY, currentPrice]);

  const bands = useMemo(() => {
    const { lo, hi } = bandRange;
    const step = (hi - lo) / PRICE_BAND_COUNT;
    return Array.from({ length: PRICE_BAND_COUNT }, (_, i) => {
      const bandLo = lo + i * step;
      const bandHi = lo + (i + 1) * step;
      return { id: i, lo: bandLo, hi: bandHi, mid: (bandLo + bandHi) / 2 };
    });
  }, [bandRange.lo, bandRange.hi]);

  let activeBandIndex =
    displayPrice != null
      ? bands.findIndex((b) => displayPrice >= b.lo && displayPrice < b.hi)
      : -1;
  if (activeBandIndex === -1 && bands.length && displayPrice != null && displayPrice >= bands[bands.length - 1].hi)
    activeBandIndex = bands.length - 1;

  return (
    <Box
      ref={containerRef}
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="blackAlpha.100"
      overflow="hidden"
      boxShadow="sm"
      minH={compact ? "240px" : "320px"}
    >
      <Box p={compact ? 2 : 4} borderBottom="1px solid" borderColor="blackAlpha.100">
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="600" color="brand.textPrimary">
            {token.symbol} / USD{compact ? " · 5 min" : ""}
          </Text>
          <Text fontSize="lg" fontWeight="700" color="brand.textPrimary">
            {displayPrice != null ? `$${displayPrice.toFixed(token.decimals)}` : "—"}
          </Text>
        </Flex>
      </Box>

      <Box position="relative" w="full" h={`${chartH}px`}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" style={{ display: "block" }}>
          <defs>
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#025122" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#025122" stopOpacity="1" />
            </linearGradient>
          </defs>
          {gridLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          ))}
          {path && (
            <>
              <path
                d={path + ` L ${size.w} ${size.h} L 0 ${size.h} Z`}
                fill="#025122"
                fillOpacity={0.06}
              />
              <path
                d={path}
                fill="none"
                stroke="url(#chartLineGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 1000,
                  strokeDashoffset: 1000,
                  animation: "chartDraw 1.5s ease-out forwards",
                }}
              />
              {/* Live dot at current price - blipmarkets-style movement */}
              <circle
                cx={tipX}
                cy={tipY}
                r="6"
                fill="#025122"
                opacity="0.35"
                style={{ animation: "chartPulse 1.5s ease-in-out infinite" }}
              />
              <circle
                cx={tipX}
                cy={tipY}
                r="4"
                fill="#025122"
                style={{ animation: "chartPulse 1.5s ease-in-out infinite" }}
              />
            </>
          )}
        </svg>
        <style>{`
          @keyframes chartDraw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes chartPulse {
            0%, 100% { opacity: 0.75; }
            50% { opacity: 1; }
          }
          @keyframes boxLive {
            0%, 100% { box-shadow: 0 0 0 0 rgba(2, 81, 34, 0.4); }
            50% { box-shadow: 0 0 0 6px rgba(2, 81, 34, 0.15); }
          }
        `}</style>
      </Box>

      {/* Landing: 5-min moving boxes — 3 past, 1 live, 2 future */}
      {compact && (
        <Flex
          p={2}
          gap={1}
          borderTop="1px solid"
          borderColor="blackAlpha.100"
          bg="blackAlpha.30"
          align="center"
          justify="space-between"
        >
          {Array.from({ length: LANDING_BOXES }, (_, i) => {
            const isPast = i < 3;
            const isLive = i === 3;
            const isFuture = i > 3;
            return (
              <Box
                key={i}
                flex={1}
                py={2}
                px={1}
                borderRadius="md"
                borderWidth="2px"
                borderStyle={isFuture ? "dashed" : "solid"}
                borderColor={isLive ? "brand.textAccent" : "blackAlpha.200"}
                bg={isLive ? "brand.textAccent" : isPast ? "white" : "blackAlpha.50"}
                textAlign="center"
                opacity={isFuture ? 0.7 : 1}
                style={isLive ? { animation: "boxLive 1.5s ease-in-out infinite" } : undefined}
              >
                <Text
                  fontSize="2xs"
                  fontWeight={isLive ? "700" : "600"}
                  color={isLive ? "white" : "gray.600"}
                >
                  {isPast ? "Past" : isLive ? "Live" : "Future"}
                </Text>
              </Box>
            );
          })}
        </Flex>
      )}

      {/* Price band blocks - hidden in compact mode */}
      {!compact && (
        <Flex
          p={3}
          gap={2}
          flexWrap="wrap"
          borderTop="1px solid"
          borderColor="blackAlpha.100"
          bg="blackAlpha.20"
        >
          <Text fontSize="2xs" fontWeight="600" color="brand.textPrimary" w="full" mb={1}>
            Price bands
          </Text>
          {bands.map((band, i) => {
            const isActive = i === activeBandIndex;
            return (
              <Box
                key={band.id}
                flex="1 1 auto"
                minW="60px"
                py={2}
                px={3}
                borderRadius="md"
                border="2px solid"
                borderColor={isActive ? "brand.textAccent" : "blackAlpha.200"}
                bg={isActive ? "brand.textAccent" : "white"}
                textAlign="center"
              >
                <Text fontSize="xs" fontWeight="700" color={isActive ? "white" : "gray.600"}>
                  ${band.lo.toFixed(3)} – ${band.hi.toFixed(3)}
                </Text>
                {isActive && (
                  <Text fontSize="2xs" fontWeight="600" color="white" mt={0.5}>
                    Current
                  </Text>
                )}
              </Box>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
