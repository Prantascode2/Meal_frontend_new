import React, { useState, useEffect } from 'react';
import { Users, Utensils, Wallet, Landmark, FileBarChart, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiInsights } from '../components/AiInsights'; 
import api from '../api/axiosInstance';

export const Dashboard = () => {
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
  const rawRole = localStorage.getItem('role') || 'USER';
  const normalizedRole = rawRole.replace('ROLE_', '').toUpperCase();
  
  const [dashboardData, setDashboardData] = useState({
    meals: [],
    deposits: [],
    members: []
  });

  const [dataStatus, setDataStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const canAccessAI = normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';

  useEffect(() => {
    const fetchContext = async () => {
      if (!canAccessAI) {
        setDataStatus('success');
        return;
      }
      
      setDataStatus('loading');
      try {
        // 1. Generate dates for the current month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Formats: YYYY-MM-DD
        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        // 2. Format for LocalDateTime (Required by DepositController)
        // This ensures the backend doesn't throw a 400 Bad Request
        const startDateTime = `${firstDay}T00:00:00`;
        const endDateTime = `${lastDay}T23:59:59`;

        // 3. Parallel fetch with specific query params
        const [mealsRes, depositsRes, membersRes] = await Promise.all([
          // MealController expects LocalDate
          api.get(`/meals?startDate=${firstDay}&endDate=${lastDay}`),
          // DepositController expects LocalDateTime
          api.get(`/deposit/total/range?startDate=${startDateTime}&endDate=${endDateTime}`),
          // Member list for context
          api.get('/members')
        ]);

        setDashboardData({
          meals: mealsRes.data || [],
          deposits: depositsRes.data || [],
          members: membersRes.data || []
        });
        
        setDataStatus('success');
      } catch (err: any) {
        console.error("Dashboard Sync Error:", err.response?.status, err.response?.data);
        setDataStatus('error');
      }
    };

    fetchContext();
  }, [canAccessAI]);

  const stats = [
    { title: 'Total Members', icon: <Users />, link: '/members', color: 'bg-blue-600', desc: 'Manage mess members' },
    { title: 'Meal Entries', icon: <Utensils />, link: '/meals', color: 'bg-green-600', desc: 'Track daily meals' },
    { title: 'Member Deposits', icon: <Landmark />, link: '/deposits', color: 'bg-indigo-600', desc: 'View cash deposits' },
    { title: 'Add Expense', icon: <Wallet />, link: '/expenses', color: 'bg-orange-500', desc: 'Log bazaar costs' },
    { title: 'Monthly Reports', icon: <FileBarChart />, link: '/reports', color: 'bg-purple-600', desc: 'Financial summaries' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome back, <span className="text-indigo-600">{userEmail?.split('@')[0]}</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-widest border border-slate-200">
              {normalizedRole} Account
            </span>
            
            {canAccessAI && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                {dataStatus === 'loading' && (
                  <><RefreshCw size={12} className="animate-spin text-blue-500" /> <span className="text-blue-500">Syncing Data...</span></>
                )}
                {dataStatus === 'success' && (
                  <><CheckCircle2 size={12} className="text-green-500" /> <span className="text-green-500">AI Context Ready</span></>
                )}
                {dataStatus === 'error' && (
                  <><XCircle size={12} className="text-red-500" /> <span className="text-red-500">Sync Failed</span></>
                )}
              </div>
            )}
          </div>
        </div>
        
        <Link 
          to="/reports" 
          className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-xl transition-all"
        >
          View Full Report <ArrowRight size={16} />
        </Link>
      </header>

      {/* --- AI SECTION --- */}
      {canAccessAI && (
        <div className="mb-10">
          <AiInsights 
            mealHistory={dashboardData.meals}
            deposits={dashboardData.deposits}
            members={dashboardData.members}
          />
          {dataStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 font-semibold flex items-center gap-2">
                <XCircle size={16} /> Data Synchronization Error
              </p>
              <p className="text-xs text-red-500 mt-1">
                The AI couldn't fetch current meal or deposit records. Check your internet or re-login.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((item, index) => (
          <Link 
            key={index} 
            to={item.link} 
            className={`${item.color} p-6 rounded-2xl text-white shadow-lg hover:scale-[1.03] transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-4">
                {item.icon}
              </div>
              <p className="text-sm font-medium opacity-90">{item.title}</p>
              <p className="text-xl font-bold mt-1">Manage</p>
              <p className="text-[10px] mt-2 opacity-70 uppercase font-bold tracking-widest leading-tight">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};