import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Trash2, Activity } from 'lucide-react';

const TYPE_STYLES = {
  csv_upload:      { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'CSV Upload' },
  pdf_processed:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'PDF Processed' },
  pdf_error:       { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'PDF Error' },
  sent_to_faculty: { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   label: 'Sent to Faculty' },
  sent_to_vc:      { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Sent to VC' },
  faculty_approved:{ bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500',label: 'Faculty Approved' },
  report_deleted:  { bg: 'bg-gray-50',   text: 'text-gray-600',   dot: 'bg-gray-400',   label: 'Deleted' },
  ai_analysis:     { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'AI Analysis' },
};

export default function ActivityLog({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { fetchLogs(); }, [filter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const { data } = await api.get(`/api/logs/my${params}`);
      setLogs(data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  async function clearLogs() {
    if (!window.confirm('Clear all activity logs?')) return;
    await api.delete('/api/logs/my');
    setLogs([]);
  }

  const types = ['all', 'csv_upload', 'pdf_processed', 'sent_to_faculty', 'sent_to_vc', 'faculty_approved', 'pdf_error'];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-700 text-sm">Activity Log</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{logs.length}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button onClick={clearLogs} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Clear logs">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b overflow-x-auto">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
              filter === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {t === 'all' ? 'All' : (TYPE_STYLES[t]?.label || t)}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No activity yet</div>
        ) : (
          logs.map(log => {
            const style = TYPE_STYLES[log.type] || TYPE_STYLES.pdf_processed;
            return (
              <div key={log._id} className={`flex gap-3 items-start px-4 py-3 hover:bg-gray-50 ${log.status === 'error' ? 'bg-red-50' : ''}`}>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`}></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="text-xs text-gray-700 flex-1">{log.message}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
