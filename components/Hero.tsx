"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowRight, Target, Clock } from "lucide-react";
import { TradeChartBox } from "../app/trade/TradeChartBox";
import { useHederaPrice } from "../hooks/useHederaPrice";
import { useSelectedToken } from "../contexts/SelectedTokenContext";

export function Hero() {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { formatted, change24h, isLoading } = useHederaPrice();
  const { token } = useSelectedToken();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      as="section"
      flex={1}
      position="relative"
      minH={{ base: "auto", lg: "calc(100vh - 180px)" }}
      bg="brand.primaryBg"
    >
      <Container maxW="7xl" pt={{ base: 10, md: 20 }} pb={{ base: 10, md: 16 }} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: 8, lg: 10 }} alignItems="center">
          {/* Left: headline + CTA */}
          <Box gridColumn={{ base: 1, lg: "1 / 7" }}>
            <VStack align={{ base: "center", lg: "flex-start" }} spacing={6} textAlign={{ base: "center", lg: "left" }}>
              <Heading
                as="h1"
                fontFamily="heading"
                fontSize={{ base: "4xl", sm: "5xl", md: "6xl", lg: "7xl" }}
                lineHeight="1.1"
                letterSpacing="-0.02em"
                fontWeight="700"
                color="brand.primaryText"
              >
                Trade{" "}
                <Box as="span" color="brand.accentOnBlue">
                  ${token.symbol}
                </Box>{" "}
                like never before.
              </Heading>

              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="brand.primaryText"
                opacity={0.95}
                fontWeight="400"
                maxW="lg"
                lineHeight="tall"
              >
                High-performance infrastructure for micro-duration speculation. Turn short-term price action into
                clear, binary outcomes — on Solana.
              </Text>

              <NextLink href="/trade">
                <Button
                  size="lg"
                  mt={2}
                  as="span"
                  rightIcon={<ArrowRight size={18} />}
                  bg="brand.accentOnBlue"
                  color="brand.primaryBg"
                  fontWeight="bold"
                  _hover={{ bg: "white", color: "brand.primaryBg" }}
                >
                  Launch App
                </Button>
              </NextLink>
            </VStack>
          </Box>

          {/* Right: Live Preview chart — hidden on mobile, only left (headline + CTA) shown */}
          {isDesktop && (
            <Box gridColumn={{ base: 1, lg: "7 / -1" }}>
              <Box
                bg="white"
                borderRadius="xl"
                border="2px solid"
                borderColor="blackAlpha.200"
                overflow="hidden"
                boxShadow="lg"
              >
                {/* Live Preview header bar — primary blue, white text */}
                <Flex
                  px={4}
                  py={3}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.300"
                  bg="brand.primaryBg"
                  align="center"
                  justify="space-between"
                  flexWrap="wrap"
                  gap={2}
                >
                  <Flex align="center" gap={2}>
                    <Target size={16} color="var(--chakra-colors-brand-accentOnBlue)" />
                    <Text fontSize="xs" fontWeight="700" color="brand.accentOnBlue">
                      Live Preview
                    </Text>
                  </Flex>
                  <Flex align="center" gap={4} fontSize="xs" fontFamily="mono" color="brand.primaryText">
                    <Flex align="center" gap={1}>
                      <Clock size={14} />
                      {timeStr}
                    </Flex>
                    <Text fontWeight="700" color="brand.accentOnBlue">
                      {isLoading ? "—" : formatted}
                    </Text>
                    {change24h != null && (
                      <Text
                        fontWeight="600"
                        color={change24h >= 0 ? "brand.accentOnBlue" : "red.200"}
                      >
                        {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                      </Text>
                    )}
                  </Flex>
                </Flex>
                <Box p={2} minH="460px" maxH="580px" h="540px" overflow="hidden">
                  <TradeChartBox compact demo />
                </Box>
              </Box>
            </Box>
          )}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
