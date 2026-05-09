import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import StatsBar from "../components/StatsBar";
import PDFUploadModal from "../components/PDFUploadModal";
import CSVReviewModal from "../components/CSVReviewModal";
import Footer from "../components/Footer";
import { Upload, Send, Trash2, RefreshCw, Wrench, Users, Plus, Download, Archive, X, ChevronRight } from "lucide-react";

const SEMESTERS = ["1","2","3","4","5","6","7","8"];
const YEARS = Array.from({length:6},(_,i)=>`${2023+i}-${2024+i}`);

export default function HODDashboard() {
  const { token, user, logout } = useAuth();
  const csvRef = useRef();

  const [tab, setTab]                   = useState("reports"); // "reports" | "records"
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState([]);
  const [submissions, setSubmissions]   = useState([]);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [okReviewed, setOkReviewed]     = useState(new Set());
  const [vcUser, setVcUser]             = useState(null);

  // CSV session info modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [pendingFile, setPendingFile]           = useState(null);
  const [sessionInfo, setSessionInfo]           = useState({ department: "", academicYear: YEARS[2], semester: "1" });

  // CSV review
  const [csvLinks, setCsvLinks]               = useState([]);
  const [csvCurrentIdx, setCsvCurrentIdx]     = useState(0);
  const [csvProcessing, setCsvProcessing]     = useState(false);
  const [csvCurrentData, setCsvCurrentData]   = useState(null);
  const [showCsvReview, setShowCsvReview]     = useState(false);
  const [currentSession, setCurrentSession]   = useState(null);

  // Records filter
  const [recYear, setRecYear]       = useState("");
  const [recSem, setRecSem]         = useState("");
  const [recStatus, setRecStatus]   = useState("");

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { fetchReports(); fetchSubmissions(); fetchVCUser(); }, []);

  async function fetchSubmissions() {
    try { const { data } = await api.get("/api/submissions/my"); setSubmissions(data); } catch {}
  }
  async function fetchVCUser() {
    try { const { data } = await api.get("/api/auth/vc-info"); setVcUser(data); } catch {}
  }
  async function fetchReports() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/reports/my");
      setReports(data);
      // Auto-select all faculty_approved reports
      const autoSelect = data.filter(r => r.status === "faculty_approved" || r.status === "processed").map(r => r._id);
      setSelected(autoSelect);
    }
    catch (err) {
      if (err.response?.status === 401) { toast.error("Session expired"); logout(); return; }
      toast.error("Failed to load reports");
    } finally { setLoading(false); }
  }

  // Step 1: intercept CSV file, show session modal first
  function handleCSVFileSelect(e) {
    const file = e.target.files[0]; if (!file) return;
    setPendingFile(file);
    setSessionInfo({ department: user?.department || "", academicYear: YEARS[2], semester: "1" });
    setShowSessionModal(true);
    e.target.value = "";
  }

  // Step 2: after session info confirmed, upload CSV
  async function handleSessionConfirm() {
    if (!sessionInfo.department.trim()) return toast.error("Please enter department name");
    if (!sessionInfo.academicYear) return toast.error("Please select academic year");
    if (!sessionInfo.semester) return toast.error("Please select semester");
    setShowSessionModal(false);
    setCurrentSession({ ...sessionInfo });
    const fd = new FormData(); fd.append("csv", pendingFile);
    try {
      const { data } = await api.post("/api/process/upload-csv", fd);
      toast.success(`Found ${data.total} PDF links`);
      setCsvLinks(data.links); setCsvCurrentIdx(0); setCsvCurrentData(null);
      setShowCsvReview(true); loadPDF(data.links, 0);
    } catch (err) {
      if (err.response?.status === 401) { toast.error("Session expired"); logout(); return; }
      toast.error(err.response?.data?.error || "CSV upload failed");
    }
  }

  async function loadPDF(links, idx) {
    if (idx >= links.length) return;
    setCsvProcessing(true); setCsvCurrentData(null);
    try {
      const { data } = await api.post("/api/process/process-one", { pdfLink: links[idx], sno: idx + 1 });
      // Tag report with session info
      if (currentSession) {
        await api.patch(`/api/reports/${data.report._id}/edit`, {
          academicYear: currentSession.academicYear,
          semester: currentSession.semester
        }).catch(() => {});
      }
      setCsvCurrentData(data.report);
      setReports(prev => { const ex = prev.find(r => r._id === data.report._id); return ex ? prev : [...prev, data.report]; });
    } catch (err) {
      if (err.response?.status === 401) { toast.error("Session expired"); logout(); return; }
      toast.error(`Failed to load PDF ${idx + 1}`); setCsvCurrentData({ error: true, sno: idx + 1 });
    } finally { setCsvProcessing(false); }
  }

  function handleCsvOk() {
    const next = csvCurrentIdx + 1;
    if (next >= csvLinks.length) {
      setShowCsvReview(false); toast.success(`All ${csvLinks.length} reports reviewed!`);
      setSelected(reports.filter(r => r.status === "processed").map(r => r._id)); fetchReports();
    } else { setCsvCurrentIdx(next); loadPDF(csvLinks, next); }
  }

  async function handleSendToVC() {
    if (selected.length === 0) return toast.error("Select at least one report");
    const notApproved = reports.filter(r => selected.includes(r._id) && r.status !== "faculty_approved");
    let force = false;
    if (notApproved.length > 0) {
      const names = notApproved.map(r => r.facultyName || "Unknown").join(", ");
      if (!window.confirm(`${notApproved.length} report(s) not yet approved by faculty:\n${names}\n\nSend anyway?`)) return;
      force = true;
    }
    try {
      await api.post("/api/submissions/send", {
        reportIds: selected,
        academicYear: currentSession?.academicYear || new Date().getFullYear().toString(),
        department: currentSession?.department || user?.department || "",
        semester: currentSession?.semester || "",
        force
      });
      toast.success("Reports sent to VC successfully"); setSelected([]);
      fetchSubmissions();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to send"); }
  }

  async function handleBulkSendToFaculty() {
    const ids = reports.filter(r => r.status === "processed").map(r => r._id);
    if (ids.length === 0) return toast.error("No processed reports to send");
    try {
      const { data } = await api.post("/api/reports/bulk-send-to-faculty", { reportIds: ids });
      toast.success(`Sent ${data.sent} reports to faculty`); fetchReports();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  }

  function handleExportCSV() {
    fetch("/api/reports/my/export", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "feedback-reports.csv"; a.click();
        URL.revokeObjectURL(url);
      });
    toast.success("Downloading CSV...");
  }

  async function handleSendToFaculty(reportId) {
    try { await api.post(`/api/reports/${reportId}/send-to-faculty`); toast.success("Report sent to faculty"); fetchReports(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to send"); }
  }

  async function handleDownloadPDF(subId) {
    toast.loading("Generating combined PDF...", { id: "pdf-dl" });
    try {
      const res = await fetch(`/api/submissions/${subId}/download-pdf`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || "PDF not available", { id: "pdf-dl" }); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `feedback-report-${subId}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { id: "pdf-dl" });
    } catch { toast.error("Failed to download PDF", { id: "pdf-dl" }); }
  }
  async function handleHODApprove(reportId) {
    try {
      await api.patch(`/api/reports/${reportId}/edit`, { status: "faculty_approved" });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: "faculty_approved" } : r));
      toast.success("Report approved by HOD");
    } catch { toast.error("Failed to approve"); }
  }
  async function handleFieldEdit(reportId, field, value) {
    try {
      await api.patch(`/api/reports/${reportId}/edit`, { [field]: value });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, [field]: value } : r));
    } catch { toast.error("Failed to update"); }
  }
  async function clearAllReports() {
    if (!window.confirm("Delete all reports? This cannot be undone.")) return;
    try {
      const { data } = await api.delete("/api/reports/my/all");
      setReports([]); setSelected([]); setOkReviewed(new Set());
      toast.success(`Deleted ${data.deleted} reports`);
    } catch { toast.error("Failed to delete"); }
  }
  async function fixMetadata() {
    toast("Re-extracting names from PDFs...", { icon: "🔄" });
    try {
      const { data } = await api.post("/api/reports/my/fix-metadata");
      toast.success(`Fixed ${data.fixed} of ${data.total} reports`); fetchReports();
    } catch { toast.error("Failed to fix metadata"); }
  }
  function handleInlineOk(reportId) {
    setOkReviewed(prev => new Set([...prev, reportId]));
    api.post(`/api/reports/${reportId}/send-to-faculty`)
      .then(() => { toast.success("Report sent to faculty dashboard"); fetchReports(); })
      .catch(err => toast.error("Failed: " + (err.response?.data?.error || err.message)));
  }

  const processed    = reports.filter(r => r.status === "processed");
  const approvedSubs = submissions.filter(s => s.status === "approved" || s.status === "rejected");

  // Records: filter submissions
  const filteredRecords = submissions.filter(s => {
    if (recYear   && s.academicYear !== recYear)   return false;
    if (recSem    && s.semester     !== recSem)     return false;
    if (recStatus && s.status       !== recStatus)  return false;
    return true;
  });

  const STATUS_COLOR = { approved:"bg-emerald-100 text-emerald-700", rejected:"bg-red-100 text-red-700", submitted:"bg-indigo-100 text-indigo-700", reviewed:"bg-slate-100 text-slate-600" };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="HOD Dashboard" subtitle={user?.department} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="page-title">Faculty Feedback Reports</h1>
            <p className="text-slate-500 text-sm mt-1">
              {currentSession
                ? `${currentSession.department} · ${currentSession.academicYear} · Semester ${currentSession.semester}`
                : `Academic Year 2025–26 · ${user?.department || "Department"}`}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* VC Notifications */}
        {approvedSubs.map(sub => (
          <div key={sub._id} className={`rounded-2xl px-5 py-3.5 flex items-center gap-3 text-sm font-medium border animate-slide-up ${sub.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <span>{sub.status === "approved" ? "✅" : "❌"}</span>
            <span>VC has <strong>{sub.status}</strong> your submission
              {sub.academicYear && <span className="ml-1 opacity-60">({sub.academicYear}{sub.semester ? ` · Sem ${sub.semester}` : ""})</span>}
            </span>
            {sub.vcComment && <span className="text-xs opacity-60 ml-1">— "{sub.vcComment}"</span>}
            {sub.status === "approved" && (
              <button onClick={() => handleDownloadPDF(sub._id)}
                className="ml-auto btn btn-success btn-sm flex items-center gap-1.5 shrink-0">
                <Download size={13} /> Download Final PDF
              </button>
            )}
          </div>
        ))}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          <button onClick={() => setTab("reports")}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${tab==="reports" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
            Reports
          </button>
          <button onClick={() => setTab("records")}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${tab==="records" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
            <Archive size={14} /> Records
            {submissions.filter(s=>s.status==="approved").length > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {submissions.filter(s=>s.status==="approved").length}
              </span>
            )}
          </button>
        </div>

        {/* ── REPORTS TAB ── */}
        {tab === "reports" && <>
          <StatsBar
            total={reports.length} processed={processed.length}
            pending={reports.filter(r => r.status === "pending").length}
            errors={reports.filter(r => r.status === "error").length}
            totalAppreciation={processed.reduce((s, r) => s + (r.appreciationCount || 0), 0)}
            totalAttention={processed.reduce((s, r) => s + (r.attentionCount || 0), 0)}
          />

          <div className="card px-5 py-3.5 flex flex-wrap gap-2 items-center justify-between animate-fade-in">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowPDFModal(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Upload PDFs
              </button>
              <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFileSelect} />
              <button onClick={() => csvRef.current.click()} className="btn btn-secondary btn-sm">
                <Upload size={14} /> Upload CSV
              </button>
              {reports.length > 0 && <>
                <button onClick={fixMetadata} className="btn btn-secondary btn-sm text-indigo-600">
                  <Wrench size={14} /> Fix Names
                </button>
                <button onClick={clearAllReports} className="btn btn-secondary btn-sm text-red-600">
                  <Trash2 size={14} /> Clear All
                </button>
              </>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={fetchReports} className="btn btn-ghost btn-sm">
                <RefreshCw size={14} /> Refresh
              </button>
              {processed.length > 0 && (
                <button onClick={handleBulkSendToFaculty} className="btn btn-secondary btn-sm text-teal-700">
                  <Users size={14} /> Send All to Faculty
                </button>
              )}
              {reports.length > 0 && (
                <button onClick={handleExportCSV} className="btn btn-secondary btn-sm text-emerald-700">
                  <Download size={14} /> Export CSV
                </button>
              )}
              <button onClick={handleSendToVC} disabled={selected.length === 0} className="btn btn-success btn-sm">
                <Send size={14} /> Send to VC {selected.length > 0 && `(${selected.length})`}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="card p-16 text-center animate-fade-in">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 text-sm font-medium">Loading reports...</p>
            </div>
          ) : (
            <div className="animate-slide-up">
              <FeedbackTable
                reports={reports} selected={selected} onSelect={setSelected}
                okReviewed={okReviewed} onInlineOk={handleInlineOk}
                onSendToFaculty={handleSendToFaculty} onHODApprove={handleHODApprove}
                onFieldEdit={handleFieldEdit} hodUser={user} vcUser={vcUser}
              />
            </div>
          )}
        </>}

        {/* ── RECORDS TAB ── */}
        {tab === "records" && (
          <div className="space-y-5 animate-fade-in">
            {/* Filter bar */}
            <div className="card px-5 py-4 flex flex-wrap gap-3 items-center">
              <p className="text-sm font-semibold text-slate-700 mr-2">Filter Records:</p>
              <select value={recYear} onChange={e => setRecYear(e.target.value)} className="input text-xs py-2 w-40">
                <option value="">All Years</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={recSem} onChange={e => setRecSem(e.target.value)} className="input text-xs py-2 w-36">
                <option value="">All Semesters</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              <select value={recStatus} onChange={e => setRecStatus(e.target.value)} className="input text-xs py-2 w-36">
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="submitted">Submitted</option>
                <option value="rejected">Rejected</option>
              </select>
              {(recYear || recSem || recStatus) && (
                <button onClick={() => { setRecYear(""); setRecSem(""); setRecStatus(""); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
              )}
              <span className="ml-auto text-xs text-slate-400">{filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}</span>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Archive size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-semibold">No records found</p>
                <p className="text-slate-400 text-sm mt-1">Approved submissions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map(sub => (
                  <div key={sub._id} className="card p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sub.status === "approved" ? "bg-emerald-100" : sub.status === "rejected" ? "bg-red-100" : "bg-indigo-100"}`}>
                          <Archive size={18} className={sub.status === "approved" ? "text-emerald-600" : sub.status === "rejected" ? "text-red-600" : "text-indigo-600"} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800 text-sm">
                              {sub.department || user?.department || "Department"}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[sub.status] || "bg-slate-100 text-slate-600"}`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                            {sub.academicYear && <span>📅 {sub.academicYear}</span>}
                            {sub.semester && <span>📚 Semester {sub.semester}</span>}
                            <span>📋 {sub.reports?.length || 0} reports</span>
                            <span>🕐 {new Date(sub.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                          {sub.vcComment && (
                            <p className="text-xs text-slate-500 mt-1 italic">VC: "{sub.vcComment}"</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        {sub.reports?.length > 0 && (
                          <div className="text-xs text-slate-500">
                            {(() => {
                              const ffis = (sub.reports || []).map(r => r.ffiScore).filter(Boolean);
                              const avg = ffis.length ? (ffis.reduce((s,v)=>s+v,0)/ffis.length).toFixed(2) : null;
                              return avg ? <span className={`font-bold text-sm ${parseFloat(avg)>=4?"text-emerald-600":parseFloat(avg)>=3?"text-amber-600":"text-red-600"}`}>Avg FFI: {avg}</span> : null;
                            })()}
                          </div>
                        )}
                        {sub.status === "approved" && (
                          <button onClick={() => handleDownloadPDF(sub._id)}
                            className="btn btn-success btn-sm flex items-center gap-1.5">
                            <Download size={12} /> Download PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* CSV Session Info Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Session Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enter details before processing the CSV</p>
              </div>
              <button onClick={() => setShowSessionModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Department Name</label>
                <input type="text" className="input" placeholder="e.g. Computer Science & Technology"
                  value={sessionInfo.department}
                  onChange={e => setSessionInfo(s => ({...s, department: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Academic Year</label>
                <select className="input" value={sessionInfo.academicYear}
                  onChange={e => setSessionInfo(s => ({...s, academicYear: e.target.value}))}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Semester</label>
                <select className="input" value={sessionInfo.semester}
                  onChange={e => setSessionInfo(s => ({...s, semester: e.target.value}))}>
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowSessionModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSessionConfirm} className="btn btn-primary flex-1">
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showPDFModal && (
        <PDFUploadModal token={token} onClose={() => setShowPDFModal(false)}
          onUploaded={() => { setShowPDFModal(false); fetchReports(); }} />
      )}
      {showCsvReview && (
        <CSVReviewModal currentData={csvCurrentData} currentIdx={csvCurrentIdx}
          total={csvLinks.length} processing={csvProcessing}
          onOk={handleCsvOk} onClose={() => { setShowCsvReview(false); fetchReports(); }} />
      )}
    </div>
  );
}
