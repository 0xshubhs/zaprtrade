"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HederaMarketLogo } from "./HederaMarketLogo";

export function Navigation() {
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={50}
      bg="brand.primaryBg"
      px={{ base: 4, md: 6 }}
      py={3}
    >
      <Flex justify={{ base: "center", md: "space-between" }} align="center" maxW="7xl" mx="auto">
        <NextLink href="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap={1}>
            <HederaMarketLogo size={18} />
            <Text fontWeight="700" fontSize="lg" letterSpacing="tight" color="brand.accentOnBlue" lineHeight="1">
              ZapTrade
            </Text>
          </Flex>
        </NextLink>
        <Box display={{ base: "none", md: "block" }} sx={{ "& [data-rk]": { color: "var(--chakra-colors-brand-accentOnBlue) !important" } }}>
          <ConnectButton />
        </Box>
      </Flex>
    </Box>
  );
}
