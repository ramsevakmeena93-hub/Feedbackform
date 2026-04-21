const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const FacultyReport = require('../models/FacultyReport');
const { authMiddleware, requireRole } = require('./middleware');

// HOD: Send reports to VC
router.post('/send', authMiddleware, requireRole('hod'), async (req, res) => {
  try {
    const { reportIds, academicYear } = req.body;
    if (!reportIds?.length) return res.status(400).json({ error: 'No report IDs provided' });

    // Verify all reports belong to this HOD and are processed
    const reports = await FacultyReport.find({
      _id: { $in: reportIds },
      hodId: req.user.id,
      status: 'processed'
    });

    if (reports.length === 0) return res.status(400).json({ error: 'No processed reports found' });

    const submission = await Submission.create({
      hodId: req.user.id,
      reports: reports.map(r => r._id),
      academicYear: academicYear || new Date().getFullYear().toString(),
      status: 'submitted'
    });

    res.json({ message: 'Reports sent to VC successfully', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HOD: Get own submissions
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
      .populate('reports', 'facultyName subjectCode ffiScore goodCommentsCount badCommentsCount')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VC: Update submission status
router.patch('/:id/status', authMiddleware, requireRole('vc'), async (req, res) => {
  try {
    const { status, vcComment } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, vcComment },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
