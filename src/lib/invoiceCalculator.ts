import { z } from 'zod';
import type { InvoiceItem, PaymentSplitItem } from '../types';

export const InvoiceItemSchema = z.object({
  id: z.string(),
  item_type: z.enum(['service', 'product', 'package']),
  item_id: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().optional(),
  rate: z.number().min(0, 'Rate cannot be negative'),
  quantity: z.number().min(0.01, 'Quantity must be greater than zero'),
  gst_percent: z.number().min(0).max(100),
  tax_amount: z.number().min(0),
  total_amount: z.number().min(0),
  assigned_staff: z.string().optional(),
});

export const CreateInvoiceSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().optional(),
  vehicle_info: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    reg_number: z.string().optional(),
  }).optional(),
  billing_date: z.string(),
  items: z.array(InvoiceItemSchema).min(1, 'At least one service or product is required'),
  discount_amount: z.number().min(0).default(0),
  paid_amount: z.number().min(0).default(0),
  payment_method: z.enum(['Cash', 'GPay', 'UPI', 'Card', 'Split', 'Bank Transfer']).default('Cash'),
  payment_split: z.array(z.object({
    method: z.enum(['Cash', 'GPay', 'UPI', 'Card', 'Bank Transfer']),
    amount: z.number().min(0),
  })).optional(),
  gst_number: z.string().optional(),
  notes: z.string().optional(),
});

export interface CalculationResult {
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  paid_amount: number;
  balance_due: number;
  payment_status: 'paid' | 'partial' | 'due';
}

export function calculateInvoice(
  items: InvoiceItem[],
  discountInput: number = 0,
  isDiscountPercentage: boolean = false,
  paidInput: number = 0,
  splitPayments?: PaymentSplitItem[],
  isSplitPayment: boolean = false
): CalculationResult {
  // 1. Calculate each item's tax and total
  const calculatedItems = items.map((item) => {
    const base = (item.rate || 0) * (item.quantity || 1);
    const tax = base * ((item.gst_percent || 0) / 100);
    const total = base + tax;
    return {
      ...item,
      tax_amount: Math.round(tax * 100) / 100,
      total_amount: Math.round(total * 100) / 100,
    };
  });

  // 2. Sum base subtotal & tax
  const subtotal = calculatedItems.reduce((sum, item) => sum + ((item.rate || 0) * (item.quantity || 1)), 0);
  const totalTax = calculatedItems.reduce((sum, item) => sum + item.tax_amount, 0);

  // 3. Discount calculation
  let discount = 0;
  if (isDiscountPercentage) {
    discount = Math.min(subtotal, (subtotal * (discountInput || 0)) / 100);
  } else {
    discount = Math.min(subtotal, discountInput || 0);
  }

  // 4. Grand Total
  const grandTotal = Math.max(0, Math.round((subtotal - discount + totalTax) * 100) / 100);

  // 5. Total Paid calculation
  let totalPaid = 0;
  if (isSplitPayment && splitPayments && splitPayments.length > 0) {
    totalPaid = splitPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  } else {
    totalPaid = paidInput || 0;
  }

  // 6. Balance Due & Status
  const balanceDue = Math.max(0, Math.round((grandTotal - totalPaid) * 100) / 100);
  let status: 'paid' | 'partial' | 'due' = 'paid';
  if (totalPaid >= grandTotal && grandTotal > 0) {
    status = 'paid';
  } else if (totalPaid > 0) {
    status = 'partial';
  } else {
    status = 'due';
  }

  return {
    items: calculatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(totalTax * 100) / 100,
    discount_amount: Math.round(discount * 100) / 100,
    grand_total: grandTotal,
    paid_amount: Math.round(totalPaid * 100) / 100,
    balance_due: balanceDue,
    payment_status: status,
  };
}
