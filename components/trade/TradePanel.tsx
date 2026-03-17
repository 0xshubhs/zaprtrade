"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  VStack,
  SimpleGrid,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDown, PanelRight } from "lucide-react";
import { useAccount } from "wagmi";
import { useHederaBet } from "../../hooks/useHederaBet";
import { useSelectedToken } from "../../contexts/SelectedTokenContext";
import { TradeBalanceSummary } from "./TradeBalanceSummary";

const AMOUNTS = [1, 5, 10, 15, 20];

interface TradePanelProps {
  betAmount?: string;
  onBetAmountChange?: (value: string) => void;
}

export function TradePanel({ betAmount: controlledBetAmount, onBetAmountChange }: TradePanelProps) {
  const [internalBetAmount, setInternalBetAmount] = useState("1");
  const betAmount = controlledBetAmount ?? internalBetAmount;
  const setBetAmount = onBetAmountChange ?? setInternalBetAmount;

  const { address, isConnected } = useAccount();
  const { balance } = useHederaBet();
  const { token } = useSelectedToken();
  const { isOpen: isPanelOpen, onToggle: togglePanel } = useDisclosure({
    defaultIsOpen: true,
  });

  const balanceFormatted = balance.toFixed(2);

  const formatAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  return (
    <Box
      position={{ base: "fixed", sm: "absolute" }}
      bottom={{ base: 4, sm: 8 }}
      left={{ base: 4, sm: 8 }}
      zIndex={30}
      w={{ base: "calc(100% - 32px)", sm: "320px" }}
      maxW="320px"
    >
      {!isPanelOpen && (
        <Button
          size="sm"
          leftIcon={<PanelRight size={18} />}
          onClick={togglePanel}
          bg="brand.buttonBg"
          color="brand.buttonText"
          border="1px solid"
          borderColor="brand.textPrimary"
          _hover={{ bg: "gray.100", borderColor: "brand.textAccent", color: "brand.textAccent" }}
          mb={2}
        >
          Open trade panel
        </Button>
      )}

      <Box
        bg="brand.pageBg"
        borderRadius="2xl"
        border="1px solid"
        borderColor="blackAlpha.200"
        boxShadow="xl"
        overflow="hidden"
        sx={{
          ...(!isPanelOpen && { display: "none" }),
        }}
      >
        <Flex
          px={3}
          py={2}
          bg="white"
          borderBottom="1px solid"
          borderColor="blackAlpha.100"
          align="center"
          justify="space-between"
        >
          <Text fontSize="xs" fontWeight="700" color="brand.textPrimary" textTransform="uppercase" letterSpacing="wider">
            Trade
          </Text>
          <IconButton
            aria-label="Close panel"
            icon={<ChevronDown size={18} />}
            size="xs"
            variant="ghost"
            color="brand.textPrimary"
            _hover={{ bg: "gray.100", color: "brand.textAccent" }}
            onClick={togglePanel}
          />
        </Flex>

        <Box p={4} minH="200px">
          <VStack align="stretch" spacing={4}>
            <TradeBalanceSummary embedded />

            <Box>
              <Text fontSize="2xs" fontWeight="600" color="brand.textPrimary" mb={2} textTransform="uppercase" letterSpacing="wider" opacity={0.9}>
                Quick amount
              </Text>
              <SimpleGrid columns={5} gap={1}>
                {AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    size="sm"
                    bg={betAmount === String(amt) ? "brand.textAccent" : "brand.buttonBg"}
                    color={betAmount === String(amt) ? "white" : "brand.buttonText"}
                    border="1px solid"
                    borderColor={betAmount === String(amt) ? "brand.textAccent" : "brand.textPrimary"}
                    _hover={{
                      bg: betAmount === String(amt) ? "brand.textPrimary" : "gray.100",
                      color: betAmount === String(amt) ? "white" : "brand.textAccent",
                      borderColor: "brand.textAccent",
                    }}
                    onClick={() => setBetAmount(String(amt))}
                  >
                    {amt}
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            <Box>
              <Text fontSize="2xs" fontWeight="600" color="brand.textPrimary" mb={2} textTransform="uppercase" letterSpacing="wider" opacity={0.9}>
                Amount ({token.symbol})
              </Text>
              <Flex align="center" bg="gray.50" borderRadius="lg" p={1} border="1px solid" borderColor="blackAlpha.200">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  variant="unstyled"
                  px={2}
                  color="brand.textDark"
                  fontFamily="mono"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  _placeholder={{ color: "gray.500" }}
                />
                <Text px={2} fontSize="xs" fontWeight="700" color="brand.textAccent">
                  {token.symbol}
                </Text>
              </Flex>
              <Text fontSize="2xs" color="gray.500" mt={1}>
                Per trade: lose this amount or win amount × multiplier
              </Text>
            </Box>

            <Box>
              <Text fontSize="2xs" fontWeight="600" color="brand.textPrimary" mb={1} textTransform="uppercase" letterSpacing="wider" opacity={0.9}>
                Balance in trading
              </Text>
              <Text fontSize="lg" fontWeight="700" color="brand.textAccent" fontFamily="mono">
                {balanceFormatted} {token.symbol}
              </Text>
            </Box>

            {!isConnected && (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Connect wallet in the navbar to fund play balance.
              </Text>
            )}
          </VStack>
        </Box>

        <Flex p={3} borderTop="1px solid" borderColor="blackAlpha.100" bg="gray.50" align="center" justify="space-between">
          {isConnected && address ? (
            <>
              <Flex align="center" gap={2}>
                <Box w={2} h={2} borderRadius="full" bg="green.500" boxShadow="0 0 8px var(--chakra-colors-green-500)" />
                <Text fontSize="2xs" color="brand.textPrimary" textTransform="uppercase" fontWeight="700">
                  Connected
                </Text>
              </Flex>
              <Text fontSize="2xs" color="brand.textDark" fontFamily="mono">
                {formatAddress(address)}
              </Text>
            </>
          ) : (
            <Text fontSize="2xs" color="brand.textPrimary" textTransform="uppercase" fontWeight="700">
              Connect wallet in navbar
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
