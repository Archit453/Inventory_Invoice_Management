import { forwardRef } from 'react';
import type { Invoice } from '../../types';
import { formatINR, formatDateTime } from '../../lib/formatters';

interface InvoicePrintTemplateProps {
  invoice: Invoice | null;
  mode?: 'a4' | 'thermal';
}

export const InvoicePrintTemplate = forwardRef<HTMLDivElement, InvoicePrintTemplateProps>(
  ({ invoice, mode = 'a4' }, ref) => {
    if (!invoice) return null;

    if (mode === 'thermal') {
      return (
        <div ref={ref} className="thermal-receipt p-2 font-mono text-[11px] leading-tight text-black bg-white max-w-[76mm] mx-auto">
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className="font-bold text-sm tracking-wide uppercase">TAX INVOICE</h2>
            <p className="text-[10px]">Studio & Workshop Management</p>
            <p className="text-[10px]">Ph: +91 8456869931</p>
            <p className="text-[9px] mt-0.5">GSTIN: 21AAFFS9821L1Z0</p>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
            <div><span className="font-bold">Bill No:</span> #{invoice.invoice_number}</div>
            <div><span className="font-bold">Date:</span> {formatDateTime(invoice.billing_date)}</div>
            <div><span className="font-bold">Client:</span> {invoice.customer_name} ({invoice.customer_phone || '-'})</div>
            {invoice.vehicle_info?.reg_number && (
              <div><span className="font-bold">Car:</span> {invoice.vehicle_info.make} {invoice.vehicle_info.model} [{invoice.vehicle_info.reg_number}]</div>
            )}
          </div>

          <div className="py-2 border-b border-dashed border-black">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-black font-bold">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-dotted border-gray-300">
                    <td className="py-1 text-left">
                      <div className="font-semibold">{item.name}</div>
                      {item.assigned_staff && item.assigned_staff !== 'Assign...' && (
                        <div className="text-[9px] text-gray-600">Tech: {item.assigned_staff}</div>
                      )}
                    </td>
                    <td className="py-1 text-center align-top">{item.quantity}</td>
                    <td className="py-1 text-right align-top">{formatINR(item.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatINR(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatINR(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>GST/Tax:</span>
                <span>{formatINR(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
              <span>GRAND TOTAL:</span>
              <span>{formatINR(invoice.grand_total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid ({invoice.payment_method}):</span>
              <span>{formatINR(invoice.paid_amount)}</span>
            </div>
            {invoice.balance_due > 0 ? (
              <div className="flex justify-between font-bold text-red-600">
                <span>Balance Due:</span>
                <span>{formatINR(invoice.balance_due)}</span>
              </div>
            ) : (
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Status:</span>
                <span>PAID IN FULL</span>
              </div>
            )}
          </div>

          <div className="text-center pt-3 text-[9px] space-y-1">
            <p>Thank you for your business!</p>
            <p>For warranty & maintenance, visit our studio.</p>
          </div>
        </div>
      );
    }

    // Standard A4 Studio Tax Invoice
    return (
      <div ref={ref} className="p-8 max-w-[210mm] mx-auto bg-white text-slate-900 font-sans print:p-4">
        {/* Top Header */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 rounded-full bg-blue-600 inline-block"></span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                TAX INVOICE
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Studio & Workshop Management
            </p>
            <p className="text-xs text-slate-600 mt-2 max-w-sm leading-relaxed">
              Plot no - 55, Pahala, Before Utkal Mahindra Service,<br />
              Bhubaneswar, Odisha 752101<br />
              Phone: +91 8456869931 | +91 98612 01770<br />
              GSTIN: 21AAFFS9821L1Z0
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-md mb-2">
              TAX INVOICE
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              #{invoice.invoice_number}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Date: <span className="font-semibold text-slate-800">{formatDateTime(invoice.billing_date)}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Payment Method: <span className="font-semibold text-slate-800">{invoice.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Information Box */}
        <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              BILLED TO CUSTOMER
            </div>
            <div className="font-bold text-sm text-slate-900">{invoice.customer_name}</div>
            <div className="text-xs text-slate-600 mt-0.5">Phone: {invoice.customer_phone || 'Walk-in Customer'}</div>
            {invoice.gst_number && (
              <div className="text-xs text-slate-600 mt-0.5">Customer GSTIN: {invoice.gst_number}</div>
            )}
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              VEHICLE SERVICED
            </div>
            {invoice.vehicle_info?.reg_number ? (
              <>
                <div className="font-bold text-sm text-slate-900">
                  {invoice.vehicle_info.make} {invoice.vehicle_info.model} {invoice.vehicle_info.year ? `(${invoice.vehicle_info.year})` : ''}
                </div>
                <div className="text-xs font-semibold text-blue-600 mt-0.5">
                  Registration: {invoice.vehicle_info.reg_number}
                </div>
                {invoice.vehicle_info.color && (
                  <div className="text-xs text-slate-500">Color: {invoice.vehicle_info.color}</div>
                )}
              </>
            ) : (
              <div className="text-xs text-slate-500 italic">No specific vehicle registered</div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Rate</th>
                <th className="py-3 px-3 text-center">GST %</th>
                <th className="py-3 px-3 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    {item.assigned_staff && item.assigned_staff !== 'Assign...' && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Lead Specialist: <span className="font-medium text-slate-700">{item.assigned_staff}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 px-3 text-right">{formatINR(item.rate)}</td>
                  <td className="py-3 px-3 text-center">{item.gst_percent}%</td>
                  <td className="py-3 px-3 text-right text-slate-600">{formatINR(item.tax_amount)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatINR(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Financial Summary */}
        <div className="flex justify-between items-start gap-8 pt-2">
          {/* Notes & Bank Details */}
          <div className="w-1/2 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 mb-1">Bank & UPI Settlement Details:</div>
              <div className="text-slate-600 space-y-0.5 text-[11px]">
                <div>Bank: HDFC Bank Ltd.</div>
                <div>A/C Name: Creation</div>
                <div>IFSC: HDFC0001234</div>
                <div>UPI ID: <span className="font-mono font-medium text-blue-600">creation@hdfcbank</span></div>
              </div>
            </div>

            {invoice.notes && (
              <div className="text-xs text-slate-600 italic">
                <span className="font-semibold text-slate-800">Special Notes:</span> {invoice.notes}
              </div>
            )}
          </div>

          {/* Amount Calculation */}
          <div className="w-1/2 max-w-sm space-y-2 text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatINR(invoice.subtotal)}</span>
            </div>

            {invoice.discount_amount > 0 && (
              <div className="flex justify-between py-1 text-emerald-600 font-medium">
                <span>Discount Applied:</span>
                <span>-{formatINR(invoice.discount_amount)}</span>
              </div>
            )}

            {invoice.tax_amount > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Total GST / Tax:</span>
                <span className="font-semibold text-slate-900">{formatINR(invoice.tax_amount)}</span>
              </div>
            )}

            <div className="flex justify-between py-2.5 border-t-2 border-slate-900 text-sm font-extrabold text-slate-900">
              <span>GRAND TOTAL:</span>
              <span className="text-blue-600">{formatINR(invoice.grand_total)}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-700">
              <span>Amount Paid:</span>
              <span className="font-bold text-emerald-600">{formatINR(invoice.paid_amount)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-t border-slate-200">
              <span className="font-bold">Balance Due:</span>
              <span className={`font-bold ${invoice.balance_due > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {invoice.balance_due > 0 ? formatINR(invoice.balance_due) : '₹0.00 (PAID)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
          <div>Thank you for choosing us for your vehicle's perfection.</div>
          <div className="font-medium text-slate-500">Authorized Signature</div>
        </div>
      </div>
    );
  }
);

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';
