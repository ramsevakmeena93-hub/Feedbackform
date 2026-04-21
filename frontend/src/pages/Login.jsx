import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

const PORTAL_LABELS = {
  hod: { title: 'HOD Portal', color: 'from-indigo-600 to-blue-500', badge: 'bg-indigo-100 text-indigo-700' },
  vc: { title: 'Vice Chancellor Portal', color: 'from-purple-600 to-violet-500', badge: 'bg-purple-100 text-purple-700' },
  faculty: { title: 'Faculty Portal', color: 'from-teal-600 to-emerald-500', badge: 'bg-teal-100 text-teal-700' },
};

export default function Login({ appRole }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const portal = PORTAL_LABELS[appRole] || { title: 'Faculty Feedback System', color: 'from-indigo-600 to-blue-500', badge: '' };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      // Enforce role for this portal
      if (appRole && data.user.role !== appRole) {
        toast.error(`This portal is for ${appRole.toUpperCase()} accounts only`);
        return;
      }
      login(data.user, data.token);
      navigate(data.user.role === 'vc' ? '/vc' : data.user.role === 'faculty' ? '/faculty' : '/hod');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${portal.color} p-4`}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className={`p-3 rounded-full mb-3 ${portal.badge}`}>
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{portal.title}</h1>
          <p className="text-sm text-gray-400 mt-1">Automated Faculty Feedback Analysis</p>
          {appRole && (
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${portal.badge}`}>
              {appRole === 'hod' ? 'Head of Department' : appRole === 'vc' ? 'Vice Chancellor' : appRole === 'faculty' ? 'Faculty Member' : ''}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${portal.color} text-white py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
