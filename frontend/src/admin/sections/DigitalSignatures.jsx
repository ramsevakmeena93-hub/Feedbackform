import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  LayoutGrid, List, Search, Filter, CheckCircle, XCircle, 
  Trash2, Download, Eye, AlertCircle, Bell, X
} from 'lucide-react';

const DigitalSignatures = ({ token, user, isDark }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [previewUser, setPreviewUser] = useState(null);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mocking API call to GET /api/admin/users
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Mock Data
        const mockUsers = Array.from({ length: 12 }).map((_, i) => ({
          _id: `usr_${i}`,
          name: `Faculty Member ${i + 1}`,
          role: i % 5 === 0 ? 'HOD' : 'Faculty',
          department: ['CSE', 'IT', 'ECE'][i % 3],
          signatureImage: i % 4 !== 0 ? `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=` : null,
          signatureStatus: i % 4 === 0 ? 'not_uploaded' : i % 3 === 0 ? 'pending' : i % 7 === 0 ? 'rejected' : 'verified',
          uploadDate: new Date(Date.now() - i * 86400000).toISOString()
        }));
        setUsers(mockUsers);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleStatusUpdate = (userId, newStatus) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, signatureStatus: newStatus } : u));
    toast.success(`Signature marked as ${newStatus}`);
    if (previewUser && previewUser._id === userId) setPreviewUser(null);
  };

  const handleSendReminder = () => {
    toast.success('Reminders sent to all pending users');
  };

  const filteredUsers = users.filter(u => {
    const rMatch = roleFilter === 'all' || u.role.toLowerCase() === roleFilter;
    const sMatch = statusFilter === 'all' || u.signatureStatus === statusFilter;
    return rMatch && sMatch;
  });

  const withSig = users.filter(u => u.signatureImage);
  const missingSig = users.filter(u => !u.signatureImage);
  
  const stats = {
    total: withSig.length,
    verified: withSig.filter(u => u.signatureStatus === 'verified').length,
    pending: withSig.filter(u => u.signatureStatus === 'pending').length,
    rejected: withSig.filter(u => u.signatureStatus === 'rejected').length,
    missing: missingSig.length
  };

  const getStatusBadge = (status) => {
    const config = {
      verified: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Verified' },
      pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Pending Review' },
      rejected: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', label: 'Rejected' },
      not_uploaded: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Not Uploaded' }
    };
    const c = config[status] || config.not_uploaded;
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Digital Signatures</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and verify faculty digital signatures</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Uploaded</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mb-1">Verified</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.verified}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.rejected}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Missing</p>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.missing}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
        </div>
        
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
        >
          <option value="all">All Roles</option>
          <option value="hod">HOD</option>
          <option value="faculty">Faculty</option>
        </select>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredUsers.filter(u => u.signatureImage).map(user => (
                <div key={user._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white truncate">{user.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.role} • {user.department}</p>
                    </div>
                    {getStatusBadge(user.signatureStatus)}
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 flex-grow flex items-center justify-center min-h-[120px]">
                    <div className="bg-white p-2 rounded border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setPreviewUser(user)}>
                      <img src={user.signatureImage} alt="Signature" className="w-[160px] h-[60px] object-contain" />
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400">Uploaded {new Date(user.uploadDate).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {user.signatureStatus === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(user._id, 'verified')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(user._id, 'rejected')} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setPreviewUser(user)} className="p-1.5 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded" title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Signature</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.filter(u => u.signatureImage).map(user => (
                    <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.department}</td>
                      <td className="px-6 py-4">
                        <div className="bg-white w-[100px] h-[40px] border border-slate-200 rounded flex items-center justify-center p-1 cursor-pointer" onClick={() => setPreviewUser(user)}>
                          <img src={user.signatureImage} alt="sig" className="max-h-full max-w-full" />
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.signatureStatus)}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(user.uploadDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.signatureStatus === 'pending' && (
                            <>
                              <button onClick={() => handleStatusUpdate(user._id, 'verified')} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"><CheckCircle className="w-5 h-5" /></button>
                              <button onClick={() => handleStatusUpdate(user._id, 'rejected')} className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded"><XCircle className="w-5 h-5" /></button>
                            </>
                          )}
                          <button onClick={() => setPreviewUser(user)} className="p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded"><Eye className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Missing Signatures Section */}
          {missingSig.length > 0 && (
            <div className="mt-8 border border-amber-200 dark:border-amber-900/50 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 flex justify-between items-center border-b border-amber-100 dark:border-amber-900/50">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Missing Signatures ({missingSig.length})</h3>
                </div>
                <button onClick={handleSendReminder} className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors">
                  <Bell className="w-4 h-4" /> Send Reminders
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {missingSig.map(u => (
                    <span key={u._id} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-slate-200 dark:border-slate-700">
                      {u.name} <span className="text-xs text-slate-400 ml-1">({u.department})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Signature Preview</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{previewUser.name} - {previewUser.role}</p>
              </div>
              <button onClick={() => setPreviewUser(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex items-center justify-center bg-slate-100 dark:bg-slate-950/50 min-h-[300px]">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <img src={previewUser.signatureImage} alt="Full Signature" className="w-[400px] h-[150px] object-contain" />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <div className="flex gap-2">
                {previewUser.signatureStatus === 'pending' && (
                  <>
                    <button onClick={() => handleStatusUpdate(previewUser._id, 'verified')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Verify & Approve
                    </button>
                    <button onClick={() => handleStatusUpdate(previewUser._id, 'rejected')} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 text-sm font-medium rounded-lg transition-colors">
                      Reject
                    </button>
                  </>
                )}
                {previewUser.signatureStatus !== 'pending' && (
                  <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium capitalize">
                    Current Status: {previewUser.signatureStatus}
                  </span>
                )}
              </div>
              
              <a href={previewUser.signatureImage} download={`signature_${previewUser.name.replace(/\s+/g, '_')}.png`} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Download PNG
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalSignatures;
