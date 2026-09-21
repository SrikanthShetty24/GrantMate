const StudentProfile = require('../models/StudentProfile');
const Scholarship = require('../models/Scholarship');
const { Application, Notification } = require('../models/index');
const { matchEligible } = require('../utils/eligibilityMatcher');

// GET /api/student/profile
const getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found. Please create your profile.' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/student/profile
const createProfile = async (req, res) => {
  try {
    const existing = await StudentProfile.findOne({ userId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Profile already exists. Use PUT to update.' });

    const profile = await StudentProfile.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/student/profile
const updateProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/eligible
const getEligible = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success: false, message: 'Complete your profile first to see eligible scholarships.' });

    const scholarships = await Scholarship.find({ verified: true, deadline: { $gte: new Date() } });
    const eligible = matchEligible(scholarships, profile);

    // Get saved IDs for this user
    const saved = await Application.find({ userId: req.user._id }).select('scholarshipId status');
    const savedMap = {};
    saved.forEach(a => { savedMap[a.scholarshipId.toString()] = a.status; });

    const result = eligible.map(s => ({
      ...s.toObject(),
      applicationStatus: savedMap[s._id.toString()] || null,
      urgency: getUrgency(s.deadline),
    }));

    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/scholarships — browse all verified
const getScholarships = async (req, res) => {
  try {
    const { category, state, course, minAmount, search, page = 1, limit = 12 } = req.query;
    const filter = { verified: true, deadline: { $gte: new Date() } };

    if (category && category !== 'All') filter.categoryRequired = { $in: [category, 'All'] };
    if (state && state !== 'All') filter.state = { $in: [state, 'All'] };
    if (course && course !== 'All') filter.courseRequired = { $in: [course, 'All'] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Scholarship.countDocuments(filter);
    const scholarships = await Scholarship.find(filter)
      .sort({ deadline: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const saved = await Application.find({ userId: req.user._id }).select('scholarshipId status');
    const savedMap = {};
    saved.forEach(a => { savedMap[a.scholarshipId.toString()] = a.status; });

    const result = scholarships.map(s => ({
      ...s.toObject(),
      applicationStatus: savedMap[s._id.toString()] || null,
      urgency: getUrgency(s.deadline),
    }));

    res.json({ success: true, data: result, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/student/save/:scholarshipId
const saveScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.scholarshipId);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found.' });

    const app = await Application.findOneAndUpdate(
      { userId: req.user._id, scholarshipId: req.params.scholarshipId },
      { userId: req.user._id, scholarshipId: req.params.scholarshipId, status: 'Saved' },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: app, message: 'Scholarship saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/student/save/:scholarshipId
const unsaveScholarship = async (req, res) => {
  try {
    await Application.findOneAndDelete({ userId: req.user._id, scholarshipId: req.params.scholarshipId });
    res.json({ success: true, message: 'Scholarship removed from saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/student/applied/:scholarshipId
const markApplied = async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      { userId: req.user._id, scholarshipId: req.params.scholarshipId },
      { status: 'Applied', appliedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: app, message: 'Marked as applied.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/saved
const getSaved = async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id })
      .populate('scholarshipId')
      .sort({ createdAt: -1 });

    const result = apps
      .filter(a => a.scholarshipId)
      .map(a => ({
        ...a.scholarshipId.toObject(),
        applicationStatus: a.status,
        appliedAt: a.appliedAt,
        urgency: getUrgency(a.scholarshipId.deadline),
      }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/dashboard
const getDashboard = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const totalScholarships = await Scholarship.countDocuments({ verified: true });
    const saved = await Application.countDocuments({ userId: req.user._id });
    const applied = await Application.countDocuments({ userId: req.user._id, status: 'Applied' });

    let eligible = 0;
    let upcoming = [];

    if (profile) {
      const all = await Scholarship.find({ verified: true, deadline: { $gte: new Date() } });
      const eligibleList = matchEligible(all, profile);
      eligible = eligibleList.length;

      // Upcoming deadlines (next 30 days)
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      upcoming = eligibleList
        .filter(s => s.deadline <= thirtyDaysLater)
        .sort((a, b) => a.deadline - b.deadline)
        .slice(0, 5)
        .map(s => ({ ...s.toObject(), urgency: getUrgency(s.deadline) }));
    }

    res.json({
      success: true,
      data: {
        hasProfile: !!profile,
        stats: { totalScholarships, eligible, saved, applied },
        upcomingDeadlines: upcoming,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/notifications
const getNotifications = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .populate('scholarshipId', 'title deadline')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unread = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({ success: true, data: notifications, total, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/student/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/student/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/student/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/student/notifications/clear-all
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: deadline urgency badge
const getUrgency = (deadline) => {
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days <= 7) return 'red';
  if (days <= 30) return 'yellow';
  return 'green';
};

module.exports = {
  getProfile, createProfile, updateProfile,
  getEligible, getScholarships,
  saveScholarship, unsaveScholarship, markApplied, getSaved,
  getDashboard,
  getNotifications, markNotificationRead, deleteNotification, markAllRead, clearAllNotifications,
};
