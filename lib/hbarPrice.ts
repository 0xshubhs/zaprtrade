/**
 * Token price from CoinGecko public API.
 *
 * API: CoinGecko Simple Price
 * No API key; free tier ~10–30 req/min.
 */

import { DEFAULT_TOKEN } from "./tokenConfig";

export interface HbarPriceData {
  usd: number;
  usd_24h_change?: number;
}

async function fetchOnce(coingeckoId: string): Promise<HbarPriceData | null> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  const token = data?.[coingeckoId];
  if (!token || typeof token.usd !== "number") return null;
  return {
    usd: token.usd,
    usd_24h_change: typeof token.usd_24h_change === "number" ? token.usd_24h_change : undefined,
  };
}

/** Fetch token price from CoinGecko with retries. */
export async function fetchHbarPrice(coingeckoId?: string): Promise<HbarPriceData | null> {
  const id = coingeckoId ?? DEFAULT_TOKEN.coingeckoId;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fetchOnce(id);
      if (result) return result;
    } catch {
      if (attempt === maxAttempts) return null;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  return null;
}
