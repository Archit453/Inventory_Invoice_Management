import type { FC } from 'react';
import { CheckCircle2, MessageCircle, Printer, X } from 'lucide-react';
import type { Invoice } from '../../types';
import { openWhatsAppInvoice } from '../../lib/whatsapp';

interface BillSuccessModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export const BillSuccessModal: FC<BillSuccessModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPrint,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Icon */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Bill Generated!</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Invoice <span className="font-bold text-slate-800">#{invoice.invoice_number}</span> created successfully.
        </p>

        {/* Actions matching video */}
        <div className="space-y-2.5">
          <button
            onClick={() => openWhatsAppInvoice(invoice)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-emerald-500/20 transition-all active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={onPrint}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-slate-900/20 transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
