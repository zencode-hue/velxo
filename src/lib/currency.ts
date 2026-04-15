export const CURRENCIES: Array<{ code: string; symbol: string; name: string; flag: string }> = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "COP", symbol: "CO$", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso", flag: "🇦🇷" },
];

export const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol])
);

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53,
  NGN: 1580, GHS: 15.5, JPY: 149, INR: 83, BRL: 4.97,
  MXN: 17.2, ZAR: 18.6, KES: 130, EGP: 30.9, AED: 3.67,
  SAR: 3.75, TRY: 32.5, PKR: 278, BDT: 110, PHP: 56.5,
  IDR: 15700, MYR: 4.72, SGD: 1.34, HKD: 7.82, CHF: 0.89,
  SEK: 10.4, NOK: 10.6, DKK: 6.88, PLN: 3.97, CZK: 22.8,
  HUF: 355, RON: 4.57, UAH: 38.5, ILS: 3.72, THB: 35.1,
  VND: 24500, CLP: 920, COP: 3950, PEN: 3.72, ARS: 870,
};

// Country code → currency code mapping for IP detection
export const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR",
  GR: "EUR", CA: "CAD", AU: "AUD", NZ: "AUD", JP: "JPY", IN: "INR",
  BR: "BRL", MX: "MXN", ZA: "ZAR", NG: "NGN", GH: "GHS", KE: "KES",
  EG: "EGP", AE: "AED", SA: "SAR", TR: "TRY", PK: "PKR", BD: "BDT",
  PH: "PHP", ID: "IDR", MY: "MYR", SG: "SGD", HK: "HKD", CH: "CHF",
  SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF",
  RO: "RON", UA: "UAH", IL: "ILS", TH: "THB", VN: "VND", CL: "CLP",
  CO: "COP", PE: "PEN", AR: "ARS",
};

export function formatPrice(usdAmount: number, currency: string, rates: Record<string, number>): string {
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  const converted = usdAmount * rate;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";

  if (["JPY", "NGN", "GHS", "IDR", "VND", "CLP", "COP", "HUF"].includes(currency)) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  if (["KES", "PKR", "BDT", "EGP", "UAH", "ARS"].includes(currency)) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}
