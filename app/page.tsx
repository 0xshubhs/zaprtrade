"use client";

import { Flex } from "@chakra-ui/react";
import { Navigation, LandingTicker, Hero } from "../components";

export default function Home() {
  return (
    <Flex as="main" direction="column" minH="100vh" bg="brand.primaryBg">
      <Navigation />
      <LandingTicker />
      <Hero />
    </Flex>
  );
}
