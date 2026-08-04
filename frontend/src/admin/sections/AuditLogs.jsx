import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ClipboardList, Search, Filter, RefreshCw, CheckCircle,
  XCircle, Trash2, AlertTriangle, Info, ChevronDown,
  ChevronUp, Sparkles, X, CheckCheck, AlertOctagon
} from 'lucide-react';

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const LEVEL_CONFIG = {
  error: { bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500', label: 'ERROR', icon: AlertOctagon },
  warn:  { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'WARN', icon: AlertTriangle },
  info:  { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', label: 'INFO', icon: Info },
  debug: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', dot: 'bg-slate-400', label: 'DEBUG', icon: Info },
};

function AISuggestionPanel({ suggestion }) {
  if (!suggestion) return null;
  const lines = suggestion.split('\n').filter(Boolean);
  return (
    <div className="mt-3 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">AI Suggestion</span>
      </div>
      <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
        {lines.map((line, i) => (
          <p key={i} className={line.startsWith('**') ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}>
            {line.replace(/\*\*/g, '')}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function AuditLogs({ token, user, isDark }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [stats, setStats] = useState({ total: 0, errors: 0, warns: 0, info: 0, unresolved: 0 });

  const api = useCallback(() => axios.create({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { limit: 20, page: p };
      if (levelFilter) params.level = levelFilter;
      if (resolvedFilter !== '') params.resolved = resolvedFilter;
      if (search) params.search = search;
      const res = await api().get('/api/admin/logs', { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPage(p);

      // Stats summary
      const [errRes, warnRes, infoRes, unresolvedRes] = await Promise.allSettled([
        api().get('/api/admin/logs?level=error&limit=1'),
        api().get('/api/admin/logs?level=warn&limit=1'),
        api().get('/api/admin/logs?level=info&limit=1'),
        api().get('/api/admin/logs?resolved=false&limit=1'),
      ]);
      setStats({
        total: res.data.total || 0,
        errors: errRes.status === 'fulfilled' ? (errRes.value.data.total || 0) : 0,
        warns: warnRes.status === 'fulfilled' ? (warnRes.value.data.total || 0) : 0,
        info: infoRes.status === 'fulfilled' ? (infoRes.value.data.total || 0) : 0,
        unresolved: unresolvedRes.status === 'fulfilled' ? (unresolvedRes.value.data.total || 0) : 0,
      });
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [api, levelFilter, resolvedFilter, search]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const handleResolve = async (id) => {
    const t = toast.loading('Resolving...');
    try {
      await api().patch(`/api/admin/logs/${id}/resolve`, { resolution: 'Resolved by admin' });
      toast.success('Log resolved', { id: t });
      fetchLogs(page);
    } catch {
      toast.error('Failed to resolve', { id: t });
    }
  };

  const handleDelete = async (id) => {
    const t = toast.loading('Deleting...');
    try {
      await api().delete(`/api/admin/logs/${id}`);
      toast.success('Log deleted', { id: t });
      fetchLogs(page);
    } catch {
      toast.error('Failed to delete', { id: t });
    }
  };

  const handleClearResolved = async () => {
    if (!window.confirm('Clear all resolved logs?')) return;
    const t = toast.loading('Clearing...');
    try {
      const res = await api().delete('/api/admin/logs/clear/resolved');
      toast.success(res.data.message || 'Cleared', { id: t });
      fetchLogs(1);
    } catch {
      toast.error('Failed to clear', { id: t });
    }
  };

  const handleAiSuggest = async (log) => {
    setAiLoading(prev => ({ ...prev, [log._id]: true }));
    try {
      const res = await api().post(`/api/admin/logs/${log._id}/ai-suggest`);
      setAiSuggestions(prev => ({ ...prev, [log._id]: res.data.suggestion }));
      setExpandedId(log._id);
    } catch {
      toast.error('AI suggestion failed');
    } finally {
      setAiLoading(prev => ({ ...prev, [log._id]: false }));
    }
  };

  const STAT_CARDS = [
    { label: 'Total Logs', value: stats.total, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-slate-50 dark:bg-slate-800/50' },
    { label: 'Errors', value: stats.errors, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Warnings', value: stats.warns, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Info', value: stats.info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Unresolved', value: stats.unresolved, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Audit Logs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Track every system action and event</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchLogs(1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleClearResolved} className="px-3 py-1.5 text-xs font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear Resolved
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search log messages..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <select
          value={resolvedFilter}
          onChange={e => setResolvedFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Status</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold">No logs found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {logs.map(log => {
                  const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
                  const Icon = cfg.icon;
                  const isExpanded = expandedId === log._id;
                  return (
                    <>
                      <tr
                        key={log._id}
                        onClick={() => setExpandedId(isExpanded ? null : log._id)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${log.resolved ? 'opacity-60' : ''} ${isExpanded ? 'bg-slate-50 dark:bg-slate-700/30' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${cfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                            {log.source || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className={`text-sm truncate ${log.resolved ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {log.message}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {timeAgo(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {log.resolved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle className="w-3 h-3" /> Resolved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                              <XCircle className="w-3 h-3" /> Open
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            {!log.resolved && (
                              <button onClick={() => handleResolve(log._id)} title="Resolve" className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors">
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => handleAiSuggest(log)} title="AI Suggest" disabled={aiLoading[log._id]} className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 transition-colors disabled:opacity-50">
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(log._id)} title="Delete" className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`exp_${log._id}`} className="bg-slate-50/80 dark:bg-slate-900/30">
                          <td colSpan={6} className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Message</p>
                            <pre className="text-xs font-mono bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-auto max-h-48 whitespace-pre-wrap">
                              {log.message}
                              {log.stack ? `\n\nStack Trace:\n${log.stack}` : ''}
                            </pre>
                            {aiSuggestions[log._id] && <AISuggestionPanel suggestion={aiSuggestions[log._id]} />}
                            {aiLoading[log._id] && (
                              <div className="mt-3 flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs">
                                <Sparkles className="w-4 h-4 animate-pulse" /> Generating AI suggestion...
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Page {page} of {pages} · {total} total logs
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLogs(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => i + Math.max(1, page - 2)).map(p => (
                    <button
                      key={p}
                      onClick={() => fetchLogs(p)}
                      className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchLogs(page + 1)}
                    disabled={page >= pages}
                    className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
