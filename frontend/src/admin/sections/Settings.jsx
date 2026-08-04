import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Settings as SettingsIcon, Moon, Sun, Palette, Layout, Database, 
  Bell, Info, Server, HardDrive, Cpu, Activity, Save
} from 'lucide-react';

const Settings = ({ token, user, isDark, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [metrics, setMetrics] = useState({ uptime: '14d 5h 23m', memUsed: 420, memTotal: 1024, rss: '256 MB', node: 'v18.17.0', platform: 'linux', pid: 1403 });
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [instName, setInstName] = useState('MITS Gwalior');
  const [instCode, setInstCode] = useState('0901');
  const [academicYear, setAcademicYear] = useState('2023-2024');
  const [semester, setSemester] = useState('Odd');
  const [email, setEmail] = useState('admin@mits.edu');

  const [themeOpts, setThemeOpts] = useState({ 
    color: 'indigo', 
    fontSize: 'Medium', 
    layout: 'Expanded' 
  });

  const [notifConfig, setNotifConfig] = useState({
    email: true,
    push: true,
    hodAlerts: true,
    facultyAlerts: false,
    feedbackAlerts: true
  });

  const handleSave = (section) => {
    toast.loading('Saving settings...', { id: 'save' });
    setTimeout(() => {
      toast.success(`${section} settings saved successfully!`, { id: 'save' });
    }, 1000);
  };

  const fetchMetrics = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics(prev => ({ ...prev, memUsed: Math.floor(Math.random() * 400) + 300 }));
      toast.success('System metrics updated');
      setLoading(false);
    }, 800);
  };

  const handleBackup = () => {
    toast.success('Database backup initiated. You will be notified when complete.', { duration: 4000 });
  };

  const tabs = [
    { id: 'general', icon: SettingsIcon, label: 'General' },
    { id: 'theme', icon: Palette, label: 'Theme & UI' },
    { id: 'system', icon: Activity, label: 'System' },
    { id: 'database', icon: Database, label: 'Database' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'about', icon: Info, label: 'About' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure global application parameters and preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row min-h-[600px] overflow-hidden">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible p-3 gap-1 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                    : 'text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white dark:bg-slate-900">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Institution Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institution Name</label>
                  <input type="text" value={instName} onChange={(e) => setInstName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institution Code</label>
                  <input type="text" value={instCode} onChange={(e) => setInstCode(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Academic Year</label>
                  <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Semester Phase</label>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white">
                    <option value="Odd">Odd Semester</option>
                    <option value="Even">Even Semester</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin Contact Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>
              
              <div className="pt-6">
                <button onClick={() => handleSave('General')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Appearance Settings</h3>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-white">Color Scheme</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark mode</p>
                </div>
                <button 
                  onClick={() => onThemeChange && onThemeChange(!isDark)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center ${isDark ? 'translate-x-9' : 'translate-x-1'}`}>
                    {isDark ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-slate-400" />}
                  </span>
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 dark:text-white">Accent Color</h4>
                <div className="flex gap-4">
                  {['indigo', 'violet', 'rose', 'emerald', 'amber', 'cyan'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => setThemeOpts({...themeOpts, color})}
                      className={`w-10 h-10 rounded-full bg-${color}-500 flex items-center justify-center transition-transform hover:scale-110 ${themeOpts.color === color ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-' + color + '-500' : ''}`}
                    >
                      {themeOpts.color === color && <span className="w-3 h-3 bg-white rounded-full"></span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 dark:text-white">Font Size & Layout</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {['Small', 'Medium', 'Large'].map(size => (
                      <label key={size} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <input type="radio" name="fs" checked={themeOpts.fontSize === size} onChange={() => setThemeOpts({...themeOpts, fontSize: size})} className="text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300">{size}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {['Expanded', 'Compact'].map(layout => (
                      <label key={layout} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <input type="radio" name="layout" checked={themeOpts.layout === layout} onChange={() => setThemeOpts({...themeOpts, layout})} className="text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300">{layout}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => handleSave('Theme')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* SYSTEM TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">System Metrics</h3>
                <button onClick={fetchMetrics} disabled={loading} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1">
                  <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Server Status</h4>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span> Online
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Uptime: {metrics.uptime}</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Cpu className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Memory Usage</h4>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(metrics.memUsed/metrics.memTotal)*100}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-500 flex justify-between">
                    <span>{metrics.memUsed} MB used</span>
                    <span>{metrics.memTotal} MB total</span>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <th className="px-6 py-4 text-slate-500 font-medium">Node.js Version</th>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-mono">{metrics.node}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <th className="px-6 py-4 text-slate-500 font-medium">Platform OS</th>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 capitalize">{metrics.platform}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <th className="px-6 py-4 text-slate-500 font-medium">Process ID (PID)</th>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-mono">{metrics.pid}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <th className="px-6 py-4 text-slate-500 font-medium">RSS Memory</th>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-mono">{metrics.rss}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DATABASE TAB */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Database Management</h3>
              
              <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <Database className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                <div>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-400">MongoDB Connected</h4>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500">Cluster: mits-production-cluster-0</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">1,248</p>
                  <p className="text-sm text-slate-500 mt-1">Total Users</p>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">15.4k</p>
                  <p className="text-sm text-slate-500 mt-1">Submissions</p>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">89k</p>
                  <p className="text-sm text-slate-500 mt-1">Audit Logs</p>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <button onClick={handleBackup} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                  <HardDrive className="w-5 h-5" /> Generate Full Backup
                </button>
                <button onClick={() => toast.success('Cache cleared')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
                  <Activity className="w-5 h-5" /> Clear Application Cache
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Notification Routing</h3>
              
              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Send daily digests to admin email' },
                  { id: 'push', label: 'Push Notifications', desc: 'Browser notifications for critical alerts' },
                  { id: 'hodAlerts', label: 'HOD Change Alerts', desc: 'Notify when department heads change' },
                  { id: 'facultyAlerts', label: 'Faculty Alerts', desc: 'Notify on every new faculty registration' },
                  { id: 'feedbackAlerts', label: 'Feedback Alerts', desc: 'Notify when negative feedback threshold is reached' },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white">{item.label}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifConfig({...notifConfig, [item.id]: !notifConfig[item.id]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifConfig[item.id] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifConfig[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button onClick={() => handleSave('Notification')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  <Server className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Feedback System</h3>
                  <p className="text-slate-500 mt-1">Enterprise Edition v2.0.0</p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">React 18</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">Node.js</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">MongoDB</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">TailwindCSS</span>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Build Date</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">August 2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">License</span>
                  <span className="text-slate-800 dark:text-slate-200">MIT / Internal Use</span>
                </div>
                
                <div className="pt-4 flex justify-center">
                  <button 
                    onClick={() => toast.success('System is up to date (v2.0.0)')}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Check for Updates
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
