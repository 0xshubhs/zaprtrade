"use client";

import { Flex, Heading, Text } from "@chakra-ui/react";
import { Navigation } from "../components/Navigation";

export default function Home() {
  return (
    <Flex as="main" direction="column" minH="100vh" bg="brand.primaryBg">
      <Navigation />
      <Flex flex={1} align="center" justify="center" direction="column" gap={4}>
        <Heading color="brand.primaryText" fontSize="5xl">ZapTrade</Heading>
        <Text color="brand.primaryText" opacity={0.8}>Coming soon</Text>
      </Flex>
    </Flex>
  );
}
