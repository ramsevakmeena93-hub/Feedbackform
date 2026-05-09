import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  hod:     { label: 'Head of Department', color: 'bg-blue-900',   icon: '🏛️' },
  vc:      { label: 'Vice Chancellor',    color: 'bg-purple-900', icon: '🎓' },
  faculty: { label: 'Faculty Member',     color: 'bg-green-900',  icon: '👨‍🏫' },
};

export default function Register({ appRole }) {
  const defaultRole = appRole || 'hod';
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const cfg = ROLE_CONFIG[defaultRole] || ROLE_CONFIG.hod;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', { ...form, role: defaultRole });
      login(data.user, data.token);
      navigate(data.user.role === 'vc' ? '/vc' : data.user.role === 'faculty' ? '/faculty' : '/hod');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{cfg.icon}</div>
          <h1 className="text-xl font-bold text-slate-900">{cfg.label} Registration</h1>
          <p className="text-slate-500 text-sm">MITS Gwalior · Feedback System</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', field: 'name', type: 'text', placeholder: 'Dr. John Smith' },
              { label: 'Email Address', field: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Password', field: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Department', field: 'department', type: 'text', placeholder: 'Computer Science & Technology' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} className="input" placeholder={placeholder}
                  value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                  required={field !== 'department'} />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Role</label>
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-slate-50 text-sm`}>
                <span>{cfg.icon}</span>
                <span className="font-medium text-slate-700">{cfg.label}</span>
                <span className="ml-auto text-xs text-slate-400 uppercase">{defaultRole}</span>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full ${cfg.color} hover:opacity-90 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 mt-2`}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-900 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
