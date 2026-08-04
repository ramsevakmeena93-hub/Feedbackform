import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Building2, Users, Star, Plus, Upload, Edit, UserPlus, Trash2 } from 'lucide-react';

const DepartmentManagement = ({ token, user, isDark }) => {
  const [departments, setDepartments] = useState([]);
  
  useEffect(() => {
    // Mock data
    setDepartments([
      { id: 1, name: 'Computer Science and Engineering', hod: 'Dr. Alan Smith', facultyCount: 45, rating: 4.5 },
      { id: 2, name: 'Electronics and Communication', hod: 'Dr. Jane Doe', facultyCount: 38, rating: 4.2 },
      { id: 3, name: 'Mechanical Engineering', hod: null, facultyCount: 30, rating: 3.9 },
      { id: 4, name: 'Civil Engineering', hod: 'Dr. Robert Brow', facultyCount: 25, rating: 4.1 },
    ]);
  }, []);

  const totalDepts = departments.length;
  const withHod = departments.filter(d => d.hod).length;
  const avgFaculty = totalDepts ? (departments.reduce((acc, d) => acc + d.facultyCount, 0) / totalDepts).toFixed(0) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Department Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage academic departments and assigned HODs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast('Use CSV Upload for bulk import', { icon: 'ℹ️' })} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Upload size={18} /> Bulk Import
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus size={18} /> Create Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', val: totalDepts },
          { label: 'With HOD', val: withHod },
          { label: 'Without HOD', val: totalDepts - withHod, color: 'text-amber-500' },
          { label: 'Avg Faculty/Dept', val: avgFaculty },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 shadow-sm">
            <div className={`text-2xl font-bold ${stat.color || 'text-slate-800 dark:text-white'}`}>{stat.val}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Building2 size={24} />
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16}/></button>
                <button disabled={dept.facultyCount > 0} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{dept.name}</h3>
            
            <div className="flex-1 space-y-4 mt-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Head of Department</div>
                {dept.hod ? (
                  <div className="font-medium text-slate-700 dark:text-slate-200">{dept.hod}</div>
                ) : (
                  <div className="text-amber-500 text-sm font-medium">No HOD Assigned</div>
                )}
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Users size={16} /> <span className="text-sm">{dept.facultyCount} Faculty</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={16} className="fill-amber-500" /> <span>{dept.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-xl transition-colors">
                View Faculty
              </button>
              <button className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors">
                Assign HOD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;
