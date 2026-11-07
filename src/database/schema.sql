-- ============================================================================
-- INVENTORY & INVOICE MANAGEMENT SCHEMA (STANDALONE SYSTEM)
-- ============================================================================
-- Database Schema for Products, Invoices, Items, Expenses, and Appointments
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. INVENTORY PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100) NOT NULL DEFAULT 'Consumables',
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs', -- 'pcs', 'ml', 'liters', 'meters', 'rolls', 'bottles'
    current_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_stock_alert NUMERIC(12,2) NOT NULL DEFAULT 5,
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory_products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON public.inventory_products(is_active);

-- 2. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Customer',
    customer_phone VARCHAR(50),
    vehicle_info JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"make": "BMW", "model": "M340i", "reg_number": "OD02AB1234"}
    billing_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid', -- 'paid', 'partial', 'due'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash', -- 'Cash', 'UPI', 'GPay', 'Card', 'Split'
    payment_split JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"method": "Cash", "amount": 5000}, {"method": "GPay", "amount": 2700}]
    gst_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_phone ON public.invoices(customer_phone);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_date ON public.invoices(billing_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);

-- 3. INVOICE LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- 4. EXPENSE ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Miscellaneous', -- 'Raw Materials & Supplies', 'Salaries & Wages', 'Rent & Studio', 'Utilities & Electricity', 'Tea & Refreshments', 'Marketing & Ads', 'Equipment Maintenance', 'Miscellaneous'
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash', -- 'Cash', 'GPay', 'UPI', 'Bank Transfer', 'Card'
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- 5. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Automatic stock decrement trigger when an invoice item of type 'product' is created
CREATE OR REPLACE FUNCTION public.decrement_inventory_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_type = 'product' AND NEW.item_id IS NOT NULL THEN
        UPDATE public.inventory_products
        SET current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.item_id::uuid;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoice_decrement_stock ON public.invoice_items;
CREATE TRIGGER trg_invoice_decrement_stock
AFTER INSERT ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_inventory_on_invoice();

-- Initial Seed of Inventory Consumables
INSERT INTO public.inventory_products (name, sku, category, unit, current_stock, min_stock_alert, purchase_price, selling_price)
VALUES
('Garware Hi-Gloss PPF Roll (15m)', 'PPF-GAR-15M', 'PPF & Films', 'rolls', 6.00, 2.00, 32000.00, 48000.00),
('Avery Dennison Supreme PPF (15m)', 'PPF-AVERY-15M', 'PPF & Films', 'rolls', 4.00, 1.00, 52000.00, 75000.00),
('CarPro CQuartz UK 3.0 Ceramic (50ml)', 'CER-CQ-50ML', 'Ceramics & Coatings', 'bottles', 18.00, 5.00, 3800.00, 6500.00),
('Gyeon Q2 Mohs EVO Ceramic (50ml)', 'CER-GYE-50ML', 'Ceramics & Coatings', 'bottles', 12.00, 4.00, 4500.00, 8000.00),
('Koch-Chemie Heavy Cut H9.02 (1L)', 'POL-KC-H9', 'Polishing & Compounds', 'liters', 9.00, 2.00, 2400.00, 3400.00),
('Koch-Chemie Micro Cut M3.02 (1L)', 'POL-KC-M3', 'Polishing & Compounds', 'liters', 8.00, 2.00, 2600.00, 3600.00),
('Meguiar''s Hyper Wash Shampoo (3.8L)', 'WSH-MEG-38L', 'Shampoos & Chemicals', 'bottles', 7.00, 2.00, 2800.00, 3800.00),
('Gyeon Q2M Iron Remover (1L)', 'CHM-GYE-IRN', 'Shampoos & Chemicals', 'bottles', 10.00, 3.00, 1900.00, 2600.00),
('Maxshine 5" Wool Cutting Pad', 'PAD-MAX-WOOL', 'Pads & Towels', 'pcs', 25.00, 8.00, 450.00, 750.00),
('Edgeless 500 GSM Microfiber Towels (Pack of 5)', 'TWL-500GSM-5P', 'Pads & Towels', 'pcs', 30.00, 10.00, 600.00, 1100.00)
ON CONFLICT DO NOTHING;
