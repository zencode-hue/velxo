"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FALLBACK_RATES } from "@/lib/currency";

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  rates: FALLBACK_RATES,
  loading: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data.rates) setRates(data.rates);
    } catch {
      // Use fallback rates silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load saved currency
    const saved = localStorage.getItem("velxo_currency");
    if (saved) setCurrencyState(saved);
    fetchRates();
  }, [fetchRates]);

  function setCurrency(c: string) {
    setCurrencyState(c);
    localStorage.setItem("velxo_currency", c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
