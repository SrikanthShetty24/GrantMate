const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  courseRequired: { type: [String], default: ['All'] },
  categoryRequired: { type: [String], default: ['All'] },
  incomeLimit: { type: Number, default: 0 },
  state: { type: [String], default: ['All'] },
  minPercentage: { type: Number, default: 0 },
  genderRequired: { type: String, enum: ['All', 'Male', 'Female'], default: 'All' },
  deadline: { type: Date, required: true },
  officialLink: { type: String, required: true },
  amount: { type: String, default: 'Variable' },
  source: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  verified: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  apiFetched: { type: Boolean, default: false },
}, { timestamps: true });

// Compound unique index: title + deadline
scholarshipSchema.index({ title: 1, deadline: 1 }, { unique: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
