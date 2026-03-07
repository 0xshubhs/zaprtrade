"use client";

import { Box, Container, Flex, Text } from "@chakra-ui/react";

export function Footer() {
  return (
    <Box as="footer" bg="brand.darkTeal" mt="auto">
      <Container maxW="6xl" py={5}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Text color="whiteAlpha.900" fontSize="sm" fontWeight="600">
            ZapTrade
          </Text>
          <Text color="whiteAlpha.700" fontSize="sm">
            All rights reserved.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
