const express = require('express');
const router = express.Router();
const FacultyReport = require('../models/FacultyReport');
const { authMiddleware, requireRole } = require('./middleware');
const { testGeminiConnection, analyzeCommentsWithAI } = require('../services/aiAnalyzer');
const { log } = require('../services/logger');

// Test AI connection
router.get('/ai/test', authMiddleware, async (req, res) => {
  const result = await testGeminiConnection();
  res.json(result);
});

// Re-analyze report using AI
router.post('/:id/ai-analyze', authMiddleware, async (req, res) => {
  try {
    const report = await FacultyReport.findOne({ _id: req.params.id, hodId: req.user.id });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    const allComments = [...(report.appreciation || []), ...(report.commentsNeedingAttention || []), ...(req.body.extraComments || [])].filter(Boolean);
    if (allComments.length === 0) return res.status(400).json({ error: 'No comments to analyze' });
    const aiResult = await analyzeCommentsWithAI(allComments);
    const updated = await FacultyReport.findByIdAndUpdate(report._id, {
      appreciation: aiResult.appreciation,
      commentsNeedingAttention: aiResult.commentsNeedingAttention,
      appreciationCount: aiResult.appreciation.length,
      attentionCount: aiResult.commentsNeedingAttention.length
    }, { new: true });
    res.json({ report: updated, aiResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fix metadata from PDFs
router.post('/my/fix-metadata', authMiddleware, async (req, res) => {
  try {
    const reports = await FacultyReport.find({ hodId: req.user.id, driveLink: { $exists: true, $ne: '' } });
    let fixed = 0;
    for (const report of reports) {
      try {
        const response = await require('axios').get(require('../services/pdfAnalyzer').convertDriveLink(report.driveLink), {
          responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5
        });
        const meta = await require('../services/pdfAnalyzer').extractMetaFromPDF(Buffer.from(response.data));
        if (meta.facultyName) {
          await FacultyReport.findByIdAndUpdate(report._id, {
            facultyName: meta.facultyName,
            subjectCode: meta.subjectCode || report.subjectCode,
            programme: meta.programme || report.programme,
            semester: meta.semester || report.semester,
            ffiScore: meta.ffiScore ?? report.ffiScore
          });
          fixed++;
        }
      } catch {}
    }
    res.json({ fixed, total: reports.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all reports for HOD
router.delete('/my/all', authMiddleware, async (req, res) => {
  try {
    const result = await FacultyReport.deleteMany({ hodId: req.user.id });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send report to faculty
router.post('/:id/send-to-faculty', authMiddleware, async (req, res) => {
  try {
    const report = await FacultyReport.findOneAndUpdate(
      { _id: req.params.id, hodId: req.user.id },
      { status: 'sent_to_faculty', sentToFacultyAt: new Date() },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
    log(req.user.id, 'sent_to_faculty', `Report sent to faculty: ${report.facultyName}`, { reportId: report._id }, 'success');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update editable fields
router.patch('/:id/edit', authMiddleware, async (req, res) => {
  try {
    const { programme, semester, goodComments, badComments, hodRemarks, facultyName, subjectCode } = req.body;
    const update = {};
    if (programme !== undefined) update.programme = programme;
    if (semester !== undefined) update.semester = semester;
    if (goodComments !== undefined) update.goodComments = goodComments;
    if (badComments !== undefined) update.badComments = badComments;
    if (hodRemarks !== undefined) update.hodRemarks = hodRemarks;
    if (facultyName !== undefined) update.facultyName = facultyName;
    if (subjectCode !== undefined) update.subjectCode = subjectCode;
    const report = await FacultyReport.findOneAndUpdate(
      { _id: req.params.id, hodId: req.user.id },
      update,
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faculty: Get their reports
router.get('/faculty/my', authMiddleware, async (req, res) => {
  try {
    const reports = await FacultyReport.find({
      $or: [
        { facultyUserId: req.user.id },
        { facultyName: { $regex: req.user.name, $options: 'i' }, status: { $in: ['sent_to_faculty', 'faculty_approved'] } }
      ]
    }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faculty: Acknowledge report
router.post('/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    const report = await FacultyReport.findByIdAndUpdate(
      req.params.id,
      { facultyAcknowledged: true, facultyAcknowledgedAt: new Date(), status: 'faculty_approved' },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
    log(report.hodId, 'faculty_approved', `Faculty acknowledged: ${report.facultyName}`, { reportId: report._id }, 'success');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reports for HOD
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { hodId: req.user.id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { facultyName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } }
      ];
    }
    const reports = await FacultyReport.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single report
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await FacultyReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update HOD remarks
router.patch('/:id/remarks', authMiddleware, async (req, res) => {
  try {
    const { hodRemarks } = req.body;
    const report = await FacultyReport.findOneAndUpdate(
      { _id: req.params.id, hodId: req.user.id },
      { hodRemarks },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VC: get submission reports
router.get('/submission/:submissionId', authMiddleware, requireRole('vc'), async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    const submission = await Submission.findById(req.params.submissionId).populate('reports');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
