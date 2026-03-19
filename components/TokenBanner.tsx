"use client";

import { Box, HStack, Text } from "@chakra-ui/react";

export function TokenBanner() {
  return (
    <Box position="sticky" top={0} zIndex={100}>
      <HStack
        bg="brand.green"
        py={2}
        px={4}
        justify="center"
        borderBottom="3px solid"
        borderColor="brand.darkTeal"
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          color="white"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Live on Solana
        </Text>
      </HStack>
    </Box>
  );
}
