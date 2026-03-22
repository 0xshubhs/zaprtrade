# HederaMarket — Optimized Workflow (Beyond Oracle)

How to make the app work end-to-end. This doc is based on understanding **Blipmarket**’s architecture (not copying it) and maps a minimal, optimized path for **HederaMarket**.

---

## 1. How Blipmarket Works (Conceptual)

### 1.1 Grid model

- **Grid** = time × price. One grid per asset (e.g. ETH-USD) and timeframe (e.g. 60s).
- **Time**: Fixed windows (e.g. 1:00–1:01, 1:01–1:02). `timeframe_sec`, `start_time`, aligned to a boundary.
- **Price**: Bands from an anchor (e.g. $3000 ± $5 steps). Each **cell** = one time window × one price band: `[t_start, t_end]` × `[p_low, p_high]`.
- Cells can be **real** (already created) or **virtual** (“future” cells created when the first bet is placed on that window/band).

### 1.2 Place bet (optimized flow)

1. **Auth** → `user_id`. User must exist and have a balance (practice or real).
2. **Validate** → stake amount, cell exists or is a valid future cell, cell not **frozen** (within N windows of “now”), and (if contest mode) cell window ≤ contest end.
3. **Atomic deduction** → subtract stake from user balance (practice or real/testnet/mainnet). Fail fast if insufficient.
4. **Ledger** → append immutable entry (user, asset, amount = -stake, type = bet).
5. **Cell** → if cell is virtual, create it and **schedule resolution** at `t_end`.
6. **Pricing** → share-based: compute `shares_bought`, `purchase_price`, `potential_payout`; increment cell’s total shares; enforce per-cell share cap if any.
7. **Position** → save (user, cell, stake, shares, potential_payout, state = active). On any later failure (e.g. share increment), **rollback** balance.

So: one atomic debit, one ledger line, optional cell creation + resolution schedule, share math, then persist position.

### 1.3 Resolution (optimized flow)

1. **Trigger** → at window end (scheduled when the first bet on that window is placed) or via a worker that polls for due windows.
2. **Lock** → claim a resolution lock for `(grid_id, window_index)` so the same window is never settled twice.
3. **Price** → get price **history** for the window (from cache/DB or historical API). Blipmarket uses **min/max price over the window**: a cell wins if the band `[p_low, p_high]` **overlaps** the observed range `[minPrice, maxPrice]` (i.e. price “touched” that band during the window).
4. **Winners** → all positions in winning cells get payout (share-based: `potential_payout`; or pool-based: stake + share of losing pool minus fee).
5. **Settlement** → credit winner balances, append ledger (payout, fee, platform PnL), mark positions resolved. Losers already had stake deducted at bet time; no second debit.

So: lock → price range for window → which cells overlap → credit winners + ledger → release lock.

### 1.4 Balance and ledger

- **Balance**: Per-user, per-mode (practice / testnet / mainnet). Deposits credit balance; place bet debits; resolution credits winners.
- **Ledger**: Append-only log (user, amount, type, timestamp). Used for history, support, and auditing. No in-place updates.

### 1.5 What Blipmarket does not do in the hot path

- No on-chain tx for each bet (off-chain bookkeeping; optional relayer for deposits/withdrawals).
- Resolution is **scheduled by time** (or worker), not by user action. Oracle/price is a separate concern (price service + history).

---

## 2. HederaMarket Today

| Piece            | Status |
|------------------|--------|
| UI / trade page  | Done (grid, chart, panel, history). |
| Price (display) | CoinGecko; used for display and client-side resolution. |
| “Place bet”      | Client-only: `hederaBetStore.placeBet` deducts in-memory balance and registers a pending bet. |
| Resolution       | Client-only: after `durationSeconds`, frontend fetches price and calls `resolveBet(betId, endPrice)`. |
| Balance          | In-memory (e.g. HBAR demo). No persistence, no auth. |
| History          | In-memory list; lost on refresh. |
| Auth             | Wallet connect only; no backend user id. |
| Grid / cells     | UI-only (time × price cells for display). No server-side grid or cell ids. |

So: **no backend, no persistence, no auth, no real money**. Only oracle integration is “we use CoinGecko”; you asked to leave oracle integration out of this doc.

---

## 3. What HederaMarket Needs (Beyond Oracle) to “Work”

To make the app **work** in a production-ready way (without specifying how you integrate the oracle), you need at least the following. Order is a suggestion.

### 3.1 Identity and auth

- **Backend** (or BFF) must know “who is betting”: e.g. wallet address or session id.
- Flow: user connects wallet → backend issues a session or JWT tied to that address (and optionally a signed message). Every protected call sends that credential.
- **Optimization**: Same auth as you’d use for any API; no need to mirror Blipmarket’s exact auth.

### 3.2 Persistent balance and ledger

- **Balance**: Stored per user (and optionally per “mode”: demo vs real). Deduct on place bet; credit on win.
- **Ledger**: Append-only rows (user, amount, type, time, bet_id, etc.). Enables history, support, audits.
- **Optimization**: Start with a single balance column and a single ledger table; add “mode” or “currency” later if you need demo vs real.

