"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useHederaPrice } from "../hooks/useHederaPrice";
import { useSelectedToken } from "../contexts/SelectedTokenContext";

export function LandingTicker() {
  const { formatted, change24h, isLoading } = useHederaPrice();
  const { token } = useSelectedToken();

  return (
    <Box
      w="full"
      py={2}
      px={4}
      bg="white"
      borderBottom="1px solid"
      borderColor="blackAlpha.100"
    >
      <Flex justify="center" align="center" gap={{ base: 6, md: 10 }} flexWrap="wrap">
        <Flex align="center" gap={2}>
          <Text fontSize="2xs" fontWeight="700" color="#002583" textTransform="uppercase" letterSpacing="wider">
            Price
          </Text>
          <Text fontSize="sm" fontWeight="700" color="#002583" fontFamily="mono">
            {isLoading ? "Loading…" : formatted}
          </Text>
        </Flex>
        {change24h != null && (
          <Flex align="center" gap={2}>
            <Text fontSize="2xs" fontWeight="600" color="#002583">
              24h Change
            </Text>
            <Text
              fontSize="sm"
              fontWeight="700"
              fontFamily="mono"
              color={change24h >= 0 ? "green.600" : "red.600"}
            >
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </Text>
          </Flex>
        )}
        <Flex align="center" gap={2}>
          <Text fontSize="2xs" fontWeight="700" color="#002583" textTransform="uppercase" letterSpacing="wider">
            Asset
          </Text>
          <Text fontSize="sm" fontWeight="700" color="#002583" fontFamily="mono">
            {token.symbol} / USD
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
