import { useState, useMemo, useRef, type FC } from 'react';
import {
  Search,
  Plus,
  MessageCircle,
  Edit2,
  Printer,
  Trash2,
  Car
} from 'lucide-react';
import type { Invoice } from '../../types';
import { formatINR, formatDateTime } from '../../lib/formatters';
import { openWhatsAppInvoice } from '../../lib/whatsapp';
import { InvoicePrintTemplate } from './InvoicePrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

interface BillingListProps {
  invoices: Invoice[];
  onNewBillClick: () => void;
  onDeleteInvoice: (id: string) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}

export const BillingList: FC<BillingListProps> = ({
  invoices,
  onNewBillClick,
  onDeleteInvoice,
  onEditInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Invoice | null>(null);
  const [printMode, setPrintMode] = useState<'a4' | 'thermal'>('a4');
  const printRef = useRef<HTMLDivElement>(null);

  // Filter invoices by customer name, phone, invoice number or car reg
  const filteredInvoices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return invoices;
    return invoices.filter(inv =>
      inv.invoice_number.toLowerCase().includes(term) ||
      inv.customer_name.toLowerCase().includes(term) ||
      (inv.customer_phone && inv.customer_phone.includes(term)) ||
      (inv.vehicle_info?.reg_number && inv.vehicle_info.reg_number.toLowerCase().includes(term))
    );
  }, [invoices, searchTerm]);

  // Handle Printing via react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoiceToPrint ? `Invoice-${selectedInvoiceToPrint.invoice_number}` : 'Invoice',
  });

  const triggerPrint = (invoice: Invoice, mode: 'a4' | 'thermal' = 'a4') => {
    setSelectedInvoiceToPrint(invoice);
    setPrintMode(mode);
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card matching Demo Video */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Billing Management</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Invoices & Payment Tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={onNewBillClick}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>New Bill</span>
          </button>
        </div>
      </div>

      {/* Main Billing Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Invoice</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Balance</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No bills found matching your search.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Invoice ID */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 tracking-tight">
                        {inv.invoice_number}
                      </span>
                    </td>

                    {/* Customer & Phone */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{inv.customer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {inv.customer_phone || '-'}
                      </div>
                      {inv.vehicle_info?.reg_number && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-0.5">
                          <Car className="w-3 h-3" />
                          <span>{inv.vehicle_info.reg_number}</span>
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {formatDateTime(inv.billing_date)}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {formatINR(inv.grand_total)}
                    </td>

                    {/* Balance Status Badge */}
                    <td className="py-4 px-4">
                      {inv.balance_due > 0 ? (
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          {formatINR(inv.balance_due)}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          PAID
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100">
                        {inv.payment_method}
                      </span>
                    </td>

                    {/* Actions matching video buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => openWhatsAppInvoice(inv)}
                          title="Share Invoice on WhatsApp"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                          <span className="hidden sm:inline uppercase">WhatsApp</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditInvoice && onEditInvoice(inv)}
                          title="Edit Invoice"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline uppercase">Edit</span>
                        </button>

                        {/* Print Button (A4 Tax Invoice) */}
                        <button
                          onClick={() => triggerPrint(inv, 'a4')}
                          title="Print A4 Tax Invoice"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline uppercase">Print</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete invoice ${inv.invoice_number}?`)) {
                              onDeleteInvoice(inv.id);
                              toast.success('Invoice deleted');
                            }
                          }}
                          title="Delete Invoice"
                          className="p-1.5 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Print Container for react-to-print */}
      <div className="hidden">
        <InvoicePrintTemplate
          ref={printRef}
          invoice={selectedInvoiceToPrint}
          mode={printMode}
        />
      </div>

    </div>
  );
};
