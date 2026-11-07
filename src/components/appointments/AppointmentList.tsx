import { useState, useMemo, type FC, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Clock,
  Car,
  FileText,
  MessageCircle,
  Trash2,
  XCircle,
  X,
  Check
} from 'lucide-react';
import type { Appointment, Customer, StudioService } from '../../types';
import { formatINR, formatDateTime } from '../../lib/formatters';
import { toast } from 'sonner';

interface AppointmentListProps {
  appointments: Appointment[];
  customers: Customer[];
  services: StudioService[];
  onSaveAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onGenerateBillFromAppointment: (appointment: Appointment) => void;
}

export const AppointmentList: FC<AppointmentListProps> = ({
  appointments,
  customers,
  services,
  onSaveAppointment,
  onDeleteAppointment,
  onGenerateBillFromAppointment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [aptDateTime, setAptDateTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [advanceMethod, setAdvanceMethod] = useState<'Cash' | 'GPay' | 'UPI' | 'Card'>('GPay');
  const [assignedStaff, setAssignedStaff] = useState('Amit (PPF Specialist)');
  const [notes, setNotes] = useState('');

  const staffOptions = ['Rohan (Lead Technician)', 'Amit (PPF Specialist)', 'Sanjay (Coating Pro)', 'Karan (Interior Tech)'];

  // Categorize Appointments
  const categorized = useMemo(() => {
    const todayDateStr = new Date().toISOString().split('T')[0];

    return appointments.filter((apt) => {
      const aptDateStr = apt.appointment_date.split('T')[0];
      const matchSearch =
        apt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.customer_phone && apt.customer_phone.includes(searchTerm)) ||
        (apt.vehicle_info?.reg_number && apt.vehicle_info.reg_number.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (activeSubTab === 'completed') return apt.status === 'completed';
      if (activeSubTab === 'cancelled') return apt.status === 'cancelled';
      if (activeSubTab === 'today') {
        return aptDateStr === todayDateStr && apt.status !== 'completed' && apt.status !== 'cancelled';
      }
      if (activeSubTab === 'upcoming') {
        return aptDateStr > todayDateStr && apt.status !== 'completed' && apt.status !== 'cancelled';
      }
      return true;
    });
  }, [appointments, searchTerm, activeSubTab]);

  const openCreateModal = () => {
    setEditingApt(null);
    setSelectedCustomerId('');
    setCustName('');
    setCustPhone('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleReg('');
    setSelectedServices([services[0]?.name || '🛡️ Garware Plus Hi-Gloss PPF']);
    setAdvanceAmount(2000);
    setAdvanceMethod('GPay');
    setAssignedStaff('Rohan (Lead Technician)');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find(cust => cust.id === id);
    if (c) {
      setCustName(c.customer_name);
      setCustPhone(c.customer_phone || '');
      setVehicleMake(c.vehicle_info?.make || '');
      setVehicleModel(c.vehicle_info?.model || '');
      setVehicleReg(c.vehicle_info?.reg_number || '');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const apt: Appointment = {
      id: editingApt ? editingApt.id : `apt-${Date.now()}`,
      customer_id: selectedCustomerId || undefined,
      customer_name: custName.trim(),
      customer_phone: custPhone.trim() || undefined,
      vehicle_info: {
        make: vehicleMake.trim() || undefined,
        model: vehicleModel.trim() || undefined,
        reg_number: vehicleReg.trim().toUpperCase() || undefined,
      },
      appointment_date: new Date(aptDateTime).toISOString(),
      status: editingApt ? editingApt.status : 'scheduled',
      advance_amount: advanceAmount,
      advance_payment_method: advanceMethod,
      services_requested: selectedServices,
      assigned_staff: assignedStaff,
      notes: notes.trim() || undefined,
      created_at: editingApt?.created_at || new Date().toISOString(),
    };

    onSaveAppointment(apt);
    setIsModalOpen(false);
    toast.success(editingApt ? 'Appointment updated' : 'Appointment booked');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card matching frame 120s */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Appointment Booking</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Schedule and Manage Your Sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs matching frame 120s (Today, Upcoming, Completed, Cancelled) */}
      <div className="flex items-center border-b border-slate-200">
        {(['today', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeSubTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Table matching frame 120s */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Date/Time</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Services Requested</th>
                <th className="py-4 px-4 text-center">Advance Paid</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorized.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No appointments under {activeSubTab}.
                  </td>
                </tr>
              ) : (
                categorized.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Date / Time */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>{formatDateTime(apt.appointment_date)}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Staff: {apt.assigned_staff || 'Not assigned'}</span>
                      </div>
                    </td>

                    {/* Customer & Car */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{apt.customer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {apt.customer_phone || '-'}
                      </div>
                      {apt.vehicle_info?.reg_number && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-0.5 font-semibold">
                          <Car className="w-3 h-3" />
                          <span>{apt.vehicle_info.make} {apt.vehicle_info.model} ({apt.vehicle_info.reg_number})</span>
                        </div>
                      )}
                    </td>

                    {/* Services Requested */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {apt.services_requested.map((s, idx) => (
                          <div key={idx} className="text-xs font-medium text-slate-800">
                            • {s}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Advance Paid */}
                    <td className="py-4 px-4 text-center">
                      {apt.advance_amount > 0 ? (
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {formatINR(apt.advance_amount)} ({apt.advance_payment_method})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>

                    {/* Status Badge matching video */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        apt.status === 'in_service'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : apt.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : apt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {apt.status === 'in_service' ? 'In-Service' : apt.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions matching video buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* GENERATE BILL Button */}
                        <button
                          onClick={() => onGenerateBillFromAppointment(apt)}
                          title="Generate Final Bill for this Appointment"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#131D31] hover:bg-slate-800 transition-colors uppercase shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Generate Bill</span>
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={() => {
                            const phone = (apt.customer_phone || '').replace(/\D/g, '');
                            const text = encodeURIComponent(`Hi ${apt.customer_name}, confirming your appointment scheduled for ${formatDateTime(apt.appointment_date)}. See you at our studio!`);
                            window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors uppercase"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                          <span className="hidden xl:inline">WhatsApp</span>
                        </button>

                        {/* Cancel Appointment */}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              onSaveAppointment({ ...apt, status: 'cancelled' });
                              toast.info('Appointment marked as cancelled');
                            }}
                            title="Cancel Appointment"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this appointment record?')) {
                              onDeleteAppointment(apt.id);
                              toast.success('Appointment deleted');
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule Customer Appointment</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Choose Existing Customer (or type below)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">-- New Walk-in / Direct Client --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name} ({c.customer_phone || 'No phone'}) {c.vehicle_info?.reg_number ? `— ${c.vehicle_info.reg_number}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="BMW"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="M340i"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Reg. Number
                  </label>
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    placeholder="OD 02 AB 1234"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={aptDateTime}
                    onChange={(e) => setAptDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {staffOptions.map(staff => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Advance Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Deposit Mode
                  </label>
                  <select
                    value={advanceMethod}
                    onChange={(e) => setAdvanceMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="GPay">GPay</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Customer Job Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paint inspection required for swirl marks on bonnet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs uppercase shadow-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Confirm Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
