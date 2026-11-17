-- ============================================================================
-- INVENTORY & INVOICE MANAGEMENT — MULTI-TENANT SAAS DATABASE SCHEMA
-- ============================================================================
-- Complete schema with Tenants, User Memberships, Row Level Security (RLS),
-- Automated Stock Decrements, Invoices, Line Items, Products, Expenses & Appointments
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SAAS TENANTS (ORGANIZATIONS / BUSINESSES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'free', 'starter', 'growth', 'enterprise'
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'trialing', 'active', 'past_due', 'canceled'
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
    max_invoices_per_month INTEGER DEFAULT 300,
    max_team_members INTEGER DEFAULT 3,
    settings JSONB NOT NULL DEFAULT '{
        "currency": "INR",
        "currency_symbol": "₹",
        "tax_label": "GST",
        "default_tax_rate": 18,
        "phone": "+91 9876543210",
        "email": "contact@studio.com",
        "address": "Workshop Operations Center",
        "gstin": "21AAAPL1234L1Z5",
        "upi_name": "Studio Operations",
        "upi_id": "studio@upi",
        "theme": "navy"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- ============================================================================
-- 2. TENANT USER MEMBERSHIPS & ROLES (RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'cashier', -- 'owner', 'manager', 'cashier', 'technician'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON public.tenant_users(tenant_id);

-- ============================================================================
-- 3. INVENTORY PRODUCTS TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100) NOT NULL DEFAULT 'Consumables',
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs', -- 'pcs', 'ml', 'liters', 'meters', 'rolls', 'bottles'
    current_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_stock_alert NUMERIC(12,2) NOT NULL DEFAULT 5,
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    barcode VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tenant ON public.inventory_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory_products(tenant_id, category);

-- ============================================================================
-- 4. STUDIO SERVICES TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.studio_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(100),
    tagline TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL DEFAULT 'Studio Services',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_tenant ON public.studio_services(tenant_id);

-- ============================================================================
-- 5. CUSTOMERS TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    email VARCHAR(255),
    vehicle_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    pending_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(tenant_id, customer_phone);

-- ============================================================================
-- 6. INVOICES TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Customer',
    customer_phone VARCHAR(50),
    vehicle_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    billing_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid', -- 'paid', 'partial', 'due'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash', -- 'Cash', 'UPI', 'GPay', 'Card', 'Bank Transfer', 'Split'
    payment_split JSONB NOT NULL DEFAULT '[]'::jsonb,
    gst_number VARCHAR(50),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_date ON public.invoices(tenant_id, billing_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON public.invoices(tenant_id, payment_status);

-- ============================================================================
-- 7. INVOICE LINE ITEMS TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL DEFAULT 'service', -- 'service', 'product', 'package'
    item_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    rate NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    gst_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    assigned_staff VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_tenant ON public.invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ============================================================================
-- 8. EXPENSES TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Miscellaneous',
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON public.expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_date ON public.expenses(tenant_id, expense_date DESC);

-- ============================================================================
-- 9. APPOINTMENTS TABLE (TENANT ISOLATED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    vehicle_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    appointment_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_service', 'completed', 'cancelled'
    advance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    advance_payment_method VARCHAR(50) DEFAULT 'Cash',
    services_requested JSONB NOT NULL DEFAULT '[]'::jsonb,
    assigned_staff VARCHAR(100),
    notes TEXT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON public.appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON public.appointments(tenant_id, appointment_date);

-- ============================================================================
-- 10. STOCK DECREMENT TRIGGER (PER TENANT)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.decrement_inventory_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_type = 'product' AND NEW.item_id IS NOT NULL THEN
        UPDATE public.inventory_products
        SET current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.item_id::uuid
          AND tenant_id = NEW.tenant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoice_decrement_stock ON public.invoice_items;
CREATE TRIGGER trg_invoice_decrement_stock
AFTER INSERT ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_inventory_on_invoice();

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current auth user belongs to the tenant
CREATE OR REPLACE FUNCTION public.is_member_of(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users
        WHERE tenant_id = target_tenant_id
          AND user_id = auth.uid()
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for tenant-isolated data
CREATE POLICY "Tenants user membership access" ON public.tenants
    FOR ALL USING (id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users membership access" ON public.tenant_users
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Inventory Products Isolation" ON public.inventory_products
    FOR ALL USING (public.is_member_of(tenant_id));

CREATE POLICY "Services Isolation" ON public.studio_services
    FOR ALL USING (public.is_member_of(tenant_id));

CREATE POLICY "Customers Isolation" ON public.customers
    FOR ALL USING (public.is_member_of(tenant_id));

CREATE POLICY "Invoices Isolation" ON public.invoices
    FOR ALL USING (public.is_member_of(tenant_id));

CREATE POLICY "Invoice Items Isolation" ON public.invoice_items
    FOR ALL USING (public.is_member_of(tenant_id));

CREATE POLICY "Expenses Isolation" ON public.expenses
    FOR ALL USING (public.is_member_of(tenant_id));

CREATE POLICY "Appointments Isolation" ON public.appointments
    FOR ALL USING (public.is_member_of(tenant_id));
