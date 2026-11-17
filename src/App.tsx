import { useState, useEffect, useRef } from 'react';
import type { MainTabType, Invoice, InventoryProduct, Expense, Appointment, Customer, StudioService } from './types';
import { DataStore } from './lib/store';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { BillingList } from './components/billing/BillingList';
import { CreateInvoiceView } from './components/billing/CreateInvoiceView';
import { BillSuccessModal } from './components/billing/BillSuccessModal';
import { InvoicePrintTemplate } from './components/billing/InvoicePrintTemplate';
import { ProductList } from './components/inventory/ProductList';
import { ExpenseList } from './components/expenses/ExpenseList';
import { AppointmentList } from './components/appointments/AppointmentList';
import { CustomerListView } from './components/customers/CustomerListView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { Toaster, toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

function MainAppContent() {
  const { currentTenant, isOnboarding } = useTenant();
  const [activeTab, setActiveTab] = useState<MainTabType>('billing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Application Data States (Scoped to currentTenant)
  const [invoices, setInvoices] = useState<Invoice[]>(() => DataStore.getInvoices());
  const [products, setProducts] = useState<InventoryProduct[]>(() => DataStore.getProducts());
  const [expenses, setExpenses] = useState<Expense[]>(() => DataStore.getExpenses());
  const [appointments, setAppointments] = useState<Appointment[]>(() => DataStore.getAppointments());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<StudioService[]>([]);

  // Post-Creation Success Modal State
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Prefill Data for creating bill from appointment or customer
  const [billPrefill, setBillPrefill] = useState<{
    customerPhone?: string;
    services?: string[];
    advancePaid?: number;
  }>({});

  // Printing reference
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: createdInvoice ? `Invoice-${createdInvoice.invoice_number}` : 'Invoice',
  });

  // Re-sync all state whenever currentTenant changes
  useEffect(() => {
    DataStore.setActiveTenantId(currentTenant.id);
    setInvoices(DataStore.getInvoices());
    setProducts(DataStore.getProducts());
    setExpenses(DataStore.getExpenses());
    setAppointments(DataStore.getAppointments());
    DataStore.getCustomers().then(setCustomers);
    DataStore.getServices().then(setServices);
  }, [currentTenant.id]);

  // Handlers for Invoices
  const handleSaveInvoice = (newInv: Invoice) => {
    DataStore.saveInvoice(newInv);
    setInvoices(DataStore.getInvoices());
    setProducts(DataStore.getProducts()); // stock updated
    setCreatedInvoice(newInv);
    setIsSuccessModalOpen(true);
    setActiveTab('billing');
    toast.success(`Invoice #${newInv.invoice_number} saved for ${currentTenant.name}!`);
  };

  const handleDeleteInvoice = (id: string) => {
    DataStore.deleteInvoice(id);
    setInvoices(DataStore.getInvoices());
  };

  // Handlers for Products
  const handleSaveProduct = (prod: InventoryProduct) => {
    DataStore.saveProduct(prod);
    setProducts(DataStore.getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    DataStore.deleteProduct(id);
    setProducts(DataStore.getProducts());
  };

  const handleAdjustStock = (id: string, delta: number) => {
    DataStore.adjustStock(id, delta);
    setProducts(DataStore.getProducts());
  };

  // Handlers for Expenses
  const handleSaveExpense = (exp: Expense) => {
    DataStore.saveExpense(exp);
    setExpenses(DataStore.getExpenses());
  };

  const handleDeleteExpense = (id: string) => {
    DataStore.deleteExpense(id);
    setExpenses(DataStore.getExpenses());
  };

  // Handlers for Appointments
  const handleSaveAppointment = (apt: Appointment) => {
    DataStore.saveAppointment(apt);
    setAppointments(DataStore.getAppointments());
  };

  const handleDeleteAppointment = (id: string) => {
    DataStore.deleteAppointment(id);
    setAppointments(DataStore.getAppointments());
  };

  const handleGenerateBillFromAppointment = (apt: Appointment) => {
    setBillPrefill({
      customerPhone: apt.customer_phone,
      services: apt.services_requested,
      advancePaid: apt.advance_amount,
    });
    setActiveTab('new-bill');
  };

  // Handlers for Customers
  const handleSaveCustomer = (cust: Customer) => {
    DataStore.saveCustomer(cust);
    setCustomers(prev => {
      const idx = prev.findIndex(c => c.id === cust.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = cust;
        return u;
      }
      return [cust, ...prev];
    });
  };

  const handleSelectCustomerToBill = (cust: Customer) => {
    setBillPrefill({
      customerPhone: cust.customer_phone,
    });
    setActiveTab('new-bill');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <Toaster position="top-right" richColors />

      {/* Left Sidebar with Tenant Selector & Role Info */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'new-bill') {
            setBillPrefill({});
          }
          setActiveTab(tab);
        }}
        onNewBillClick={() => {
          setBillPrefill({});
          setActiveTab('new-bill');
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-full">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            invoices={invoices}
            products={products}
            expenses={expenses}
            appointments={appointments}
            setActiveTab={setActiveTab}
            onNewBillClick={() => {
              setBillPrefill({});
              setActiveTab('new-bill');
            }}
          />
        )}

        {activeTab === 'billing' && (
          <BillingList
            invoices={invoices}
            onNewBillClick={() => {
              setBillPrefill({});
              setActiveTab('new-bill');
            }}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {activeTab === 'new-bill' && (
          <CreateInvoiceView
            customers={customers}
            services={services}
            products={products}
            prefillCustomerPhone={billPrefill.customerPhone}
            prefillServices={billPrefill.services}
            advancePaid={billPrefill.advancePaid}
            onBack={() => setActiveTab('billing')}
            onInvoiceCreated={handleSaveInvoice}
            onAddNewCustomer={handleSaveCustomer}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentList
            appointments={appointments}
            customers={customers}
            services={services}
            onSaveAppointment={handleSaveAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onGenerateBillFromAppointment={handleGenerateBillFromAppointment}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerListView
            customers={customers}
            invoices={invoices}
            onSaveCustomer={handleSaveCustomer}
            onSelectCustomerToBill={handleSelectCustomerToBill}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductList
            products={products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            invoices={invoices}
            expenses={expenses}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Bill Success Modal (WhatsApp & Print triggers) */}
      <BillSuccessModal
        invoice={createdInvoice}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onPrint={() => {
          setTimeout(() => {
            handlePrint();
          }, 150);
        }}
      />

      {/* Hidden Print Container */}
      <div className="hidden">
        <InvoicePrintTemplate
          ref={printRef}
          invoice={createdInvoice}
          mode="a4"
        />
      </div>

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* New Studio Onboarding Wizard */}
      {isOnboarding && <OnboardingWizard />}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <MainAppContent />
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
