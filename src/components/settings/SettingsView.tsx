import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  Building2,
  CreditCard,
  Star,
  Palette,
  Check,
  Save,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from '../../contexts/TenantContext';
import { SAAS_PLANS } from '../../lib/saasPlans';

export const SettingsView: FC = () => {
  const { currentTenant, updateTenantSettings } = useTenant();

  const [studioName, setStudioName] = useState(currentTenant.name);
  const [studioPhone, setStudioPhone] = useState(currentTenant.settings.phone || '+91 9876543210');
  const [studioEmail, setStudioEmail] = useState(currentTenant.settings.email || 'contact@studio.com');
  const [studioGstin, setStudioGstin] = useState(currentTenant.settings.gstin || '21AAAPL1234L1Z5');
  const [studioAddress, setStudioAddress] = useState(currentTenant.settings.address || 'Studio Operations Center');
  
  const [upiName, setUpiName] = useState(currentTenant.settings.upi_name || currentTenant.name);
  const [upiId, setUpiId] = useState(currentTenant.settings.upi_id || 'studio@upi');
  const [googleReviewLink, setGoogleReviewLink] = useState(currentTenant.settings.google_review_link || 'https://maps.google.com');

  const [selectedTheme, setSelectedTheme] = useState(currentTenant.settings.theme || 'navy');

  // Re-sync when currentTenant changes
  useEffect(() => {
    setStudioName(currentTenant.name);
    setStudioPhone(currentTenant.settings.phone || '+91 9876543210');
    setStudioEmail(currentTenant.settings.email || 'contact@studio.com');
    setStudioGstin(currentTenant.settings.gstin || '21AAAPL1234L1Z5');
    setStudioAddress(currentTenant.settings.address || 'Studio Operations Center');
    setUpiName(currentTenant.settings.upi_name || currentTenant.name);
    setUpiId(currentTenant.settings.upi_id || 'studio@upi');
    setGoogleReviewLink(currentTenant.settings.google_review_link || 'https://maps.google.com');
    setSelectedTheme(currentTenant.settings.theme || 'navy');
  }, [currentTenant]);

  const currentPlan = SAAS_PLANS[currentTenant.plan_tier] || SAAS_PLANS.starter;

  const themes = [
    { id: 'navy', name: 'Navy Clean Professional', primary: '#131D31', accent: '#2563EB' },
    { id: 'luxury', name: 'Classic Obsidian Luxury', primary: '#16171A', accent: '#F59E0B' },
    { id: 'quartz', name: 'Pure Quartz', primary: '#0F172A', accent: '#10B981' },
    { id: 'emerald', name: 'Emerald Studio', primary: '#064E3B', accent: '#22C55E' },
  ];

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    await updateTenantSettings({
      phone: studioPhone,
      email: studioEmail,
      gstin: studioGstin,
      address: studioAddress,
      upi_name: upiName,
      upi_id: upiId,
      google_review_link: googleReviewLink,
      theme: selectedTheme,
    });
    toast.success(`Settings saved for ${currentTenant.name}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Studio Configuration</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            SaaS Plan, Tax, UPI QR Payments & Multi-Bay Setup
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>Tenant ID: <span className="font-mono text-[11px]">{currentTenant.slug}</span></span>
        </div>
      </div>

      {/* SaaS Plan & Subscription Status Card */}
      <div className="bg-gradient-to-r from-[#131D31] via-[#1E2D4A] to-[#131D31] rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{currentPlan.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {currentTenant.subscription_status}
                </span>
              </div>
              <p className="text-xs text-slate-300">{currentPlan.description}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-white">
              {currentPlan.monthlyPriceINR === 0 ? 'Free' : `₹${currentPlan.monthlyPriceINR.toLocaleString('en-IN')}`}
              <span className="text-xs font-normal text-slate-300">/mo</span>
            </div>
            <button
              onClick={() => toast.info('Subscription upgrades are managed via the Billing Portal')}
              className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Plan Limits */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Invoices Limit</div>
            <div className="text-base font-bold text-white mt-0.5">{currentPlan.limits.maxInvoicesPerMonth.toLocaleString()} <span className="text-[10px] text-slate-400">/mo</span></div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Team Staff Seats</div>
            <div className="text-base font-bold text-white mt-0.5">{currentPlan.limits.maxTeamMembers} <span className="text-[10px] text-slate-400">Members</span></div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Product Catalog</div>
            <div className="text-base font-bold text-white mt-0.5">{currentPlan.limits.maxProducts} <span className="text-[10px] text-slate-400">Items</span></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Studio Identity Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Studio Identity & Invoice Header</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Studio Trade Name
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                value={studioPhone}
                onChange={(e) => setStudioPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={studioEmail}
                onChange={(e) => setStudioEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                GSTIN / Tax Identification
              </label>
              <input
                type="text"
                value={studioGstin}
                onChange={(e) => setStudioGstin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Studio Physical Address (Printed on invoices)
              </label>
              <textarea
                rows={2}
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Dynamic UPI Payment Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>UPI Payments & Dynamic QR Code Setup</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Payee / Beneficiary Name
              </label>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Name shown to customer during UPI payment</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">UPI ID to receive direct payments without gateway fees</span>
            </div>
          </div>
        </div>

        {/* Google Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Google Reviews Integration</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Google Review Direct Link
            </label>
            <input
              type="url"
              value={googleReviewLink}
              onChange={(e) => setGoogleReviewLink(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Included in post-service WhatsApp billing messages to collect customer reviews automatically
            </span>
          </div>
        </div>

        {/* Premium System Themes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Palette className="w-4 h-4 text-indigo-600" />
            <span>System Theme & Accent</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((th) => (
              <div
                key={th.id}
                onClick={() => setSelectedTheme(th.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedTheme === th.id
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">{th.name}</span>
                  {selectedTheme === th.id && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex h-5 rounded-lg overflow-hidden border border-slate-200">
                  <div className="w-1/2" style={{ backgroundColor: th.primary }}></div>
                  <div className="w-1/2" style={{ backgroundColor: th.accent }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Update Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Workspace Settings</span>
        </button>

      </form>
    </div>
  );
};
