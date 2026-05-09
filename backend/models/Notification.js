const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who receives it
  type:    { type: String, enum: ['faculty_approved', 'vc_approved', 'vc_rejected'], required: true },
  message: { type: String, required: true },
  reportId:     { type: mongoose.Schema.Types.ObjectId, ref: 'FacultyReport', default: null },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission',    default: null },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
