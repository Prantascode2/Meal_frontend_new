import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Landmark, Plus, History, Loader2, Search, Trash2, Edit3, Check, X, Wallet, AlertCircle } from 'lucide-react';
import { AiInsights } from '../components/AiInsights'; 

export const Deposits = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]); 
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ memberId: '', amount: '', description: '' });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const userRole = (localStorage.getItem('role') || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const [mRes, dRes] = await Promise.all([
        api.get('/members'),
        api.get(`/deposit/total/range?startDate=${firstDay}&endDate=${lastDay}`)
      ]);

      setMembers(mRes.data);
      setDeposits(Array.isArray(dRes.data) ? dRes.data : []);

      // Try fetching meals separately so it doesn't break the page
      try {
       const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        const startDateTime = `${firstDay}T00:00:00`;
        const endDateTime = `${lastDay}T23:59:59`;
        const mealRes = await api.get(`/meals?startDate=${firstDay}&endDate=${lastDay}`);
        setMeals(mealRes.data || []);
      } catch (mealErr) {
        console.warn("Meal data could not be loaded for AI context", mealErr);
      }

    } catch (err) {
      console.error("Error loading ledger data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this deposit?")) return;
    try {
      await api.delete(`/deposit/${id}`);
      setDeposits(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const startEditing = (deposit: any) => {
    setEditingId(deposit.id);
    setEditFormData({ ...deposit });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/deposit/${editingId}`, editFormData);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await api.post('/deposit/add', {
        memberId: Number(formData.memberId),
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      setFormData({ memberId: '', amount: '', description: '' });
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert("Error adding deposit.");
    }
  };

  // --- Filtering Logic ---
  const filteredDeposits = deposits.filter(d => {
    const name = (d.memberName || '').toLowerCase();
    const note = (d.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || note.includes(search);
  });

  const memberTotals = deposits.reduce((acc: any, d: any) => {
    const name = d.memberName || `Member #${d.memberId}`;
    acc[name] = (acc[name] || 0) + d.amount;
    return acc;
  }, {});

  const totalFiltered = filteredDeposits.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-indigo-100 rounded-lg"><Landmark className="text-indigo-600" size={24} /></div>
            Deposit Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Track and manage mess fund contributions</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Filter by member..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdmin && (
            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md font-bold text-sm ${
                isAdding ? 'bg-slate-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isAdding ? <><History size={18}/> View History</> : <><Plus size={18}/> Add Deposit</>}
            </button>
          )}
        </div>
      </div>

      {/* AI INSIGHTS SECTION */}
      {isAdmin && !isAdding && (
        <AiInsights 
          mealHistory={meals} 
          deposits={deposits} 
          members={members} 
        />
      )}

      {!isAdding && (
        <>
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Total Mess Fund</p>
                <Wallet size={16} className="opacity-50" />
              </div>
              <h2 className="text-3xl font-black">৳{totalFiltered.toLocaleString()}</h2>
            </div>

            {Object.entries(memberTotals).map(([name, total]: any) => (
              <div key={name} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase truncate max-w-[120px]">{name}</p>
                  <p className="text-lg font-black text-slate-800">৳{total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    {isAdmin && <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={isAdmin ? 4 : 3} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
                  ) : filteredDeposits.length > 0 ? (
                    filteredDeposits.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{d.memberName}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm italic">
                          {editingId === d.id ? (
                            <input 
                              className="w-full border-indigo-200 border p-2 rounded-lg not-italic"
                              value={editFormData.description}
                              onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                            />
                          ) : (
                            d.description || "Cash contribution"
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === d.id ? (
                            <input 
                              type="number"
                              className="w-24 border-indigo-200 border p-2 rounded-lg text-right font-bold"
                              value={editFormData.amount}
                              onChange={e => setEditFormData({...editFormData, amount: Number(e.target.value)})}
                            />
                          ) : (
                            <span className="font-black text-emerald-600">৳{d.amount.toLocaleString()}</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-3">
                              {editingId === d.id ? (
                                <>
                                  <button onClick={handleUpdate} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition"><Check size={18}/></button>
                                  <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition"><X size={18}/></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEditing(d)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"><Edit3 size={18}/></button>
                                  <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"><Trash2 size={18}/></button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className="text-center py-20 text-slate-400 italic">
                        <AlertCircle className="mx-auto mb-2 opacity-30" size={32} />
                        No deposit records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ADD FORM */}
      {isAdding && isAdmin && (
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 mx-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Deposit</h2>
            <p className="text-slate-400 text-xs mt-1 font-bold">Add cash to the mess treasury</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Select Member</label>
              <select 
                className="w-full border-slate-200 border-2 p-3.5 rounded-2xl outline-none focus:border-indigo-500 transition-colors bg-slate-50 font-semibold" 
                required 
                value={formData.memberId} 
                onChange={e => setFormData({...formData, memberId: e.target.value})}
              >
                <option value="">Member List</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Amount (৳)</label>
              <input 
                type="number" 
                className="w-full border-slate-200 border-2 p-3.5 rounded-2xl outline-none focus:border-indigo-500 transition-colors bg-slate-50 font-black text-lg" 
                placeholder="0.00"
                required 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Short Note</label>
              <input 
                placeholder="e.g. Monthly Fee"
                className="w-full border-slate-200 border-2 p-3.5 rounded-2xl outline-none focus:border-indigo-500 transition-colors bg-slate-50 font-medium" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs">
              Save Transaction
            </button>
          </form>
        </div>
      )}
    </div>
  );
};