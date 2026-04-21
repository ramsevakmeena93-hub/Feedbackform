import { ExternalLink, ChevronRight, X, Loader } from "lucide-react";

export default function CSVReviewModal({ currentData, currentIdx, total, processing, onOk, onClose }) {
  const isLast = currentIdx === total - 1;
  const progress = Math.round((currentIdx / total) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-indigo-50 rounded-t-2xl">
          <div>
            <h2 className="font-bold text-indigo-800 text-lg">Review PDF Reports</h2>
            <p className="text-xs text-indigo-500 mt-0.5">Read each report then click OK to confirm and load next</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-400">
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>S.No {currentIdx + 1} of {total}</span>
            <span>{progress}% done</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {processing ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader size={32} className="animate-spin text-indigo-500" />
              <p className="text-gray-500 text-sm">Loading PDF {currentIdx + 1}...</p>
              <p className="text-gray-400 text-xs">Downloading and analyzing from Google Drive</p>
            </div>
          ) : !currentData ? (
            <div className="text-center py-16 text-gray-400">Waiting...</div>
          ) : currentData.error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">Failed to load PDF {currentIdx + 1}</p>
              <p className="text-red-400 text-sm mt-1">Click OK to skip and continue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Faculty Info Card */}
              <div className="bg-gray-50 rounded-xl p-4 border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        S.No {currentIdx + 1}
                      </span>
                      <h3 className="font-bold text-gray-800 text-base">
                        {currentData.facultyName || "Unknown Faculty"}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {[currentData.subjectCode, currentData.programme,
                        currentData.semester ? `Sem ${currentData.semester}` : ""]
                        .filter(Boolean).join(" · ") || "No details"}
                    </p>
                  </div>
                  {currentData.ffiScore != null && (
                    <div className="text-right shrink-0">
                      <span className={`text-2xl font-bold ${
                        currentData.ffiScore >= 4 ? "text-green-600" :
                        currentData.ffiScore >= 3 ? "text-yellow-600" : "text-red-600"
                      }`}>{currentData.ffiScore.toFixed(2)}</span>
                      <p className="text-xs text-gray-400">FFI Score</p>
                    </div>
                  )}
                </div>
                {currentData.driveLink && (
                  <a href={currentData.driveLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2">
                    <ExternalLink size={12} /> View Full PDF
                  </a>
                )}
              </div>

              {/* Yellow — Attention */}
              <div className="rounded-xl border border-yellow-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border-b border-yellow-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                  <span className="text-sm font-semibold text-yellow-700">Comments Needing Attention</span>
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                    {currentData.commentsNeedingAttention?.length || 0}
                  </span>
                </div>
                <div className="p-4">
                  {!currentData.commentsNeedingAttention?.length ? (
                    <p className="text-xs text-gray-400 italic">None found</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentData.commentsNeedingAttention.map((t, i) => (
                        <li key={i} className="flex gap-2 items-start text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-yellow-400 shrink-0"></span>{t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Red — Appreciation */}
              <div className="rounded-xl border border-red-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-sm font-semibold text-red-700">Appreciation / Remark</span>
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {currentData.appreciation?.length || 0}
                  </span>
                </div>
                <div className="p-4">
                  {!currentData.appreciation?.length ? (
                    <p className="text-xs text-gray-400 italic">None found</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentData.appreciation.map((t, i) => (
                        <li key={i} className="flex gap-2 items-start text-sm text-gray-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0"></span>{t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                i < currentIdx ? "bg-green-400" :
                i === currentIdx ? "bg-indigo-500" : "bg-gray-200"
              }`} />
            ))}
          </div>
          <button
            onClick={onOk}
            disabled={processing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm"
          >
            {isLast ? "Done - All Reviewed" : "OK"}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
