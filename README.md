# ZapTrade

**High-performance micro-duration trading on Solana.**

ZapTrade is a real-time prediction trading platform built on the Solana ecosystem. Users speculate on short-term price movements of Solana tokens by selecting grid cells — each representing a 1-minute time window and a price band. If the price touches the selected band within the window, the user wins a multiplier-based payout. Think of it as binary options meets grid trading, designed for speed and simplicity.

---

## Problem

Retail traders in the Solana ecosystem lack simple, fast-execution tools for short-term speculation. Existing DEXes focus on swaps and limit orders — there is no native, gamified micro-duration prediction product on Solana. Users turn to centralized platforms with worse UX, higher fees, and no on-chain transparency.

## Solution

ZapTrade brings sub-minute prediction trading to Solana with:

- **Grid-based UI** — Visual, intuitive interface where each cell is a bet. No complex order books or chart analysis required.
- **18 Solana tokens** — Live prices for SOL, JUP, RAY, BONK, WIF, JTO, PYTH, W, ORCA, RENDER, HNT, DRIFT, TNSR, POPCAT, BOME, MEW, MNDE, MOBILE — all fetched in real-time from CoinGecko.
- **Instant resolution** — 60-second rounds. Price is captured at bet placement and checked after the window. Win/loss is binary and immediate.
- **Risk-scaled multipliers** — Cells farther from the current price offer higher multipliers (up to 10x). Closer cells pay less but win more often.
- **Wallet-native** — Connect via RainbowKit, fund a play balance, and trade in seconds.

## Market Opportunity

- The global online gambling & prediction market is projected to exceed **$130B by 2027**.
- Solana's sub-second finality and low fees make it ideal for high-frequency micro-bets.
- Platforms like Polymarket (Ethereum/Polygon) have proven demand for prediction markets — ZapTrade brings this model to Solana with a trading-native UX.

---

## Features

- **Landing page** — Hero section with live token price, demo chart with simulated price movement and bet effects.
- **Trade page** (`/trade`) — Full-screen interactive grid: 5 minutes of price history, live "now" line, and clickable future cells for placing bets.
- **Token selector** — Dropdown with 18 Solana ecosystem tokens, each with live CoinGecko price feeds.
- **Trade panel** — Balance & exposure tracking, transfer-to-play, quick bet amounts, and custom input.
- **Trade history** — Bottom-right popup showing recent results (won/lost, payout amount).
- **Dynamic price scaling** — Chart grid automatically adjusts price intervals based on the selected token's value (works for SOL at $140 and BONK at $0.00001).

---

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | Next.js 16 (App Router, Turbopack) |
| Language    | TypeScript |
| UI          | Chakra UI v2, Framer Motion, Lucide Icons |
| Wallet      | RainbowKit, Wagmi v2, Viem |
| Price Feeds | CoinGecko API (real-time, 15s polling on trade, 60s on landing) |
| State       | In-memory bet store with observer pattern (contract integration planned) |
| Deployment  | Vercel-ready |

---

## Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| 1 | MVP — Grid trading UI with live CoinGecko prices, 18 Solana tokens | Done |
| 2 | Solana wallet integration (Phantom, Solflare via `@solana/wallet-adapter`) | In Progress |
| 3 | On-chain bet settlement via Solana smart contracts (Anchor/Rust) | Planned |
| 4 | Pyth/Switchboard oracle integration for tamper-proof price feeds | Planned |
| 5 | SPL token wagering (bet with SOL, USDC, or project tokens) | Planned |
| 6 | Leaderboards, referral system, and social trading features | Planned |
| 7 | Mobile-optimized PWA | Planned |

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Select a token from the dropdown on the trade page and start trading.

---

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run start`   | Run production server    |
| `npm run lint`    | Run ESLint               |

---

## Environment

Create `.env.local` in the project root:

```env
# Optional: WalletConnect project ID for mobile wallet support
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## Project Structure

```
zaptrade/
├── app/
│   ├── layout.tsx, page.tsx        # Root layout & landing page
│   ├── providers.tsx               # Chakra + RainbowKit + TokenContext
│   └── trade/
│       ├── page.tsx                # Trade page with token dropdown
│       └── TradeChartBox.tsx       # Interactive grid (SVG, ~700 LOC)
├── components/
│   ├── Navigation.tsx              # Navbar (ZapTrade logo + Connect)
│   ├── Hero.tsx                    # Landing hero + live demo chart
│   ├── LandingTicker.tsx           # Live price strip
│   └── trade/                      # TradePanel, TradeMiniHistory, TradeBalanceSummary
├── contexts/
│   ├── SelectedTokenContext.tsx     # Token selection state (18 Solana tokens)
│   └── TokenDataContext.tsx        # Token metadata
├── hooks/
│   ├── useHederaBet.ts             # Bet placement & resolution
│   └── useHederaPrice.ts           # CoinGecko price polling
├── lib/
│   ├── tokenConfig.ts              # Token definitions (CoinGecko IDs, symbols, decimals)
│   ├── hbarPrice.ts                # CoinGecko API fetcher with retries
│   └── hederaBetStore.ts           # In-memory bet store (balance, pending, history)
└── config/
    └── wagmi.ts                    # Chain config
```

---

## Team

Built for the Solana SuperTeam Grant program.

---

## License

MIT
