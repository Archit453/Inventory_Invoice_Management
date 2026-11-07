import type { Invoice } from '../types';
import { formatINR, formatDateTime } from './formatters';

export function generateInvoiceWhatsAppMessage(invoice: Invoice): string {
  const vehicleText = invoice.vehicle_info?.reg_number 
    ? `🚗 *Vehicle:* ${invoice.vehicle_info.make || ''} ${invoice.vehicle_info.model || ''} (${invoice.vehicle_info.reg_number})`
    : '';

  const itemsList = invoice.items
    .map((item, idx) => `  ${idx + 1}. ${item.name} (${item.quantity}x) — ${formatINR(item.total_amount)}`)
    .join('\n');

  const paymentStatusText = invoice.payment_status === 'paid'
    ? '✅ *Status:* PAID IN FULL'
    : invoice.payment_status === 'partial'
    ? `⚠️ *Status:* PARTIALLY PAID (Pending: ${formatINR(invoice.balance_due)})`
    : `❌ *Status:* PAYMENT DUE (${formatINR(invoice.balance_due)})`;

  return `✨ *CREATION* ✨
Creation Studio — Premium Services & Care
────────────────────────
📋 *TAX INVOICE / BILL: #${invoice.invoice_number}*
📅 *Date:* ${formatDateTime(invoice.billing_date)}
👤 *Customer:* ${invoice.customer_name}
${vehicleText ? vehicleText + '\n' : ''}────────────────────────
🛠️ *SERVICES & PRODUCTS:*
${itemsList}

────────────────────────
💰 *Subtotal:* ${formatINR(invoice.subtotal)}
${invoice.discount_amount > 0 ? `🏷️ *Discount:* -${formatINR(invoice.discount_amount)}\n` : ''}${invoice.tax_amount > 0 ? `📊 *GST/Tax:* ${formatINR(invoice.tax_amount)}\n` : ''}💎 *GRAND TOTAL:* ${formatINR(invoice.grand_total)}
💳 *Amount Paid:* ${formatINR(invoice.paid_amount)} (${invoice.payment_method})
${paymentStatusText}
────────────────────────
📍 *Studio Address:* Plot no - 55, Pahala, Before Utkal Mahindra Service, Bhubaneswar, Odisha 752101
📞 *Contact:* +91 8456869931
🗺️ *Location:* https://maps.app.goo.gl/TP4S4MommkGLpAzP7

Thank you for choosing Creation for your vehicle's care!`;
}

export function openWhatsAppInvoice(invoice: Invoice) {
  const rawPhone = invoice.customer_phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const phoneWithCountryCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const text = generateInvoiceWhatsAppMessage(invoice);
  const encodedText = encodeURIComponent(text);
  
  const url = phoneWithCountryCode 
    ? `https://wa.me/${phoneWithCountryCode}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  window.open(url, '_blank');
}
