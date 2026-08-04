import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Plus, MoreVertical, Edit, UserCog, Building2, 
  Key, Ban, Trash2, Shield, Activity, ChevronDown, 
  ChevronUp, User, ShieldAlert, CheckCircle2
} from 'lucide-react';

const UserManagement = ({ token, user, isDark }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Modals state
  const [modalState, setModalState] = useState({ type: null, data: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration if API fails or isn't ready
      // const res = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      // setUsers(res.data);
      
      // Fallback mock data
      const mockUsers = Array.from({ length: 25 }, (_, i) => ({
        _id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: ['admin', 'hod', 'vc', 'faculty'][Math.floor(Math.random() * 4)],
        department: ['CSE', 'ECE', 'MECH', 'CIVIL'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.8 ? 'suspended' : 'active',
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 10000000).toISOString()
      }));
      setUsers(mockUsers);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Derived state
  const departments = ['all', ...new Set(users.map(u => u.department).filter(Boolean))];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchDept = deptFilter === 'all' || u.department === deptFilter;
      return matchSearch && matchRole && matchStatus && matchDept;
    }).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, search, roleFilter, statusFilter, deptFilter, sortConfig]);

  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedUsers(paginatedUsers.map(u => u._id));
    else setSelectedUsers([]);
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) setSelectedUsers([...selectedUsers, id]);
    else setSelectedUsers(selectedUsers.filter(uid => uid !== id));
  };

  const handleAction = async (action, data) => {
    const loadingToast = toast.loading('Processing...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // await axios.patch(`/api/admin/users/${data.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${action} successful!`, { id: loadingToast });
      setModalState({ type: null, data: null });
      fetchUsers();
    } catch (err) {
      toast.error('Action failed', { id: loadingToast });
    }
  };

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      hod: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      vc: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      faculty: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${colors[role] || 'bg-gray-100'}`}>
        {role}
      </span>
    );
  };

  const StatusBadge = ({ status }) => (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
      <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{status}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage all system users and roles</p>
        </div>
        <button 
          onClick={() => setModalState({ type: 'add' })}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search users..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="vc">VC</option>
            <option value="hod">HOD</option>
            <option value="faculty">Faculty</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
            {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer" onClick={() => handleSort('name')}>User Info</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Emp ID</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Joining Date</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="p-4"><div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400">No users found.</td>
                </tr>
              ) : (
                paginatedUsers.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                    <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={(e) => handleSelectOne(e, u._id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">EMP_{u._id.slice(-4).toUpperCase()}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{u.department || '-'}</td>
                    <td className="p-4"><RoleBadge role={u.role} /></td>
                    <td className="p-4"><StatusBadge status={u.status} /></td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right relative">
                      <button onClick={() => setActiveDropdown(activeDropdown === u._id ? null : u._id)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                      {activeDropdown === u._id && (
                        <div className="absolute right-8 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10 animate-in fade-in zoom-in duration-200">
                          <button onClick={() => setModalState({ type: 'edit', data: u })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"><Edit size={14}/> Edit</button>
                          <button onClick={() => setModalState({ type: 'role', data: u })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"><UserCog size={14}/> Change Role</button>
                          <button onClick={() => setModalState({ type: 'dept', data: u })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"><Building2 size={14}/> Transfer Dept</button>
                          <button onClick={() => setModalState({ type: 'pwd', data: u })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"><Key size={14}/> Reset Password</button>
                          <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                          <button onClick={() => setModalState({ type: 'status', data: u })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"><Ban size={14}/> {u.status === 'active' ? 'Suspend' : 'Activate'}</button>
                          <button onClick={() => setModalState({ type: 'delete', data: u })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14}/> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div>Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</div>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700">Prev</button>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">{page}</span>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalState.type && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{modalState.type.replace('_', ' ')} User</h3>
              <button onClick={() => setModalState({ type: null })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
            </div>
            
            {modalState.type === 'delete' ? (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete <strong>{modalState.data.name}</strong>? This action cannot be undone.</p>
                <input type="text" placeholder="Type DELETE to confirm" className="w-full px-4 py-2 rounded-xl border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" />
                <button onClick={() => handleAction('Delete', modalState.data)} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl">Confirm Delete</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Form fields go here based on modal type...</p>
                <button onClick={() => handleAction('Save', modalState.data)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl">Save Changes</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
