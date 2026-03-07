"use client";

import { Box } from "@chakra-ui/react";

const ACCENT = "#ADFF01";

interface HederaMarketLogoProps {
  size?: number;
  className?: string;
}

/** HederaMarket mark: flow curve + live dot. */
export function HederaMarketLogo({ size = 18, className }: HederaMarketLogoProps) {
  const w = 22;
  const h = 18;
  return (
    <Box
      as="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      width={(size * w) / h}
      height={size}
      flexShrink={0}
      display="block"
      className={className}
      aria-hidden
    >
      <path
        d="M 2 14 C 6 14 7 8 11 10 C 15 12 16 6 20 8"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="8" r="2" fill={ACCENT} />
    </Box>
  );
}
