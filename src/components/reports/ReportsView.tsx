import { useState, useMemo, Fragment, type FC } from 'react';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Scale
} from 'lucide-react';
import type { Invoice, Expense } from '../../types';
import { formatINR, formatDateTime } from '../../lib/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReportsViewProps {
  invoices: Invoice[];
  expenses: Expense[];
}

export const ReportsView: FC<ReportsViewProps> = ({ invoices, expenses }) => {
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Financial aggregates
  const totalBilled = useMemo(() => invoices.reduce((s, i) => s + (i.grand_total || 0), 0), [invoices]);
  const totalCollected = useMemo(() => invoices.reduce((s, i) => s + (i.paid_amount || 0), 0), [invoices]);
  const totalOutstanding = useMemo(() => invoices.reduce((s, i) => s + (i.balance_due || 0), 0), [invoices]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const netStudioProfit = totalCollected - totalExpenses;

  // Payment mode split from invoices
  const paymentSplit = useMemo(() => {
    const split: { [mode: string]: number } = {};
    invoices.forEach(inv => {
      const mode = inv.payment_method || 'Cash';
      split[mode] = (split[mode] || 0) + (inv.paid_amount || 0);
    });
    return Object.entries(split).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  // Comparison Bar Chart Data
  const financialComparisonData = useMemo(() => [
    { name: 'Creation Studio Revenue', Revenue: totalCollected, Expenses: 0 },
    { name: 'Operational Expenses', Revenue: 0, Expenses: totalExpenses },
  ], [totalCollected, totalExpenses]);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Earnings & Financial Reports</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            P&L, Revenue Analytics & Deposit Breakdowns
          </p>
        </div>

        {/* Net Profit Pill */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
          netStudioProfit >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <Scale className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Net Profit:</span>
          <span className="text-sm font-black">{formatINR(netStudioProfit)}</span>
        </div>
      </div>

      {/* 4 Cards matching frame 165s */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Billed</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalBilled)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{formatINR(totalCollected)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Dues</div>
            <div className={`text-2xl font-black mt-1 ${totalOutstanding > 0 ? 'text-red-500' : 'text-slate-800'}`}>
              {formatINR(totalOutstanding)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Invoices Count</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{invoices.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Expenses BarChart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Studio Revenue vs Overhead Costs
            </div>
            <span className="text-[11px] text-slate-400">Lifetime Summary</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value: any) => formatINR(Number(value))} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Mode Distribution PieChart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Payment Mode Distribution
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {paymentSplit.length === 0 ? (
              <div className="text-slate-400 text-xs">No payment data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentSplit.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatINR(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bill Details with Expandable Deposit Breakdown (matching frame 165s) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Bill Details</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Click any row to view deposit breakdown</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 w-10"></th>
                <th className="py-4 px-4">Bill #</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4 text-right">Bill Amount</th>
                <th className="py-4 px-4 text-right">Discount</th>
                <th className="py-4 px-4 text-right">Tax</th>
                <th className="py-4 px-4 text-right">Total Paid</th>
                <th className="py-4 px-4 text-right">Pending</th>
                <th className="py-4 px-4">Payment Method</th>
                <th className="py-4 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => {
                const isExpanded = expandedInvoiceId === inv.id;
                return (
                  <Fragment key={inv.id}>
                    <tr
                      onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">{inv.invoice_number}</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{inv.customer_name}</td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900">{formatINR(inv.grand_total)}</td>
                      <td className="py-4 px-4 text-right text-emerald-600">
                        {inv.discount_amount > 0 ? `-${formatINR(inv.discount_amount)}` : '₹0'}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-500">{formatINR(inv.tax_amount)}</td>
                      <td className="py-4 px-4 text-right font-bold text-emerald-600">{formatINR(inv.paid_amount)}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-bold ${inv.balance_due > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                          {formatINR(inv.balance_due)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 uppercase">
                          {inv.payment_method}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 font-medium">
                        {formatDateTime(inv.billing_date)}
                      </td>
                    </tr>

                    {/* Expandable Deposits Breakdown Row (matching frame 165s) */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={10} className="p-4 pl-12">
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Deposits Breakdown
                            </div>
                            <div className="grid grid-cols-3 text-xs border-b border-slate-100 pb-2 font-semibold text-slate-500">
                              <div>Deposit Amount</div>
                              <div>Payment Type</div>
                              <div className="text-right">Deposit Date & Time</div>
                            </div>
                            <div className="grid grid-cols-3 text-xs font-medium text-slate-900">
                              <div className="font-bold text-emerald-600">{formatINR(inv.paid_amount)}</div>
                              <div>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[10px]">
                                  {inv.payment_method}
                                </span>
                              </div>
                              <div className="text-right text-slate-500">{formatDateTime(inv.billing_date)}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
