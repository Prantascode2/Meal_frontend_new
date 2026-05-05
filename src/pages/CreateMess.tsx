import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Home, User, Mail, Lock, Loader2 } from 'lucide-react';

export const CreateMess = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', messName: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Matches @PostMapping("/register-admin")
      await api.post('/auth/register-admin', formData);
      alert("Mess Created! Please login as Admin.");
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data || "Registration failed. Check if email exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full mb-3">
            <Home className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">Register New Mess</h2>
          <p className="text-gray-500 text-sm">Create a workspace for your meal system</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Home className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Mess Name" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, messName: e.target.value})} required />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Admin Name" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="email" placeholder="Admin Email" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="password" placeholder="Admin Password" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mt-8 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Establish Mess'}
        </button>
      </form>
    </div>
  );
};