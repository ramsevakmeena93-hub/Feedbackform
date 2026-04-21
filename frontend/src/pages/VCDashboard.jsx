import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

const STATUS_COLORS = {
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  reviewed: 'bg-purple-100 text-purple-700'
};

export default function VCDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { fetchSubmissions(); }, []);

  async function fetchSubmissions() {
    try {
      const { data } = await api.get('/api/submissions/all');
      setSubmissions(data);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    const vcComment = status === 'rejected' ? prompt('Enter rejection reason (optional):') : '';
    try {
      await api.patch(`/api/submissions/${id}/status`, { status, vcComment: vcComment || '' });
      toast.success(`Submission ${status}`);
      fetchSubmissions();
    } catch {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Vice Chancellor Dashboard" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-700">All HOD Submissions</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No submissions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">HOD</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Reports</th>
                    <th className="px-4 py-3 text-left">Avg FFI</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map(sub => {
                    const avgFFI = sub.reports?.length
                      ? (sub.reports.reduce((s, r) => s + (r.ffiScore || 0), 0) / sub.reports.length).toFixed(1)
                      : '-';
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{sub.hodId?.name}</td>
                        <td className="px-4 py-3 text-gray-500">{sub.hodId?.department || '-'}</td>
                        <td className="px-4 py-3">{sub.reports?.length || 0} reports</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${parseFloat(avgFFI) >= 7 ? 'text-green-600' : parseFloat(avgFFI) >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {avgFFI}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status]}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/vc/submission/${sub._id}`)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="View">
                              <Eye size={16} />
                            </button>
                            {sub.status === 'submitted' && (
                              <>
                                <button onClick={() => updateStatus(sub._id, 'approved')}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => updateStatus(sub._id, 'rejected')}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
