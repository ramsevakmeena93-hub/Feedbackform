import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Activity, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';

const VCManagement = ({ token, user, isDark }) => {
  const [vcData, setVcData] = useState(null);

  useEffect(() => {
    // Mock data
    setVcData({
      name: 'Prof. Alan Turing',
      email: 'vc@college.edu',
      department: 'Administration',
      joiningDate: '2020-05-12',
      lastLogin: '2 hours ago',
      status: 'active',
      stats: { reviewed: 1250, approved: 1100, rejected: 100, pending: 50 },
      recentActivity: [
        { id: 1, faculty: 'John Doe', dept: 'CSE', date: '2023-10-25', action: 'approved' },
        { id: 2, faculty: 'Jane Smith', dept: 'ECE', date: '2023-10-24', action: 'rejected' },
        { id: 3, faculty: 'Mike Lee', dept: 'MECH', date: '2023-10-23', action: 'pending' },
      ]
    });
  }, []);

  if (!vcData) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Vice Chancellor Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of VC activities and role management</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors">
          Change VC
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-3xl font-bold mb-4">
            {vcData.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{vcData.name}</h2>
          <p className="text-slate-500 mb-4">{vcData.email}</p>
          <div className="w-full space-y-2 text-sm text-left">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{vcData.department}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{vcData.joiningDate}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Status</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">{vcData.status}</span>
            </div>
          </div>
        </div>

        {/* Stats & Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Reviewed', val: vcData.stats.reviewed, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { label: 'Approved', val: vcData.stats.approved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
              { label: 'Rejected', val: vcData.stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
              { label: 'Pending', val: vcData.stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
                <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{stat.val}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 font-semibold text-slate-800 dark:text-white">Recent Activity</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {vcData.recentActivity.map(act => (
                <div key={act.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{act.faculty}</div>
                    <div className="text-sm text-slate-500">{act.dept} • {act.date}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                    ${act.action === 'approved' ? 'bg-green-100 text-green-700' : 
                      act.action === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {act.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCManagement;
