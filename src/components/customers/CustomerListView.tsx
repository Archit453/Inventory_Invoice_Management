import { useState, useMemo, type FC, type FormEvent } from 'react';
import {
  Search,
  UserPlus,
  Car,
  Phone,
  Receipt,
  MessageCircle,
  X,
  Check
} from 'lucide-react';
import type { Customer, Invoice } from '../../types';
import { formatINR } from '../../lib/formatters';
import { toast } from 'sonner';

interface CustomerListViewProps {
  customers: Customer[];
  invoices: Invoice[];
  onSaveCustomer: (customer: Customer) => void;
  onSelectCustomerToBill: (customer: Customer) => void;
}

export const CustomerListView: FC<CustomerListViewProps> = ({
  customers,
  invoices,
  onSaveCustomer,
  onSelectCustomerToBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [reg, setReg] = useState('');

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter(c =>
      c.customer_name.toLowerCase().includes(term) ||
      (c.customer_phone && c.customer_phone.includes(term)) ||
      (c.vehicle_info?.reg_number && c.vehicle_info.reg_number.toLowerCase().includes(term)) ||
      (c.vehicle_info?.model && c.vehicle_info.model.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const c: Customer = {
      id: `cust-${Date.now()}`,
      customer_name: name.trim(),
      customer_phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      vehicle_info: {
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        reg_number: reg.trim().toUpperCase() || undefined,
      },
      pending_balance: 0,
      wallet_balance: 0,
    };

    onSaveCustomer(c);
    setIsModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setMake('');
    setModel('');
    setReg('');
    toast.success('Customer registered in CRM');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Customer Directory & Profiles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or car reg..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => {
          const customerInvoices = invoices.filter(
            inv => inv.customer_id === c.id || inv.customer_phone === c.customer_phone
          );
          const totalSpent = customerInvoices.reduce((s, i) => s + (i.paid_amount || 0), 0);

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{c.customer_name}</h3>
                    {c.customer_phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.customer_phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No phone registered</span>
                    )}
                  </div>

                  {c.pending_balance && c.pending_balance > 0 ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                      Pending: {formatINR(c.pending_balance)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Clear
                    </span>
                  )}
                </div>

                {/* Vehicle details */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Car className="w-3 h-3 text-blue-600" />
                    <span>Registered Vehicle</span>
                  </div>
                  {c.vehicle_info?.reg_number ? (
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {c.vehicle_info.make} {c.vehicle_info.model}
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-blue-600">
                        {c.vehicle_info.reg_number}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No vehicle mapped yet</div>
                  )}
                </div>

                {/* Lifetime spend & invoices count */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{customerInvoices.length} Bills generated</span>
                  <span className="font-bold text-slate-900">{formatINR(totalSpent)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectCustomerToBill(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#131D31] hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Receipt className="w-3.5 h-3.5 text-blue-400" />
                  <span>Create Bill</span>
                </button>

                {c.customer_phone && (
                  <button
                    onClick={() => {
                      const phone = c.customer_phone?.replace(/\D/g, '') || '';
                      window.open(`https://wa.me/91${phone}?text=Hello%20${encodeURIComponent(c.customer_name)}%2C%20greetings%20from%20our%20Studio!`, '_blank');
                    }}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    title="Send WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-emerald-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New CRM Lead / Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alok Mishra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9861201770"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alok@example.com"
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
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Mercedes-Benz"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Car Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="GLC 300"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Vehicle Reg Number
                </label>
                <input
                  type="text"
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                  placeholder="OD 02 BR 5555"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save to CRM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
