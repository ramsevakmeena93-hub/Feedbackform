const mongoose = require('mongoose');

const facultyReportSchema = new mongoose.Schema({
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // linked faculty account

  // Core fields (editable by HOD)
  facultyName: { type: String, default: '' },
  subjectCode: { type: String, default: '' },
  programme: { type: String, default: '' },
  semester: { type: String, default: '' },
  pdfLink: { type: String, default: '' },
  driveLink: { type: String, default: '' },

  // AI + color-based analysis
  appreciation: [{ type: String }],
  commentsNeedingAttention: [{ type: String }],
  appreciationCount: { type: Number, default: 0 },
  attentionCount: { type: Number, default: 0 },
  ffiScore: { type: Number, default: null },

  // HOD editable fields
  hodRemarks: { type: String, default: '' },
  goodComments: [{ type: String }],   // HOD can edit/add
  badComments: [{ type: String }],    // HOD can edit/add

  // Faculty acknowledgment
  facultyAcknowledged: { type: Boolean, default: false },
  facultyAcknowledgedAt: { type: Date },
  sentToFacultyAt: { type: Date },

  status: { type: String, enum: ['pending', 'processed', 'error', 'sent_to_faculty', 'faculty_approved'], default: 'pending' },
  errorMessage: { type: String },
  analyzedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FacultyReport', facultyReportSchema);
