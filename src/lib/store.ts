import { supabase } from './supabase';
import type { Customer, StudioService, InventoryProduct, Invoice, Expense, Appointment } from '../types';

// Default Seed Data for primary demo tenant
export const DEFAULT_SERVICES: StudioService[] = [
  { id: 's-1', name: '🛡️ Garware Plus Hi-Gloss PPF', short_code: 'ppf_garware', tagline: 'Self-healing ultra-gloss TPU protective film', price: 65000, category: 'Paint Protection' },
  { id: 's-2', name: '✨ 9H/10H Dual-Layer Ceramic Shield', short_code: 'ceramic_9h', tagline: 'Extreme candy gloss & hydrophobic barrier', price: 28000, category: 'Ceramic Coating' },
  { id: 's-3', name: '💎 3-Step Paint Correction & Polish', short_code: 'paint_correction', tagline: 'Swirl mark & oxidation removal compound', price: 12000, category: 'Polishing' },
  { id: 's-4', name: '🧼 Deep Steam Interior Detailing & Sanitization', short_code: 'interior_detail', tagline: 'Roof liner, leather conditioning & steam extraction', price: 7500, category: 'Interior' },
  { id: 's-5', name: '🚿 pH-Neutral Snow Foam Wash & Engine Bay', short_code: 'premium_wash', tagline: 'Two-bucket wash with microfiber dry & tire glaze', price: 2000, category: 'Washing' },
  { id: 's-6', name: '🛡️ Windshield & Glass Hydrophobic Coating', short_code: 'glass_coat', tagline: 'Clear rain repellent glass coating', price: 4500, category: 'Ceramic Coating' },
  { id: 's-7', name: '💺 Premium Leather Seat Ceramic Guard', short_code: 'leather_guard', tagline: 'UV fade & stain prevention for interior upholstery', price: 8500, category: 'Interior' },
];

