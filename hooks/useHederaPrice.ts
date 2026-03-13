"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchHbarPrice, type HbarPriceData } from "../lib/hbarPrice";
import { useSelectedToken } from "../contexts/SelectedTokenContext";

const POLL_MS = 60_000; // 1 min
const POLL_MS_LANDING_FIRST = 2_000; // retry sooner on first load if failed

export function useHederaPrice(): {
  price: HbarPriceData | null;
  formatted: string;
  change24h: number | null;
  isLoading: boolean;
} {
  const { token } = useSelectedToken();
  const [price, setPrice] = useState<HbarPriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await fetchHbarPrice(token.coingeckoId);
      setPrice(data);
    } finally {
      setIsLoading(false);
    }
  }, [token.coingeckoId]);

  // Reset when token changes
  useEffect(() => {
    setPrice(null);
    setIsLoading(true);
    load(true);
    const t = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (price == null && !isLoading) load(true);
    }, POLL_MS_LANDING_FIRST);
    return () => clearTimeout(id);
  }, [price, isLoading, load]);

  const formatted =
    price != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: token.decimals }).format(price.usd)
      : "—";

  const change24h = price?.usd_24h_change ?? null;

  return { price, formatted, change24h, isLoading };
}
