"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useHederaPrice } from "../hooks/useHederaPrice";
import { useSelectedToken } from "../contexts/SelectedTokenContext";

export function FlowPriceTicker() {
  const { formatted, change24h, isLoading } = useHederaPrice();
  const { token } = useSelectedToken();

  if (isLoading) {
    return (
      <Box
        w="full"
        py={2}
        px={4}
        bg="white"
        borderBottom="1px solid"
        borderColor="blackAlpha.100"
      >
        <Flex justify="center" align="center" gap={6}>
          <Text fontSize="xs" fontWeight="600" color="brand.darkTeal">
            {token.symbol}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Loading...
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      py={2}
      px={4}
      bg="white"
      borderBottom="1px solid"
      borderColor="blackAlpha.100"
    >
      <Flex justify="center" align="center" gap={{ base: 4, md: 8 }} flexWrap="wrap">
        <HStack spacing={2}>
          <Text fontSize="xs" fontWeight="700" color="brand.darkTeal" textTransform="uppercase" letterSpacing="wider">
            {token.symbol}
          </Text>
          <Text fontSize="sm" fontWeight="700" color="brand.darkTeal">
            {formatted}
          </Text>
        </HStack>
        {change24h != null && (
          <HStack spacing={2}>
            <Text fontSize="xs" fontWeight="600" color="gray.600">
              24h
            </Text>
            <Text
              fontSize="sm"
              fontWeight="700"
              color={change24h >= 0 ? "green.600" : "red.600"}
            >
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </Text>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
