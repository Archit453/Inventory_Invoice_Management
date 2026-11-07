import { useMemo, type FC } from 'react';
import {
  Wallet,
  CalendarCheck,
  Package,
  ArrowRight,
  PlusCircle,
  AlertTriangle,
  Receipt,
  Car
} from 'lucide-react';
import type { Invoice, InventoryProduct, Appointment, MainTabType } from '../../types';
import { formatINR } from '../../lib/formatters';

interface DashboardOverviewProps {
  invoices: Invoice[];
  products: InventoryProduct[];
  expenses: any[];
  appointments: Appointment[];
  setActiveTab: (tab: MainTabType) => void;
  onNewBillClick: () => void;
}

export const DashboardOverview: FC<DashboardOverviewProps> = ({
  invoices,
  products,
  expenses,
  appointments,
  setActiveTab,
  onNewBillClick,
}) => {
  const totalRevenue = useMemo(() => invoices.reduce((s, i) => s + (i.paid_amount || 0), 0), [invoices]);
  const totalPending = useMemo(() => invoices.reduce((s, i) => s + (i.balance_due || 0), 0), [invoices]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const netProfit = totalRevenue - totalExpenses;
  const lowStockItems = useMemo(() => products.filter(p => p.current_stock <= p.min_stock_alert), [products]);
  const activeAppointments = useMemo(() => appointments.filter(a => a.status === 'scheduled' || a.status === 'in_service'), [appointments]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Studio Welcome Banner */}
      <div className="bg-gradient-to-r from-[#131D31] via-[#1E2D4A] to-[#131D31] rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Studio Operations
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Billing & Inventory Control
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Manage tax invoicing, technician assignments, stock consumption for PPF & ceramic coatings, customer appointment bookings, and net profitability (Current Net Profit: <span className="font-bold text-emerald-400">{formatINR(netProfit)}</span>).
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onNewBillClick}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Bill</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => setActiveTab('billing')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatINR(totalRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            <span>View all invoices</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('appointments')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">{activeAppointments.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            <span>Studio schedule</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            <span>Check supplies</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('billing')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Dues</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${totalPending > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatINR(totalPending)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            <span>Payment tracking</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* 2 Column Section: Recent Bills & Low Stock Consumables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Studio Bills</h3>
              <p className="text-[11px] text-slate-400">Latest customer invoices</p>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{inv.invoice_number}</span>
                    <span className="text-xs text-slate-700 font-medium">{inv.customer_name}</span>
                  </div>
                  {inv.vehicle_info?.reg_number && (
                    <div className="text-[11px] text-blue-600 font-mono flex items-center gap-1 mt-0.5">
                      <Car className="w-3 h-3" />
                      <span>{inv.vehicle_info.reg_number}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-xs text-slate-900">{formatINR(inv.grand_total)}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    inv.balance_due > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {inv.balance_due > 0 ? `Due: ${formatINR(inv.balance_due)}` : 'PAID'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Consumables & Materials Watchlist</h3>
              <p className="text-[11px] text-slate-400">Stock thresholds & reorder levels</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 4).map((p) => {
              const isLow = p.current_stock <= p.min_stock_alert;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.category}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold text-xs ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                      {p.current_stock} {p.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Alert at {p.min_stock_alert} {p.unit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
