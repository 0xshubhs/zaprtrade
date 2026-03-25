export interface TokenConfig {
  id: string;
  symbol: string;
  name: string;
  coingeckoId: string;
  /** Approximate price for demo mode base price. */
  demoBasePrice: number;
  /** Price decimal places for display. */
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
  {
    id: "wif",
    symbol: "WIF",
    name: "dogwifhat",
    coingeckoId: "dogwifcoin",
    demoBasePrice: 0.5,
    decimals: 4,
  },
  {
    id: "jto",
    symbol: "JTO",
    name: "Jito",
    coingeckoId: "jito-governance-token",
    demoBasePrice: 2.5,
    decimals: 3,
  },
  {
    id: "pyth",
    symbol: "PYTH",
    name: "Pyth Network",
    coingeckoId: "pyth-network",
    demoBasePrice: 0.3,
    decimals: 4,
  },
  {
    id: "w",
    symbol: "W",
    name: "Wormhole",
    coingeckoId: "wormhole",
    demoBasePrice: 0.2,
    decimals: 4,
  },
  {
    id: "orca",
    symbol: "ORCA",
    name: "Orca",
    coingeckoId: "orca",
    demoBasePrice: 3,
    decimals: 3,
  },
  {
    id: "render",
    symbol: "RENDER",
    name: "Render",
    coingeckoId: "render-token",
    demoBasePrice: 4.5,
    decimals: 3,
  },
  {
    id: "hnt",
    symbol: "HNT",
    name: "Helium",
    coingeckoId: "helium",
    demoBasePrice: 4,
    decimals: 3,
  },
  {
    id: "drift",
    symbol: "DRIFT",
    name: "Drift Protocol",
    coingeckoId: "drift-protocol",
    demoBasePrice: 0.7,
    decimals: 4,
  },
  {
    id: "tensor",
    symbol: "TNSR",
    name: "Tensor",
    coingeckoId: "tensor",
    demoBasePrice: 0.4,
    decimals: 4,
  },
  {
    id: "popcat",
    symbol: "POPCAT",
    name: "Popcat",
    coingeckoId: "popcat",
    demoBasePrice: 0.3,
    decimals: 4,
  },
  {
    id: "bome",
    symbol: "BOME",
    name: "Book of Meme",
    coingeckoId: "book-of-meme",
    demoBasePrice: 0.005,
    decimals: 6,
  },
  {
    id: "mew",
    symbol: "MEW",
    name: "cat in a dogs world",
    coingeckoId: "cat-in-a-dogs-world",
    demoBasePrice: 0.003,
    decimals: 6,
  },
  {
    id: "mnde",
    symbol: "MNDE",
    name: "Marinade",
    coingeckoId: "marinade",
    demoBasePrice: 0.08,
    decimals: 4,
  },
  {
    id: "mobile",
    symbol: "MOBILE",
    name: "Helium Mobile",
    coingeckoId: "helium-mobile",
    demoBasePrice: 0.0005,
    decimals: 6,
  },
];

export const DEFAULT_TOKEN = SOLANA_TOKENS[0]; // SOL
