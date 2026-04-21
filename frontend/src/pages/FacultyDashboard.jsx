import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { CheckCircle, Clock, ExternalLink, Eye } from 'lucide-react';

export default function FacultyDashboard() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(null);

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    try {
      const { data } = await api.get('/api/reports/faculty/my');
      setReports(data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(reportId) {
    if (!window.confirm('Confirm that you have read and acknowledged this feedback report?')) return;
    setAcknowledging(reportId);
    try {
      await api.post(`/api/reports/${reportId}/acknowledge`);
      toast.success('Report acknowledged successfully');
      fetchReports();
    } catch {
      toast.error('Failed to acknowledge');
    } finally {
      setAcknowledging(null);
    }
  }

  const pending = reports.filter(r => r.status === 'sent_to_faculty');
  const approved = reports.filter(r => r.status === 'faculty_approved');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Faculty Dashboard" subtitle={user?.name} />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl"><Clock className="text-amber-600" size={22} /></div>
            <div>
              <p className="text-xs text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-800">{pending.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl"><CheckCircle className="text-green-600" size={22} /></div>
            <div>
              <p className="text-xs text-gray-500">Acknowledged</p>
              <p className="text-2xl font-bold text-gray-800">{approved.length}</p>
            </div>
          </div>
        </div>

        {/* Reports */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading your reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <Eye size={40} className="mx-auto mb-3 opacity-30" />
            <p>No feedback reports sent to you yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, idx) => (
              <div key={report._id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
                report.status === 'faculty_approved' ? 'border-green-400' : 'border-amber-400'
              }`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                          #{idx + 1}
                        </span>
                        <h3 className="font-bold text-gray-800">{report.facultyName || user?.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          report.status === 'faculty_approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {report.status === 'faculty_approved' ? '✓ Acknowledged' : 'Pending Review'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {[report.subjectCode, report.programme, report.semester ? `Sem ${report.semester}` : '']
                          .filter(Boolean).join(' · ') || 'No details'}
                      </p>
                      {report.ffiScore != null && (
                        <p className="text-sm mt-1">
                          FFI Score: <span className={`font-bold ${
                            report.ffiScore >= 4 ? 'text-green-600' :
                            report.ffiScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{report.ffiScore.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {report.driveLink && (
                        <a href={report.driveLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                          <ExternalLink size={13} /> View PDF
                        </a>
                      )}
                      {report.status !== 'faculty_approved' && (
                        <button
                          onClick={() => handleAcknowledge(report._id)}
                          disabled={acknowledging === report._id}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                          {acknowledging === report._id ? 'Confirming...' : 'I have seen this'}
                        </button>
                      )}
                      {report.status === 'faculty_approved' && (
                        <span className="text-xs text-gray-400">
                          Acknowledged {report.facultyAcknowledgedAt
                            ? new Date(report.facultyAcknowledgedAt).toLocaleDateString()
                            : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  {(report.commentsNeedingAttention?.length > 0 || report.appreciation?.length > 0) && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {report.commentsNeedingAttention?.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <p className="text-xs font-semibold text-yellow-700 mb-2">
                            🟡 Comments Needing Attention ({report.commentsNeedingAttention.length})
                          </p>
                          <ul className="space-y-1">
                            {report.commentsNeedingAttention.map((t, i) => (
                              <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></span>{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.appreciation?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-xs font-semibold text-red-700 mb-2">
                            🔴 Appreciation ({report.appreciation.length})
                          </p>
                          <ul className="space-y-1">
                            {report.appreciation.map((t, i) => (
                              <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HOD Remarks */}
                  {report.hodRemarks && (
                    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                      <p className="text-xs text-indigo-600 font-medium">HOD Remarks:</p>
                      <p className="text-xs text-gray-700 mt-0.5">{report.hodRemarks}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
