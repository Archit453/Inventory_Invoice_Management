import { useState, type FC } from 'react';
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
  PlusCircle,
  ChevronDown,
  Building2,
  Plus,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import type { MainTabType } from '../../types';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onNewBillClick: () => void;
  onOpenAuthModal: () => void;
}

export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewBillClick,
  onOpenAuthModal,
}) => {
  const { currentTenant, availableTenants, switchTenant, userRole, setIsOnboarding } = useTenant();
  const { user, demoUser, signOut } = useAuth();
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);

  // Role-Based Navigation Filtering (RBAC)
  const navSections = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard' as MainTabType, label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager'] },
      ],
    },
    {
      label: 'MANAGE BILLING',
      items: [
        { id: 'billing' as MainTabType, label: 'Billing', icon: Receipt, roles: ['owner', 'manager', 'cashier'] },
        { id: 'appointments' as MainTabType, label: 'Appointments', icon: CalendarCheck, roles: ['owner', 'manager', 'cashier', 'technician'] },
      ],
    },
    {
      label: 'CLIENTS',
      items: [
        { id: 'customers' as MainTabType, label: 'Customers', icon: Users, roles: ['owner', 'manager', 'cashier'] },
      ],
    },
    {
      label: 'MANAGE SERVICE & STOCK',
      items: [
        { id: 'inventory' as MainTabType, label: 'Products & Inventory', icon: Package, roles: ['owner', 'manager', 'cashier', 'technician'] },
      ],
    },
    {
      label: 'MANAGE REPORT',
      items: [
        { id: 'expenses' as MainTabType, label: 'Expense Management', icon: TrendingDown, roles: ['owner', 'manager'] },
        { id: 'reports' as MainTabType, label: 'Earnings & P&L', icon: BarChart3, roles: ['owner', 'manager'] },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'settings' as MainTabType, label: 'Studio Settings', icon: Settings, roles: ['owner', 'manager'] },
      ],
    },
  ];

  const userDisplayName = user?.user_metadata?.full_name || demoUser?.fullName || 'Studio User';
  const userEmail = user?.email || demoUser?.email || 'user@studio.com';

  return (
    <aside className="w-64 bg-[#131D31] text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none no-print">
      
      {/* SaaS Tenant / Workspace Selector */}
      <div className="p-4 border-b border-slate-800/80 relative">
        <button
          onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 transition-colors border border-slate-700/60 text-left"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-white font-bold text-xs leading-tight truncate">
                {currentTenant.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400">
                  {currentTenant.plan_tier}
                </span>
                <span className="text-[10px] text-slate-400 truncate">Workspace</span>
              </div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTenantMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Workspace Switcher Dropdown */}
        {isTenantMenuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Workspace
            </div>
            
            {availableTenants.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  switchTenant(t.id);
                  setIsTenantMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                  t.id === currentTenant.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.name}</span>
                </div>
                {t.id === currentTenant.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                )}
              </button>
            ))}

            <div className="pt-1.5 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsTenantMenuOpen(false);
                  setIsOnboarding(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register New Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      {['owner', 'manager', 'cashier'].includes(userRole) && (
        <div className="p-4 pb-2">
          <button
            onClick={onNewBillClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-600/30 transition-all duration-150 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE NEW BILL</span>
          </button>
        </div>
      )}

      {/* Navigation Sections (Filtered by Role) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-6">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.label}
              </div>
              <div className="space-y-1">
                {visibleItems.map((item) => {
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
          );
        })}
      </div>

      {/* User Session & Role Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{userDisplayName}</div>
              <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
            </div>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
            {userRole}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={onOpenAuthModal}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Switch Role</span>
          </button>
          
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
