"use client";

import React from "react";
import { Box, Text, Flex, Button, VStack, useDisclosure } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { History } from "lucide-react";
import { useHederaBet } from "../../hooks/useHederaBet";
import { useSelectedToken } from "../../contexts/SelectedTokenContext";

export interface TradeRecord {
  id: string;
  direction: "UP" | "DOWN";
  amount: number;
  payout: number;
  won: boolean;
  timestamp: number;
}

interface TradeMiniHistoryProps {
  trades?: TradeRecord[];
}

export function TradeMiniHistory({ trades: propTrades }: TradeMiniHistoryProps) {
  const { history: hederaHistory } = useHederaBet();
  const { token } = useSelectedToken();
  const fromStore: TradeRecord[] = hederaHistory.map((t) => ({
    id: t.id,
    direction: t.direction,
    amount: t.amount,
    payout: t.payout,
    won: t.won,
    timestamp: t.timestamp,
  }));
  const list = fromStore.length > 0 ? fromStore : propTrades ?? [];
  const recent = list.slice(0, 10);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={40}
      maxW="calc(100vw - 24px)"
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              width: "280px",
              maxWidth: "min(280px, calc(100vw - 32px))",
              background: "var(--chakra-colors-brand-pageBg)",
              borderRadius: "1rem",
              border: "1px solid",
              borderColor: "var(--chakra-colors-blackAlpha-200)",
              boxShadow: "xl",
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <Flex p={3} borderBottom="1px solid" borderColor="blackAlpha.100" bg="gray.50" justify="space-between" align="center">
              <Text fontSize="2xs" fontWeight="700" color="brand.textPrimary" textTransform="uppercase" letterSpacing="wider">
                Trade history
              </Text>
              <Button size="xs" variant="ghost" color="brand.textPrimary" _hover={{ bg: "gray.100", color: "brand.textAccent" }} onClick={onToggle} aria-label="Close history">
                ✕
              </Button>
            </Flex>
            <Box maxH="280px" overflowY="auto" sx={{ "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: "blackAlpha.200", borderRadius: "4px" } }}>
              {recent.length > 0 ? (
                <VStack spacing={0} align="stretch" borderTopWidth="0">
                  {recent.map((trade) => (
                    <Flex
                      key={trade.id}
                      p={3}
                      justify="space-between"
                      align="center"
                      borderBottom="1px solid"
                      borderColor="blackAlpha.100"
                      _hover={{ bg: "gray.50" }}
                    >
                      <Box>
                        <Text fontSize="xs" fontWeight="600" color="brand.textDark">
                          {trade.direction} — {trade.amount.toFixed(2)} {token.symbol}
                        </Text>
                        <Text fontSize="2xs" color="brand.textPrimary" fontFamily="mono">
                          {new Date(trade.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </Text>
                      </Box>
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        fontFamily="mono"
                        color={trade.won ? "green.600" : "red.600"}
                      >
                        {trade.won ? `+${trade.payout.toFixed(4)}` : `-${trade.amount.toFixed(4)}`}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Box py={8} textAlign="center">
                  <Text fontSize="2xs" color="brand.textPrimary" textTransform="uppercase" fontWeight="700">
                    No history yet
                  </Text>
                  <Text fontSize="xs" color="gray.600" mt={2}>
                    Trades will appear here
                  </Text>
                </Box>
              )}
            </Box>
            {recent.length > 0 && (
              <Box p={2} bg="gray.50" textAlign="center" borderTop="1px solid" borderColor="blackAlpha.100">
                <Text fontSize="2xs" color="brand.textPrimary" textTransform="uppercase" fontWeight="600">
                  Last 10 trades · {token.symbol}
                </Text>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="sm"
        onClick={onToggle}
        leftIcon={<History size={16} />}
        bg="white"
        borderWidth="2px"
        borderStyle="solid"
        borderColor="#002583"
        color="#002583"
        _hover={{
          bg: "gray.100",
          borderColor: "#043BCB",
          color: "#043BCB",
        }}
        _active={{
          bg: "gray.200",
          borderColor: "#002583",
          color: "#002583",
        }}
        sx={{ "& .chakra-button__icon": { color: "inherit" } }}
      >
        History {recent.length > 0 && `(${recent.length})`}
      </Button>
    </Box>
  );
}
