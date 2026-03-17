"use client";

import React, { useState } from "react";
import { Box, Flex, Text, Button, Input } from "@chakra-ui/react";
import { Wallet, TrendingUp, TrendingDown, ArrowDownToLine } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { useHederaBet } from "../../hooks/useHederaBet";
import { useSelectedToken } from "../../contexts/SelectedTokenContext";
import { hederaBetStore } from "../../lib/hederaBetStore";

interface TradeBalanceSummaryProps {
  embedded?: boolean;
}

export function TradeBalanceSummary({ embedded = false }: TradeBalanceSummaryProps) {
  const { address, isConnected } = useAccount();
  const { data: walletBalanceData } = useBalance({ address });
  const { balance: playBalance } = useHederaBet();
  const { token } = useSelectedToken();
  const pendingMap = hederaBetStore.getPending();
  const pending = Array.from(pendingMap.values());
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  const atRisk = pending.reduce((sum, b) => sum + b.amount, 0);
  const potentialProfit = pending.reduce((sum, b) => sum + b.amount * (b.multiplier - 1), 0);
  const walletBalance = walletBalanceData ? Number(walletBalanceData.formatted) : 0;
  const depositNum = parseFloat(depositAmount) || 0;
  const canDeposit = isConnected && depositNum > 0 && depositNum <= walletBalance;

  const handleDeposit = () => {
    if (!canDeposit) return;
    setIsDepositing(true);
    try {
      hederaBetStore.deposit(depositNum);
      setDepositAmount("");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Box
      bg={embedded ? "transparent" : "white"}
      borderRadius={embedded ? 0 : "lg"}
      border={embedded ? "none" : "1px solid"}
      borderColor="blackAlpha.200"
      px={embedded ? 0 : 4}
      py={embedded ? 0 : 3}
      minW={embedded ? undefined : { base: "auto", sm: "300px" }}
    >
      <Text fontSize="xs" fontWeight="700" color="brand.textPrimary" textTransform="uppercase" letterSpacing="wider" mb={3}>
        Balance & exposure
      </Text>
      <Flex direction="column" gap={3}>
        {isConnected ? (
          <>
            <Flex align="center" justify="space-between" gap={4}>
              <Text fontSize="sm" color="brand.textPrimary" fontWeight="600">
                Wallet ({token.symbol})
              </Text>
              <Text fontSize="md" fontFamily="mono" fontWeight="700" color="brand.textAccent">
                {walletBalanceData ? `${walletBalance.toFixed(2)} ${walletBalanceData.symbol}` : "—"}
              </Text>
            </Flex>
            <Flex align="center" justify="space-between" gap={4}>
              <Flex align="center" gap={2}>
                <Wallet size={14} style={{ color: "var(--chakra-colors-brand-textAccent)" }} />
                <Text fontSize="sm" color="brand.textPrimary" fontWeight="600">
                  Play balance
                </Text>
              </Flex>
              <Text fontSize="md" fontFamily="mono" fontWeight="700" color="brand.textAccent">
                {playBalance.toFixed(2)} {token.symbol}
              </Text>
            </Flex>
            <Box pt={1} borderTop="1px solid" borderColor="blackAlpha.100">
              <Text fontSize="2xs" color="brand.textPrimary" fontWeight="600" mb={2} textTransform="uppercase" letterSpacing="wider">
                Transfer to play
              </Text>
              <Flex gap={2} align="center">
                <Input
                  type="number"
                  size="sm"
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  bg="gray.50"
                  borderColor="blackAlpha.200"
                  fontFamily="mono"
                  color="brand.textDark"
                  min={0}
                  step="0.1"
                />
                <Button
                  size="sm"
                  leftIcon={<ArrowDownToLine size={14} />}
                  onClick={handleDeposit}
                  isDisabled={!canDeposit || isDepositing}
                  bg="brand.buttonBg"
                  color="brand.buttonText"
                  _hover={{ bg: "gray.100", color: "brand.textAccent" }}
                >
                  Deposit
                </Button>
              </Flex>
              <Text fontSize="2xs" color="gray.500" mt={1}>
                In production this will send {token.symbol} from your wallet to the play balance.
              </Text>
            </Box>
          </>
        ) : (
          <Text fontSize="sm" color="gray.500">
            Connect wallet in the navbar to see balance and transfer {token.symbol} to play.
          </Text>
        )}

        {pending.length > 0 && (
          <>
            <Flex align="center" justify="space-between" gap={4}>
              <Text fontSize="sm" color="brand.textPrimary" fontWeight="500">
                At risk ({pending.length} bet{pending.length !== 1 ? "s" : ""})
              </Text>
              <Text fontSize="sm" fontFamily="mono" fontWeight="600" color="brand.textDark">
                {atRisk.toFixed(2)} {token.symbol}
              </Text>
            </Flex>
            <Flex align="center" justify="space-between" gap={4}>
              <Flex align="center" gap={2}>
                <TrendingUp size={14} style={{ color: "var(--chakra-colors-green-600)" }} />
                <Text fontSize="sm" color="brand.textPrimary" fontWeight="500">
                  If all win
                </Text>
              </Flex>
              <Text fontSize="sm" fontFamily="mono" fontWeight="700" color="green.600">
                +{potentialProfit.toFixed(2)} {token.symbol}
              </Text>
            </Flex>
            <Flex align="center" justify="space-between" gap={4}>
              <Flex align="center" gap={2}>
                <TrendingDown size={14} style={{ color: "var(--chakra-colors-red-600)" }} />
                <Text fontSize="sm" color="brand.textPrimary" fontWeight="500">
                  If all lose
                </Text>
              </Flex>
              <Text fontSize="sm" fontFamily="mono" fontWeight="700" color="red.600">
                −{atRisk.toFixed(2)} {token.symbol}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  );
}
