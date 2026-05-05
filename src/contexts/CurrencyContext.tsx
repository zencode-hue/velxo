"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FALLBACK_RATES, COUNTRY_CURRENCY } from "@/lib/currency";

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
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data.rates) setRates(data.rates);
    } catch {
      // silently use fallback
    }
  }, []);

  const detectCurrencyFromIP = useCallback(async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const countryCode = data.country_code as string;
      const detected = COUNTRY_CURRENCY[countryCode];
      if (detected) return detected;
    } catch {
      // fallback
    }
    return "USD";
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("metramart_currency");
    if (saved) {
      setCurrencyState(saved);
      fetchRates();
    } else {
      // Auto-detect from IP
      setLoading(true);
      Promise.all([fetchRates(), detectCurrencyFromIP()]).then(([, detected]) => {
        setCurrencyState(detected);
        setLoading(false);
      });
    }
  }, [fetchRates, detectCurrencyFromIP]);

  function setCurrency(c: string) {
    setCurrencyState(c);
    localStorage.setItem("metramart_currency", c);
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
