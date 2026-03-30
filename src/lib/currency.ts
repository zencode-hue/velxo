// Currency symbols and approximate static fallback rates (USD base)
// Live rates fetched client-side via open.er-api.com (free, no key needed)

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
  NGN: "₦", GHS: "₵", JPY: "¥", INR: "₹", BRL: "R$",
};

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53,
  NGN: 1580, GHS: 15.5, JPY: 149, INR: 83, BRL: 4.97,
};

export function formatPrice(usdAmount: number, currency: string, rates: Record<string, number>): string {
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  const converted = usdAmount * rate;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";

  // Format based on currency
  if (["JPY", "NGN", "GHS", "INR"].includes(currency)) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}
