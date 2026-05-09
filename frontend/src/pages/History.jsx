import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Archive, Download, Filter, Search } from "lucide-react";

const SEMESTERS = ["1","2","3","4","5","6","7","8"];

export default function History() {
  const { token, user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterYear, setFilterYear]   = useState("");
  const [filterSem,  setFilterSem]    = useState("");
  const [filterDept, setFilterDept]   = useState("");
  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { fetchHistory(); }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      // HOD sees their own, VC sees all
      const url = user?.role === "vc" ? "/api/submissions/all" : "/api/submissions/my";
      const { data } = await api.get(url);
      // Only approved submissions
      setSubmissions(data.filter(s => s.status === "approved"));
    } catch { toast.error("Failed to load history"); }
    finally { setLoading(false); }
  }

  async function handleDownload(subId) {
    toast.loading("Generating combined PDF...", { id: "pdf" });
    try {
      const res = await fetch(`/api/submissions/${subId}/download-pdf`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || "PDF not available", { id: "pdf" }); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `feedback-report-${subId}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully", { id: "pdf" });
    } catch { toast.error("Failed to download", { id: "pdf" }); }
  }

  // Get unique values for filters
  const years = [...new Set(submissions.map(s => s.academicYear).filter(Boolean))].sort().reverse();
  const depts = [...new Set(submissions.map(s => s.hodId?.department || s.department).filter(Boolean))].sort();

  const filtered = submissions.filter(s => {
    if (filterYear && s.academicYear !== filterYear) return false;
    if (filterSem  && s.semester     !== filterSem)  return false;
    if (filterDept && (s.hodId?.department || s.department) !== filterDept) return false;
    return true;
  });

  // Group by year → semester → department
  const grouped = {};
  filtered.forEach(s => {
    const yr   = s.academicYear || "Unknown Year";
    const sem  = s.semester     ? `Semester ${s.semester}` : "Unknown Semester";
    const dept = s.hodId?.department || s.department || "Unknown Dept";
    if (!grouped[yr])       grouped[yr]       = {};
    if (!grouped[yr][sem])  grouped[yr][sem]  = {};
    if (!grouped[yr][sem][dept]) grouped[yr][sem][dept] = [];
    grouped[yr][sem][dept].push(s);
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <Navbar title="History" subtitle="Approved Reports" />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Archive size={22} className="text-indigo-600" /> Report History
            </h1>
            <p className="text-slate-500 text-sm mt-1">All VC-approved submissions — filterable by year, semester, department</p>
          </div>
          <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
            {filtered.length} approved submission{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex flex-wrap gap-3 items-center">
          <Filter size={14} className="text-slate-400" />
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 w-40">
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 w-36">
            <option value="">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 w-56">
            <option value="">All Departments</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(filterYear || filterSem || filterDept) && (
            <button onClick={() => { setFilterYear(""); setFilterSem(""); setFilterDept(""); }}
              className="text-xs text-red-400 hover:text-red-600 font-medium">Clear</button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Loading history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center">
            <Archive size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold">No approved submissions found</p>
            <p className="text-slate-400 text-sm mt-1">Approved submissions will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0])).map(([year, sems]) => (
              <div key={year} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Year header */}
                <div className="px-6 py-3 bg-indigo-600 flex items-center gap-2">
                  <span className="text-white font-bold text-sm">📅 {year}</span>
                </div>

                {Object.entries(sems).sort().map(([sem, depts]) => (
                  <div key={sem} className="border-b border-slate-50 last:border-0">
                    {/* Semester header */}
                    <div className="px-6 py-2.5 bg-indigo-50 border-b border-indigo-100">
                      <span className="text-indigo-700 font-semibold text-xs uppercase tracking-wide">📚 {sem}</span>
                    </div>

                    {Object.entries(depts).map(([dept, subs]) => (
                      <div key={dept} className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">🏛️ {dept}</p>
                        <div className="space-y-2">
                          {subs.map(sub => {
                            const ffis = (sub.reports||[]).map(r=>r.ffiScore).filter(Boolean);
                            const avg  = ffis.length ? (ffis.reduce((s,v)=>s+v,0)/ffis.length).toFixed(2) : "—";
                            return (
                              <div key={sub._id} className="flex items-center justify-between gap-4 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">{sub.hodId?.name || "HOD"}</p>
                                    <p className="text-xs text-slate-400">{new Date(sub.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="bg-white border border-slate-200 rounded-lg px-2 py-1">
                                      📋 {sub.reports?.length || 0} reports
                                    </span>
                                    {avg !== "—" && (
                                      <span className={`font-bold px-2 py-1 rounded-lg border ${parseFloat(avg)>=4?"bg-teal-50 text-teal-700 border-teal-200":parseFloat(avg)>=3?"bg-amber-50 text-amber-700 border-amber-200":"bg-red-50 text-red-700 border-red-200"}`}>
                                        FFI: {avg}
                                      </span>
                                    )}
                                    <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded-lg px-2 py-1 font-semibold">✓ Approved</span>
                                  </div>
                                </div>
                                <button onClick={() => handleDownload(sub._id)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-sm">
                                  <Download size={12} /> Download PDF
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
