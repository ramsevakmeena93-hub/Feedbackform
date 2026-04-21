import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const STATUS_PILL = {
  processed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700"
};

function CommentList({ items, color }) {
  const [expanded, setExpanded] = useState(false);
  const dotColor = color === "red" ? "bg-red-500" : "bg-yellow-400";
  const tagBg = color === "red" ? "bg-red-50 border-red-200 text-red-800" : "bg-yellow-50 border-yellow-200 text-yellow-800";
  const btnColor = color === "red" ? "text-red-500 hover:text-red-700" : "text-yellow-600 hover:text-yellow-800";
  if (!items || items.length === 0) return <span className="text-xs text-gray-300 italic">None found</span>;
  const visible = expanded ? items : items.slice(0, 1);
  return (
    <div className="space-y-1 min-w-[180px] max-w-[260px]">
      {visible.map((text, i) => (
        <div key={i} className={"flex gap-1.5 items-start rounded-md border px-2 py-1 " + tagBg}>
          <span className={"mt-1 w-2 h-2 rounded-full shrink-0 " + dotColor}></span>
          <span className="text-xs leading-snug break-words">{text}</span>
        </div>
      ))}
      {items.length > 1 && (
        <button onClick={() => setExpanded(e => !e)} className={"flex items-center gap-1 text-xs font-medium mt-0.5 " + btnColor}>
          {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{items.length - 1} more</>}
        </button>
      )}
    </div>
  );
}

