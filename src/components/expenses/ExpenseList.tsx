import { useState, useMemo, type FC, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Receipt,
  TrendingDown,
  CreditCard,
  PieChart as PieIcon,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import type { Expense } from '../../types';
import { formatINR, formatDate } from '../../lib/formatters';
import { toast } from 'sonner';

interface ExpenseListProps {
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: FC<ExpenseListProps> = ({
  expenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Raw Materials & Supplies');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<any>('GPay');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories = [
    'Raw Materials & Supplies',
    'Salaries & Wages',
    'Rent & Studio',
    'Utilities & Electricity',
    'Tea & Refreshments',
    'Marketing & Ads',
    'Equipment Maintenance',
    'Miscellaneous',
  ];

  // Metrics
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const totalEntries = expenses.length;
  const avgPerEntry = totalEntries > 0 ? totalSpent / totalEntries : 0;

  // Payment Mode Split
  const paymentSplit = useMemo(() => {
    const split: { [mode: string]: number } = {};
    expenses.forEach((e) => {
      split[e.payment_mode] = (split[e.payment_mode] || 0) + e.amount;
    });
    return split;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const openCreateModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('Raw Materials & Supplies');
    setAmount(1500);
    setPaymentMode('GPay');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount);
    setPaymentMode(exp.payment_mode);
    setExpenseDate(exp.expense_date);
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (amount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    const exp: Expense = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      title: title.trim(),
      category,
      amount,
      payment_mode: paymentMode,
      expense_date: expenseDate,
      notes: notes.trim() || undefined,
      created_at: editingExpense?.created_at || new Date().toISOString(),
    };

    onSaveExpense(exp);
    setIsModalOpen(false);
    toast.success(editingExpense ? 'Expense updated' : 'Expense recorded');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Expense Management</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Track Studio Overheads, Consumables & Payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Metrics Row matching frame 180s */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalSpent)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entries</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalEntries}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg. Per Entry</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(avgPerEntry)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <PieIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top: GPay/UPI</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatINR(paymentSplit['GPay'] || paymentSplit['UPI'] || 0)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Payment Mode Split Banner matching frame 180s */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Payment Mode Split
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(paymentSplit).map(([mode, amt]) => (
            <div key={mode} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{mode}</span>
              <span className="text-sm font-bold text-slate-900">{formatINR(amt)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table matching frame 180s */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-4">Expense Title</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4 text-center">Mode</th>
                <th className="py-4 px-4">Notes</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No expense entries recorded.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {exp.title}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200">
                        {exp.payment_mode}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 italic max-w-xs truncate">
                      {exp.notes || '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors uppercase"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete expense "${exp.title}"?`)) {
                              onDeleteExpense(exp.id);
                              toast.success('Expense deleted');
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
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

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingExpense ? 'Edit Expense Entry' : 'Record Studio Expense'}
              </h3>
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
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PPF roll freight or Studio electricity"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="GPay">GPay</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid to TPCODL via GPay transaction #12345"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
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
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
