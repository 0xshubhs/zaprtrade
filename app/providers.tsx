"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { theme } from "../theme";
import { SelectedTokenProvider } from "../contexts/SelectedTokenContext";
import { config } from "../config/wagmi";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <CacheProvider>
            <ChakraProvider theme={theme}>
              <SelectedTokenProvider>
                {children}
              </SelectedTokenProvider>
            </ChakraProvider>
          </CacheProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
