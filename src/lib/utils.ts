import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getTotalAmount(items?: { amount: string }[] | null): number {
  if (!Array.isArray(items)) return 0; // si undefined ou null → 0
  return items.reduce((total, item) => {
    const parsed = parseFloat((item.amount ?? '0').replace(",", "."));
    return total + (isNaN(parsed) ? 0 : parsed);
  }, 0);
}
