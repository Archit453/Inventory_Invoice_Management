import { useState, type FC, type FormEvent } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { Building2, Receipt, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const OnboardingWizard: FC = () => {
  const { createTenant, setIsOnboarding } = useTenant();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Automotive Detailing & Workshop');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [upiId, setUpiId] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const handleFinish = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error('Please enter a business name');
      return;
    }

    await createTenant(businessName.trim(), {
      phone,
      email,
      address,
      gstin,
      upi_id: upiId || `${businessName.toLowerCase().replace(/\s+/g, '')}@upi`,
      default_tax_rate: taxRate,
      currency_symbol: currencySymbol,
    });

    toast.success(`Welcome to Studio OS! ${businessName} workspace created.`);
    setIsOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Step Indicator Header */}
        <div className="bg-[#131D31] text-white p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Studio Onboarding Wizard</span>
            </span>
            <span className="text-xs font-mono text-slate-400">Step {step} of 3</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {step === 1 && 'Name Your Studio & Select Industry'}
            {step === 2 && 'Invoicing, Tax & Direct Payment Settings'}
            {step === 3 && 'Confirm & Launch Private Workspace'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Setting up your isolated multi-tenant database and inventory catalog.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Studio / Workshop Business Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Paramount Detailing Hub"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Business Category & Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Automotive Detailing & Workshop">🚗 Automotive Detailing & Custom Workshop</option>
                  <option value="Automotive Garage & Mechanical">🔧 Mechanical Garage & Vehicle Service</option>
                  <option value="Electronics & Mobile Repair">📱 Electronics & Device Repair Center</option>
                  <option value="Salon & Spa Studio">💇 Salon, Spa & Wellness Studio</option>
                  <option value="Retail & Specialty Store">🛍️ Retail Store & Consumables Counter</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Determines your default services catalog and unit measurements.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!businessName.trim()}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  <span>Next: Financial Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Default Tax / GST %
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  UPI ID for Direct Customer Payment (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourbusiness@hdfcbank"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Printed on thermal receipts for zero-fee customer QR scanning.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Official Studio Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@studio.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  GSTIN / Tax Registration No.
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="21AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Studio Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 12, Main Road, City, Pincode"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20"
                >
                  <span>Review & Launch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{businessName}</h3>
                    <p className="text-xs text-slate-500">{industry}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 text-slate-600">
                  <div><span className="font-bold text-slate-700">Tax Rate:</span> {taxRate}% GST</div>
                  <div><span className="font-bold text-slate-700">Currency:</span> {currencySymbol} (INR)</div>
                  <div><span className="font-bold text-slate-700">Phone:</span> {phone || 'Not provided'}</div>
                  <div><span className="font-bold text-slate-700">UPI ID:</span> {upiId || 'Auto-generated'}</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-800">
                <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Your workspace will be initialized with starter consumables and a fresh isolated ledger.</span>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Workspace</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
