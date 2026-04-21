import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';

const PORTAL_STYLES = {
  hod: 'border-indigo-200 bg-white',
  vc: 'border-purple-200 bg-white',
  faculty: 'border-teal-200 bg-white',
};

const ROLE_BADGE = {
  hod: 'bg-indigo-100 text-indigo-700',
  vc: 'bg-purple-100 text-purple-700',
  faculty: 'bg-teal-100 text-teal-700',
};

const ICON_COLOR = {
  hod: 'text-indigo-600',
  vc: 'text-purple-600',
  faculty: 'text-teal-600',
};

export default function Navbar({ title, subtitle }) {
  const { user, logout, appRole } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || appRole;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className={`border-b shadow-sm sticky top-0 z-10 ${PORTAL_STYLES[role] || 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className={ICON_COLOR[role] || 'text-indigo-600'} size={24} />
          <div>
            <h1 className="font-bold text-gray-800 text-sm leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${ROLE_BADGE[role] || ''}`}>
              {role === 'hod' ? 'Head of Department' : role === 'vc' ? 'Vice Chancellor' : role === 'faculty' ? 'Faculty' : role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
