import { useState, useEffect, useMemo, type FC, type FormEvent } from 'react';
import {
  ArrowLeft,
  UserPlus,
  Plus,
  Trash2,
  Calendar,
  Wallet,
  AlertCircle,
  Car,
  Check
} from 'lucide-react';
import type { Customer, StudioService, InventoryProduct, Invoice, InvoiceItem, PaymentSplitItem } from '../../types';
import { ServiceProductSelectorModal } from './ServiceProductSelectorModal';
import { calculateInvoice } from '../../lib/invoiceCalculator';
import { formatINR } from '../../lib/formatters';
import { toast } from 'sonner';

interface CreateInvoiceViewProps {
  customers: Customer[];
  services: StudioService[];
  products: InventoryProduct[];
  onBack: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
  onAddNewCustomer: (customer: Customer) => void;
  prefillCustomerPhone?: string;
  prefillServices?: string[];
  advancePaid?: number;
}

export const CreateInvoiceView: FC<CreateInvoiceViewProps> = ({
  customers,
  services,
  products,
  onBack,
  onInvoiceCreated,
  onAddNewCustomer,
  prefillCustomerPhone,
  prefillServices,
  advancePaid = 0,
}) => {
  // Selected Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [billingDate, setBillingDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Quick Add Customer Modal
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustVehicleMake, setNewCustVehicleMake] = useState('');
  const [newCustVehicleModel, setNewCustVehicleModel] = useState('');
  const [newCustVehicleReg, setNewCustVehicleReg] = useState('');

  // Payment & Discount State
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GPay' | 'UPI' | 'Card' | 'Bank Transfer'>('Cash');
  const [paidInput, setPaidInput] = useState<number>(0);
  const [splitRows, setSplitRows] = useState<PaymentSplitItem[]>([
    { method: 'Cash', amount: 0 },
    { method: 'GPay', amount: 0 },
  ]);

  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isDiscountPercentage, setIsDiscountPercentage] = useState(false);
  const [customerGstNo, setCustomerGstNo] = useState('');
  const [notes, setNotes] = useState('');

  const staffOptions = ['Assign...', 'Rohan (Lead Technician)', 'Amit (PPF Specialist)', 'Sanjay (Coating Pro)', 'Karan (Interior Tech)'];

  // Handle prefilling if redirected from appointment
  useEffect(() => {
    if (prefillCustomerPhone) {
      const match = customers.find(c => c.customer_phone === prefillCustomerPhone);
      if (match) {
        setSelectedCustomerId(match.id);
      }
    }

    if (prefillServices && prefillServices.length > 0 && items.length === 0) {
      const initialItems: InvoiceItem[] = [];
      prefillServices.forEach(sName => {
        const found = services.find(s => s.name === sName);
        const price = found?.price || 15000;
        const tax = price * 0.18;
        initialItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          item_type: 'service',
          item_id: found?.id,
          name: sName,
          rate: price,
          quantity: 1,
          gst_percent: 18,
          tax_amount: tax,
          total_amount: price + tax,
          assigned_staff: 'Assign...',
        });
      });
      setItems(initialItems);
    }
    if (advancePaid > 0 && paidInput === 0) {
      setPaidInput(advancePaid);
    }
  }, [prefillCustomerPhone, prefillServices, customers, services, advancePaid, paidInput, items.length]);

  // Selected customer object
  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Calculation Results
  const calc = useMemo(() => {
    return calculateInvoice(
      items,
      discountValue,
      isDiscountPercentage,
      paidInput,
      splitRows,
      isSplitPayment
    );
  }, [items, discountValue, isDiscountPercentage, paidInput, splitRows, isSplitPayment]);

  // Sync default paid amount to grand total if not manually edited yet
  useEffect(() => {
    if (paidInput === 0 && calc.grand_total > 0 && !isSplitPayment) {
      setPaidInput(calc.grand_total);
    }
  }, [calc.grand_total, isSplitPayment]);

  const handleItemRateChange = (index: number, rate: number) => {
    const updated = [...items];
    updated[index].rate = Math.max(0, rate);
    setItems(updated);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(0.1, qty);
    setItems(updated);
  };

  const handleItemGstChange = (index: number, gst: number) => {
    const updated = [...items];
    updated[index].gst_percent = gst;
    setItems(updated);
  };

  const handleItemStaffChange = (index: number, staff: string) => {
    const updated = [...items];
    updated[index].assigned_staff = staff;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddCatalogItems = (newItems: InvoiceItem[]) => {
    setItems([...items, ...newItems]);
  };

  const handleCreateCustomerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      customer_name: newCustName.trim(),
      customer_phone: newCustPhone.trim(),
      vehicle_info: {
        make: newCustVehicleMake.trim() || undefined,
        model: newCustVehicleModel.trim() || undefined,
        reg_number: newCustVehicleReg.trim().toUpperCase() || undefined,
      },
      pending_balance: 0,
      wallet_balance: 0,
    };

    onAddNewCustomer(newCustomer);
    setSelectedCustomerId(newCustomer.id);
    setIsNewCustModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustVehicleMake('');
    setNewCustVehicleModel('');
    setNewCustVehicleReg('');
    toast.success('Customer added and selected');
  };

  const handleSubmitInvoice = () => {
    if (!selectedCustomerId && !activeCustomer) {
      toast.error('Please select or add a customer to bill');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one service or product');
      return;
    }

    const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      customer_id: activeCustomer?.id,
      customer_name: activeCustomer?.customer_name || 'Customer',
      customer_phone: activeCustomer?.customer_phone,
      vehicle_info: activeCustomer?.vehicle_info,
      billing_date: new Date(billingDate).toISOString(),
      items: calc.items,
      subtotal: calc.subtotal,
      discount_amount: calc.discount_amount,
      discount_percent: isDiscountPercentage ? discountValue : 0,
      tax_amount: calc.tax_amount,
      grand_total: calc.grand_total,
      paid_amount: calc.paid_amount,
      balance_due: calc.balance_due,
      payment_status: calc.payment_status,
      payment_method: isSplitPayment ? 'Split' : paymentMethod,
      payment_split: isSplitPayment ? splitRows : undefined,
      gst_number: customerGstNo.trim() || undefined,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    onInvoiceCreated(newInvoice);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create New Invoice</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generate New Invoice</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewCustModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider shadow-xs hover:bg-slate-50 transition-all"
        >
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main Grid: Left = Details + Items, Right = Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: CUSTOMER DETAILS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Customer Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Billed To
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Select Customer from CRM Leads --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name} {c.customer_phone ? `(${c.customer_phone})` : ''} {c.vehicle_info?.reg_number ? `— ${c.vehicle_info.reg_number}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Billing Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={billingDate}
                    onChange={(e) => setBillingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Customer Status Badges (matching frame 25s) */}
            {activeCustomer && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {activeCustomer.pending_balance && activeCustomer.pending_balance > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    TOTAL PENDING: {formatINR(activeCustomer.pending_balance)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    NO PENDING BALANCE
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                  <Wallet className="w-3.5 h-3.5" />
                  Wallet: {formatINR(activeCustomer.wallet_balance || 0)}
                </span>

                {activeCustomer.vehicle_info?.reg_number && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold">
                    <Car className="w-3.5 h-3.5" />
                    {activeCustomer.vehicle_info.make} {activeCustomer.vehicle_info.model} ({activeCustomer.vehicle_info.reg_number})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card 2: SERVICES & PRODUCTS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Services & Products
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold tracking-wide uppercase transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service/Product</span>
              </button>
            </div>

            {/* Line Items Table */}
            {items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                No services or products selected yet. Click the button above to add.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-2.5">Service/Product</th>
                      <th className="pb-2.5 w-24">Rate (₹)</th>
                      <th className="pb-2.5 w-16 text-center">Qty</th>
                      <th className="pb-2.5 w-20 text-center">GST %</th>
                      <th className="pb-2.5 w-36">Staff</th>
                      <th className="pb-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="group">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.item_type === 'service' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {item.item_type}
                          </span>
                        </td>
                        <td className="py-3 px-1">
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => handleItemRateChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-1 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemQtyChange(idx, parseFloat(e.target.value) || 1)}
                            className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 text-center focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-1 text-center">
                          <select
                            value={item.gst_percent}
                            onChange={(e) => handleItemGstChange(idx, parseFloat(e.target.value))}
                            className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="py-3 px-1">
                          <select
                            value={item.assigned_staff || 'Assign...'}
                            onChange={(e) => handleItemStaffChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                          >
                            {staffOptions.map(staff => (
                              <option key={staff} value={staff}>{staff}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pl-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Invoice Remarks / Vehicle Condition Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 5-Year Garware PPF warranty package with 3 free maintenance washes..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

        </div>

        {/* Right 1 Column: PAYMENT PANEL (matching frame 25s & 50s) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Payment & Settlement
            </span>
            <button
              type="button"
              onClick={() => setIsSplitPayment(!isSplitPayment)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                isSplitPayment ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              + Split
            </button>
          </div>

          {/* Payment Method & Amount */}
          {!isSplitPayment ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Cash">Cash</option>
                  <option value="GPay">GPay</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={paidInput}
                    onChange={(e) => setPaidInput(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Split Payments
              </label>
              {splitRows.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    value={row.method}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[idx].method = e.target.value as any;
                      setSplitRows(updated);
                    }}
                    className="w-1/2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GPay">GPay</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={row.amount}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[idx].amount = parseFloat(e.target.value) || 0;
                      setSplitRows(updated);
                    }}
                    className="w-1/2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Paid vs Due Status Badge */}
          <div className="flex items-center justify-between text-xs font-bold py-2 px-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-emerald-600">PAID: {formatINR(calc.paid_amount)}</span>
            <span className={calc.balance_due > 0 ? 'text-red-500' : 'text-slate-400'}>
              DUE: {formatINR(calc.balance_due)}
            </span>
          </div>

          {/* Customer GSTIN */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Customer GST No (Optional)
            </label>
            <input
              type="text"
              value={customerGstNo}
              onChange={(e) => setCustomerGstNo(e.target.value.toUpperCase())}
              placeholder="e.g. 21ABCDE1234F1Z5"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800"
            />
          </div>

          {/* Discount Field */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Discount Type
              </label>
              <select
                value={isDiscountPercentage ? 'percent' : 'flat'}
                onChange={(e) => setIsDiscountPercentage(e.target.value === 'percent')}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="flat">Fixed (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatINR(calc.subtotal)}</span>
            </div>
            {calc.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-{formatINR(calc.discount_amount)}</span>
              </div>
            )}
            {calc.tax_amount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-800">{formatINR(calc.tax_amount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-extrabold text-slate-900 tracking-wide uppercase">Grand Total:</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatINR(calc.grand_total)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleSubmitInvoice}
              className="w-full py-3 px-4 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-slate-900/20 transition-all duration-150 active:scale-98"
            >
              Generate Invoice
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>

      {/* Service / Product Catalog Modal */}
      <ServiceProductSelectorModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        services={services}
        products={products}
        onAddItems={handleAddCatalogItems}
      />

      {/* Quick Add Customer Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Add New Customer & Vehicle</h3>
            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sourav Mohapatra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9861201770"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Car Make
                  </label>
                  <input
                    type="text"
                    value={newCustVehicleMake}
                    onChange={(e) => setNewCustVehicleMake(e.target.value)}
                    placeholder="e.g. BMW / Audi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Car Model
                  </label>
                  <input
                    type="text"
                    value={newCustVehicleModel}
                    onChange={(e) => setNewCustVehicleModel(e.target.value)}
                    placeholder="e.g. M340i / X5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Vehicle Reg Number
                </label>
                <input
                  type="text"
                  value={newCustVehicleReg}
                  onChange={(e) => setNewCustVehicleReg(e.target.value)}
                  placeholder="e.g. OD 02 AB 1234"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs uppercase"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