export const DEFAULT_PRODUCTS: InventoryProduct[] = [
  {
    id: 'prod-1',
    name: 'Garware Hi-Gloss PPF Roll (15m)',
    sku: 'PPF-GAR-15M',
    category: 'PPF & Films',
    unit: 'rolls',
    current_stock: 6.00,
    min_stock_alert: 2.00,
    purchase_price: 32000,
    selling_price: 48000,
    is_active: true,
  },
  {
    id: 'prod-2',
    name: 'Avery Dennison Supreme PPF (15m)',
    sku: 'PPF-AVERY-15M',
    category: 'PPF & Films',
    unit: 'rolls',
    current_stock: 3.00,
    min_stock_alert: 1.00,
    purchase_price: 52000,
    selling_price: 75000,
    is_active: true,
  },
  {
    id: 'prod-3',
    name: 'CarPro CQuartz UK 3.0 Ceramic (50ml)',
    sku: 'CER-CQ-50ML',
    category: 'Ceramics & Coatings',
    unit: 'bottles',
    current_stock: 18.00,
    min_stock_alert: 5.00,
    purchase_price: 3800,
    selling_price: 6500,
    is_active: true,
  },
  {
    id: 'prod-4',
    name: 'Gyeon Q2 Mohs EVO Ceramic (50ml)',
    sku: 'CER-GYE-50ML',
    category: 'Ceramics & Coatings',
    unit: 'bottles',
    current_stock: 12.00,
    min_stock_alert: 4.00,
    purchase_price: 4500,
    selling_price: 8000,
    is_active: true,
  },
  {
    id: 'prod-5',
    name: 'Koch-Chemie Heavy Cut H9.02 (1L)',
    sku: 'POL-KC-H9',
    category: 'Polishing & Compounds',
    unit: 'liters',
    current_stock: 9.00,
    min_stock_alert: 2.00,
    purchase_price: 2400,
    selling_price: 3400,
    is_active: true,
  },
  {
    id: 'prod-6',
    name: 'Meguiar\'s Hyper Wash Shampoo (3.8L)',
    sku: 'WSH-MEG-38L',
    category: 'Shampoos & Chemicals',
    unit: 'bottles',
    current_stock: 7.00,
    min_stock_alert: 2.00,
    purchase_price: 2800,
    selling_price: 3800,
    is_active: true,
  },
  {
    id: 'prod-7',
    name: 'Maxshine 5" Wool Cutting Pad',
    sku: 'PAD-MAX-WOOL',
    category: 'Pads & Towels',
    unit: 'pcs',
    current_stock: 25.00,
    min_stock_alert: 8.00,
    purchase_price: 450,
    selling_price: 750,
    is_active: true,
  },
  {
    id: 'prod-8',
    name: 'Edgeless 500 GSM Microfiber Towels (Pack of 5)',
    sku: 'TWL-500GSM-5P',
    category: 'Pads & Towels',
    unit: 'pcs',
    current_stock: 30.00,
    min_stock_alert: 10.00,
    purchase_price: 600,
    selling_price: 1100,
    is_active: true,
  },
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customer_name: 'Chirag Limbachiya',
    customer_phone: '7874231435',
    email: 'chirag@example.com',
    vehicle_info: { make: 'BMW', model: 'M340i xDrive', year: 2024, reg_number: 'OD 02 AB 1234', color: 'Tanzanite Blue' },
    pending_balance: 1035,
    wallet_balance: 0,
  },
  {
    id: 'cust-2',
    customer_name: 'Raj Sharma',
    customer_phone: '9979965703',
    email: 'raj@example.com',
    vehicle_info: { make: 'Mercedes-Benz', model: 'GLC 300', year: 2023, reg_number: 'OD 02 BR 5555', color: 'Polar White' },
    pending_balance: 0,
    wallet_balance: 500,
  },
  {
    id: 'cust-3',
    customer_name: 'Vishwa Patel',
    customer_phone: '9236476545',
    email: 'vishwa@example.com',
    vehicle_info: { make: 'Audi', model: 'A6 Matrix', year: 2022, reg_number: 'OD 02 CD 9999', color: 'Mythos Black' },
    pending_balance: 0,
    wallet_balance: 0,
  },
  {
    id: 'cust-4',
    customer_name: 'Priyesh Mohanty',
    customer_phone: '7046629027',
    email: 'priyesh@example.com',
    vehicle_info: { make: 'Mahindra', model: 'XUV 700 AX7L', year: 2024, reg_number: 'OD 02 EF 7777', color: 'Midnight Black' },
    pending_balance: 0,
    wallet_balance: 0,
  },
  {
    id: 'cust-5',
    customer_name: 'Riya Patnaik',
    customer_phone: '8866433307',
    email: 'riya@example.com',
    vehicle_info: { make: 'Hyundai', model: 'Creta N Line', year: 2024, reg_number: 'OD 02 GH 3456', color: 'Thunder Blue' },
    pending_balance: 0,
    wallet_balance: 0,
  },
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-16',
    invoice_number: 'INV-0016',
    customer_name: 'Chirag Limbachiya',
    customer_phone: '7874231435',
    vehicle_info: { make: 'BMW', model: 'M340i xDrive', reg_number: 'OD 02 AB 1234' },
    billing_date: new Date(Date.now() - 2 * 3600000).toISOString(),
    items: [
      { id: 'item-1', item_type: 'service', name: '🛡️ Garware Plus Hi-Gloss PPF', rate: 65000, quantity: 1, gst_percent: 18, tax_amount: 11700, total_amount: 76700, assigned_staff: 'Rohan (Lead Technician)' },
      { id: 'item-2', item_type: 'product', name: 'CarPro CQuartz UK 3.0 Ceramic (50ml)', rate: 6500, quantity: 1, gst_percent: 18, tax_amount: 1170, total_amount: 7670, assigned_staff: 'Amit (PPF Specialist)' },
    ],
    subtotal: 71500,
    discount_amount: 1470,
    tax_amount: 12870,
    grand_total: 82900,
    paid_amount: 82900,
    balance_due: 0,
    payment_status: 'paid',
    payment_method: 'GPay',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'inv-15',
    invoice_number: 'INV-0015',
    customer_name: 'Raj Sharma',
    customer_phone: '9979965703',
    vehicle_info: { make: 'Mercedes-Benz', model: 'GLC 300', reg_number: 'OD 02 BR 5555' },
    billing_date: new Date(Date.now() - 24 * 3600000).toISOString(),
    items: [
      { id: 'item-3', item_type: 'service', name: '🚿 pH-Neutral Snow Foam Wash & Engine Bay', rate: 2000, quantity: 1, gst_percent: 18, tax_amount: 360, total_amount: 2360, assigned_staff: 'Sanjay (Coating Pro)' },
      { id: 'item-4', item_type: 'service', name: '🛡️ Windshield & Glass Hydrophobic Coating', rate: 4500, quantity: 1, gst_percent: 18, tax_amount: 810, total_amount: 5310, assigned_staff: 'Sanjay (Coating Pro)' },
    ],
    subtotal: 6500,
    discount_amount: 0,
    tax_amount: 1170,
    grand_total: 7670,
    paid_amount: 7670,
    balance_due: 0,
    payment_status: 'paid',
    payment_method: 'Cash',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'inv-14',
    invoice_number: 'INV-0014',
    customer_name: 'Vishwa Patel',
    customer_phone: '9236476545',
    vehicle_info: { make: 'Audi', model: 'A6 Matrix', reg_number: 'OD 02 CD 9999' },
    billing_date: new Date(Date.now() - 48 * 3600000).toISOString(),
    items: [
      { id: 'item-5', item_type: 'service', name: '🧼 Deep Steam Interior Detailing & Sanitization', rate: 7500, quantity: 1, gst_percent: 18, tax_amount: 1350, total_amount: 8850, assigned_staff: 'Amit (PPF Specialist)' },
    ],
    subtotal: 7500,
    discount_amount: 0,
    tax_amount: 1350,
    grand_total: 8850,
    paid_amount: 8850,
    balance_due: 0,
    payment_status: 'paid',
    payment_method: 'UPI',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'inv-8',
    invoice_number: 'INV-0008',
    customer_name: 'Chirag Limbachiya',
    customer_phone: '7874231435',
    vehicle_info: { make: 'BMW', model: 'M340i xDrive', reg_number: 'OD 02 AB 1234' },
    billing_date: new Date(Date.now() - 72 * 3600000).toISOString(),
    items: [
      { id: 'item-6', item_type: 'service', name: '🚿 pH-Neutral Snow Foam Wash', rate: 2000, quantity: 1, gst_percent: 18, tax_amount: 360, total_amount: 2360, assigned_staff: 'Rohan (Lead Technician)' },
    ],
    subtotal: 2000,
    discount_amount: 0,
    tax_amount: 360,
    grand_total: 2360,
    paid_amount: 2025,
    balance_due: 335,
    payment_status: 'partial',
    payment_method: 'Cash',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Garware PPF rolls supplier consignment',
    category: 'Raw Materials & Supplies',
    amount: 64000,
    payment_mode: 'Bank Transfer',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '2 Rolls Garware Plus Hi-Gloss',
  },
  {
    id: 'exp-2',
    title: 'Workshop Staff Weekly Wages',
    category: 'Salaries & Wages',
    amount: 18000,
    payment_mode: 'GPay',
    expense_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    notes: 'Weekly payouts for Rohan, Amit & Sanjay',
  },
  {
    id: 'exp-3',
    title: 'Studio Electricity Bill (3 Phase)',
    category: 'Utilities & Electricity',
    amount: 6850,
    payment_mode: 'GPay',
    expense_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    notes: 'TPCODL Commercial tariff',
  },
  {
    id: 'exp-4',
    title: 'Client Lounge Tea & Espresso Pods',
    category: 'Tea & Refreshments',
    amount: 500,
    payment_mode: 'Cash',
    expense_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    notes: 'Lounge snacks and refreshments',
  },
];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    customer_name: 'Riya Patnaik',
    customer_phone: '8866433307',
    vehicle_info: { make: 'Hyundai', model: 'Creta N Line', reg_number: 'OD 02 GH 3456' },
    appointment_date: new Date().toISOString(),
    appointment_time: '03:30 PM',
    status: 'in_service',
    advance_amount: 1500,
    advance_payment_method: 'GPay',
    services_requested: ['✨ 9H/10H Dual-Layer Ceramic Shield'],
    assigned_staff: 'Amit (PPF Specialist)',
    notes: 'Customer requested headlight tint film as well',
  },
  {
    id: 'apt-2',
    customer_name: 'Priyesh Mohanty',
    customer_phone: '7046629027',
    vehicle_info: { make: 'Mahindra', model: 'XUV 700 AX7L', reg_number: 'OD 02 EF 7777' },
    appointment_date: new Date(Date.now() + 86400000).toISOString(),
    appointment_time: '11:00 AM',
    status: 'scheduled',
    advance_amount: 5000,
    advance_payment_method: 'UPI',
    services_requested: ['🛡️ Garware Plus Hi-Gloss PPF'],
    assigned_staff: 'Rohan (Lead Technician)',
    notes: 'Full front bumper + bonnet + mirrors PPF',
  },
  {
    id: 'apt-3',
    customer_name: 'Chirag Limbachiya',
    customer_phone: '7874231435',
    vehicle_info: { make: 'BMW', model: 'M340i xDrive', reg_number: 'OD 02 AB 1234' },
    appointment_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    appointment_time: '04:00 PM',
    status: 'scheduled',
    advance_amount: 0,
    advance_payment_method: 'Cash',
    services_requested: ['🚿 pH-Neutral Snow Foam Wash & Engine Bay'],
    assigned_staff: 'Sanjay (Coating Pro)',
    notes: 'Periodic maintenance wash',
  },
];

