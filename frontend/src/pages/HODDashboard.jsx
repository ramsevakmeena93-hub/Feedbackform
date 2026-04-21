import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FeedbackTable from '../components/FeedbackTable';
import StatsBar from '../components/StatsBar';
import PDFUploadModal from '../components/PDFUploadModal';
import CSVReviewModal from '../components/CSVReviewModal';
import ActivityLog from '../components/ActivityLog';
import { Upload, Send, Search, FileText, Trash2 } from 'lucide-react';

export default function HODDashboard() {
  const { token, user } = useAuth();
  const csvRef = useRef();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [okReviewed, setOkReviewed] = useState(new Set());

  // CSV sequential review state
  const [csvLinks, setCsvLinks] = useState([]);     // all Drive links from CSV
  const [csvCurrentIdx, setCsvCurrentIdx] = useState(0); // which link we're on
  const [csvProcessing, setCsvProcessing] = useState(false); // loading current PDF
  const [csvCurrentData, setCsvCurrentData] = useState(null); // analyzed data for current
  const [showCsvReview, setShowCsvReview] = useState(false);

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/reports/my');
      setReports(data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Upload CSV → get list of Drive links → start sequential review
  async function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('csv', file);
    try {
      const { data } = await api.post('/api/process/upload-csv', formData);
      toast.success(`Found ${data.total} PDF links — starting review`);
      setCsvLinks(data.links);
      setCsvCurrentIdx(0);
      setCsvCurrentData(null);
      setShowCsvReview(true);
      // Load first PDF immediately
      loadPDF(data.links, 0);
    } catch (err) {
      toast.error(err.response?.data?.error || 'CSV upload failed');
    } finally {
      e.target.value = '';
    }
  }

  // Load and analyze a single PDF by index
  async function loadPDF(links, idx) {
    if (idx >= links.length) return;
    setCsvProcessing(true);
    setCsvCurrentData(null);
    try {
      const { data } = await api.post('/api/process/process-one', {
        pdfLink: links[idx],
        sno: idx + 1
      });
      setCsvCurrentData(data.report);
      // Add to reports list immediately
      setReports(prev => {
        const exists = prev.find(r => r._id === data.report._id);
        return exists ? prev : [...prev, data.report];
      });
    } catch (err) {
      toast.error(`Failed to load PDF ${idx + 1}: ${err.response?.data?.error || err.message}`);
      setCsvCurrentData({ error: true, sno: idx + 1 });
    } finally {
      setCsvProcessing(false);
    }
  }

  // HOD clicks OK → save current, load next
  function handleCsvOk() {
    const nextIdx = csvCurrentIdx + 1;
    if (nextIdx >= csvLinks.length) {
      // All done
      setShowCsvReview(false);
      toast.success(`All ${csvLinks.length} reports reviewed!`);
      // Auto-select all for sending to VC
      setSelected(reports.filter(r => r.status === 'processed').map(r => r._id));
      fetchReports();
    } else {
      setCsvCurrentIdx(nextIdx);
      loadPDF(csvLinks, nextIdx);
    }
  }

  function handleCsvClose() {
    setShowCsvReview(false);
    fetchReports();
  }

  async function handleSendToFaculty(reportId) {
    try {
      await api.post(`/api/reports/${reportId}/send-to-faculty`);
      toast.success('Report sent to faculty');
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send to faculty');
    }
  }

  async function handleSendToVC() {
    if (selected.length === 0) return toast.error('Select at least one report');
    try {
      await api.post('/api/submissions/send', {
        reportIds: selected,
        academicYear: new Date().getFullYear().toString()
      });
      toast.success('Reports sent to VC successfully');
      setSelected([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send');
    }
  }

  async function clearAllReports() {
    if (!window.confirm('Delete all reports? This cannot be undone.')) return;
    try {
      const { data } = await api.delete('/api/reports/my/all');
      setReports([]);
      setSelected([]);
      setOkReviewed(new Set());
      toast.success(`Deleted ${data.deleted} reports`);
    } catch {
      toast.error('Failed to delete reports');
    }
  }

  async function fixMetadata() {
    toast('Re-extracting names from PDFs...', { icon: '🔄' });
    try {
      const { data } = await api.post('/api/reports/my/fix-metadata');
      toast.success(`Fixed ${data.fixed} of ${data.total} reports`);
      fetchReports();
    } catch {
      toast.error('Failed to fix metadata');
    }
  }

  async function handleFieldEdit(reportId, field, value) {
    try {
      await api.patch(`/api/reports/${reportId}/edit`, { [field]: value });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, [field]: value } : r));
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    }
  }

  function handleInlineOk(reportId) {
    setOkReviewed(prev => new Set([...prev, reportId]));
  }

  const filtered = reports.filter(r =>
    r.facultyName?.toLowerCase().includes(search.toLowerCase()) ||
    r.subjectCode?.toLowerCase().includes(search.toLowerCase())
  );

  const processed = reports.filter(r => r.status === 'processed');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="HOD Dashboard" subtitle={user?.department} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <StatsBar
          total={reports.length}
          processed={processed.length}
          pending={reports.filter(r => r.status === 'pending').length}
          errors={reports.filter(r => r.status === 'error').length}
          totalAppreciation={processed.reduce((s, r) => s + (r.appreciationCount || 0), 0)}
          totalAttention={processed.reduce((s, r) => s + (r.attentionCount || 0), 0)}
        />

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-3 items-center flex-wrap">

            {/* Direct PDF Upload */}
            <button onClick={() => setShowPDFModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
              <FileText size={16} /> Upload PDFs
            </button>

            {/* CSV Upload */}
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <button onClick={() => csvRef.current.click()}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
              <Upload size={16} /> Upload CSV
            </button>

            {/* Clear All */}
            {reports.length > 0 && (
              <button onClick={clearAllReports}
                className="flex items-center gap-2 bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm">
                <Trash2 size={16} /> Clear All ({reports.length})
              </button>
            )}

            {/* Fix Names — re-extract metadata from PDFs */}
            {reports.length > 0 && (
              <button onClick={fixMetadata}
                className="flex items-center gap-2 bg-white border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm">
                🔄 Fix Names
              </button>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder="Search faculty / subject..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={handleSendToVC} disabled={selected.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium">
              <Send size={16} /> Send to VC ({selected.length})
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading reports...</div>
        ) : (
          <FeedbackTable
            reports={filtered}
            selected={selected}
            onSelect={setSelected}
            okReviewed={okReviewed}
            onInlineOk={handleInlineOk}
            onSendToFaculty={handleSendToFaculty}
            onFieldEdit={handleFieldEdit}
          />
        )}
      </div>

      {/* Activity Log */}
      <ActivityLog token={token} />

      {/* PDF Upload Modal */}
      {showPDFModal && (
        <PDFUploadModal token={token} onClose={() => setShowPDFModal(false)}
          onUploaded={() => { setShowPDFModal(false); fetchReports(); }} />
      )}

      {/* CSV Sequential Review Modal */}
      {showCsvReview && (
        <CSVReviewModal
          currentData={csvCurrentData}
          currentIdx={csvCurrentIdx}
          total={csvLinks.length}
          processing={csvProcessing}
          onOk={handleCsvOk}
          onClose={handleCsvClose}
        />
      )}
    </div>
  );
}
