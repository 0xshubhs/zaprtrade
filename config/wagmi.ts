import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

/** Solana Devnet — using EVM-compatible config for now (wallet infra migration pending). */
export const solanaDevnet = defineChain({
  id: 296,
  name: "Solana Devnet",
  nativeCurrency: {
    symbol: "SOL",
    name: "SOL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "Solscan",
      url: "https://solscan.io",
    },
  },
});

export const config = getDefaultConfig({
  appName: "ZapTrade",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [solanaDevnet],
  ssr: true,
});
