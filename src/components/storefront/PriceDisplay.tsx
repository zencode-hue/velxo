"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice } from "@/lib/currency";

interface PriceDisplayProps {
  usdAmount: number;
  className?: string;
  strikethrough?: boolean;
}

export default function PriceDisplay({ usdAmount, className = "", strikethrough = false }: PriceDisplayProps) {
  const { currency, rates } = useCurrency();
  const formatted = formatPrice(usdAmount, currency, rates);

  if (strikethrough) {
    return <span className={`line-through text-gray-500 ${className}`}>{formatted}</span>;
  }

  return <span className={className}>{formatted}</span>;
}
