import type { FC } from 'react';
import {
  LayoutDashboard,
  Receipt,
  CalendarCheck,
  Users,
  Package,
  TrendingDown,
  BarChart3,
  Settings,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import type { MainTabType } from '../../types';

interface SidebarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onNewBillClick: () => void;
  unreadCount?: number;
}

export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewBillClick,
}) => {
  const navSections = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard' as MainTabType, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'MANAGE BILLING',
      items: [
        { id: 'billing' as MainTabType, label: 'Billing', icon: Receipt },
        { id: 'appointments' as MainTabType, label: 'Appointments', icon: CalendarCheck },
      ],
    },
    {
      label: 'CLIENTS',
      items: [
        { id: 'customers' as MainTabType, label: 'Customers', icon: Users },
      ],
    },
    {
      label: 'MANAGE SERVICE & STOCK',
      items: [
        { id: 'inventory' as MainTabType, label: 'Products & Inventory', icon: Package },
      ],
    },
    {
      label: 'MANAGE REPORT',
      items: [
        { id: 'expenses' as MainTabType, label: 'Expense Management', icon: TrendingDown },
        { id: 'reports' as MainTabType, label: 'Earnings & P&L', icon: BarChart3 },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'settings' as MainTabType, label: 'Studio Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#131D31] text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none no-print">
      {/* Studio Header Brand */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight tracking-wide">Studio OS</h1>
            <p className="text-[11px] text-blue-400 font-medium uppercase tracking-wider">Inventory & Invoicing</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <button
          onClick={onNewBillClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-600/30 transition-all duration-150 active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>CREATE NEW BILL</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'billing' && activeTab === 'new-bill');
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-[#223354] text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>System Active</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
