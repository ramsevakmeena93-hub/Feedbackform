import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HowItWorks from './pages/HowItWorks';
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

// Always null in combined single-build deployment
const APP_ROLE = null;

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!user) return <Navigate to="/landing" replace />;
  if (role && user.role !== role) return <Navigate to="/landing" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!user) return <Navigate to="/landing" replace />;
  const dest = user.role === 'vc' ? '/vc'
    : user.role === 'faculty' ? '/faculty'
    : user.role === 'admin'   ? '/admin'
    : '/hod';
  return <Navigate to={dest} replace />;
}

export default function App() {
  return (
    <AuthProvider appRole={APP_ROLE}>
      <Routes>
        {/* Root → landing */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HOD */}
        <Route path="/hod" element={<ProtectedRoute role="hod"><HODDashboard /></ProtectedRoute>} />
        <Route path="/hod/report/:id" element={<ProtectedRoute role="hod"><ReportDetail /></ProtectedRoute>} />
        <Route path="/hod/history" element={<ProtectedRoute role="hod"><History /></ProtectedRoute>} />

        {/* VC */}
        <Route path="/vc" element={<ProtectedRoute role="vc"><VCDashboard /></ProtectedRoute>} />
        <Route path="/vc/submission/:id" element={<ProtectedRoute role="vc"><SubmissionDetail /></ProtectedRoute>} />
        <Route path="/vc/history" element={<ProtectedRoute role="vc"><History /></ProtectedRoute>} />

        {/* Faculty */}
        <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/history" element={<ProtectedRoute role="faculty"><History /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AuthProvider>
  );
}
