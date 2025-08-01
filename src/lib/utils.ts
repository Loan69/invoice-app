import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getTotalAmount(items: { amount: string }[] = []): number {
  return items.reduce((total, item) => {
    const parsed = parseFloat(item.amount.replace(",", "."));
    return total + (isNaN(parsed) ? 0 : parsed);
  }, 0);
}
