import { createContext, useContext, useState, useEffect, type ReactNode, type FC } from 'react';
import type { Tenant, TenantSettings, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { DataStore } from '../lib/store';

const DEFAULT_DEMO_TENANTS: Tenant[] = [
  {
    id: 'tenant-apex',
    name: 'Apex Studio OS',
    slug: 'apex-studio',
    plan_tier: 'growth',
    subscription_status: 'active',
    billing_cycle: 'monthly',
    max_invoices_per_month: 1000,
    max_team_members: 10,
    settings: {
      currency: 'INR',
      currency_symbol: '₹',
      tax_label: 'GST',
      default_tax_rate: 18,
      phone: '+91 9876543210',
      email: 'contact@apexstudio.com',
      address: 'Plot 44, Industrial Area, Bhubaneswar, Odisha',
      gstin: '21AAAPL9821L1Z0',
      upi_name: 'Apex Studio',
      upi_id: 'apex@hdfcbank',
      theme: 'navy',
    },
  },
  {
    id: 'tenant-metro',
    name: 'Metro Auto Workshop',
    slug: 'metro-auto',
    plan_tier: 'starter',
    subscription_status: 'active',
    billing_cycle: 'monthly',
    max_invoices_per_month: 250,
    max_team_members: 3,
    settings: {
      currency: 'INR',
      currency_symbol: '₹',
      tax_label: 'GST',
      default_tax_rate: 18,
      phone: '+91 9123456780',
      email: 'billing@metroauto.com',
      address: 'Sector 5, Main Highway, Cuttack',
      gstin: '21BBBPK3321M1Z2',
      upi_name: 'Metro Auto Care',
      upi_id: 'metroauto@icici',
      theme: 'emerald',
    },
  },
];

interface TenantContextType {
  currentTenant: Tenant;
  availableTenants: Tenant[];
  userRole: UserRole;
  loading: boolean;
  switchTenant: (tenantId: string) => void;
  createTenant: (name: string, initialSettings?: Partial<TenantSettings>) => Promise<Tenant>;
  updateTenantSettings: (newSettings: Partial<TenantSettings>) => Promise<void>;
  isOnboarding: boolean;
  setIsOnboarding: (val: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, demoUser } = useAuth();
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>(() => {
    const cached = localStorage.getItem('iim_saas_tenants_v1');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_DEMO_TENANTS;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    const cached = localStorage.getItem('iim_active_tenant_id');
    if (cached && availableTenants.some(t => t.id === cached)) {
      return cached;
    }
    return availableTenants[0]?.id || 'tenant-apex';
  });

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync available tenants to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('iim_saas_tenants_v1', JSON.stringify(availableTenants));
  }, [availableTenants]);

  // Persist active tenant ID
  useEffect(() => {
    localStorage.setItem('iim_active_tenant_id', currentTenantId);
    DataStore.setActiveTenantId(currentTenantId);
  }, [currentTenantId]);

  // Load cloud tenants if authenticated with real Supabase Auth
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    supabase
      .from('tenant_users')
      .select('tenant_id, role, tenants (*)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        setLoading(false);
        if (!error && data && data.length > 0) {
          const cloudTenants = data
            .map(row => row.tenants as unknown as Tenant)
            .filter(Boolean);
          if (cloudTenants.length > 0) {
            setAvailableTenants(cloudTenants);
            setCurrentTenantId(cloudTenants[0].id);
            return;
          }
        }
        // If user has no tenants in cloud, prompt onboarding wizard
        if (!data || data.length === 0) {
          setIsOnboarding(true);
        }
      });
  }, [user]);

  const currentTenant = availableTenants.find(t => t.id === currentTenantId) || availableTenants[0] || DEFAULT_DEMO_TENANTS[0];
  const userRole: UserRole = demoUser?.role || 'owner';

  const switchTenant = (tenantId: string) => {
    const exists = availableTenants.find(t => t.id === tenantId);
    if (exists) {
      setCurrentTenantId(tenantId);
    }
  };

  const createTenant = async (name: string, initialSettings?: Partial<TenantSettings>): Promise<Tenant> => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      owner_id: user?.id || demoUser?.id,
      plan_tier: 'starter',
      subscription_status: 'trialing',
      billing_cycle: 'monthly',
      max_invoices_per_month: 250,
      max_team_members: 3,
      settings: {
        currency: 'INR',
        currency_symbol: '₹',
        tax_label: 'GST',
        default_tax_rate: 18,
        phone: initialSettings?.phone || '+91 9876543210',
        email: initialSettings?.email || user?.email || 'contact@studio.com',
        address: initialSettings?.address || 'Studio Address',
        gstin: initialSettings?.gstin || '',
        upi_name: initialSettings?.upi_name || name,
        upi_id: initialSettings?.upi_id || `${slug}@upi`,
        theme: 'navy',
        ...initialSettings,
      },
      created_at: new Date().toISOString(),
    };

    // If cloud Supabase user is active, save to cloud
    if (user) {
      try {
        const { data: insertedTenant, error: tErr } = await supabase.from('tenants').insert({
          name: newTenant.name,
          slug: newTenant.slug,
          owner_id: user.id,
          plan_tier: newTenant.plan_tier,
          subscription_status: newTenant.subscription_status,
          settings: newTenant.settings,
        }).select().single();

        if (!tErr && insertedTenant) {
          await supabase.from('tenant_users').insert({
            tenant_id: insertedTenant.id,
            user_id: user.id,
            email: user.email!,
            role: 'owner',
          });
          newTenant.id = insertedTenant.id;
        }
      } catch (err) {
        console.error('Cloud tenant creation notice:', err);
      }
    }

    setAvailableTenants(prev => [...prev, newTenant]);
    setCurrentTenantId(newTenant.id);
    setIsOnboarding(false);
    return newTenant;
  };

  const updateTenantSettings = async (newSettings: Partial<TenantSettings>) => {
    const updated = {
      ...currentTenant,
      settings: {
        ...currentTenant.settings,
        ...newSettings,
      },
    };

    setAvailableTenants(prev => prev.map(t => t.id === updated.id ? updated : t));

    if (user) {
      await supabase
        .from('tenants')
        .update({ settings: updated.settings })
        .eq('id', updated.id);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        availableTenants,
        userRole,
        loading,
        switchTenant,
        createTenant,
        updateTenantSettings,
        isOnboarding,
        setIsOnboarding,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
