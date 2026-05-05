import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { UserPlus, Trash2, Loader2, X, Check, ShieldCheck, Eye, Users, Edit3, Save } from 'lucide-react';

export const Members = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ 
    name: '', email: '', password: '', role: 'MEMBER' 
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });

  // Permissions logic - Normalized
  const userRole = (localStorage.getItem('role') || '').replace('ROLE_', '');
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const isMember = userRole === 'MEMBER';
  
  const canView = isAdmin || isManager || isMember; 
  const canManage = isAdmin; // Only Admin can register/delete/edit roles

  useEffect(() => {
    if (canView) fetchMembers();
    else { setLoading(false); setError("Access Denied"); }
  }, [canView]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/members');
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load members from your mess.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (member: any) => {
    setEditingId(member.id);
    setEditFormData({ 
      name: member.name, 
      email: member.email, 
      role: (member.role || 'MEMBER').replace('ROLE_', '') 
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      setSubmitLoading(true);
      await api.put(`/members/${id}`, editFormData);
      setEditingId(null);
      fetchMembers(); 
      alert("Member updated!");
    } catch (err: any) {
      alert(err.response?.data || "Update failed. Ensure unique email.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    setSubmitLoading(true);
    try {
      await api.post('/members/register', newMember); 
      setIsAdding(false);
      setNewMember({ name: '', email: '', password: '', role: 'MEMBER' });
      fetchMembers(); 
    } catch (err: any) {
      alert(err.response?.data || "Registration failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const deactivateMember = async (id: number) => {
    if (!canManage) return;
    if (window.confirm("Remove this member from the mess?")) {
      try {
        await api.delete(`/members/${id}`);
        setMembers(prev => prev.filter((m: any) => m.id !== id));
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section as previously defined... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><Users size={24} /></div>
            <h1 className="text-2xl font-bold text-slate-800">Mess Members</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            {canManage ? <ShieldCheck size={16} className="text-emerald-500" /> : <Eye size={16} className="text-blue-500" />}
            {canManage ? "Administrative Access" : "View-Only Access"}
          </p>
        </div>
        
        {canManage && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
              isAdding ? 'bg-slate-500' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isAdding ? <><X className="mr-2" size={20}/> Cancel</> : <><UserPlus className="mr-2" size={20}/> New Member</>}
          </button>
        )}
      </div>

      {/* Add Form Logic */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8">
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input placeholder="Full Name" required className="border p-3 rounded-xl" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
            <input placeholder="Email" type="email" required className="border p-3 rounded-xl" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
            <input placeholder="Password" type="password" required className="border p-3 rounded-xl" value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} />
            <select className="border p-3 rounded-xl bg-white" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
            </select>
            <button disabled={submitLoading} className="bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
              {submitLoading ? <Loader2 className="animate-spin" size={20}/> : <><Check size={20}/> Save</>}
            </button>
          </form>
        </div>
      )}

      {/* Table section remains largely the same but with submitLoading protection... */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase">Member Info</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase text-center">Status</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase">Authority</th>
                {canManage && <th className="p-5 font-bold text-slate-500 text-xs uppercase text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5">
                    {editingId === m.id ? (
                      <div className="space-y-2">
                        <input className="border p-2 rounded-lg text-sm w-full" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                        <input className="border p-2 rounded-lg text-sm w-full" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">{m.name.charAt(0)}</div>
                        <div>
                          <div className="font-bold text-slate-800">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.email}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">Active</span>
                  </td>
                  <td className="p-5">
                    {editingId === m.id ? (
                        <select className="border p-2 rounded-lg text-sm" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})}>
                            <option value="MEMBER">Member</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        m.role?.includes('ADMIN') ? 'bg-purple-600 text-white' : 
                        m.role?.includes('MANAGER') ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {m.role?.replace('ROLE_', '')}
                      </span>
                    )}
                  </td>
                  {canManage && (
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        {editingId === m.id ? (
                          <>
                            <button disabled={submitLoading} onClick={() => handleUpdate(m.id)} className="text-emerald-600 p-2 hover:bg-emerald-50 rounded-xl">
                              {submitLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-xl"><X size={20}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(m)} className="text-slate-300 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={20}/></button>
                            <button onClick={() => deactivateMember(m.id)} className="text-slate-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
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