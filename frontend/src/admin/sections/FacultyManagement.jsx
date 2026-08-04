import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Check, X, Eye, FileText, Image as ImageIcon, Award
} from 'lucide-react';

const FacultyManagement = ({ token, user, isDark }) => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFaculty = async () => {
      setLoading(true);
      try {
        // Mock data for demonstration
        const mockFaculty = Array.from({ length: 15 }, (_, i) => ({
          _id: `fac_${Math.random().toString(36).substr(2, 9)}`,
          name: `Faculty ${i + 1}`,
          email: `faculty${i + 1}@college.edu`,
          department: ['CSE', 'ECE', 'MECH', 'CIVIL'][Math.floor(Math.random() * 4)],
          status: Math.random() > 0.7 ? 'pending' : 'active',
          performanceRating: (Math.random() * 2 + 3).toFixed(1),
          feedbackCount: Math.floor(Math.random() * 100) + 10,
          signatureImage: Math.random() > 0.5 ? 'base64str' : null,
          qualification: ['Ph.D', 'M.Tech'][Math.floor(Math.random() * 2)]
        }));
        setFaculty(mockFaculty);
      } catch (error) {
        toast.error('Failed to fetch faculty');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [token]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage faculty members, approvals, and performance</p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Faculty Info</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department & Qual.</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Performance</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Signature</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
              ) : faculty.map(f => (
                <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-white">{f.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{f.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-700 dark:text-slate-300">{f.department}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{f.qualification}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Award size={16} /> <span className="font-medium text-slate-700 dark:text-slate-300">{f.performanceRating}</span>
                      <span className="text-xs text-slate-400 ml-1">({f.feedbackCount})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {f.signatureImage ? (
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center cursor-pointer">
                        <ImageIcon size={14} className="text-slate-500" />
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-md">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {f.status === 'pending' && (
                        <>
                          <button className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={16}/></button>
                          <button className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={16}/></button>
                        </>
                      )}
                      <button className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><FileText size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;
