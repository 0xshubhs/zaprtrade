"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TokenData {
  marketCap?: string;
  marketCapRaw?: number;
  change1h?: number;
  price?: string;
}

const TokenDataContext = createContext<{
  tokenData: TokenData | null;
  isLoading: boolean;
}>({ tokenData: null, isLoading: true });

export function TokenDataProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock: set placeholder after a short delay
    const t = setTimeout(() => {
      setTokenData({
        marketCap: "$1.2M",
        marketCapRaw: 1200000,
        change1h: 2.5,
        price: "$0.0012",
      });
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <TokenDataContext.Provider value={{ tokenData, isLoading }}>
      {children}
    </TokenDataContext.Provider>
  );
}

export function useTokenData() {
  return useContext(TokenDataContext);
}
