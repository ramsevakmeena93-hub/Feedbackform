import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import { CheckCircle, Clock, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Award, BookOpen, AlertTriangle, Target, Lightbulb, Users, Archive } from 'lucide-react';

// ── GRADE BADGE ──────────────────────────────────────────────────
function GradeBadge({ grade }) {
  const colors = { 'A+': 'bg-emerald-100 text-emerald-800 border-emerald-300', 'A': 'bg-green-100 text-green-800 border-green-300', 'B+': 'bg-blue-100 text-blue-800 border-blue-300', 'B': 'bg-indigo-100 text-indigo-800 border-indigo-300', 'C+': 'bg-amber-100 text-amber-800 border-amber-300', 'C': 'bg-red-100 text-red-800 border-red-300' };
  return <span className={`text-2xl font-black px-4 py-1 rounded-xl border-2 ${colors[grade] || colors['C']}`}>{grade}</span>;
}

// ── REPORT CARD ──────────────────────────────────────────────────
function ReportCard({ report, onAcknowledge, acknowledging }) {
  const [expanded, setExpanded] = useState(false);
  const approved = report.status === 'faculty_approved';

  return (
    <div className={`card overflow-hidden border-l-4 ${approved ? 'border-l-green-600' : 'border-l-amber-500'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={approved ? 'badge-green' : 'badge-gray'}>
                {approved ? '✓ Acknowledged' : '⏳ Pending Review'}
              </span>
              {report.semester && <span className="badge-blue">Sem {report.semester}</span>}
              {report.academicYear && <span className="badge-gray">{report.academicYear}</span>}
              {report.ffiScore != null && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${report.ffiScore >= 4 ? 'bg-green-100 text-green-700' : report.ffiScore >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  FFI: {report.ffiScore.toFixed(2)}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-base">{report.facultyName || 'Your Report'}</h3>
            <p className="text-slate-500 text-sm mt-0.5">
              {[report.subjectCode, report.programme].filter(Boolean).join(' · ') || 'No details'}
            </p>
            {report.driveLink && (
              <a href={report.driveLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-900 hover:underline mt-2 font-medium">
                <ExternalLink size={12} /> View Original PDF
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            {!approved && (
              <button onClick={() => onAcknowledge(report._id)} disabled={acknowledging === report._id}
                className="btn btn-success btn-sm">
                <CheckCircle size={14} />
                {acknowledging === report._id ? 'Confirming...' : 'I have seen this'}
              </button>
            )}
            {approved && <p className="text-xs text-slate-400">Acknowledged {report.facultyAcknowledgedAt ? new Date(report.facultyAcknowledgedAt).toLocaleDateString('en-IN') : ''}</p>}
            <button onClick={() => setExpanded(e => !e)} className="btn btn-secondary btn-sm">
              {expanded ? <><ChevronUp size={12} />Hide</> : <><ChevronDown size={12} />View Details</>}
            </button>
          </div>
        </div>

        {/* Expanded details — same format as HOD */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Comment percentages */}
            {report.commentPercentages && Object.keys(report.commentPercentages).length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">Appreciation Breakdown</p>
                <div className="space-y-2">
                  {Object.entries(report.commentPercentages).sort((a, b) => b[1] - a[1]).map(([label, pct]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-red-700 w-20 shrink-0">{label}</span>
                      <div className="flex-1 bg-red-100 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-red-700 w-10 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Needs Attention */}
              <div className="rounded-xl border border-amber-200 overflow-hidden">
                <div className="bg-amber-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700">🟡 Comments Needing Attention</span>
                  <span className="badge-yellow">{report.commentsNeedingAttention?.length || 0}</span>
                </div>
                <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {!report.commentsNeedingAttention?.length ? (
                    <p className="text-xs text-slate-400 italic">None found</p>
                  ) : report.commentsNeedingAttention.map((t, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-700 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>{t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Appreciation */}
              <div className="rounded-xl border border-red-200 overflow-hidden">
                <div className="bg-red-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-700">🔴 Appreciation</span>
                  <span className="badge-red">{report.appreciation?.length || 0}</span>
                </div>
                <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {!report.appreciation?.length ? (
                    <p className="text-xs text-slate-400 italic">None found</p>
                  ) : report.appreciation.map((t, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-700 bg-red-50 border border-red-100 rounded px-2 py-1.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* HOD Remarks & Action Taken */}
            {(report.hodRemarks || report.actionTaken) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.hodRemarks && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-blue-700 mb-1">HOD Remarks</p>
                    <p className="text-xs text-slate-700">{report.hodRemarks}</p>
                  </div>
                )}
                {report.actionTaken && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-green-700 mb-1">Action Taken</p>
                    <p className="text-xs text-slate-700">{report.actionTaken}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ANALYSIS SECTION ─────────────────────────────────────────────
function AnalysisSection({ summary }) {
  if (!summary) return null;
  const { avgFFI, grade, totalReports, totalAppreciation, totalAttention, ffiBySubject, commentPercentages } = summary;

  const ffiChartData = ffiBySubject.map(s => ({
    name: s.subject.length > 10 ? s.subject.substring(0, 10) + '...' : s.subject,
    FFI: s.ffi,
    fullName: s.subject
  }));

  const pieData = [
    { name: 'Appreciation', value: totalAppreciation, fill: '#ef4444' },
    { name: 'Needs Attention', value: totalAttention, fill: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center border-blue-200 bg-blue-50">
          <TrendingUp className="mx-auto text-blue-700 mb-2" size={20} />
          <p className="text-2xl font-bold text-blue-900">{avgFFI}</p>
          <p className="text-xs text-blue-600 font-medium">Avg FFI Score</p>
        </div>
        <div className="card p-4 text-center border-purple-200 bg-purple-50">
          <Award className="mx-auto text-purple-700 mb-2" size={20} />
          <GradeBadge grade={grade} />
          <p className="text-xs text-purple-600 font-medium mt-1">Performance Grade</p>
        </div>
        <div className="card p-4 text-center border-red-200 bg-red-50">
          <BookOpen className="mx-auto text-red-600 mb-2" size={20} />
          <p className="text-2xl font-bold text-red-700">{totalAppreciation}</p>
          <p className="text-xs text-red-600 font-medium">Appreciation Comments</p>
        </div>
        <div className="card p-4 text-center border-amber-200 bg-amber-50">
          <AlertTriangle className="mx-auto text-amber-600 mb-2" size={20} />
          <p className="text-2xl font-bold text-amber-700">{totalAttention}</p>
          <p className="text-xs text-amber-600 font-medium">Attention Comments</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* FFI by Subject */}
        {ffiChartData.length > 0 && (
          <div className="card p-5">
            <p className="section-title mb-4">FFI Score by Subject</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ffiChartData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n, p) => [v, p.payload.fullName]} />
                <Bar dataKey="FFI" radius={[4, 4, 0, 0]}>
                  {ffiChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.FFI >= 4 ? '#15803d' : entry.FFI >= 3 ? '#d97706' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Comment distribution */}
        {pieData.length > 0 && (
          <div className="card p-5">
            <p className="section-title mb-4">Comment Distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Appreciation breakdown */}
      {Object.keys(commentPercentages).length > 0 && (
        <div className="card p-5">
          <p className="section-title mb-4">Appreciation Quality Breakdown</p>
          <div className="space-y-3">
            {Object.entries(commentPercentages).sort((a, b) => b[1] - a[1]).map(([label, pct]) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700 w-24 shrink-0">{label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-900 to-blue-600 h-3 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="text-sm font-bold text-blue-900 w-12 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance insight */}
      <div className="card p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white">
        <p className="font-bold text-lg mb-2">Performance Insight</p>
        <p className="text-blue-200 text-sm">
          {avgFFI >= 4.0
            ? `Excellent performance! Your average FFI of ${avgFFI} reflects outstanding teaching quality. Students appreciate your clarity and engagement.`
            : avgFFI >= 3.5
            ? `Good performance with FFI ${avgFFI}. Students value your teaching. Focus on the attention comments to further improve.`
            : avgFFI >= 3.0
            ? `Satisfactory performance (FFI ${avgFFI}). Review the comments needing attention and consider addressing student concerns.`
            : `FFI ${avgFFI} indicates areas for improvement. Please review student feedback carefully and discuss with HOD.`
          }
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-blue-300">Based on {totalReports} report{totalReports > 1 ? 's' : ''}</span>
          <span className="text-blue-500">·</span>
          <span className="text-xs text-blue-300">{totalAppreciation + totalAttention} total comments analyzed</span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────
export default function FacultyDashboard() {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('reports'); // reports | analysis | advanced | records
  const [advancedData, setAdvancedData] = useState(null);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(null);
  const [filterYear, setFilterYear] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSems, setAvailableSems] = useState([]);

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    fetchData();
    if (activeTab === 'advanced') fetchAdvanced();
  }, [filterYear, filterSem, activeTab]);

  async function fetchAdvanced() {
    try {
      const { data } = await api.get('/api/reports/faculty/advanced-analytics');
      setAdvancedData(data);
    } catch {}
  }

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterYear) params.append('year', filterYear);
      if (filterSem) params.append('semester', filterSem);

      const { data } = await api.get(`/api/reports/faculty/analysis?${params}`);
      setReports(data.reports || []);
      setSummary(data.summary);
      if (data.summary?.years) setAvailableYears(data.summary.years);
      if (data.summary?.semesters) setAvailableSems(data.summary.semesters);
    } catch (err) {
      if (err.response?.status === 401) { logout(); return; }
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(reportId) {
    if (!window.confirm('Confirm that you have read and acknowledged this feedback report?')) return;
    setAcknowledging(reportId);
    try {
      await api.post(`/api/reports/${reportId}/acknowledge`);
      toast.success('Report acknowledged');
      fetchData();
    } catch { toast.error('Failed to acknowledge'); }
    finally { setAcknowledging(null); }
  }

  const pending = reports.filter(r => r.status === 'sent_to_faculty');
  const acknowledged = reports.filter(r => r.status === 'faculty_approved');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      <Navbar title="Faculty Portal" subtitle={user?.department} />

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Welcome, {user?.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{user?.department || 'Faculty Member'} · MITS Gwalior</p>
          </div>
          {summary && <GradeBadge grade={summary.grade} />}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Reports', value: reports.length, color: 'text-blue-900 bg-blue-50 border-blue-200' },
            { label: 'Pending', value: pending.length, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Acknowledged', value: acknowledged.length, color: 'text-green-700 bg-green-50 border-green-200' },
            { label: 'Avg FFI', value: summary?.avgFFI || '—', color: 'text-purple-700 bg-purple-50 border-purple-200' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`card p-4 border ${color}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card px-4 py-3 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="input text-xs py-2 w-36">
            <option value="">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="input text-xs py-2 w-36">
            <option value="">All Semesters</option>
            {availableSems.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {(filterYear || filterSem) && (
            <button onClick={() => { setFilterYear(''); setFilterSem(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
          {[
            { id: 'reports',  label: `Reports (${reports.length})` },
            { id: 'analysis', label: 'Analysis' },
            { id: 'advanced', label: '🚀 Advanced' },
            { id: 'records',  label: 'Records' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="card p-16 text-center">
            <div className="w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="w-full">
                {reports.length === 0 ? (
                  <div className="card p-16 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-slate-500 font-medium">No reports found</p>
                    <p className="text-slate-400 text-sm mt-1">Your HOD will send feedback reports for your review</p>
                  </div>
                ) : (
                  <div className="card overflow-hidden">
                    {pending.length > 0 && (
                      <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">⏳ Pending Review — {pending.length} report{pending.length>1?"s":""} need your acknowledgment</p>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="table-header">
                          <tr>
                            <th className="px-4 py-3 text-left">Faculty Name</th>
                            <th className="px-4 py-3 text-left">Subject Code</th>
                            <th className="px-4 py-3 text-left">Programme</th>
                            <th className="px-4 py-3 text-center">Sem</th>
                            <th className="px-4 py-3 text-center">Year</th>
                            <th className="px-4 py-3 text-center">FFI</th>
                            <th className="px-4 py-3 text-left">Appreciation</th>
                            <th className="px-4 py-3 text-left">Needs Attention</th>
                            <th className="px-4 py-3 text-left">HOD Remarks</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reports.map((report, idx) => {
                            const approved = report.status === 'faculty_approved';
                            const pcts = report.commentPercentages || {};
                            const pctEntries = Object.entries(pcts).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
                            const longApp = (report.appreciation||[]).filter(c=>c.trim().split(/\s+/).length>4);
                            return (
                              <tr key={report._id} className={`hover:bg-slate-50 align-top transition-colors ${!approved ? 'bg-amber-50/30' : ''}`}>
                                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                                  {report.facultyName || '—'}
                                  {report.driveLink && (
                                    <a href={report.driveLink} target="_blank" rel="noopener noreferrer"
                                      className="block text-xs text-indigo-600 hover:underline mt-0.5 flex items-center gap-1">
                                      <ExternalLink size={10}/> View PDF
                                    </a>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-slate-600 whitespace-nowrap">{report.subjectCode||'—'}</td>
                                <td className="px-4 py-3 text-xs text-slate-600">{report.programme||'—'}</td>
                                <td className="px-4 py-3 text-center text-xs">{report.semester||'—'}</td>
                                <td className="px-4 py-3 text-center text-xs">{report.academicYear||'—'}</td>
                                <td className="px-4 py-3 text-center">
                                  {report.ffiScore!=null
                                    ? <span className={`text-sm font-bold ${report.ffiScore>=4?'text-emerald-600':report.ffiScore>=3?'text-amber-600':'text-red-600'}`}>{report.ffiScore.toFixed(2)}</span>
                                    : <span className="text-slate-300">—</span>}
                                </td>
                                <td className="px-4 py-3 max-w-[160px]">
                                  <div className="space-y-0.5">
                                    {pctEntries.map(([label,pct])=>(
                                      <span key={label} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-1.5 py-0.5 inline-block mr-1">{label} {pct}%</span>
                                    ))}
                                    {longApp.slice(0,1).map((c,i)=>(
                                      <div key={i} className="text-xs text-emerald-800 leading-snug mt-0.5">{c}</div>
                                    ))}
                                    {pctEntries.length===0&&longApp.length===0&&<span className="text-slate-300 text-xs">None</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3 max-w-[180px]">
                                  {(report.commentsNeedingAttention||[]).length>0
                                    ? <div className="space-y-1">{(report.commentsNeedingAttention||[]).slice(0,2).map((c,i)=>(
                                        <div key={i} className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-0.5 leading-snug">{c}</div>
                                      ))}</div>
                                    : <span className="text-slate-300 text-xs">None</span>}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px]">
                                  {report.hodRemarks||<span className="text-slate-300">—</span>}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                  {approved
                                    ? <span className="badge-emerald flex items-center gap-1 justify-center"><CheckCircle size={10}/>Approved</span>
                                    : <span className="badge-amber flex items-center gap-1 justify-center"><Clock size={10}/>Pending</span>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {!approved && (
                                    <button onClick={()=>handleAcknowledge(report._id)} disabled={acknowledging===report._id}
                                      className="btn btn-success btn-sm whitespace-nowrap">
                                      <CheckCircle size={12}/>
                                      {acknowledging===report._id?'...':'I have seen this'}
                                    </button>
                                  )}
                                  {approved && (
                                    <p className="text-xs text-slate-400">
                                      {report.facultyAcknowledgedAt ? new Date(report.facultyAcknowledgedAt).toLocaleDateString('en-IN') : 'Done'}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ANALYSIS TAB */}
            {activeTab === 'analysis' && (
              reports.length === 0 ? (
                <div className="card p-16 text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-slate-500 font-medium">No data to analyze</p>
                  <p className="text-slate-400 text-sm mt-1">Analysis will appear once reports are available</p>
                </div>
              ) : <AnalysisSection summary={summary} />
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              !advancedData ? (
                <div className="card p-16 text-center">
                  <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-500 text-sm">Loading advanced analytics...</p>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Improvement Tracker */}
                  {advancedData.improvement && (
                    <div className={`card p-5 border-l-4 ${advancedData.improvement.direction === 'up' ? 'border-l-green-500 bg-green-50' : advancedData.improvement.direction === 'down' ? 'border-l-red-500 bg-red-50' : 'border-l-slate-400'}`}>
                      <div className="flex items-center gap-3">
                        {advancedData.improvement.direction === 'up' ? <TrendingUp className="text-green-600" size={24} /> : advancedData.improvement.direction === 'down' ? <TrendingDown className="text-red-600" size={24} /> : <span className="text-2xl">➡️</span>}
                        <div>
                          <p className="font-bold text-slate-800">FFI Improvement Tracker</p>
                          <p className="text-sm text-slate-600">
                            {advancedData.improvement.direction === 'up'
                              ? `📈 Improved by ${advancedData.improvement.diff} points from ${advancedData.improvement.from} to ${advancedData.improvement.to}`
                              : advancedData.improvement.direction === 'down'
                              ? `📉 Decreased by ${Math.abs(advancedData.improvement.diff)} points from ${advancedData.improvement.from} to ${advancedData.improvement.to}`
                              : `No change between ${advancedData.improvement.from} and ${advancedData.improvement.to}`}
                          </p>
                        </div>
                        <span className={`ml-auto text-2xl font-black ${advancedData.improvement.diff > 0 ? 'text-green-600' : advancedData.improvement.diff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {advancedData.improvement.diff > 0 ? '+' : ''}{advancedData.improvement.diff}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* FFI Trend Line Chart */}
                  {advancedData.trend?.length > 0 && (
                    <div className="card p-5">
                      <p className="section-title mb-4">📊 FFI Score Timeline</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={advancedData.trend}>
                          <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="avgFFI" stroke="#1e3a8a" strokeWidth={2} dot={{ fill: '#1e3a8a', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Peer Comparison */}
                  <div className="card p-5">
                    <p className="section-title mb-4">👥 Anonymous Peer Comparison</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Your Avg FFI</p>
                        <p className={`text-3xl font-black ${advancedData.myAvgFFI >= advancedData.deptAvgFFI ? 'text-green-700' : 'text-amber-600'}`}>{advancedData.myAvgFFI}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Dept Avg FFI</p>
                        <p className="text-3xl font-black text-slate-600">{advancedData.deptAvgFFI}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      {advancedData.myAvgFFI >= advancedData.deptAvgFFI
                        ? <p className="text-sm text-green-700 font-medium">✅ You are performing above department average</p>
                        : <p className="text-sm text-amber-600 font-medium">⚠️ You are below department average — focus on improvement areas</p>}
                    </div>
                  </div>

                  {/* Teaching Dimension Radar */}
                  {advancedData.dimensions && Object.values(advancedData.dimensions).some(v => v > 0) && (
                    <div className="card p-5">
                      <p className="section-title mb-4">🎯 Teaching Weakness Areas</p>
                      <p className="text-xs text-slate-500 mb-3">Based on student attention comments — lower is better</p>
                      <div className="space-y-2">
                        {Object.entries(advancedData.dimensions).map(([dim, count]) => (
                          <div key={dim} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-600 w-24 shrink-0">{dim}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                              <div className={`h-2.5 rounded-full ${count === 0 ? 'bg-green-400' : count <= 2 ? 'bg-amber-400' : 'bg-red-500'}`}
                                style={{ width: count === 0 ? '5%' : `${Math.min(count * 20, 100)}%` }}></div>
                            </div>
                            <span className={`text-xs font-bold w-8 text-right ${count === 0 ? 'text-green-600' : count <= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                              {count === 0 ? '✓' : count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Smart Recommendations */}
                  {advancedData.recommendations?.length > 0 && (
                    <div className="card p-5">
                      <p className="section-title mb-4">💡 Smart Recommendations</p>
                      <div className="space-y-3">
                        {advancedData.recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-3 items-start bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <span className="text-2xl shrink-0">{rec.icon}</span>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{rec.title}</p>
                              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{rec.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary stats */}
                  <div className="card p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white">
                    <p className="font-bold mb-3">📋 Career Summary</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-black">{advancedData.totalReports}</p>
                        <p className="text-blue-300 text-xs">Total Reports</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black">{advancedData.trend?.length || 0}</p>
                        <p className="text-blue-300 text-xs">Semesters</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black">{advancedData.myAvgFFI}</p>
                        <p className="text-blue-300 text-xs">Lifetime FFI</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* RECORDS TAB */}
            {activeTab === 'records' && (
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b bg-slate-50">
                  <p className="section-title">All Records — Year & Semester Wise</p>
                </div>
                {reports.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">No records found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="table-header">
                        <tr>
                          <th className="px-4 py-3 text-left">Year</th>
                          <th className="px-4 py-3 text-left">Semester</th>
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Programme</th>
                          <th className="px-4 py-3 text-center">FFI</th>
                          <th className="px-4 py-3 text-center">Appreciation</th>
                          <th className="px-4 py-3 text-center">Attention</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map(r => (
                          <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">{r.academicYear || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">Sem {r.semester || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.subjectCode || '—'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{r.programme || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-bold text-sm ${r.ffiScore >= 4 ? 'text-green-700' : r.ffiScore >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                                {r.ffiScore?.toFixed(2) || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center"><span className="badge-red">{r.appreciationCount || 0}</span></td>
                            <td className="px-4 py-3 text-center"><span className="badge-yellow">{r.attentionCount || 0}</span></td>
                            <td className="px-4 py-3">
                              <span className={r.status === 'faculty_approved' ? 'badge-green' : 'badge-blue'}>
                                {r.status?.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
