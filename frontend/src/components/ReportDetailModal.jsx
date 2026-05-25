import { useState } from "react";
import { X, FileText, User, BarChart3, CheckCircle2, Clock, AlertCircle, ExternalLink, ThumbsUp, AlertTriangle, Zap } from "lucide-react";

const STATUS_CFG = {
  processed:        { color:"bg-emerald-100 text-emerald-700 border-emerald-200", icon:CheckCircle2, label:"Processed" },
  pending:          { color:"bg-slate-100 text-slate-600 border-slate-200",       icon:Clock,        label:"Pending" },
  error:            { color:"bg-red-100 text-red-700 border-red-200",             icon:AlertCircle,  label:"Error" },
  sent_to_faculty:  { color:"bg-indigo-100 text-indigo-700 border-indigo-200",    icon:Clock,        label:"Sent to Faculty" },
  faculty_approved: { color:"bg-emerald-100 text-emerald-700 border-emerald-200", icon:CheckCircle2, label:"Faculty Approved" },
};

export default function ReportDetailModal({ report, onClose, onApprove, onSendToFaculty, onHODApprove }) {
  if (!report) return null;

  const [showApproveForm, setShowApproveForm] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isEligibleForHODApprove = report.status === "sent_to_faculty" && report.sentToFacultyAt && (new Date() - new Date(report.sentToFacultyAt) >= 24 * 60 * 60 * 1000);

  const st = STATUS_CFG[report.status] || STATUS_CFG.pending;
  const StatusIcon = st.icon;
  const ffi = report.ffiScore;
  const ffiColor = ffi == null ? "text-slate-400" : ffi >= 4 ? "text-emerald-600" : ffi >= 3 ? "text-amber-600" : "text-red-600";
  const ffiBg    = ffi == null ? "bg-slate-50"    : ffi >= 4 ? "bg-emerald-50"    : ffi >= 3 ? "bg-amber-50"    : "bg-red-50";

  const pcts = report.commentPercentages || {};
  const pctEntries = Object.entries(pcts).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]);
  const attComments = report.commentsNeedingAttention || [];
  const appComments = report.appreciation || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User size={22} className="text-white"/>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{report.facultyName || "—"}</h2>
              <p className="text-sm text-slate-500">{report.subjectCode || "—"} · {report.programme || "—"} · Sem {report.semester || "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
            <X size={18}/>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* Card 1: Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                  <StatusIcon size={16} className="text-slate-600"/>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ${st.color}`}>
                <StatusIcon size={13}/> {st.label}
              </span>
              {report.errorMessage && (
                <p className="text-xs text-red-500 mt-2 leading-snug">{report.errorMessage}</p>
              )}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Faculty ack.</span>
                  <span className={report.facultyAcknowledged ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                    {report.facultyAcknowledged ? "✓ Yes" : "Pending"}
                  </span>
                </div>
                {report.facultyAcknowledgedAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ack. date</span>
                    <span className="text-slate-600">{new Date(report.facultyAcknowledgedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Faculty Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <User size={16} className="text-indigo-600"/>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Faculty</p>
              </div>
              <p className="font-bold text-slate-900 text-sm mb-1">{report.facultyName || "—"}</p>
              <div className="space-y-1.5 mt-2">
                {[
                  ["Subject Code", report.subjectCode],
                  ["Programme",   report.programme],
                  ["Semester",    report.semester ? `Sem ${report.semester}` : "—"],
                ].map(([l,v]) => (
                  <div key={l} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-slate-700 font-medium">{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: PDF */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center">
                  <FileText size={16} className="text-rose-600"/>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">PDF</p>
              </div>
              {report.driveLink ? (
                <a href={report.driveLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors">
                  <ExternalLink size={13}/> View Feedback PDF
                </a>
              ) : (
                <p className="text-xs text-slate-400 italic">No PDF link</p>
              )}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Appreciation</span>
                  <span className="text-emerald-600 font-semibold">{report.appreciationCount || 0} comments</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Needs Attention</span>
                  <span className="text-amber-600 font-semibold">{report.attentionCount || 0} comments</span>
                </div>
              </div>
            </div>

            {/* Card 4: FFI Score */}
            <div className={`${ffiBg} border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 size={16} className={ffiColor}/>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">FFI Score</p>
              </div>
              <p className={`text-4xl font-black ${ffiColor} mb-1`}>
                {ffi != null ? ffi.toFixed(2) : "—"}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                {ffi == null ? "Not calculated" : ffi >= 4 ? "Excellent performance" : ffi >= 3 ? "Good performance" : "Needs improvement"}
              </p>
              {/* FFI bar */}
              {ffi != null && (
                <div className="w-full bg-white/60 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${ffi>=4?"bg-emerald-500":ffi>=3?"bg-amber-500":"bg-red-500"}`}
                    style={{ width: `${Math.min((ffi/5)*100, 100)}%` }}/>
                </div>
              )}
            </div>
          </div>

          {/* Analysis section removed */}

          {/* Action Taken */}
          {report.actionTaken && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Action Taken</p>
              <p className="text-sm text-slate-700 leading-relaxed">{report.actionTaken}</p>
            </div>
          )}

          {showApproveForm && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 mb-6 space-y-3 animate-fade-in text-left">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle size={16} /> Enter Action Taken / Approval Reason
              </div>
              <p className="text-xs text-amber-600">Please provide a valid action taken explanation. This will be stored on the report and visible to the VC and the Faculty member.</p>
              <textarea
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                placeholder="Describe action taken / reason for HOD approval..."
                rows={3}
                value={approvalReason}
                onChange={e => { setApprovalReason(e.target.value); if(e.target.value.trim()) setErrorMsg(""); }}
              />
              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowApproveForm(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!approvalReason.trim()) {
                      setErrorMsg("A valid Action Taken comment is required to approve.");
                      return;
                    }
                    onHODApprove(report._id, approvalReason);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Confirm Force Approve
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${st.color}`}>
              <StatusIcon size={12}/> {st.label}
            </span>
            {ffi != null && (
              <span className={`text-sm font-bold ${ffiColor}`}>FFI: {ffi.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-secondary btn-sm">Close</button>
            {report.status === "processed" && onSendToFaculty && (
              <button onClick={() => { onSendToFaculty(report._id); onClose(); }}
                className="btn btn-primary btn-sm flex items-center gap-1.5">
                <Zap size={13}/> Send to Faculty
              </button>
            )}
            {isEligibleForHODApprove && onHODApprove && !showApproveForm && (
              <button onClick={() => setShowApproveForm(true)}
                className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5">
                <CheckCircle2 size={13}/> HOD Approve
              </button>
            )}
            {report.status === "faculty_approved" && onApprove && (
              <button onClick={() => { onApprove(report._id); onClose(); }}
                className="btn btn-success btn-sm flex items-center gap-1.5">
                <CheckCircle2 size={13}/> Mark Ready
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
