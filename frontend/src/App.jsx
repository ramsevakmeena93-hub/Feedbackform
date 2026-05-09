import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Developer from './pages/Developer';
import History from './pages/History';
import HODDashboard from './pages/HODDashboard';
import VCDashboard from './pages/VCDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import ReportDetail from './pages/ReportDetail';
import SubmissionDetail from './pages/SubmissionDetail';

import AdminDashboard from './pages/AdminDashboard';

const APP_ROLE = (() => {
  try { return typeof __APP_ROLE__ !== 'undefined' ? __APP_ROLE__ : null; }
  catch { return null; }
})();

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (APP_ROLE && user.role !== APP_ROLE) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div></div>;
  // Main portal (no role lock) — always show landing page
  if (!APP_ROLE) return <Navigate to="/landing" />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== APP_ROLE) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'vc' ? '/vc' : user.role === 'faculty' ? '/faculty' : user.role === 'admin' ? '/admin' : '/hod'} />;
}

export default function App() {
  return (
    <AuthProvider appRole={APP_ROLE}>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/login" element={<Login appRole={APP_ROLE} />} />
        <Route path="/register" element={<Register appRole={APP_ROLE} />} />
        <Route path="/hod" element={<ProtectedRoute role="hod"><HODDashboard /></ProtectedRoute>} />
        <Route path="/hod/report/:id" element={<ProtectedRoute role="hod"><ReportDetail /></ProtectedRoute>} />
        <Route path="/hod/history" element={<ProtectedRoute role="hod"><History /></ProtectedRoute>} />
        <Route path="/vc" element={<ProtectedRoute role="vc"><VCDashboard /></ProtectedRoute>} />
        <Route path="/vc/submission/:id" element={<ProtectedRoute role="vc"><SubmissionDetail /></ProtectedRoute>} />
        <Route path="/vc/history" element={<ProtectedRoute role="vc"><History /></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}
