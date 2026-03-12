"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { SOLANA_TOKENS, DEFAULT_TOKEN, type TokenConfig } from "../lib/tokenConfig";

interface SelectedTokenCtx {
  token: TokenConfig;
  setToken: (token: TokenConfig) => void;
  tokens: TokenConfig[];
}

const Ctx = createContext<SelectedTokenCtx>({
  token: DEFAULT_TOKEN,
  setToken: () => {},
  tokens: SOLANA_TOKENS,
});

export function SelectedTokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<TokenConfig>(DEFAULT_TOKEN);
  return (
    <Ctx.Provider value={{ token, setToken, tokens: SOLANA_TOKENS }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSelectedToken() {
  return useContext(Ctx);
}
