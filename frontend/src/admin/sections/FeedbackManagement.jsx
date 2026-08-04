import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, RefreshCw, Download, Eye, CheckCircle, XCircle, 
  Clock, Activity, FileText, ChevronLeft, ChevronRight 
} from 'lucide-react';

const FeedbackManagement = ({ token, user, isDark }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const intervalRef = useRef(null);

  const fetchSubmissions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Simulating API call since actual endpoint might not be ready
      // const res = await axios.get('/api/submissions/all', { headers: { Authorization: `Bearer ${token}` } });
      // setSubmissions(res.data);
      
      // MOCK DATA for demonstration
      const mockData = Array.from({ length: 45 }).map((_, i) => ({
        _id: `sub_${i}`,
        facultyName: `Dr. Smith ${i}`,
        subject: `Data Structures ${i}`,
        department: ['CSE', 'IT', 'ECE'][i % 3],
        semester: (i % 8) + 1,
        programme: 'B.Tech',
        status: i % 4 === 0 ? 'pending' : i % 3 === 0 ? 'rejected' : 'approved',
        createdAt: new Date(Date.now() - i * 3600000).toISOString()
      }));
      setSubmissions(mockData);
    } catch (err) {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  useEffect(() => {
    if (liveMode) {
      intervalRef.current = setInterval(() => fetchSubmissions(false), 30000);
      toast.success('Live mode enabled');
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [liveMode]);

  const handleApprove = async (id) => {
    try {
      // await axios.patch(`/api/submissions/all/${id}`, { status: 'approved' }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status: 'approved' } : s));
      toast.success('Submission approved');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleReject = async (id) => {
    try {
      setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status: 'rejected' } : s));
      toast.success('Submission rejected');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Faculty,Subject,Department,Status,Date\n"
      + submissions.map(e => `${e.facultyName},${e.subject},${e.department},${e.status},${new Date(e.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export successful');
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.facultyName.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const currentData = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'rejected': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    }
  };

  const getSentimentEmoji = (status) => {
    switch (status) {
      case 'approved': return '😊';
      case 'rejected': return '😟';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Feedback Management</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and manage student feedback submissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLiveMode(!liveMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              liveMode 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            {liveMode && <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>}
            <RefreshCw className={`w-4 h-4 ${liveMode ? 'animate-spin-slow' : ''}`} />
            {liveMode ? 'Live Mode On' : 'Live Mode Off'}
          </button>
          
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'blue' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'emerald' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search faculty or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-white"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-white flex-1 md:flex-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-white flex-1 md:flex-none"
            >
              <option value="all">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Faculty Name</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Program / Sem</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">AI Sent</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && submissions.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20 float-right"></div></td>
                  </tr>
                ))
              ) : currentData.length > 0 ? (
                currentData.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{sub.facultyName}</td>
                    <td className="px-6 py-4">{sub.subject}</td>
                    <td className="px-6 py-4">{sub.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{sub.programme}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Sem {sub.semester}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(sub.status)} capitalize`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-lg" title={`Sentiment based on status`}>
                      {getSentimentEmoji(sub.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {sub.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(sub._id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 rounded transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleReject(sub._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded transition-colors" title="View Details">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <FileText className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-medium">No submissions found</p>
                      <p className="text-sm">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} results
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Stream */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Live Feedback Stream</h3>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
          {submissions.slice(0, 5).map((sub, i) => (
            <div key={`stream_${i}`} className="snap-start shrink-0 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                sub.status === 'approved' ? 'bg-emerald-500' : 
                sub.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></div>
              <div className="p-4 pl-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {new Date(sub.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white truncate">{sub.facultyName}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">{sub.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-medium">{sub.department} • {sub.programme}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