### 3.3 Place-bet API (or contract)

- **Inputs**: user (from auth), cell or (time window + price band), stake, optional params (e.g. direction for binary, or cell id for grid).
- **Logic**: Validate (stake limits, cell/window valid and not frozen, balance ≥ stake). Atomic: deduct balance → write ledger → create/update position (and optionally cell). If you use share-based pricing, compute shares and potential payout and store them.
- **Output**: position id and/or updated balance. Frontend calls this instead of (or in addition to) `hederaBetStore.placeBet` for real/demo.

**HederaMarket today** uses “direction + duration + amount” (UP/DOWN, 5–60s, FLOW amount). So the “cell” can be implicit: (window = now + duration, band = “price goes UP” or “price goes DOWN” vs start price). Your backend only needs to support that model: e.g. `(user, direction, duration_sec, amount, start_price)` and store a row per bet.

### 3.4 Resolution (scheduled or worker)

- **When**: At the end of each bet’s window (or a cron/worker that finds “due” bets).
- **How**: For each due bet, get **resolution price** (your oracle or price source). Winner = UP and end_price > start_price, or DOWN and end_price < start_price. Payout = stake × multiplier (you already have multiplier in the client).
- **Actions**: Credit winner balance, append ledger (payout), mark position resolved. No double-processing: use a lock or “resolved_at” flag per position.

**Optimization**: Like Blipmarket, **schedule resolution at place-bet time** (e.g. “run at `placed_at + duration_sec`”) or have a single worker that runs every few seconds and resolves all positions whose `window_end <= now`. One job per window or one job per position—your choice; avoid resolving the same position twice.

### 3.5 Grid and cells (optional for “simple” binary)

- **Full grid** (Blipmarket-style): You need server-side grids and cells (time windows × price bands), cell ids, and “frozen” rules. Place bet sends `cell_id`; resolution uses “which cell contains the resolution price (or price range)”.
- **Binary only** (HederaMarket current): No grid on the server. Each bet is (user, direction, amount, duration, start_price, multiplier). Resolution only needs start_price, end_price, direction. So you can **skip** grid/cell tables and resolution logic for “winning cell” until you add a full grid product.

### 3.6 Deposit and withdrawal (optional for MVP)

- **Deposit**: User sends FLOW (or wrapped token) to a treasury; your system detects it (watcher or indexer) and credits balance. Optional: use relayer to batch or simplify UX.
- **Withdrawal**: User requests; backend checks balance and sends FLOW (or triggers a contract). Optional for MVP if you only do “demo” balance.

---

## 4. Minimal Backend Shape (HederaMarket)

Without copying Blipmarket’s code, a minimal backend that makes the app “work”:

1. **Auth**  
   - Wallet-based session or JWT.  
   - Middleware: attach `user_id` (or address) to requests.

2. **Tables (conceptual)**  
   - **users**: id, wallet_address, balance_demo, balance_real, created_at, updated_at.  
   - **ledger**: id, user_id, amount, type (BET, PAYOUT, DEPOSIT, etc.), ref_id (position_id), created_at.  
   - **positions**: id, user_id, direction, amount, multiplier, start_price, window_end_at, resolved_at, payout, status (active | resolved).  

   (Add grid/cells only when you add full grid betting.)

3. **Endpoints**  
   - `POST /api/bet` — auth required; body: `{ direction, amount, duration_sec }`. Validate, deduct balance, insert ledger + position, return position id. Optionally enqueue or schedule resolution at `now + duration_sec`.  
   - `GET /api/balance` — auth required; return user balance(s).  
   - `GET /api/positions` or `GET /api/history` — auth required; return user’s positions (and/or ledger slice).  
   - Internal or cron: **resolution job** that loads positions with `window_end_at <= now` and `status = active`, gets end price (oracle), sets winner/loser, credits payout, appends ledger, updates position.

4. **Frontend**  
   - Replace (or back) `hederaBetStore.placeBet` with `POST /api/bet` and refresh balance/history from API.  
   - Keep or replace client-side resolution with “poll history” or “subscribe to position updates” so the UI shows resolved state and new balance.

---

## 5. Summary

- **Blipmarket**: Grid (time × price), atomic balance + ledger, place bet with share pricing and optional cell creation, resolution **scheduled at window end** using **price range over the window** to determine winning cells, no on-chain bet tx.
- **HederaMarket**: Today = client-only demo (in-memory balance, client-side resolve). To “work” beyond oracle:
  - Add **auth** and **persistent balance + ledger**.
  - Add **place-bet API** (or contract) that debits balance and stores a position (and optionally schedules resolution).
  - Add **resolution** (scheduled or worker) that uses your price source, decides win/loss, credits payout, and updates position.
  - Optionally add **grid/cells** when you move from binary (UP/DOWN) to full grid; optionally add **deposit/withdrawal** when you use real funds.

Oracle integration (where you get the resolution price and how you trust it) is a separate design; this doc focuses on the rest of the workflow so the app can function end-to-end.
