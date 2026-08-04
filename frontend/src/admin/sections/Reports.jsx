import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Building2, GraduationCap, Calendar, School, Award, Trophy,
  FileText, Download, Loader2, ChevronRight
} from 'lucide-react';

const Reports = ({ token, user, isDark }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  
  // Form state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [department, setDepartment] = useState('all');
  const [format, setFormat] = useState('csv');
  const [includeAI, setIncludeAI] = useState(false);

  const reportTypes = [
    { id: 'dept', title: 'Department Report', desc: 'Performance by department', icon: Building2, color: 'indigo' },
    { id: 'faculty', title: 'Faculty Report', desc: 'Individual faculty analysis', icon: GraduationCap, color: 'emerald' },
    { id: 'semester', title: 'Semester Report', desc: 'Semester-wise breakdown', icon: Calendar, color: 'amber' },
    { id: 'college', title: 'College Overview', desc: 'Complete college summary', icon: School, color: 'violet' },
    { id: 'naac', title: 'NAAC Report', desc: 'NAAC accreditation format', icon: Award, color: 'blue' },
    { id: 'nba', title: 'NBA Report', desc: 'NBA criteria report', icon: Trophy, color: 'orange' },
  ];

  const handleGenerate = () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    toast.loading('Generating report...', { id: 'reportGen' });
    
    setTimeout(() => {
      // Mock CSV Data
      const csvContent = "data:text/csv;charset=utf-8,Report Type,Date,Status\n" +
        `${selectedReport.title},${new Date().toLocaleDateString()},Generated\n`;
      
      const newReport = {
        id: Date.now(),
        name: `${selectedReport.title} - ${new Date().toLocaleDateString()}`,
        generatedBy: user?.name || 'Admin',
        date: new Date().toISOString(),
        format: format.toUpperCase()
      };
      
      setRecentReports([newReport, ...recentReports]);
      
      // Trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `report_${selectedReport.id}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report ready!', { id: 'reportGen' });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate comprehensive reports and data exports</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Report Types Grid */}
        <div className="lg:w-7/12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportTypes.map((rt) => {
              const isSelected = selectedReport?.id === rt.id;
              return (
                <button
                  key={rt.id}
                  onClick={() => setSelectedReport(rt)}
                  className={`relative p-5 rounded-xl border transition-all text-left group overflow-hidden ${
                    isSelected 
                      ? `border-${rt.color}-500 ring-1 ring-${rt.color}-500 bg-${rt.color}-50/50 dark:bg-${rt.color}-900/10` 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div className={`absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4 text-${rt.color}-500 group-hover:scale-110 transition-transform duration-500`}>
                    <rt.icon className="w-24 h-24" />
                  </div>
                  
                  <div className={`inline-flex p-3 rounded-xl mb-4 bg-${rt.color}-100 dark:bg-${rt.color}-900/30 text-${rt.color}-600 dark:text-${rt.color}-400`}>
                    <rt.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${isSelected ? `text-${rt.color}-700 dark:text-${rt.color}-400` : 'text-slate-800 dark:text-white'}`}>
                    {rt.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 relative z-10">
                    {rt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Report Config */}
        <div className="lg:w-5/12">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-6">
            {!selectedReport ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <FileText className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-700" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Select a Report Type</h3>
                <p className="text-sm max-w-[250px]">Choose a report template from the left to configure and generate</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <selectedReport.icon className={`w-5 h-5 text-${selectedReport.color}-500`} />
                    {selectedReport.title} Configuration
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set parameters for your report</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">From Date</label>
                      <input 
                        type="date" 
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">To Date</label>
                      <input 
                        type="date" 
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    >
                      <option value="all">All Departments</option>
                      <option value="CSE">Computer Science</option>
                      <option value="IT">Information Technology</option>
                      <option value="ECE">Electronics</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Export Format</label>
                    <div className="flex gap-3">
                      {['pdf', 'csv', 'excel'].map((fmt) => (
                        <label key={fmt} className="flex-1">
                          <input 
                            type="radio" 
                            name="format" 
                            value={fmt} 
                            checked={format === fmt}
                            onChange={(e) => setFormat(e.target.value)}
                            className="sr-only peer"
                          />
                          <div className="text-center px-3 py-2 text-sm uppercase rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer text-slate-600 dark:text-slate-400 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 peer-checked:border-indigo-500 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-400 transition-colors">
                            {fmt}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeAI}
                      onChange={(e) => setIncludeAI(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">Include AI Summary</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add an AI-generated executive summary</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Download className="w-5 h-5" /> Generate {format.toUpperCase()}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Reports</h3>
        </div>
        
        {recentReports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No reports generated in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Report Name</th>
                  <th className="px-6 py-4 font-medium">Generated By</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Format</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {report.name}
                    </td>
                    <td className="px-6 py-4">{report.generatedBy}</td>
                    <td className="px-6 py-4">{new Date(report.date).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                        Download <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
