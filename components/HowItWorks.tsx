"use client";

import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { Target, Zap, Trophy } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Pick your price band",
    subtitle: "Choose where you think the price will go. Higher or lower — clear outcomes.",
    icon: Target,
  },
  {
    number: "02",
    title: "Place your stake",
    subtitle: "Put your prediction to the test. Connect wallet and trade in seconds.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Win when you're right",
    subtitle: "Collect your rewards instantly. Multipliers scale with risk.",
    icon: Trophy,
  },
];

export function HowItWorks() {
  return (
    <Box as="section" bg="white" py={{ base: 12, md: 16 }} borderTop="1px solid" borderColor="blackAlpha.100">
      <Container maxW="6xl">
        <VStack spacing={{ base: 8, md: 12 }}>
          <VStack spacing={2} textAlign="center">
            <Text fontSize="2xs" fontWeight="700" color="brand.darkTeal" textTransform="uppercase" letterSpacing="wider">
              How it works
            </Text>
            <Heading as="h2" size="lg" color="brand.darkTeal" fontFamily="heading">
              Predict. Trade. Win.
            </Heading>
          </VStack>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: 8, md: 6 }}
            justify="space-between"
            w="full"
            flexWrap="wrap"
          >
            {STEPS.map((step) => (
              <Box
                key={step.number}
                flex={{ base: "1 1 100%", md: "1 1 0" }}
                minW={{ md: "200px" }}
                maxW={{ md: "280px" }}
                p={6}
                borderRadius="xl"
                border="2px solid"
                borderColor="blackAlpha.100"
                bg="brand.lime"
                _hover={{ borderColor: "brand.green", shadow: "md" }}
                transition="all 0.2s"
              >
                <Flex align="center" gap={3} mb={4}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="lg"
                    bg="brand.darkTeal"
                    color="brand.lime"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <step.icon size={20} />
                  </Box>
                  <Text fontSize="2xs" fontWeight="700" color="brand.darkTeal" letterSpacing="wider">
                    STEP {step.number}
                  </Text>
                </Flex>
                <Heading as="h3" size="sm" color="brand.darkTeal" mb={2} fontFamily="heading">
                  {step.title}
                </Heading>
                <Text fontSize="sm" color="brand.darkTeal" opacity={0.85} lineHeight="tall">
                  {step.subtitle}
                </Text>
              </Box>
            ))}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}
