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
import ProfileCompletion from './pages/ProfileCompletion';

const APP_ROLE = null;

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0f1e]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"
          style={{ borderWidth: '3px' }} />
        <p className="text-slate-400 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/landing" replace />;
  const dest = user.role === 'vc'      ? '/vc'
             : user.role === 'faculty' ? '/faculty'
             : user.role === 'admin'   ? '/admin'
             : '/hod';
  return <Navigate to={dest} replace />;
}

export default function App() {
  return (
    <AuthProvider appRole={APP_ROLE}>
      <Routes>
        {/* Root */}
        <Route path="/"        element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-completion" element={<ProfileCompletion />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/developer"    element={<Developer />} />
        <Route path="/dashboard"    element={<RoleRedirect />} />

        {/* HOD */}
        <Route path="/hod"           element={<ProtectedRoute role="hod"><HODDashboard /></ProtectedRoute>} />
        <Route path="/hod/report/:id" element={<ProtectedRoute role="hod"><ReportDetail /></ProtectedRoute>} />
        <Route path="/hod/history"   element={<ProtectedRoute role="hod"><History /></ProtectedRoute>} />

        {/* VC */}
        <Route path="/vc"                  element={<ProtectedRoute role="vc"><VCDashboard /></ProtectedRoute>} />
        <Route path="/vc/submission/:id"   element={<ProtectedRoute role="vc"><SubmissionDetail /></ProtectedRoute>} />
        <Route path="/vc/history"          element={<ProtectedRoute role="vc"><History /></ProtectedRoute>} />

        {/* Faculty */}
        <Route path="/faculty"         element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/history" element={<ProtectedRoute role="faculty"><History /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AuthProvider>
  );
}
