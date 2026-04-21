import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CommentBadge from '../components/CommentBadge';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SubmissionDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/reports/submission/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setSubmission(data))
      .catch(() => toast.error('Failed to load submission'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!submission) return <div className="text-center mt-20 text-gray-500">Submission not found</div>;

  const chartData = submission.reports?.map(r => ({
    name: r.facultyName?.split(' ')[0] || 'Faculty',
    FFI: r.ffiScore || 0,
    Good: r.goodCommentsCount || 0,
    Bad: r.badCommentsCount || 0
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Submission Detail" />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">FFI Score by Faculty</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="FFI" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.FFI >= 7 ? '#22c55e' : entry.FFI >= 5 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-700">Faculty Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">S.No</th>
                  <th className="px-4 py-3 text-left">Faculty Name</th>
                  <th className="px-4 py-3 text-left">Subject Code</th>
                  <th className="px-4 py-3 text-left">Programme</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left">FFI</th>
                  <th className="px-4 py-3 text-left">Comments</th>
                  <th className="px-4 py-3 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submission.reports?.map((r, idx) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.facultyName}</td>
                    <td className="px-4 py-3">{r.subjectCode}</td>
                    <td className="px-4 py-3 text-gray-500">{r.programme || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.semester || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${r.ffiScore >= 7 ? 'text-green-600' : r.ffiScore >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {r.ffiScore?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <CommentBadge type="good" count={r.goodCommentsCount} />
                        <CommentBadge type="bad" count={r.badCommentsCount} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{r.hodRemarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VC Comment */}
        {submission.vcComment && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm font-medium text-purple-700">VC Comment</p>
            <p className="text-sm text-purple-600 mt-1">{submission.vcComment}</p>
          </div>
        )}
      </div>
    </div>
  );
}
