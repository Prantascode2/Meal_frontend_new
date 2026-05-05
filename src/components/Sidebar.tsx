import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  Wallet, 
  FileText, 
  LogOut, 
  Landmark,
  ShieldCheck 
} from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  
  const rawRole = localStorage.getItem('role') || '';
  const role = rawRole.replace('ROLE_', '');

  const handleLogout = () => {
    const isSpecialist = role === 'ADMIN';
    localStorage.clear();
    
    navigate(isSpecialist ? '/login' : '/member/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20}/>, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Members', path: '/members', icon: <Users size={20}/>, roles: ['ADMIN', 'MANAGER', 'MEMBER'] }, // Admin Only
    { name: 'Meals', path: '/meals', icon: <Utensils size={20}/>, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Deposits', path: '/deposits', icon: <Landmark size={20}/>, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Expenses', path: '/expenses', icon: <Wallet size={20}/>, roles: ['ADMIN', 'MANAGER', 'MEMBER'] }, // Admin & Manager
    { name: 'Reports', path: '/reports', icon: <FileText size={20}/>, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col shadow-xl">
      <div className="flex items-center gap-2 px-2 mb-8">
        <h2 className="text-2xl font-bold text-blue-400">MealManager</h2>
        {role === 'ADMIN' && (
          <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded border border-indigo-500/30 uppercase font-bold">
            Admin
          </span>
        )}
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          if (!item.roles.includes(role)) return null;

          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-all mb-1 text-slate-300 hover:text-white group"
            >
              <span className="text-slate-400 group-hover:text-blue-400 transition-colors">
                {item.icon}
              </span> 
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <div className="px-3 mb-4">
          <p className="text-xs text-slate-500 truncate">{localStorage.getItem('email')}</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20}/> 
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};