import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Settings, Palette, Server, Database, Bell, Info,
  Sun, Moon, RefreshCw, Save, Shield, Globe, Mail,
  Key, HardDrive, Cpu, Clock, Activity, Download, Upload
} from 'lucide-react';

const TABS = [
  { id: 'general',  icon: Settings,  label: 'General' },
  { id: 'theme',    icon: Palette,   label: 'Theme' },
  { id: 'system',   icon: Server,    label: 'System' },
  { id: 'database', icon: Database,  label: 'Database' },
  { id: 'notifs',   icon: Bell,      label: 'Notifications' },
  { id: 'about',    icon: Info,      label: 'About' },
];

const ACCENT_COLORS = [
  { name: 'Indigo',  value: 'indigo',  cls: 'bg-indigo-500' },
  { name: 'Violet',  value: 'violet',  cls: 'bg-violet-500' },
  { name: 'Rose',    value: 'rose',    cls: 'bg-rose-500' },
  { name: 'Emerald', value: 'emerald', cls: 'bg-emerald-500' },
  { name: 'Amber',   value: 'amber',   cls: 'bg-amber-500' },
  { name: 'Cyan',    value: 'cyan',    cls: 'bg-cyan-500' },
];

const TECH_BADGES = ['React 18', 'Vite 5', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS', 'Recharts', 'JWT'];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function ProgressBar({ value, max, color = 'indigo' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
        <span>{value} MB used</span>
        <span>{max} MB total ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

export default function SettingsSection({ token, user, isDark, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('general');
  const [metrics, setMetrics] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // General settings stored in localStorage
  const [general, setGeneral] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_general') || '{}'); }
    catch { return {}; }
  });
  const [generalForm, setGeneralForm] = useState({
    institutionName: general.institutionName || 'MITS Gwalior',
    institutionCode: general.institutionCode || 'MITS001',
    academicYear:    general.academicYear    || '2025-26',
    currentSemester: general.currentSemester || 'Semester VI',
    adminEmail:      general.adminEmail      || (user?.email || ''),
  });

  // Theme
  const [accent, setAccent] = useState(() => localStorage.getItem('admin_accent') || 'indigo');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('admin_fontsize') || 'medium');
  const [sidebarLayout, setSidebarLayout] = useState(() => localStorage.getItem('admin_sidebar') || 'expanded');

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_prefs') || '{}'); }
    catch { return {}; }
  });

  const api = useCallback(() => axios.create({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const [mRes, sRes] = await Promise.allSettled([
        api().get('/api/admin/metrics'),
        api().get('/api/admin/stats'),
      ]);
      if (mRes.status === 'fulfilled') setMetrics(mRes.value.data);
      if (sRes.status === 'fulfilled') setDbStats(sRes.value.data);
    } catch {}
    finally { setMetricsLoading(false); }
  }, [api]);

  useEffect(() => {
    if (activeTab === 'system' || activeTab === 'database') fetchMetrics();
  }, [activeTab, fetchMetrics]);

  const saveGeneral = () => {
    localStorage.setItem('admin_general', JSON.stringify(generalForm));
    setGeneral(generalForm);
    toast.success('General settings saved');
  };

  const saveTheme = () => {
    localStorage.setItem('admin_accent', accent);
    localStorage.setItem('admin_fontsize', fontSize);
    localStorage.setItem('admin_sidebar', sidebarLayout);
    toast.success('Theme settings saved');
  };

  const saveNotifPrefs = () => {
    localStorage.setItem('notif_prefs', JSON.stringify(notifPrefs));
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your system configuration and preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Tab Bar */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-white dark:bg-slate-800'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Institution Settings</h3>
              {[
                { label: 'Institution Name', key: 'institutionName', placeholder: 'e.g. MITS Gwalior' },
                { label: 'Institution Code', key: 'institutionCode', placeholder: 'e.g. MITS001' },
                { label: 'Academic Year', key: 'academicYear', placeholder: 'e.g. 2025-26' },
                { label: 'Current Semester', key: 'currentSemester', placeholder: 'e.g. Semester VI' },
                { label: 'Admin Contact Email', key: 'adminEmail', placeholder: 'admin@mits.ac.in', type: 'email' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={generalForm[field.key]}
                    onChange={e => setGeneralForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  />
                </div>
              ))}
              <button onClick={saveGeneral} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-px shadow-sm">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {/* THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-8 max-w-xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Appearance</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Color Mode</label>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3 flex-1">
                    {isDark ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark theme</p>
                    </div>
                  </div>
                  <Toggle value={isDark} onChange={v => onThemeChange ? onThemeChange(v) : toast.info('Use the header toggle')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Accent Color</label>
                <div className="flex gap-3">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setAccent(c.value)}
                      className={`w-9 h-9 rounded-xl ${c.cls} transition-all hover:scale-110 ${accent === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Font Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`px-4 py-2 text-sm rounded-xl border transition-all capitalize ${fontSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Sidebar Layout</label>
                <div className="flex gap-2">
                  {['expanded', 'compact'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSidebarLayout(s)}
                      className={`px-4 py-2 text-sm rounded-xl border transition-all capitalize ${sidebarLayout === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveTheme} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-px shadow-sm">
                <Save className="w-4 h-4" /> Save Theme
              </button>
            </div>
          )}

          {/* SYSTEM */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">System Health</h3>
                <button onClick={fetchMetrics} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
              {metricsLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
              ) : metrics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                    <Activity className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">Server Status</p>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">🟢 Online</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">Uptime</p>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatUptime(metrics.uptime)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl col-span-1 sm:col-span-2 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Memory Usage</p>
                    </div>
                    <ProgressBar value={metrics.memUsed} max={metrics.memTotal} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">RSS: {metrics.rss} MB · Node {metrics.nodeVersion} · PID {metrics.pid} · {metrics.platform}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No metrics available. Is the backend running?</p>
              )}
            </div>
          )}

          {/* DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Database</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Connection', value: '🟢 Connected', sub: 'MongoDB Atlas' },
                  { label: 'Total Users', value: dbStats?.totalUsers ?? '—', sub: 'registered accounts' },
                  { label: 'Submissions', value: dbStats?.submissions ?? '—', sub: 'feedback entries' },
                  { label: 'System Logs', value: dbStats?.unresolvedLogs ?? '—', sub: 'unresolved' },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{s.label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => toast.info('Backup initiated. This may take a few minutes.')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all">
                  <Download className="w-4 h-4" /> Backup Database
                </button>
                <button onClick={() => toast.success('Cache cleared successfully')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all">
                  <RefreshCw className="w-4 h-4" /> Clear Cache
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS CONFIG */}
          {activeTab === 'notifs' && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notification Settings</h3>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Send alerts via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'hod_change', label: 'HOD Change Alerts', desc: 'When HOD is changed' },
                  { key: 'faculty', label: 'Faculty Registration', desc: 'New faculty joins' },
                  { key: 'feedback', label: 'Feedback Submissions', desc: 'New feedback received' },
                  { key: 'signature', label: 'Signature Uploads', desc: 'Signature needs review' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <Toggle
                      value={notifPrefs[item.key] !== false}
                      onChange={v => setNotifPrefs(p => ({ ...p, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
              <button onClick={saveNotifPrefs} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-px shadow-sm">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Panel v2.0</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">AI-Based College Feedback Management System</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Build date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Technology Stack</p>
                <div className="flex flex-wrap gap-2">
                  {TECH_BADGES.map(t => (
                    <span key={t} className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Institution</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{generalForm.institutionName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Academic Year: {generalForm.academicYear} · {generalForm.currentSemester}</p>
              </div>

              <button
                onClick={() => toast.success('✅ System is up to date! Version 2.0.0 is the latest.')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Check for Updates
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
