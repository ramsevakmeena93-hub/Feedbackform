const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FacultyReport' }],
  status: { type: String, enum: ['submitted', 'approved', 'rejected', 'reviewed'], default: 'submitted' },
  vcComment: { type: String, default: '' },
  department: { type: String, default: '' },
  academicYear: { type: String, default: '' },
  semester: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
