import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';

export default function StatsBar({ total, processed, pending, errors, totalAppreciation, totalAttention }) {
  const stats = [
    { label: 'Total Reports', value: total, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Processed', value: processed, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Errors', value: errors, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Appreciation 🔴', value: totalAppreciation, icon: Star, color: 'text-red-600 bg-red-50' },
    { label: 'Attention 🟡', value: totalAttention, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
