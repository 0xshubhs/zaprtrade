"use client";

import { useState, useEffect } from "react";
import { hederaBetStore } from "../lib/hederaBetStore";
import { fetchHbarPrice } from "../lib/hbarPrice";
import { useSelectedToken } from "../contexts/SelectedTokenContext";

export function useHederaBet() {
  const { token } = useSelectedToken();
  const [balance, setBalance] = useState(hederaBetStore.getBalance());
  const [history, setHistory] = useState(hederaBetStore.getHistory());
  const [pending, setPending] = useState(() => new Map(hederaBetStore.getPending()));

  useEffect(() => {
    const unsub = hederaBetStore.subscribe(() => {
      setBalance(hederaBetStore.getBalance());
      setHistory(hederaBetStore.getHistory());
      setPending(new Map(hederaBetStore.getPending()));
    });
    return () => {
      unsub();
    };
  }, []);

  const placeBet = async (
    cellId: string,
    direction: "UP" | "DOWN",
    amount: number,
    durationSeconds: number,
    multiplier: number,
    priceTop: number,
    priceBottom: number
  ): Promise<string | null> => {
    const data = await fetchHbarPrice(token.coingeckoId);
    const startPrice = data?.usd ?? 0;
    if (startPrice <= 0) return null;
    const betId = hederaBetStore.placeBet(
      cellId,
      direction,
      amount,
      durationSeconds,
      multiplier,
      startPrice,
      priceTop,
      priceBottom
    );
    if (!betId) return null;
    const pendingBet = hederaBetStore.getPending().get(betId);
    if (!pendingBet) return betId;
    const coingeckoId = token.coingeckoId;
    setTimeout(async () => {
      const endData = await fetchHbarPrice(coingeckoId);
      const endPrice = endData?.usd ?? startPrice;
      hederaBetStore.resolveBet(betId, endPrice);
    }, durationSeconds * 1000);
    return betId;
  };

  return { balance, history, pending, placeBet, resetBalance: hederaBetStore.resetBalance };
}
