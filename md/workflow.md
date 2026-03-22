# HederaMarket — Workflow & Architecture

How the dapp is built, what contracts and APIs are used (or planned), and how data flows.

---

## 1. Overview

**HederaMarket** is a marketplace dapp on **Hedera** (Hedera Testnet). Users connect their wallet via RainbowKit, and the frontend will read/write marketplace data from smart contracts and optional backend/indexer APIs.

---

## 2. Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | Next.js 16 (App Router) |
| UI          | Chakra UI, Framer Motion |
| Wallet      | RainbowKit + Wagmi + Viem |
| Network     | Hedera Testnet (chain id 296, Hashio RPC) |
| Data / state | React context (mock), TanStack Query (for future API/contract reads) |

---

## 3. Wallet & Network Config

- **Config file:** `config/wagmi.ts`
- **Chain:** Hedera Testnet via `defineChain` (id 296, RPC: `https://testnet.hashio.io/api`, explorer: Hashscan testnet).
- **App name:** `HederaMarket` (used by RainbowKit/WalletConnect).
- **Env:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for WalletConnect Cloud (optional; falls back to placeholder if unset).

The app is Hedera-only (HBAR).

---

## 4. Contracts (Current & Planned)

### Current

- **None.** No contract addresses or ABIs are wired yet. The app is UI + wallet connect only.

### Planned (for marketplace)

When you add contracts, document them here and in `constants.ts`:

| Contract role   | Purpose | Network | Notes |
|-----------------|---------|---------|--------|
| Marketplace     | Listings, buy/sell, fees | Hedera Testnet | Deploy or use existing Hedera marketplace contract |
| NFT / FT        | Items or payment token (e.g. HBAR) | Same | If you use NFTs for listings or a specific token |
| (Optional) Escrow | Hold funds until delivery | Same | If you implement escrow |

**Where to plug them in:**

- Put contract addresses (and optionally ABIs) in `constants.ts` or env (e.g. `NEXT_PUBLIC_MARKETPLACE_ADDRESS`).
- Use Wagmi hooks (`useReadContract`, `useWriteContract`) or Viem `publicClient`/`walletClient` to read/write. All of that will use the same Flow EVM chain from `config/wagmi.ts`.

---

## 5. APIs & Data Fetching

### Current (FlowMarket)

- **FLOW token price:** **CoinGecko** (public API).  
  - **API:** CoinGecko Simple Price  
  - **URL:** `https://api.coingecko.com/api/v3/simple/price?ids=flow&vs_currencies=usd&include_24hr_change=true`  
  - **Coin id:** `flow` (must be `flow`, not `flow-token`).  
  - `lib/flowPrice.ts` + `hooks/useFlowPrice.ts`; trade page polls every 15s. No API key (free tier).  

**Other options you can use later:** any public price API or your own backend for tokens.
- **No backend:** No `app/api/` routes.

### Planned (for real data)

Choose one (or combine) and document in this file:

| Source | Use case | Example |
|--------|----------|--------|
| **Flow EVM RPC** | Contract reads (listings, user balance, etc.) | Wagmi `useReadContract` or Viem `publicClient.readContract` |
| **Indexer / subgraph** | Listings, history, search | REST or GraphQL API; call from React (e.g. `fetch` or TanStack Query) |
| **Your backend** | Auth, off-chain metadata, analytics | Next.js API routes in `app/api/*` calling your DB or external APIs |
| **Flow API / explorer** | Transaction history, account info | e.g. Flow Diver or Flow HTTP API if you need non-EVM data |

Once you add an API:

- Add base URL and keys to env (e.g. `NEXT_PUBLIC_INDEXER_URL`, `NEXT_PUBLIC_FLOW_API_KEY`).
- Use TanStack Query in the app for caching and loading states; keep contract reads in Wagmi/Viem.

---

## 6. Data Flow (High Level)

