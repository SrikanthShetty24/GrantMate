const mongoose = require('mongoose');

// Application
const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  status: { type: String, enum: ['Saved', 'Applied'], default: 'Saved' },
  appliedAt: { type: Date },
}, { timestamps: true });

applicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

// Notification
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
  type: {
    type: String,
    enum: ['deadline', 'new_scholarship', 'status_update', 'system', 'deadline_email', 'new_scholarship_email'],
    required: true,
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// ApiFetchLog
const apiFetchLogSchema = new mongoose.Schema({
  fetchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiSource: { type: String, required: true },
  recordsFetched: { type: Number, default: 0 },
  recordsApproved: { type: Number, default: 0 },
  fetchStatus: { type: String, enum: ['success', 'failed', 'partial'], required: true },
  fetchedAt: { type: Date, default: Date.now },
});

// OtpToken
const otpTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Application: mongoose.model('Application', applicationSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  ApiFetchLog: mongoose.model('ApiFetchLog', apiFetchLogSchema),
  OtpToken: mongoose.model('OtpToken', otpTokenSchema),
};
