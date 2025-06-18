
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDisplayPrice(price: number | undefined): string {
  if (price === undefined || price === null || isNaN(price)) return "السعر غير متوفر";

  const formatValue = (val: number): string => {
    // Format to at most 2 decimal places, remove .00 and .X0
    // e.g., 1.50 -> "1.5", 1.00 -> "1"
    return Number(val.toFixed(2)).toString();
  };

  if (price >= 1_000_000_000) {
    return `${formatValue(price / 1_000_000_000)} مليار د.ج`;
  }
  if (price >= 1_000_000) {
    return `${formatValue(price / 1_000_000)} مليون د.ج`;
  }
  // Default to "ألف د.ج" for anything 1000 or more,
  // or for values less than 1000 (e.g., 500 will be "0.5 ألف د.ج")
  return `${formatValue(price / 1_000)} ألف د.ج`;
}