export default function FeedbackTable({ reports, selected, onSelect, okReviewed, onInlineOk, onSendToFaculty, onFieldEdit }) {
  const reviewed = okReviewed || new Set();
  const [editCell, setEditCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  function toggleSelect(id) {
    onSelect(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    const ids = reports.filter(r => r.status === "processed").map(r => r._id);
    onSelect(selected.length === ids.length ? [] : ids);
  }

  function startEdit(reportId, field, val) {
    setEditCell({ reportId, field });
    setEditValue(val || "");
  }

  function saveEdit() {
    if (editCell && onFieldEdit) onFieldEdit(editCell.reportId, editCell.field, editValue);
    setEditCell(null);
  }

  function EditableCell({ reportId, field, value, cls }) {
    const isEditing = editCell && editCell.reportId === reportId && editCell.field === field;
    if (isEditing) {
      return (
        <div className="flex gap-1 items-center">
          <input autoFocus className="border rounded px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            value={editValue} onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditCell(null); }} />
          <button onClick={saveEdit} className="text-green-600 text-xs font-bold">OK</button>
          <button onClick={() => setEditCell(null)} className="text-red-400 text-xs">X</button>
        </div>
      );
    }
    return (
      <span className={"cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 rounded px-1 " + (cls || "")}
        title="Click to edit" onClick={() => startEdit(reportId, field, value)}>
        {value || <span className="text-gray-300 italic text-xs">click to edit</span>}
      </span>
    );
  }

  if (reports.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">No reports yet. Upload PDFs to get started.</div>;
  }

  const processedIds = reports.filter(r => r.status === "processed").map(r => r._id);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" checked={selected.length === processedIds.length && processedIds.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              <th className="px-3 py-3 text-left">S.No</th>
              <th className="px-3 py-3 text-left">Name of Faculty</th>
              <th className="px-3 py-3 text-left">Code / Subject / Batch</th>
              <th className="px-3 py-3 text-left">Programme & Semester</th>
              <th className="px-3 py-3 text-left">FFI</th>
              <th className="px-3 py-3 text-left">Comments Needing Attention</th>
              <th className="px-3 py-3 text-left">Appreciation / Remark</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Faculty Status</th>
              <th className="px-3 py-3 text-left">Signature</th>
              <th className="px-3 py-3 text-left">View PDF</th>
              <th className="px-3 py-3 text-left">OK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report, idx) => (
              <tr key={report._id} className={"align-top hover:bg-gray-50 transition-colors " + (selected.includes(report._id) ? "bg-indigo-50" : "")}>
                <td className="px-3 py-3 pt-4">
                  <input type="checkbox" checked={selected.includes(report._id)} onChange={() => toggleSelect(report._id)} disabled={report.status !== "processed"} className="rounded" />
                </td>
                <td className="px-3 py-3 pt-4 text-gray-500 text-xs">{idx + 1}</td>
                <td className="px-3 py-3 pt-4 font-medium text-gray-800 whitespace-nowrap">
                  <EditableCell reportId={report._id} field="facultyName" value={report.facultyName} cls="font-medium" />
                </td>
                <td className="px-3 py-3 pt-4 text-gray-600 text-xs">
                  <div className="space-y-0.5">
                    <EditableCell reportId={report._id} field="subjectCode" value={report.subjectCode} cls="font-semibold text-gray-700 block" />
                    <EditableCell reportId={report._id} field="programme" value={report.programme} cls="text-gray-500 block" />
                  </div>
                </td>
                <td className="px-3 py-3 pt-4 text-gray-500 text-xs whitespace-nowrap">
                  <EditableCell reportId={report._id} field="semester" value={[report.programme, report.semester ? "Sem " + report.semester : ""].filter(Boolean).join(" - ") || ""} />
                </td>
                <td className="px-3 py-3 pt-4 text-center">
                  {report.status === "processed" && report.ffiScore != null ? (
                    <span className={"text-base font-bold " + (report.ffiScore >= 4 ? "text-green-600" : report.ffiScore >= 3 ? "text-yellow-600" : "text-red-600")}>
                      {report.ffiScore.toFixed(2)}
                    </span>
                  ) : <span className="text-xs text-gray-300">-</span>}
                </td>
                <td className="px-3 py-3">
                  {report.status === "processed" ? <CommentList items={report.commentsNeedingAttention} color="yellow" /> : <span className="text-xs text-gray-300">-</span>}
                </td>
                <td className="px-3 py-3">
                  {report.status === "processed" ? <CommentList items={report.appreciation} color="red" /> : <span className="text-xs text-gray-300">-</span>}
                </td>
                <td className="px-3 py-3 pt-4 whitespace-nowrap">
                  <span className={"px-2 py-1 rounded-full text-xs font-medium " + (STATUS_PILL[report.status] || "")}>
                    {report.status}
                  </span>
                  {report.status === "error" && report.errorMessage && (
                    <p className="text-xs text-red-400 mt-1 max-w-[120px] truncate" title={report.errorMessage}>{report.errorMessage}</p>
                  )}
                </td>
                <td className="px-3 py-3 pt-4 whitespace-nowrap">
                  {report.status === "faculty_approved" ? (
                    <span className="text-xs text-green-600 font-semibold">Approved</span>
                  ) : report.status === "sent_to_faculty" ? (
                    <span className="text-xs text-amber-600 font-medium">Pending</span>
                  ) : <span className="text-xs text-gray-300">-</span>}
                </td>
                <td className="px-3 py-3 pt-4">
                  <div className="flex flex-col gap-1">
                    <div className="border-b border-gray-400 w-28 mb-1"></div>
                    <span className="text-xs text-gray-600 font-medium">{report.facultyName || "-"}</span>
                    <span className="text-xs text-gray-400">Faculty Signature</span>
                  </div>
                </td>
                <td className="px-3 py-3 pt-4">
                  {report.driveLink ? (
                    <a href={report.driveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      View PDF
                    </a>
                  ) : <span className="text-xs text-gray-300">No link</span>}
                </td>
                <td className="px-3 py-3 pt-4">
                  {report.status === "processed" ? (
                    reviewed.has(report._id) ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-green-600 font-semibold">Reviewed</span>
                        {onSendToFaculty && report.status !== "sent_to_faculty" && report.status !== "faculty_approved" && (
                          <button onClick={() => onSendToFaculty(report._id)} className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition">
                            Send to Faculty
                          </button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => onInlineOk && onInlineOk(report._id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition">
                        OK
                      </button>
                    )
                  ) : report.status === "sent_to_faculty" ? (
                    <span className="text-xs text-teal-600 font-medium">Sent</span>
                  ) : report.status === "faculty_approved" ? (
                    <span className="text-xs text-green-600 font-medium">Faculty OK</span>
                  ) : <span className="text-xs text-gray-300">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
