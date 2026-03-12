export interface TokenConfig {
  id: string;
  symbol: string;
  name: string;
  coingeckoId: string;
  demoBasePrice: number;
  decimals: number;
}

export const SOLANA_TOKENS: TokenConfig[] = [
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    coingeckoId: "solana",
    demoBasePrice: 140,
    decimals: 2,
  },
  {
    id: "jup",
    symbol: "JUP",
    name: "Jupiter",
    coingeckoId: "jupiter-exchange-solana",
    demoBasePrice: 0.8,
    decimals: 4,
  },
  {
    id: "ray",
    symbol: "RAY",
    name: "Raydium",
    coingeckoId: "raydium",
    demoBasePrice: 3.5,
    decimals: 3,
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "Bonk",
    coingeckoId: "bonk",
    demoBasePrice: 0.000018,
    decimals: 8,
  },
];

export const DEFAULT_TOKEN = SOLANA_TOKENS[0];
