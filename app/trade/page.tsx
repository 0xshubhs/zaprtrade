"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Flex, Container, Text, Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { Navigation, LandingTicker } from "../../components";
import { TradeChartBox } from "./TradeChartBox";
import { TradePanel, TradeMiniHistory } from "../../components/trade";
import { useHederaBet } from "../../hooks/useHederaBet";
import { useSelectedToken } from "../../contexts/SelectedTokenContext";

const GRID_WINDOW_SEC = 60;

export default function TradePage() {
  const [betAmount, setBetAmount] = useState("1");
  const { placeBet, balance, pending, history } = useHederaBet();
  const { token, setToken, tokens } = useSelectedToken();
  const [optimisticCellIds, setOptimisticCellIds] = useState<Set<string>>(new Set());

  const { pendingCellIds, resolvedCells } = useMemo(() => {
    const pendingIds = new Set<string>();
    Array.from(pending.values()).forEach((bet: { cellId?: string }) => {
      if (bet?.cellId) pendingIds.add(bet.cellId);
    });
    optimisticCellIds.forEach((id) => pendingIds.add(id));
    const resolved = new Map<string, { won: boolean; multiplier: number }>();
    history.forEach((r) => {
      if (r.cellId) resolved.set(r.cellId, { won: r.won, multiplier: r.multiplier });
    });
    return { pendingCellIds: pendingIds, resolvedCells: resolved };
  }, [pending, history, optimisticCellIds]);

  useEffect(() => {
    const inPending = new Set<string>();
    Array.from(pending.values()).forEach((bet: { cellId?: string }) => {
      if (bet?.cellId) inPending.add(bet.cellId);
    });
    setOptimisticCellIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set(prev);
      inPending.forEach((id) => next.delete(id));
      return next.size === prev.size ? prev : next;
    });
  }, [pending]);

  const handleCellBet = useCallback(
    async (cell: { cellId: string; direction: "UP" | "DOWN"; multiplier: number; priceTop: number; priceBottom: number }) => {
      const amount = parseFloat(betAmount) || 0;
      if (amount <= 0 || amount > balance) return;
      setOptimisticCellIds((prev) => new Set(prev).add(cell.cellId));
      await placeBet(
        cell.cellId,
        cell.direction,
        amount,
        GRID_WINDOW_SEC,
        cell.multiplier,
        cell.priceTop,
        cell.priceBottom
      );
    },
    [betAmount, balance, placeBet]
  );

  return (
    <Flex as="main" direction="column" h="100vh" overflow="hidden" bg="brand.primaryBg">
      <Navigation />
      <LandingTicker />
      <Box position="relative" flex={1} minH={0} overflow="hidden" bg="brand.primaryBg" display="flex" flexDirection="column">
        <Container maxW="full" flex={1} minH={0} display="flex" flexDirection="column" py={{ base: 2, md: 3 }} px={{ base: 2, md: 4 }}>
          <Flex mb={2} align="center" gap={4} flexShrink={0}>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                rightIcon={<ChevronDown size={14} />}
                bg="transparent"
                color="brand.primaryText"
                fontWeight="600"
                fontSize="sm"
                px={2}
                _hover={{ bg: "whiteAlpha.200" }}
                _active={{ bg: "whiteAlpha.300" }}
              >
                {token.symbol} / USD — Live
              </MenuButton>
              <MenuList bg="white" borderColor="blackAlpha.200" minW="220px" maxH="400px" overflowY="auto" sx={{ "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-thumb": { background: "blackAlpha.300", borderRadius: "6px" } }}>
                {tokens.map((t) => (
                  <MenuItem
                    key={t.id}
                    onClick={() => setToken(t)}
                    bg={t.id === token.id ? "blue.50" : "white"}
                    _hover={{ bg: "gray.50" }}
                    fontSize="sm"
                    fontWeight={t.id === token.id ? "700" : "500"}
                    color="gray.800"
                  >
                    {t.symbol} — {t.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
          <Box
            flex={1}
            minH={0}
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.300"
            overflow="hidden"
          >
            <TradeChartBox
              onCellClick={handleCellBet}
              betAmount={parseFloat(betAmount) || 0}
              pendingCellIds={pendingCellIds}
              resolvedCells={resolvedCells}
            />
          </Box>
        </Container>
        <TradePanel betAmount={betAmount} onBetAmountChange={setBetAmount} />
        <TradeMiniHistory />
      </Box>
    </Flex>
  );
}
