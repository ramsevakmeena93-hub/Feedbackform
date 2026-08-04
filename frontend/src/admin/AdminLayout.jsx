import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, BarChart3, Users, GraduationCap, UserCog,
  Crown, Building2, Shield, MessageSquare, FileText, PenTool,
  Bell, ClipboardList, Settings, Menu, Search, Moon, Sun,
  ChevronDown, ChevronRight, LogOut, X, Sparkles
} from 'lucide-react';
import mitsLogo from '../assets/mits-logo.png';

import DashboardOverview from './sections/DashboardOverview';
import Analytics from './sections/Analytics';
import UserManagement from './sections/UserManagement';
import FacultyManagement from './sections/FacultyManagement';
import HODManagement from './sections/HODManagement';
import VCManagement from './sections/VCManagement';
import DepartmentManagement from './sections/DepartmentManagement';
import RolePermissions from './sections/RolePermissions';
import FeedbackManagement from './sections/FeedbackManagement';
import Reports from './sections/Reports';
import DigitalSignatures from './sections/DigitalSignatures';
import NotificationsSection from './sections/NotificationsSection';
import AuditLogs from './sections/AuditLogs';
import SettingsSection from './sections/SettingsSection';

const MENU_GROUPS = [
  {
    label: "Main",
    items: [
      { id: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'analytics',   icon: BarChart3,        label: 'Analytics' },
    ]
  },
  {
    label: "User Management",
    items: [
      { id: 'users',       icon: Users,         label: 'All Users' },
      { id: 'faculty',     icon: GraduationCap, label: 'Faculty' },
      {
        id: 'hod', icon: UserCog, label: 'HOD Management', children: [
          { id: 'hod_all',         label: 'All HODs' },
          { id: 'hod_assign',      label: 'Assign HOD' },
          { id: 'hod_transfer',    label: 'Transfer HOD' },
          { id: 'hod_performance', label: 'Performance' },
        ]
      },
      { id: 'vc',          icon: Crown,         label: 'VC Management' },
    ]
  },
  {
    label: "System",
    items: [
      { id: 'departments',   icon: Building2,      label: 'Departments' },
      { id: 'roles',         icon: Shield,         label: 'Roles & Permissions' },
      { id: 'feedback',      icon: MessageSquare,  label: 'Feedback' },
      { id: 'reports',       icon: FileText,       label: 'Reports' },
      { id: 'signatures',    icon: PenTool,        label: 'Digital Signatures' },
      { id: 'notifications', icon: Bell,           label: 'Notifications' },
      { id: 'audit',         icon: ClipboardList,  label: 'Audit Logs' },
      { id: 'settings',      icon: Settings,       label: 'Settings' },
    ]
  }
];

export default function AdminLayout() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('admin_dark_mode') === 'true');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hodOpen, setHodOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('admin_dark_mode', isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/landing');
    toast.success('Logged out successfully');
  };

  const setSection = (id) => {
    setActiveSection(id);
    setMobileSidebarOpen(false);
  };

  const renderSection = () => {
    const props = { token, user, isDark };
    switch (activeSection) {
      case 'dashboard':        return <DashboardOverview {...props} />;
      case 'analytics':        return <Analytics {...props} />;
      case 'users':            return <UserManagement {...props} />;
      case 'faculty':          return <FacultyManagement {...props} />;
      case 'hod': case 'hod_all': case 'hod_assign': case 'hod_transfer': case 'hod_performance':
        return <HODManagement {...props} subSection={activeSection} />;
      case 'vc':               return <VCManagement {...props} />;
      case 'departments':      return <DepartmentManagement {...props} />;
      case 'roles':            return <RolePermissions {...props} />;
      case 'feedback':         return <FeedbackManagement {...props} />;
      case 'reports':          return <Reports {...props} />;
      case 'signatures':       return <DigitalSignatures {...props} />;
      case 'notifications':    return <NotificationsSection {...props} />;
      case 'audit':            return <AuditLogs {...props} />;
      case 'settings':         return <SettingsSection {...props} />;
      default:                 return <DashboardOverview {...props} />;
    }
  };

  const currentLabel = MENU_GROUPS.flatMap(g => g.items)
    .flatMap(i => i.children ? [i, ...i.children] : [i])
    .find(i => i.id === activeSection)?.label || activeSection;

  const SidebarItem = ({ id, icon: Icon, label, badge, children, depth = 0 }) => {
    const isActive = activeSection === id || (children && children.some(c => c.id === activeSection));
    const hasChildren = children && children.length > 0;
    const isChildOpen = hasChildren && (id === 'hod' ? hodOpen : false);

    return (
      <>
        <button
          onClick={() => {
            if (hasChildren) {
              if (id === 'hod') { if (sidebarCollapsed) setSidebarCollapsed(false); setHodOpen(h => !h); }
            } else {
              setSection(id);
            }
          }}
          title={sidebarCollapsed ? label : ''}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium
            ${depth > 0 ? 'pl-9' : ''}
            ${isActive && !hasChildren
              ? 'bg-blue-600 text-white shadow-sm'
              : isActive && hasChildren
              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}>
          <div className="flex items-center gap-3 min-w-0">
            {Icon && <Icon size={17} className="shrink-0" />}
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1.5 shrink-0">
              {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {hasChildren && (
                isChildOpen
                  ? <ChevronDown size={13} />
                  : <ChevronRight size={13} />
              )}
            </div>
          )}
        </button>

        {/* Sub-items */}
        {hasChildren && !sidebarCollapsed && (
          <div className={`overflow-hidden transition-all duration-200 ${isChildOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-0.5 ml-3 border-l-2 border-slate-200 dark:border-slate-700 pl-2 space-y-0.5 pb-1">
              {children.map(child => (
                <SidebarItem key={child.id} id={child.id} label={child.label} depth={1} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
          <img src={mitsLogo} alt="MITS" className="w-full h-full object-contain" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">Admin Portal</p>
            <p className="text-blue-600 dark:text-blue-400 text-[10px] font-medium">MITS Feedback</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 scrollbar-hide space-y-4">
        {MENU_GROUPS.map(group => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <SidebarItem key={item.id} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 p-2 rounded-xl ${!sidebarCollapsed ? 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' : ''} transition-colors`}
          onClick={!sidebarCollapsed ? handleLogout : undefined}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors truncate">
                Click to sign out
              </p>
            </div>
          )}
          {!sidebarCollapsed && <LogOut size={14} className="text-slate-400 shrink-0" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      <div className="flex flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 animate-slide-right">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shrink-0 z-10">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle */}
              <button
                onClick={() => { setSidebarCollapsed(c => !c); setMobileSidebarOpen(o => !o); }}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Menu size={18} />
              </button>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                  <span>Admin</span>
                  <ChevronRight size={11} />
                  <span className="text-slate-600 dark:text-slate-400 capitalize font-medium">{currentLabel}</span>
                </div>
                <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-none capitalize">{currentLabel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm w-52 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Theme */}
              <button onClick={() => setIsDark(d => !d)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Notifs */}
              <button className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell size={17} />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* User */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name?.split(' ')[0] || 'Admin'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Administrator</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 page-enter">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
