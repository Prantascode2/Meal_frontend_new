import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { UtensilsCrossed, List, Calculator, CalendarDays, User, Trash2, Edit3, Check, X, Search, PieChart, Loader2 } from 'lucide-react';

export const Meals = () => {
  const [mealData, setMealData] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    mealType: 'LUNCH',
    mealCount: 1
  });
  
  const [members, setMembers] = useState<any[]>([]);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Unified Role Check
  const userRole = (localStorage.getItem('role') || '').replace('ROLE_', '');
  const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchMealHistory()]);
      setLoading(false);
    };
    init();
  }, []);

  // --- CALCULATIONS ---
  const todayStr = new Date().toISOString().split('T')[0];
  const totalMeals = mealHistory.reduce((sum, meal) => sum + (meal.mealCount || 0), 0);
  const todayMeals = mealHistory
    .filter(m => m.date === todayStr)
    .reduce((sum, meal) => sum + (meal.mealCount || 0), 0);

  const filteredMeals = mealHistory.filter(meal => 
    (meal.memberName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const memberSummaries = mealHistory.reduce((acc: any, meal: any) => {
    const name = meal.memberName || `Unknown`;
    acc[name] = (acc[name] || 0) + (meal.mealCount || 0);
    return acc;
  }, {});

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Error fetching members:", err); }
  };

  const fetchMealHistory = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const res = await api.get(`/meals?startDate=${firstDay}&endDate=${lastDay}`); 
      setMealHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Error fetching meals:", err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!mealData.memberId) return alert("Please select a member");

    setSubmitting(true);
    try {
      await api.post('/meals/add', mealData);
      setMealData(prev => ({ ...prev, memberId: '', mealCount: 1 }));
      fetchMealHistory(); 
    } catch (err: any) {
      alert(err.response?.data || "Error adding meal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this meal record?")) return;
    try {
      await api.delete(`/meals/${id}`);
      setMealHistory(prev => prev.filter(m => m.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const startEditing = (meal: any) => {
    setEditingId(meal.id);
    setEditFormData({ ...meal });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/meals/${editingId}`, editFormData);
      setEditingId(null);
      fetchMealHistory();
    } catch (err) { alert("Update failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
          <Calculator className="mb-2 opacity-80" size={24} />
          <p className="text-blue-100 text-xs font-bold uppercase">Monthly Total</p>
          <h3 className="text-3xl font-black">{totalMeals}</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-2xl shadow-lg text-white">
          <CalendarDays className="mb-2 opacity-80" size={24} />
          <p className="text-emerald-100 text-xs font-bold uppercase">Today's Consumption</p>
          <h3 className="text-3xl font-black">{todayMeals}</h3>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
          <PieChart className="mb-2 opacity-80" size={24} />
          <p className="text-indigo-100 text-xs font-bold uppercase">Active Members</p>
          <h3 className="text-3xl font-black">{members.length}</h3>
        </div>
      </div>

      {/* 2. MEMBER SUMMARIES */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">Monthly Member Breakdown</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(memberSummaries).map(([name, count]: any) => (
            <div key={name} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <span className="text-xs font-bold text-gray-600">{name}:</span>
              <span className="text-sm font-black text-blue-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LOG FORM */}
        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><UtensilsCrossed size={20} /></div>
                <h2 className="text-xl font-bold text-gray-800">Add Meal</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select className="w-full border-gray-200 border p-3 rounded-xl bg-gray-50 focus:bg-white outline-none" value={mealData.memberId} onChange={e => setMealData({...mealData, memberId: e.target.value})}>
                  <option value="">Select Member</option>
                  {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="date" className="w-full border-gray-200 border p-3 rounded-xl bg-gray-50" value={mealData.date} onChange={e => setMealData({...mealData, date: e.target.value})} />
                <div className="flex gap-2">
                  <select className="flex-1 border-gray-200 border p-3 rounded-xl bg-gray-50" value={mealData.mealType} onChange={e => setMealData({...mealData, mealType: e.target.value})}>
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                  <input type="number" className="w-20 border-gray-200 border p-3 rounded-xl bg-gray-50 text-center" value={mealData.mealCount} onChange={e => setMealData({...mealData, mealCount: parseInt(e.target.value)})}/>
                </div>
                <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Record'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LEDGER TABLE */}
        <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <List className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Meal Ledger</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Filter members..." className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-5">Date</th>
                    <th className="p-5">Member</th>
                    <th className="p-5">Type</th>
                    <th className="p-5 text-center">Qty</th>
                    {isAdmin && <th className="p-5 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMeals.map((meal: any) => (
                    <tr key={meal.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-5 text-xs text-gray-500">
                        {editingId === meal.id ? (
                          <input type="date" className="border rounded p-1" value={editFormData.date} onChange={e => setEditFormData({...editFormData, date: e.target.value})} />
                        ) : meal.date}
                      </td>
                      <td className="p-5 font-bold text-gray-800">{meal.memberName}</td>
                      <td className="p-5">
                        {editingId === meal.id ? (
                          <select className="border rounded p-1 text-xs" value={editFormData.mealType} onChange={e => setEditFormData({...editFormData, mealType: e.target.value})}>
                            <option value="BREAKFAST">BREAKFAST</option>
                            <option value="LUNCH">LUNCH</option>
                            <option value="DINNER">DINNER</option>
                          </select>
                        ) : (
                          <span className="text-[10px] font-black text-blue-500">{meal.mealType}</span>
                        )}
                      </td>
                      <td className="p-5 text-center font-black">
                        {editingId === meal.id ? (
                          <input type="number" className="border rounded p-1 w-12 text-center" value={editFormData.mealCount} onChange={e => setEditFormData({...editFormData, mealCount: parseInt(e.target.value)})} />
                        ) : meal.mealCount}
                      </td>
                      {isAdmin && (
                        <td className="p-5">
                          <div className="flex justify-center gap-2">
                            {editingId === meal.id ? (
                              <button onClick={handleUpdate} className="text-green-600 p-1"><Check size={18}/></button>
                            ) : (
                              <button onClick={() => startEditing(meal)} className="text-gray-300 hover:text-blue-600"><Edit3 size={18}/></button>
                            )}
                            <button onClick={() => handleDelete(meal.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={18}/></button>
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
      </div>
    </div>
  );
};