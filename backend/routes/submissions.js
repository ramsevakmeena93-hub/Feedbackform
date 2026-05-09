const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const FacultyReport = require('../models/FacultyReport');
const { authMiddleware, requireRole } = require('./middleware');

// HOD: Send reports to VC
router.post('/send', authMiddleware, requireRole('hod'), async (req, res) => {
  try {
    const { reportIds, academicYear, department, semester, force } = req.body;
    if (!reportIds?.length) return res.status(400).json({ error: 'No report IDs provided' });

    const reports = await FacultyReport.find({
      _id: { $in: reportIds },
      hodId: req.user.id
    });

    if (reports.length === 0) return res.status(400).json({ error: 'No reports found' });

    // Check if all are faculty_approved — unless HOD forces send
    if (!force) {
      const notReady = reports.filter(r => r.status !== 'faculty_approved' && r.status !== 'processed');
      if (notReady.length > 0) {
        return res.status(400).json({
          error: `${notReady.length} report(s) are still pending processing.`,
          notApproved: notReady.map(r => ({ id: r._id, name: r.facultyName, status: r.status }))
        });
      }
    }

    const submission = await Submission.create({
      hodId: req.user.id,
      reports: reports.map(r => r._id),
      academicYear: academicYear || new Date().getFullYear().toString(),
      department: department || req.user.department || '',
      semester: semester || '',
      status: 'submitted'
    });

    res.json({ message: 'Reports sent to VC successfully', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HOD: Get own submissions with VC status
router.get('/my', authMiddleware, requireRole('hod'), async (req, res) => {
  try {
    const submissions = await Submission.find({ hodId: req.user.id })
      .populate('reports', 'facultyName subjectCode ffiScore status')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VC: Get all submissions
router.get('/all', authMiddleware, requireRole('vc'), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('hodId', 'name email department')
      .populate({
        path: 'reports',
        model: 'FacultyReport',
        select: 'facultyName subjectCode ffiScore status appreciationCount attentionCount commentsNeedingAttention appreciation commentPercentages actionTaken hodRemarks driveLink'
      })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VC: Update submission status + notify HOD
router.patch('/:id/status', authMiddleware, requireRole('vc'), async (req, res) => {
  try {
    const { status, vcComment } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, vcComment },
      { new: true }
    ).populate('hodId', 'name email');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download final PDF after VC approval
router.get('/:id/download-pdf', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('hodId', 'name email department signatureImage')
      .populate({ path:'reports', model:'FacultyReport' });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.status !== 'approved') return res.status(403).json({ error: 'PDF only available after VC approval' });

    const User = require('../models/User');
    const vcUser = await User.findOne({ role: 'vc' }).select('name signatureImage');

    // If submission has no populated reports, fetch all HOD reports as fallback
    let reportDocs = submission.reports || [];
    if (reportDocs.length === 0 || typeof reportDocs[0] === 'string' || !reportDocs[0].facultyName) {
      reportDocs = await FacultyReport.find({ hodId: submission.hodId._id || submission.hodId });
      console.log('[PDF] Fallback: loaded', reportDocs.length, 'reports from DB');
    }

    const { generateFeedbackReportPDF } = require('../services/pdfGenerator');

    const pdfBuffer = await generateFeedbackReportPDF({
      submission,
      reports: reportDocs,
      hodUser: submission.hodId,
      vcUser,
      approvedAt: submission.updatedAt
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="feedback-report-${submission._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF Gen]', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
