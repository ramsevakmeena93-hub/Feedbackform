import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import HODDashboard from './pages/HODDashboard';
import VCDashboard from './pages/VCDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import ReportDetail from './pages/ReportDetail';
import SubmissionDetail from './pages/SubmissionDetail';

// Injected at build/dev time by Vite config — 'hod' or 'vc'
const APP_ROLE = (() => {
  try { return typeof __APP_ROLE__ !== 'undefined' ? __APP_ROLE__ : null; }
  catch { return null; }
})();

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  // If this portal is role-locked and user has wrong role, kick them out
  if (APP_ROLE && user.role !== APP_ROLE) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  // If portal is locked to a role, enforce it
  if (APP_ROLE && user.role !== APP_ROLE) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'vc' ? '/vc' : user.role === 'faculty' ? '/faculty' : '/hod'} />;
}

export default function App() {
  return (
    <AuthProvider appRole={APP_ROLE}>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login appRole={APP_ROLE} />} />
        <Route path="/register" element={<Register appRole={APP_ROLE} />} />

        {/* HOD routes */}
        <Route path="/hod" element={<ProtectedRoute role="hod"><HODDashboard /></ProtectedRoute>} />
        <Route path="/hod/report/:id" element={<ProtectedRoute role="hod"><ReportDetail /></ProtectedRoute>} />

        {/* VC routes */}
        <Route path="/vc" element={<ProtectedRoute role="vc"><VCDashboard /></ProtectedRoute>} />
        <Route path="/vc/submission/:id" element={<ProtectedRoute role="vc"><SubmissionDetail /></ProtectedRoute>} />

        {/* Faculty routes */}
        <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}
