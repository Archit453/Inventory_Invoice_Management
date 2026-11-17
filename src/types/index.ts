export type UserRole = 'owner' | 'manager' | 'cashier' | 'technician';
export type PlanTier = 'free' | 'starter' | 'growth' | 'enterprise';

export interface TenantSettings {
  currency: string;
  currency_symbol: string;
  tax_label: string;
  default_tax_rate: number;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  upi_name?: string;
  upi_id?: string;
  google_review_link?: string;
  theme?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  plan_tier: PlanTier;
  subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  billing_cycle?: 'monthly' | 'annual';
  max_invoices_per_month?: number;
  max_team_members?: number;
  settings: TenantSettings;
  created_at?: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

export interface VehicleInfo {
  make?: string;
  model?: string;
  year?: number | string;
  reg_number?: string;
  color?: string;
}

export interface Customer {
  id: string;
  tenant_id?: string;
  customer_name: string;
  customer_phone?: string;
  email?: string;
  vehicle_info?: VehicleInfo;
  pending_balance?: number;
  wallet_balance?: number;
}

export interface StudioService {
  id: string;
  tenant_id?: string;
  name: string;
  short_code?: string;
  tagline?: string;
  description?: string;
  price?: number;
  category?: string;
}

export interface InventoryProduct {
  id: string;
  tenant_id?: string;
  name: string;
  sku: string;
  category: string;
  unit: 'pcs' | 'ml' | 'liters' | 'meters' | 'rolls' | 'bottles';
  current_stock: number;
  min_stock_alert: number;
  purchase_price: number;
  selling_price: number;
  barcode?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface InvoiceItem {
  id: string;
  tenant_id?: string;
  item_type: 'service' | 'product' | 'package';
  item_id?: string;
  name: string;
  category?: string;
  rate: number;
  quantity: number;
  gst_percent: number;
  tax_amount: number;
  total_amount: number;
  assigned_staff?: string;
}

export interface PaymentSplitItem {
  method: 'Cash' | 'GPay' | 'UPI' | 'Card' | 'Bank Transfer';
  amount: number;
}

export interface Invoice {
  id: string;
  tenant_id?: string;
  invoice_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  vehicle_info?: VehicleInfo;
  billing_date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount_amount: number;
  discount_percent?: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  balance_due: number;
  payment_status: 'paid' | 'partial' | 'due';
  payment_method: 'Cash' | 'GPay' | 'UPI' | 'Card' | 'Split' | 'Bank Transfer';
  payment_split?: PaymentSplitItem[];
  gst_number?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  tenant_id?: string;
  title: string;
  category: 'Raw Materials & Supplies' | 'Salaries & Wages' | 'Rent & Studio' | 'Utilities & Electricity' | 'Tea & Refreshments' | 'Marketing & Ads' | 'Equipment Maintenance' | 'Miscellaneous';
  amount: number;
  payment_mode: 'Cash' | 'GPay' | 'UPI' | 'Bank Transfer' | 'Card';
  expense_date: string;
  notes?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  tenant_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  vehicle_info?: VehicleInfo;
  appointment_date: string;
  appointment_time?: string;
  status: 'scheduled' | 'in_service' | 'completed' | 'cancelled';
  advance_amount: number;
  advance_payment_method: 'Cash' | 'GPay' | 'UPI' | 'Card';
  services_requested: string[];
  assigned_staff?: string;
  notes?: string;
  invoice_id?: string;
  created_at?: string;
}

export type MainTabType = 
  | 'dashboard'
  | 'billing'
  | 'new-bill'
  | 'appointments'
  | 'customers'
  | 'inventory'
  | 'expenses'
  | 'reports'
  | 'settings';
