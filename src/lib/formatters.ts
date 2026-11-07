import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Indian Rupee Currency Formatter
export function formatINR(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(safeAmount);
}

// Format date for tables and cards (e.g. "09/06/2026, 02:23 PM")
export function formatDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return String(dateInput);
    return format(d, 'dd/MM/yyyy, hh:mm a');
  } catch {
    return String(dateInput);
  }
}

// Format date only (e.g. "09/06/2026")
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return String(dateInput);
    return format(d, 'dd/MM/yyyy');
  } catch {
    return String(dateInput);
  }
}