// Multi-Tenant Data Store Class providing unified offline-first + Supabase RLS synchronization
export class DataStore {
  private static activeTenantId: string = 'tenant-apex';

  static setActiveTenantId(tenantId: string) {
    this.activeTenantId = tenantId;
  }

  static getActiveTenantId(): string {
    return this.activeTenantId;
  }

  private static key(entity: string): string {
    return `iim_${this.activeTenantId}_${entity}_v1`;
  }

  // --- INVOICES ---
  static getInvoices(): Invoice[] {
    const raw = localStorage.getItem(this.key('invoices'));
    if (!raw) {
      const initial = this.activeTenantId === 'tenant-apex' ? DEFAULT_INVOICES : [];
      localStorage.setItem(this.key('invoices'), JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveInvoice(invoice: Invoice): Invoice {
    invoice.tenant_id = this.activeTenantId;
    const invoices = this.getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoice.id || i.invoice_number === invoice.invoice_number);
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.unshift(invoice);
    }
    
    localStorage.setItem(this.key('invoices'), JSON.stringify(invoices));

    // Deduct stock for any product line items
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        if (item.item_type === 'product' && item.item_id) {
          this.adjustStock(item.item_id, -(item.quantity || 1));
        }
      });
    }

    // Cloud sync with Supabase (scoped to tenant_id)
    supabase.from('invoices').upsert({
      id: invoice.id,
      tenant_id: this.activeTenantId,
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      customer_name: invoice.customer_name,
      customer_phone: invoice.customer_phone,
      vehicle_info: invoice.vehicle_info,
      billing_date: invoice.billing_date,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      tax_amount: invoice.tax_amount,
      grand_total: invoice.grand_total,
      paid_amount: invoice.paid_amount,
      balance_due: invoice.balance_due,
      payment_status: invoice.payment_status,
      payment_method: invoice.payment_method,
      payment_split: invoice.payment_split || [],
      gst_number: invoice.gst_number,
      notes: invoice.notes,
    }).then(({ error }) => {
      if (error) console.info('Supabase cloud invoice sync notice:', error.message);
    });

    return invoice;
  }

  static deleteInvoice(id: string): void {
    const invoices = this.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(this.key('invoices'), JSON.stringify(invoices));
    supabase.from('invoices').delete().eq('id', id).eq('tenant_id', this.activeTenantId).then();
  }

  // --- PRODUCTS & INVENTORY ---
  static getProducts(): InventoryProduct[] {
    const raw = localStorage.getItem(this.key('products'));
    if (!raw) {
      const initial = this.activeTenantId === 'tenant-apex' ? DEFAULT_PRODUCTS : [];
      localStorage.setItem(this.key('products'), JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveProduct(product: InventoryProduct): InventoryProduct {
    product.tenant_id = this.activeTenantId;
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(this.key('products'), JSON.stringify(products));

    supabase.from('inventory_products').upsert({
      ...product,
      tenant_id: this.activeTenantId,
    }).then(({ error }) => {
      if (error) console.info('Supabase product sync notice:', error.message);
    });
    return product;
  }

  static adjustStock(productId: string, quantityDelta: number): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx >= 0) {
      products[idx].current_stock = Math.max(0, products[idx].current_stock + quantityDelta);
      localStorage.setItem(this.key('products'), JSON.stringify(products));
      supabase.from('inventory_products')
        .update({ current_stock: products[idx].current_stock })
        .eq('id', productId)
        .eq('tenant_id', this.activeTenantId)
        .then();
    }
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(this.key('products'), JSON.stringify(products));
    supabase.from('inventory_products').delete().eq('id', id).eq('tenant_id', this.activeTenantId).then();
  }

  // --- EXPENSES ---
  static getExpenses(): Expense[] {
    const raw = localStorage.getItem(this.key('expenses'));
    if (!raw) {
      const initial = this.activeTenantId === 'tenant-apex' ? DEFAULT_EXPENSES : [];
      localStorage.setItem(this.key('expenses'), JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveExpense(expense: Expense): Expense {
    expense.tenant_id = this.activeTenantId;
    const expenses = this.getExpenses();
    const idx = expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      expenses[idx] = expense;
    } else {
      expenses.unshift(expense);
    }
    localStorage.setItem(this.key('expenses'), JSON.stringify(expenses));

    supabase.from('expenses').upsert({
      ...expense,
      tenant_id: this.activeTenantId,
    }).then(({ error }) => {
      if (error) console.info('Supabase expense sync notice:', error.message);
    });
    return expense;
  }

  static deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(this.key('expenses'), JSON.stringify(expenses));
    supabase.from('expenses').delete().eq('id', id).eq('tenant_id', this.activeTenantId).then();
  }

  // --- APPOINTMENTS ---
  static getAppointments(): Appointment[] {
    const raw = localStorage.getItem(this.key('appointments'));
    if (!raw) {
      const initial = this.activeTenantId === 'tenant-apex' ? DEFAULT_APPOINTMENTS : [];
      localStorage.setItem(this.key('appointments'), JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveAppointment(apt: Appointment): Appointment {
    apt.tenant_id = this.activeTenantId;
    const appointments = this.getAppointments();
    const idx = appointments.findIndex(a => a.id === apt.id);
    if (idx >= 0) {
      appointments[idx] = apt;
    } else {
      appointments.unshift(apt);
    }
    localStorage.setItem(this.key('appointments'), JSON.stringify(appointments));

    supabase.from('appointments').upsert({
      ...apt,
      tenant_id: this.activeTenantId,
    }).then(({ error }) => {
      if (error) console.info('Supabase appointment sync notice:', error.message);
    });
    return apt;
  }

  static deleteAppointment(id: string): void {
    const appointments = this.getAppointments().filter(a => a.id !== id);
    localStorage.setItem(this.key('appointments'), JSON.stringify(appointments));
    supabase.from('appointments').delete().eq('id', id).eq('tenant_id', this.activeTenantId).then();
  }

  // --- CUSTOMERS ---
  static async getCustomers(): Promise<Customer[]> {
    const raw = localStorage.getItem(this.key('customers'));
    if (!raw) {
      const initial = this.activeTenantId === 'tenant-apex' ? DEFAULT_CUSTOMERS : [];
      localStorage.setItem(this.key('customers'), JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveCustomer(customer: Customer): Customer {
    customer.tenant_id = this.activeTenantId;
    const customers = this.getCustomersSync();
    const idx = customers.findIndex(c => c.id === customer.id || (customer.customer_phone && c.customer_phone === customer.customer_phone));
    if (idx >= 0) {
      customers[idx] = { ...customers[idx], ...customer };
    } else {
      customers.unshift(customer);
    }
    localStorage.setItem(this.key('customers'), JSON.stringify(customers));

    supabase.from('customers').upsert({
      ...customer,
      tenant_id: this.activeTenantId,
    }).then();

    return customer;
  }

  static getCustomersSync(): Customer[] {
    const raw = localStorage.getItem(this.key('customers'));
    if (!raw) {
      return this.activeTenantId === 'tenant-apex' ? DEFAULT_CUSTOMERS : [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // --- SERVICES CATALOG ---
  static async getServices(): Promise<StudioService[]> {
    const raw = localStorage.getItem(this.key('services'));
    if (!raw) {
      const initial = this.activeTenantId === 'tenant-apex' ? DEFAULT_SERVICES : [
        { id: 's-gen-1', name: '🛠️ General Service / Repair', price: 2500, category: 'General' },
        { id: 's-gen-2', name: '🧼 Premium Cleaning', price: 1500, category: 'Washing' },
      ];
      localStorage.setItem(this.key('services'), JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SERVICES;
    }
  }

  static saveService(service: StudioService): StudioService {
    service.tenant_id = this.activeTenantId;
    const raw = localStorage.getItem(this.key('services'));
    const list: StudioService[] = raw ? JSON.parse(raw) : DEFAULT_SERVICES;
    const idx = list.findIndex(s => s.id === service.id);
    if (idx >= 0) {
      list[idx] = service;
    } else {
      list.push(service);
    }
    localStorage.setItem(this.key('services'), JSON.stringify(list));
    return service;
  }
}
