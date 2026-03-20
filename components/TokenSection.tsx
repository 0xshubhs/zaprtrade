"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
  useClipboard,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useTokenData } from "../contexts/TokenDataContext";
import { TOKEN_ADDRESS, GECKOTERMINAL_EMBED_URL } from "../constants";

const MotionBox = motion(Box);

export function TokenSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { hasCopied, onCopy } = useClipboard(TOKEN_ADDRESS);
  const { tokenData } = useTokenData();

  const truncatedAddress = `${TOKEN_ADDRESS.slice(0, 6)}...${TOKEN_ADDRESS.slice(-4)}`;

  return (
    <Box
      id="token"
      bg="brand.darkTeal"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
      borderTop="6px solid"
      borderColor="brand.darkTeal"
    >
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="300px"
        h="300px"
        bg="white"
        opacity={0.05}
        borderRadius="full"
      />

      <Container maxW="7xl" ref={ref}>
        <VStack spacing={{ base: 8, md: 12 }}>
          <VStack spacing={4}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "5xl" }}
                color="white"
              >
                $NUI
              </Heading>
            </MotionBox>
            <Box w="140px" h="4px" bg="brand.lime" />
          </VStack>

          <MotionBox
            position="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box
              position="absolute"
              top="-8px"
              left="-8px"
              w="16px"
              h="16px"
              bg="brand.lime"
              transform="rotate(45deg)"
              border="2px solid"
              borderColor="brand.darkTeal"
            />
            <HStack
              spacing={0}
              bg="white"
              border="4px solid"
              borderColor="white"
              boxShadow="6px 6px 0px 0px #02302C"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "8px 8px 0px 0px #02302C",
              }}
              transition="all 0.2s ease-out"
              cursor="pointer"
              onClick={onCopy}
              role="group"
            >
              <Flex
                bg="brand.lime"
                px={4}
                py={3}
                align="center"
                borderRight="4px solid"
                borderColor="white"
              >
                <Text
                  color="brand.darkTeal"
                  fontSize="sm"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  CA
                </Text>
              </Flex>
              <Flex px={4} py={3} align="center" flex={1}>
                <Text
                  color="brand.darkTeal"
                  fontFamily="mono"
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="medium"
                  display={{ base: "none", md: "block" }}
                >
                  {TOKEN_ADDRESS}
                </Text>
                <Text
                  color="brand.darkTeal"
                  fontFamily="mono"
                  fontSize="sm"
                  fontWeight="medium"
                  display={{ base: "block", md: "none" }}
                >
                  {truncatedAddress}
                </Text>
              </Flex>
              <Flex
                bg={hasCopied ? "brand.green" : "gray.400"}
                minW="50px"
                align="center"
                justify="center"
                alignSelf="stretch"
                borderLeft="4px solid"
                borderColor="white"
                _groupHover={{
                  bg: hasCopied ? "brand.green" : "brand.lime",
                }}
                transition="background 0.2s ease-out"
              >
                {hasCopied ? (
                  <Check size={18} stroke="white" />
                ) : (
                  <Copy size={18} stroke="white" />
                )}
              </Flex>
            </HStack>
            <Box
              position="absolute"
              bottom="-6px"
              right="20px"
              w="12px"
              h="12px"
              bg="brand.lime"
              borderRadius="full"
              border="2px solid"
              borderColor="white"
            />
          </MotionBox>

          <MotionBox
            w="full"
            maxW="4xl"
            bg="brand.darkTeal"
            border="4px solid"
            borderColor="white"
            p={{ base: 4, md: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box
              as="iframe"
              id="geckoterminal-embed"
              title="GeckoTerminal Embed"
              src={GECKOTERMINAL_EMBED_URL}
              w="full"
              h={{ base: "350px", md: "500px" }}
              border="none"
              allow="clipboard-write"
              allowFullScreen
            />

            <Flex
              mt={6}
              justify="space-around"
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <VStack>
                <Text color="whiteAlpha.700" fontSize="sm" fontWeight="bold">
                  MARKET CAP
                </Text>
                <Text color="white" fontSize="2xl" fontWeight="black">
                  {tokenData?.marketCap || "Loading..."}
                </Text>
              </VStack>
              <VStack>
                <Text color="whiteAlpha.700" fontSize="sm" fontWeight="bold">
                  1H CHANGE
                </Text>
                <Text
                  color={
                    tokenData?.change1h !== undefined && tokenData.change1h >= 0
                      ? "green.400"
                      : "red.400"
                  }
                  fontSize="2xl"
                  fontWeight="black"
                >
                  {tokenData?.change1h !== undefined
                    ? `${tokenData.change1h >= 0 ? "+" : ""}${tokenData.change1h.toFixed(2)}%`
                    : "..."}
                </Text>
              </VStack>
              <VStack>
                <Text color="whiteAlpha.700" fontSize="sm" fontWeight="bold">
                  PRICE
                </Text>
                <Text color="white" fontSize="2xl" fontWeight="black">
                  {tokenData?.price || "..."}
                </Text>
              </VStack>
            </Flex>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
