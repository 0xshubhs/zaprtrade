"use client";

import { Box } from "@chakra-ui/react";
import { GeometricShape } from "./GeometricShape";

type DecoratorColor = "red" | "blue" | "yellow";
type DecoratorShape = "circle" | "square" | "triangle";

interface CardProps {
  children: React.ReactNode;
  decoratorColor: DecoratorColor;
  decoratorShape: DecoratorShape;
  h?: string;
}

export function Card({
  children,
  decoratorColor,
  decoratorShape,
  h,
}: CardProps) {
  return (
    <Box
      h={h}
      bg="white"
      border="3px solid"
      borderColor="brand.darkTeal"
      boxShadow="4px 4px 0px 0px #02302C"
      p={6}
      position="relative"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "6px 6px 0px 0px #02302C",
      }}
      transition="all 0.2s ease-out"
    >
      <Box mb={4}>
        <GeometricShape
          shape={decoratorShape}
          color={decoratorColor}
          size="14px"
        />
      </Box>
      {children}
    </Box>
  );
}
