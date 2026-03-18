"use client";

import { Box, Flex, Text } from "@chakra-ui/react";

const BOX_COUNT = 6; // 3 past, 1 live, 2 future (like blipmarket)

interface PriceMovementBoxesProps {
  dark?: boolean;
}

export function PriceMovementBoxes({ dark = false }: PriceMovementBoxesProps) {
  return (
    <Flex
      p={2}
      gap={1}
      borderTop="1px solid"
      borderColor={dark ? "whiteAlpha.300" : "blackAlpha.100"}
      bg={dark ? "transparent" : "gray.50"}
      align="center"
      justify="space-between"
      borderRadius="md"
      mt={2}
    >
      {Array.from({ length: BOX_COUNT }, (_, i) => {
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
            borderColor={isLive ? "brand.accentOnBlue" : dark ? "whiteAlpha.400" : "blackAlpha.200"}
            bg={isLive ? "brand.accentOnBlue" : isPast ? (dark ? "whiteAlpha.200" : "white") : dark ? "whiteAlpha.100" : "gray.100"}
            textAlign="center"
            opacity={isFuture ? 0.7 : 1}
            style={isLive ? { animation: "priceBoxLive 1.5s ease-in-out infinite" } : undefined}
          >
            <Text
              fontSize="2xs"
              fontWeight={isLive ? "700" : "600"}
              color={isLive ? "brand.textDark" : dark ? "white" : "brand.textPrimary"}
            >
              {isPast ? "Past" : isLive ? "Live" : "Future"}
            </Text>
          </Box>
        );
      })}
      <style>{`
        @keyframes priceBoxLive {
          0%, 100% { box-shadow: 0 0 0 0 rgba(4, 59, 203, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(4, 59, 203, 0.1); }
        }
      `}</style>
    </Flex>
  );
}
