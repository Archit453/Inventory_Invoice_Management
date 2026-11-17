import type { PlanTier } from '../types';

export interface PlanFeatureConfig {
  id: PlanTier;
  name: string;
  badge?: string;
  monthlyPriceINR: number;
  annualPriceINR: number;
  description: string;
  limits: {
    maxInvoicesPerMonth: number;
    maxTeamMembers: number;
    maxProducts: number;
  };
  features: {
    thermalPrint: boolean;
    a4Print: boolean;
    whatsappIntegration: boolean;
    splitPayments: boolean;
    appointmentBooking: boolean;
    expenseTracking: boolean;
    financialReports: boolean;
    barcodeScanning: boolean;
    multiDeviceSync: boolean;
    customDomain: boolean;
    exportExcel: boolean;
    prioritySupport: boolean;
  };
}

export const SAAS_PLANS: Record<PlanTier, PlanFeatureConfig> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    badge: '14-Day Trial',
    monthlyPriceINR: 0,
    annualPriceINR: 0,
    description: 'Explore the full power of Studio OS for your workshop.',
    limits: {
      maxInvoicesPerMonth: 25,
      maxTeamMembers: 1,
      maxProducts: 20,
    },
    features: {
      thermalPrint: true,
      a4Print: true,
      whatsappIntegration: true,
      splitPayments: true,
      appointmentBooking: true,
      expenseTracking: true,
      financialReports: false,
      barcodeScanning: false,
      multiDeviceSync: false,
      customDomain: false,
      exportExcel: false,
      prioritySupport: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter Studio',
    badge: 'Popular',
    monthlyPriceINR: 999,
    annualPriceINR: 9990,
    description: 'Perfect for small studios, single bays, and growing workshops.',
    limits: {
      maxInvoicesPerMonth: 250,
      maxTeamMembers: 3,
      maxProducts: 100,
    },
    features: {
      thermalPrint: true,
      a4Print: true,
      whatsappIntegration: true,
      splitPayments: true,
      appointmentBooking: true,
      expenseTracking: true,
      financialReports: true,
      barcodeScanning: true,
      multiDeviceSync: true,
      customDomain: false,
      exportExcel: false,
      prioritySupport: false,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth & Multi-Bay',
    badge: 'Best Value',
    monthlyPriceINR: 2499,
    annualPriceINR: 24990,
    description: 'For busy studios with multiple technicians and high-volume billing.',
    limits: {
      maxInvoicesPerMonth: 1000,
      maxTeamMembers: 10,
      maxProducts: 500,
    },
    features: {
      thermalPrint: true,
      a4Print: true,
      whatsappIntegration: true,
      splitPayments: true,
      appointmentBooking: true,
      expenseTracking: true,
      financialReports: true,
      barcodeScanning: true,
      multiDeviceSync: true,
      customDomain: true,
      exportExcel: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Franchise / Enterprise',
    badge: 'Custom',
    monthlyPriceINR: 5999,
    annualPriceINR: 59990,
    description: 'Franchise chains, unlimited branches, and dedicated infrastructure.',
    limits: {
      maxInvoicesPerMonth: 100000,
      maxTeamMembers: 100,
      maxProducts: 10000,
    },
    features: {
      thermalPrint: true,
      a4Print: true,
      whatsappIntegration: true,
      splitPayments: true,
      appointmentBooking: true,
      expenseTracking: true,
      financialReports: true,
      barcodeScanning: true,
      multiDeviceSync: true,
      customDomain: true,
      exportExcel: true,
      prioritySupport: true,
    },
  },
};
