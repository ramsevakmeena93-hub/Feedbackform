import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Users, GraduationCap, UserCog, Crown, Shield, Building2, 
  FileText, AlertTriangle, Activity, Cpu, BarChart3, AlertCircle, 
  TrendingUp, TrendingDown, RefreshCw, Clock 
} from 'lucide-react';

export default function DashboardOverview({ token, user, isDark }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: null,
    metrics: null,
    users: [],
    submissions: []
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data fetch since actual API might not be ready
        // In reality, replace with real axios calls:
        // const [statsRes, metricsRes, usersRes, subRes] = await Promise.all([ ... ])
        
        await new Promise(r => setTimeout(r, 1500)); // Simulate loading
        
        setData({
          stats: { errorLogs: 12, warnLogs: 45, usersByRole: [
            { role: 'admin', count: 5 },
            { role: 'faculty', count: 120 },
            { role: 'hod', count: 15 },
            { role: 'vc', count: 2 }
          ]},
          metrics: { uptime: '120h 45m', memUsed: 512, memTotal: 1024, cpu: 45 },
          users: Array.from({ length: 142 }).map((_, i) => ({ 
            role: i < 5 ? 'admin' : i < 20 ? 'hod' : i < 22 ? 'vc' : 'faculty',
            department: ['CSE', 'ECE', 'ME', 'CE'][i % 4]
          })),
          submissions: Array.from({ length: 850 })
        });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Mock SSE for logs
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          message: `User action logged ${Math.floor(Math.random() * 1000)}`,
          level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)]
        };
        return [newLog, ...prev].slice(0, 10);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl h-80" />
          <div className="bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl h-80" />
        </div>
      </div>
    );
  }

  const { users, submissions, stats, metrics } = data;
  
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const hodCount = users.filter(u => u.role === 'hod').length;
  const vcCount = users.filter(u => u.role === 'vc').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const deptsCount = new Set(users.map(u => u.department)).size;

  const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-100">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span>+{trend}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').split(' ')[0]}`} />
        </div>
      </div>
    </div>
  );

  const PIE_COLORS = { admin: '#6366f1', faculty: '#10b981', hod: '#3b82f6', vc: '#8b5cf6' };
  const pieData = stats.usersByRole.map(d => ({ name: d.role.toUpperCase(), value: d.count }));
  const barData = [
    { name: 'Week 1', submissions: 120 },
    { name: 'Week 2', submissions: 250 },
    { name: 'Week 3', submissions: 180 },
    { name: 'Week 4', submissions: 300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard Overview</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users} colorClass="bg-indigo-500 text-indigo-600 dark:text-indigo-400" trend={12} />
        <StatCard title="Faculty Count" value={facultyCount} icon={GraduationCap} colorClass="bg-emerald-500 text-emerald-600 dark:text-emerald-400" />
        <StatCard title="HODs" value={hodCount} icon={UserCog} colorClass="bg-blue-500 text-blue-600 dark:text-blue-400" />
        <StatCard title="VC" value={vcCount} icon={Crown} colorClass="bg-violet-500 text-violet-600 dark:text-violet-400" />
        <StatCard title="Admins" value={adminCount} icon={Shield} colorClass="bg-rose-500 text-rose-600 dark:text-rose-400" />
        <StatCard title="Departments" value={deptsCount} icon={Building2} colorClass="bg-amber-500 text-amber-600 dark:text-amber-400" />
        <StatCard title="Total Submissions" value={submissions.length} icon={FileText} colorClass="bg-cyan-500 text-cyan-600 dark:text-cyan-400" trend={24} />
        <StatCard title="System Errors" value={stats.errorLogs} icon={AlertTriangle} colorClass="bg-red-500 text-red-600 dark:text-red-400" />
        <StatCard title="Server Uptime" value={metrics.uptime} icon={Activity} colorClass="bg-green-500 text-green-600 dark:text-green-400" />
        <StatCard title="Memory Used" value={`${metrics.memUsed} MB / ${metrics.memTotal} MB`} icon={Cpu} colorClass="bg-purple-500 text-purple-600 dark:text-purple-400" />
        <StatCard title="Reports Generated" value="45" icon={BarChart3} colorClass="bg-orange-500 text-orange-600 dark:text-orange-400" />
        <StatCard title="Warnings" value={stats.warnLogs} icon={AlertCircle} colorClass="bg-yellow-500 text-yellow-600 dark:text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Area Chart */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">User Role Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', admin: 2, faculty: 50, hod: 5, vc: 1 },
                { name: 'Feb', admin: 3, faculty: 80, hod: 10, vc: 1 },
                { name: 'Mar', admin: 5, faculty: 120, hod: 15, vc: 2 }
              ]}>
                <defs>
                  <linearGradient id="colorFac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend />
                <Area type="monotone" dataKey="faculty" stroke="#10b981" fillOpacity={1} fill="url(#colorFac)" />
                <Area type="monotone" dataKey="hod" stroke="#3b82f6" fillOpacity={0.3} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Breakdown Pie */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Role Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submissions Bar */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Submissions Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip cursor={{fill: isDark ? '#334155' : '#f1f5f9'}} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="submissions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 flex justify-between items-center">
            Live Activity Timeline
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p>Waiting for live events...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.level === 'error' ? 'bg-rose-500' : log.level === 'warn' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
                    <span className="text-xs text-slate-500">{log.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
