import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Plus, MoreVertical, Check, X, ShieldAlert, FileText, Settings, Users, Building } from 'lucide-react';

const RolePermissions = ({ isDark }) => {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Admin', type: 'system', users: 3 },
    { id: 'vc', name: 'Vice Chancellor', type: 'system', users: 1 },
    { id: 'hod', name: 'HOD', type: 'system', users: 12 },
    { id: 'faculty', name: 'Faculty', type: 'system', users: 156 },
    { id: 'dean', name: 'Dean', type: 'custom', users: 4 },
  ]);
  const [activeRole, setActiveRole] = useState('admin');

  const permissionGroups = [
    {
      group: 'User Management',
      icon: Users,
      perms: [
        { id: 'view_users', name: 'View Users', desc: 'Can view user list' },
        { id: 'edit_users', name: 'Edit Users', desc: 'Can modify user details' },
        { id: 'delete_users', name: 'Delete Users', desc: 'Can permanently delete users' },
      ]
    },
    {
      group: 'Content & Reports',
      icon: FileText,
      perms: [
        { id: 'view_feedback', name: 'View Feedback', desc: 'Can view submitted feedback' },
        { id: 'export_reports', name: 'Export Reports', desc: 'Can download CSV/PDF reports' },
      ]
    },
    {
      group: 'System Settings',
      icon: Settings,
      perms: [
        { id: 'manage_settings', name: 'Manage Settings', desc: 'Can change global settings' },
        { id: 'view_audit', name: 'View Audit Logs', desc: 'Can see system activity logs' },
      ]
    }
  ];

  const handleSave = () => {
    toast.success('Permissions saved successfully');
  };

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Role & Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage access control and role capabilities</p>
        </div>
        <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl transition-colors shadow-sm">
          Save Changes
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Left Panel: Roles */}
        <div className="w-full md:w-80 flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="font-semibold text-slate-800 dark:text-white">Roles</h2>
            <button className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-600"><Plus size={16}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${activeRole === role.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.type === 'system' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className={`font-medium ${activeRole === role.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{role.name}</div>
                    <div className="text-xs text-slate-500">{role.users} users</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md ${role.type === 'system' ? 'bg-slate-100 text-slate-500 dark:bg-slate-700' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30'}`}>
                    {role.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Permissions */}
        <div className="flex-1 flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Permissions for <span className="text-indigo-600">{roles.find(r => r.id === activeRole)?.name}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure what users with this role can access and do.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {permissionGroups.map(group => (
              <div key={group.group}>
                <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">
                  <group.icon size={18} className="text-indigo-500" /> {group.group}
                </div>
                <div className="space-y-3">
                  {group.perms.map(perm => (
                    <div key={perm.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 transition-colors">
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-200">{perm.name}</div>
                        <div className="text-sm text-slate-500">{perm.desc}</div>
                      </div>
                      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                        <button className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeRole === 'admin' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                          Allow
                        </button>
                        <button className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeRole !== 'admin' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
