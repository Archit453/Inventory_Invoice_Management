import { useState, type FC, type FormEvent } from 'react';
import {
  Building2,
  CreditCard,
  Star,
  Palette,
  Check,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsView: FC = () => {
  const [studioName, setStudioName] = useState('Studio & Workshop');
  const [studioPhone, setStudioPhone] = useState('+91 9876543210');
  const [studioEmail, setStudioEmail] = useState('contact@studio.com');
  const [studioGstin, setStudioGstin] = useState('21AAAPL1234L1Z5');
  const [studioAddress, setStudioAddress] = useState('Studio Operations & Workshop Center, Bhubaneswar');
  
  const [upiName, setUpiName] = useState('Studio Operations');
  const [upiId, setUpiId] = useState('studio@upi');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://maps.google.com');

  const [selectedTheme, setSelectedTheme] = useState('navy');

  const themes = [
    { id: 'navy', name: 'Navy Clean Professional', primary: '#131D31', accent: '#2563EB' },
    { id: 'luxury', name: 'Classic Obsidian Luxury', primary: '#16171A', accent: '#F59E0B' },
    { id: 'quartz', name: 'Pure Quartz', primary: '#0F172A', accent: '#10B981' },
    { id: 'emerald', name: 'Emerald Studio', primary: '#064E3B', accent: '#22C55E' },
  ];

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    toast.success('Studio configuration updated successfully');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Studio Configuration</h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          Tax, UPI Payments, Invoice Branding & Themes
        </p>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Studio GSTIN (Tax ID)
              </label>
              <input
                type="text"
                value={studioGstin}
                onChange={(e) => setStudioGstin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={studioPhone}
                onChange={(e) => setStudioPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={studioEmail}
                onChange={(e) => setStudioEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Studio Workshop Address (Printed on Invoices)
            </label>
            <textarea
              rows={2}
              value={studioAddress}
              onChange={(e) => setStudioAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* UPI Payments Box (matching frame 215s) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>UPI Payments & Settlements</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                UPI Display Name
              </label>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="e.g. Studio Operations"
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
                placeholder="studio@upi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">UPI ID to receive direct payments</span>
            </div>
          </div>
        </div>

        {/* Google Reviews Box (matching frame 215s) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Star className="w-4 h-4 text-amber-500" />
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

        {/* Premium System Themes (matching frame 215s) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Palette className="w-4 h-4 text-indigo-600" />
            <span>Premium System Themes</span>
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

        {/* Update Button (matching frame 215s) */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Update Global Configuration</span>
        </button>

      </form>
    </div>
  );
};
