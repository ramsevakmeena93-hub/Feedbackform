import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Filter, Calendar, Trophy, AlertOctagon, Target, Award,
  Users, Building2
} from 'lucide-react';

export default function Analytics({ token, user, isDark }) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Semester');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        
        setData({
          totalFeedback: 12450,
          avgRating: 4.2,
          bestDept: 'Computer Science',
          bestFaculty: 'Dr. Alan Turing',
          monthlyTrend: [
            { month: 'Jan', rating: 4.0, volume: 1200 },
            { month: 'Feb', rating: 4.1, volume: 1500 },
            { month: 'Mar', rating: 4.3, volume: 2200 },
            { month: 'Apr', rating: 4.2, volume: 1800 },
            { month: 'May', rating: 4.5, volume: 3000 },
          ],
          deptPerformance: [
            { dept: 'CSE', score: 4.6 },
            { dept: 'ECE', score: 4.2 },
            { dept: 'ME', score: 3.8 },
            { dept: 'CE', score: 3.9 },
            { dept: 'EE', score: 4.1 },
          ],
          subjectBreakdown: [
            { name: 'Core', value: 40 },
            { name: 'Elective', value: 30 },
            { name: 'Lab', value: 20 },
            { name: 'Project', value: 10 },
          ],
          facultyRatings: [
            { subject: 'Clarity', A: 120, B: 110, fullMark: 150 },
            { subject: 'Punctuality', A: 98, B: 130, fullMark: 150 },
            { subject: 'Knowledge', A: 86, B: 130, fullMark: 150 },
            { subject: 'Engagement', A: 99, B: 100, fullMark: 150 },
            { subject: 'Fairness', A: 85, B: 90, fullMark: 150 },
            { subject: 'Availability', A: 65, B: 85, fullMark: 150 },
          ],
          topFaculty: [
            { id: 1, name: 'Dr. Alan Turing', dept: 'CSE', score: 4.9 },
            { id: 2, name: 'Dr. Ada Lovelace', dept: 'CSE', score: 4.8 },
            { id: 3, name: 'Dr. Grace Hopper', dept: 'ECE', score: 4.7 },
            { id: 4, name: 'Dr. John von Neumann', dept: 'EE', score: 4.6 },
            { id: 5, name: 'Dr. Claude Shannon', dept: 'ECE', score: 4.5 },
          ],
          atRiskDepts: [
            { dept: 'Mechanical Eng.', head: 'Dr. Smith', score: 3.8, trend: '-0.2' },
            { dept: 'Civil Eng.', head: 'Dr. Doe', score: 3.9, trend: '-0.1' },
          ]
        });
      } catch (error) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange, token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
          <div className="h-[400px] bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium">No Analytics Data</h3>
        <p>There is no feedback data available for the selected period.</p>
      </div>
    );
  }

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics & Insights</h2>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Semester</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-indigo-100 text-sm font-medium">Total Feedback</p>
          <h3 className="text-3xl font-bold mt-1">{data.totalFeedback.toLocaleString()}</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-emerald-100 text-sm font-medium">Average Rating</p>
          <h3 className="text-3xl font-bold mt-1">{data.avgRating} <span className="text-lg opacity-75">/ 5.0</span></h3>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Most Active Dept</p>
          <h3 className="text-xl font-bold mt-1 truncate">{data.bestDept}</h3>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-violet-100 text-sm font-medium">Top Faculty</p>
          <h3 className="text-xl font-bold mt-1 truncate">{data.bestFaculty}</h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Feedback Trend (Monthly)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis yAxisId="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Bar Chart */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Department Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.deptPerformance}>
                <XAxis dataKey="dept" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis domain={[0, 5]} stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip cursor={{fill: isDark ? '#334155' : '#f1f5f9'}} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {data.deptPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score < 4.0 ? '#ef4444' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Faculty Rating Attributes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.facultyRatings}>
                <PolarGrid stroke={isDark ? '#475569' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                <Radar name="Top 10%" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Radar name="Average" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Feedback by Subject Type</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.subjectBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data.subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap Placeholder */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Feedback Intensity Heatmap</h3>
        <div className="grid grid-cols-7 gap-2 overflow-x-auto">
          {/* Days of week headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 mb-2">{day}</div>
          ))}
          {/* 4 weeks * 7 days grid cells */}
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = Math.floor(Math.random() * 5); // 0-4
            const colors = [
              'bg-slate-100 dark:bg-slate-800', 
              'bg-indigo-100 dark:bg-indigo-900', 
              'bg-indigo-300 dark:bg-indigo-700', 
              'bg-indigo-500 dark:bg-indigo-500', 
              'bg-indigo-700 dark:bg-indigo-400'
            ];
            return (
              <div 
                key={i} 
                className={`h-12 rounded-md ${colors[intensity]} transition-colors hover:ring-2 ring-indigo-300 dark:ring-indigo-700 cursor-pointer`}
                title={`Intensity level: ${intensity}`}
              />
            );
          })}
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Top 5 Faculty
          </h3>
          <div className="space-y-4">
            {data.topFaculty.map((fac, index) => (
              <div key={fac.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-sm font-bold text-slate-500">#{index+1}</span>}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{fac.name}</p>
                    <p className="text-xs text-slate-500">{fac.dept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">{fac.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" /> Departments at Risk
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 px-4">Head</th>
                  <th className="pb-3 px-4 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {data.atRiskDepts.map((dept, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900 dark:text-slate-100">{dept.dept}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{dept.head}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md">
                        {dept.score} <span className="text-xs">({dept.trend})</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {data.atRiskDepts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500">No departments at risk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
