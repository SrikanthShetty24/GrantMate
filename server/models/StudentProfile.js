const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  course: {
    type: String,
    enum: ['Engineering', 'Medical', 'Arts', 'Commerce', 'Science', 'Law', 'Management', 'Polytechnic', 'ITI', 'Other'],
    required: true,
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
    required: true,
  },
  annualIncome: { type: Number, required: true, min: 0 },
  state: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  phone: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
