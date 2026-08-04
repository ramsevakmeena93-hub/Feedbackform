import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp, UserCheck, Briefcase, BarChart3, Repeat } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HODManagement = ({ token, user, isDark }) => {
  const [expanded, setExpanded] = useState({ card1: false, card2: false, card3: false, card4: false });
  const [hods, setHods] = useState([]);

  useEffect(() => {
    // Mock HOD data
    setHods([
      { id: 1, name: 'Dr. Smith', dept: 'CSE', date: '2023-01-15', perf: 4.8 },
      { id: 2, name: 'Dr. Johnson', dept: 'ECE', date: '2022-08-10', perf: 4.5 },
    ]);
  }, []);

  const toggle = (card) => setExpanded(p => ({ ...p, [card]: !p[card] }));
  const toggleAll = () => {
    const isAllExp = Object.values(expanded).every(Boolean);
    setExpanded({ card1: !isAllExp, card2: !isAllExp, card3: !isAllExp, card4: !isAllExp });
  };

  const chartData = [
    { name: 'CSE', submissions: 400 },
    { name: 'ECE', submissions: 300 },
    { name: 'MECH', submissions: 200 },
  ];

  const CardHeader = ({ title, icon: Icon, cardKey }) => (
    <div 
      className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      onClick={() => toggle(cardKey)}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Icon size={20}/></div>
        <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
      </div>
      {expanded[cardKey] ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">HOD Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage Heads of Departments</p>
        </div>
        <button onClick={toggleAll} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
          {Object.values(expanded).every(Boolean) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Card 1: Current HODs */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <CardHeader title="Current HODs" icon={UserCheck} cardKey="card1" />
          <div className={`transition-all duration-300 ease-in-out ${expanded.card1 ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
              <div className="grid gap-4 md:grid-cols-2">
                {hods.map(h => (
                  <div key={h.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{h.name}</div>
                      <div className="text-sm text-slate-500">{h.dept} • Joined {h.date}</div>
                    </div>
                    <div className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">★ {h.perf}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Assign HOD */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <CardHeader title="Assign New HOD" icon={Briefcase} cardKey="card2" />
          <div className={`transition-all duration-300 ease-in-out ${expanded.card2 ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
              <div className="flex gap-4">
                <select className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                  <option>Select Faculty</option>
                </select>
                <select className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                  <option>Select Department</option>
                </select>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Assign</button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Transfer HOD */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <CardHeader title="Transfer HOD" icon={Repeat} cardKey="card3" />
          <div className={`transition-all duration-300 ease-in-out ${expanded.card3 ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
               <div className="flex gap-4">
                <select className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                  <option>Select Current HOD</option>
                </select>
                <select className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                  <option>Select New Department</option>
                </select>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Transfer</button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Performance */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <CardHeader title="Performance Overview" icon={BarChart3} cardKey="card4" />
          <div className={`transition-all duration-300 ease-in-out ${expanded.card4 ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }} />
                  <Bar dataKey="submissions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODManagement;