```
User browser
    │
    ├── RainbowKit (ConnectButton in navbar)
    │       └── Wagmi config → Flow EVM Testnet
    │
    ├── Page / components
    │       ├── Hero, Footer (static copy)
    │       └── FLOW price from CoinGecko (navbar)
    │
    └── (Future)
            ├── Read: useReadContract / publicClient → Marketplace contract (listings, user)
            ├── Write: useWriteContract / walletClient → List, buy, cancel
            └── Optional: fetch(indexer or backend) → listings, history, metadata
```

---

## 7. File Map (Where Things Live)

| What | Where |
|------|--------|
| Wallet + chain config | `config/wagmi.ts` |
| Providers (Wagmi, RainbowKit, Chakra, TokenData) | `app/providers.tsx` |
| Contract addresses / env-driven constants | `constants.ts` (and `.env.local`) |
| Main page layout | `app/page.tsx` |
| Nav + ConnectButton | `components/Navigation.tsx` |

---

## 8. Env & Config Checklist

- [ ] **WalletConnect:** Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local` for production.
- [ ] **Contracts:** When deployed, set e.g. `NEXT_PUBLIC_MARKETPLACE_ADDRESS` and use in `constants.ts` or config.
- [ ] **APIs:** When you add an indexer or backend, add `NEXT_PUBLIC_*` (or server-only) env vars and document them here.

---

## 9. Summary

- **How we’re making it:** Next.js + Chakra + RainbowKit/Wagmi on Flow EVM Testnet; no contracts or real APIs yet.
- **Contracts:** None integrated; plan is Flow EVM marketplace (and optionally NFT/FT) contracts.
- **APIs:** No live APIs; token data is mock; real data will come from contract reads and/or an indexer/backend.
- **Next steps:** Deploy or wire marketplace contract → add addresses to config → replace mock/static data with `useReadContract` and (optionally) indexer/API calls.

Update this doc as you add contracts, APIs, and new flows.

---

## 10. Making the app work (beyond oracle)

For end-to-end betting (place bet → resolve → balance + history), see **`md/OPTIMIZED_WORKFLOW.md`**. That doc:

- Explains how Blipmarket-style systems work (grid, place bet, resolution, balance/ledger) without copying code.
- Describes what FlowMarket has today (client-only store, in-memory balance/history).
- Lists the minimal pieces needed beyond oracle integration: **auth**, **persistent balance + ledger**, **place-bet API**, **resolution job** (scheduled or worker), and optionally **grid/cells** and **deposit/withdrawal**.
- Outlines a minimal backend shape (tables, endpoints, resolution flow) so the app can work with real or demo balances and history.

---

## 11. Blipmarket grid reference (timeframe & ray speed)

For aligning FlowMarket’s trade grid with Blipmarket’s behaviour:

| Aspect | Blipmarket |
|--------|------------|
| **Grid timeframe** | **60 seconds per column** (`timeframe_sec = 60`). Each vertical column is one 1‑minute window. |
| **Visible time range** | **10 × timeframe** = **10 minutes** in view by default (`viewportTimeRange = selectedTimeframe * 10 * 1000` in `useGridViewport`). So ~10 columns on screen. |
| **Time → X mapping** | `getX(t) = (t - viewportStart) / viewportDuration * width`. The full chart width = 10 minutes; time is linear in x. |
| **Ray / “now” line speed** | **Real time**: viewport is centered on `now`, which updates (e.g. every 5 s). So 1 second of real time = 1 second on the time axis. In pixels: **speed ≈ width / viewportDuration** (e.g. 800 px ÷ 600 s ≈ **1.33 px/s**). The vertical “now” line and price dot move slowly because the window is 10 minutes wide. |
| **Price axis** | Price range is viewport-based (e.g. ~10 price bands); user can zoom/pan. |

So: **1 min per column**, **10 min on screen**, **ray moves in real time** (so very slow in px/s). FlowMarket’s grid can mirror this with a 60 s column interval and a viewport that shows ~10 minutes so the line doesn’t race across the screen.
