import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { CreateMess } from './pages/CreateMess';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Meals } from './pages/Meals';
import { Deposits } from './pages/Deposits';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Sidebar } from './components/Sidebar';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const token = localStorage.getItem('accessToken');
  const rawRole = localStorage.getItem('role') || '';
  const userRole = rawRole.replace('ROLE_', ''); 

  if (!token) return <Navigate to="/login" replace />;

  // Logic: If allowedRoles is provided, userRole MUST be in that list
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-mess" element={<CreateMess />} />

        {/* --- ROUTES ACCESSIBLE BY EVERYONE (ADMIN, MANAGER, MEMBER) --- */}
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
        
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        
        {/* Added 'MEMBER' to allowedRoles so they can enter the page */}
        <Route path="/members" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MEMBER']}>
            <Members />
          </ProtectedRoute>
        } />
        
        <Route path="/deposits" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MEMBER']}>
            <Deposits />
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MEMBER']}>
            <Expenses />
          </ProtectedRoute>
        } />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;