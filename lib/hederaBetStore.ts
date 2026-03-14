/**
 * Client-side HBAR betting logic (no backend yet).
 * Similar to Bchnomo/Blipmarket: balance, place bet, resolve after duration, history.
 */

export interface HederaTradeRecord {
  id: string;
  cellId: string;
  direction: "UP" | "DOWN";
  amount: number;
  payout: number;
  won: boolean;
  timestamp: number;
  durationSeconds: number;
  multiplier: number;
}

interface PendingBet {
  id: string;
  cellId: string;
  direction: "UP" | "DOWN";
  amount: number;
  multiplier: number;
  startPrice: number;
  priceTop: number;
  priceBottom: number;
  durationSeconds: number;
  placedAt: number;
}

const DEFAULT_BALANCE = 0; // Initial play balance; user deposits from wallet to trade
const MAX_HISTORY = 50;

type Listener = () => void;
let balance = DEFAULT_BALANCE;
let history: HederaTradeRecord[] = [];
const pending = new Map<string, PendingBet>();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const hederaBetStore = {
  getBalance: () => balance,
  getHistory: () => [...history],
  getPending: () => new Map(pending),
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Deduct HBAR and register a pending bet. Win when price line enters the cell band [priceBottom, priceTop]. */
  placeBet: (
    cellId: string,
    direction: "UP" | "DOWN",
    amountHBAR: number,
    durationSeconds: number,
    multiplier: number,
    startPrice: number,
    priceTop: number,
    priceBottom: number
  ): string | null => {
    if (amountHBAR <= 0 || balance < amountHBAR) return null;
    balance -= amountHBAR;
    const betId = `hbar-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    pending.set(betId, {
      id: betId,
      cellId,
      direction,
      amount: amountHBAR,
      multiplier,
      startPrice,
      priceTop,
      priceBottom,
      durationSeconds,
      placedAt: Date.now(),
    });
    emit();
    return betId;
  },

  /** Resolve: win if price line entered the cell band (start→end range overlaps [priceBottom, priceTop]). */
  resolveBet: (betId: string, endPrice: number): boolean => {
    const bet = pending.get(betId);
    if (!bet) return false;
    pending.delete(betId);
    const low = Math.min(bet.startPrice, endPrice);
    const high = Math.max(bet.startPrice, endPrice);
    const won = low <= bet.priceTop && high >= bet.priceBottom;
    const payout = won ? bet.amount * bet.multiplier : 0;
    if (won) balance += payout;
    const record: HederaTradeRecord = {
      id: betId,
      cellId: bet.cellId,
      direction: bet.direction,
      amount: bet.amount,
      payout,
      won,
      timestamp: Date.now(),
      durationSeconds: bet.durationSeconds,
      multiplier: bet.multiplier,
    };
    history = [record, ...history].slice(0, MAX_HISTORY);
    emit();
    return true;
  },

  resetBalance: (value: number = DEFAULT_BALANCE) => {
    balance = value;
    emit();
  },

  /** Add HBAR to play balance (e.g. after "transfer from wallet" — in production this would be a contract call). */
  deposit: (amountHBAR: number): boolean => {
    if (amountHBAR <= 0) return false;
    balance += amountHBAR;
    emit();
    return true;
  },
};
