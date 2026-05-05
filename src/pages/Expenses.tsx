import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { 
  DollarSign, Plus, Loader2, AlertCircle, CheckCircle2, 
  TrendingDown, ShoppingCart, Receipt, Trash2, Edit3, Check, X 
} from 'lucide-react';

export const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const userId = localStorage.getItem('userId');
  const rawRole = localStorage.getItem('role') || '';
  // Normalized role check
  const isAdminOrManager = rawRole.includes('ADMIN') || rawRole.includes('MANAGER');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'MEAT',
    addedById: userId ? parseInt(userId) : null 
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const res = await api.get('/expenses', {
        params: { startDate: firstDay, endDate: lastDay }
      });
      setExpenses(res.data);
    } catch (err: any) {
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  // --- ACTIONS ---

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrManager) return;
    try {
      const payload = { 
        ...formData, 
        amount: parseFloat(formData.amount),
        addedById: userId ? parseInt(userId) : 1 
      };
      await api.post('/expenses', payload);
      setSuccess("Expense added successfully!");
      setShowForm(false);
      setFormData({ ...formData, description: '', amount: '', category: 'MEAT' });
      fetchExpenses();
    } catch (err: any) {
      setError("Error saving expense.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setSuccess("Deleted successfully.");
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError("Delete failed. Check permissions.");
    }
  };

  const startEditing = (exp: any) => {
    setEditingId(exp.id);
    setEditFormData({ ...exp });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/expenses/${editingId}`, {
        ...editFormData,
        amount: parseFloat(editFormData.amount)
      });
      setSuccess("Updated successfully.");
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      setError("Update failed.");
    }
  };

  // --- CALCULATIONS ---
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const bazaarTotal = expenses
    .filter(exp => exp.category === 'MEAT' || exp.category === 'VEGETABLES')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const otherTotal = expenses
    .filter(exp => exp.category === 'OTHER')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <DollarSign className="text-red-500" /> Mess Expenses
          </h1>
          <p className="text-slate-500 text-sm">Monthly expenditure tracking</p>
        </div>

        {isAdminOrManager && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-white font-bold transition-all shadow-lg ${
              showForm ? 'bg-slate-500 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700 shadow-red-100'
            }`}
          >
            {showForm ? <><X size={18}/> Close</> : <><Plus size={18}/> Add Expense</>}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<TrendingDown/>} label="Total Spent" value={totalAmount} color="red" />
        <StatCard icon={<ShoppingCart/>} label="Bazaar Costs" value={bazaarTotal} color="amber" />
        <StatCard icon={<Receipt/>} label="Utilities/Other" value={otherTotal} color="blue" />
      </div>

      {/* Messages */}
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3"><AlertCircle size={20} />{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3"><CheckCircle2 size={20} />{success}</div>}

      {/* Form */}
      {showForm && isAdminOrManager && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-black mb-6 text-slate-800">Record New Expense</h2>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
              <input className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Item name..." required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Amount (৳)</label>
              <input className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
              <select className="border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-red-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="MEAT">Meat</option>
                <option value="VEGETABLES">Vegetables</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <button className="bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 h-[52px] self-end shadow-lg transition-all active:scale-95">Save Entry</button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Expense Ledger</h2>
          <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-400 uppercase">Current Month</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                {isAdminOrManager && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 text-sm">{exp.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {editingId === exp.id ? (
                      <input 
                        className="border border-red-200 p-1 rounded-lg w-full text-sm"
                        value={editFormData.description}
                        onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                      />
                    ) : exp.description}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === exp.id ? (
                      <select 
                        className="border border-red-200 p-1 rounded-lg text-xs"
                        value={editFormData.category}
                        onChange={e => setEditFormData({...editFormData, category: e.target.value})}
                      >
                        <option value="MEAT">Meat</option>
                        <option value="VEGETABLES">Vegetables</option>
                        <option value="OTHER">Other</option>
                      </select>
                    ) : (
                      <CategoryBadge category={exp.category} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {editingId === exp.id ? (
                      <input 
                        type="number"
                        className="border border-red-200 p-1 rounded-lg w-24 text-right text-sm"
                        value={editFormData.amount}
                        onChange={e => setEditFormData({...editFormData, amount: e.target.value})}
                      />
                    ) : (
                      `৳${parseFloat(exp.amount).toLocaleString()}`
                    )}
                  </td>
                  {isAdminOrManager && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3 text-slate-400">
                        {editingId === exp.id ? (
                          <>
                            <Check size={18} className="cursor-pointer text-green-500" onClick={handleUpdate} />
                            <X size={18} className="cursor-pointer text-slate-400" onClick={() => setEditingId(null)} />
                          </>
                        ) : (
                          <>
                            <Edit3 size={18} className="cursor-pointer hover:text-blue-600" onClick={() => startEditing(exp)} />
                            <Trash2 size={18} className="cursor-pointer hover:text-red-600" onClick={() => handleDelete(exp.id)} />
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ icon, label, value, color }: any) => {
  const colors: any = {
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-slate-800">৳{value.toLocaleString()}</h3>
      </div>
    </div>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: any = {
    MEAT: 'bg-red-100 text-red-600',
    VEGETABLES: 'bg-green-100 text-green-600',
    OTHER: 'bg-blue-100 text-blue-600'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${styles[category] || styles.OTHER}`}>
      {category}
    </span>
  );
};