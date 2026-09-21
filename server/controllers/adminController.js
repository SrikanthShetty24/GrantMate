const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Scholarship = require('../models/Scholarship');
const { Application, Notification, ApiFetchLog } = require('../models/index');
const { matchEligible } = require('../utils/eligibilityMatcher');
const { deduplicateScholarships } = require('../utils/deduplicator');
const { sendNewScholarshipAlerts } = require('../services/mailerService');
const fetchFromDataGov = require('../services/dataGovService');
const scrapeNSP = require('../services/nspScraperService');
const FALLBACK_SCHOLARSHIPS = require('../utils/fallbackData');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalScholarships, verifiedScholarships, totalApplications] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Scholarship.countDocuments(),
      Scholarship.countDocuments({ verified: true }),
      Application.countDocuments(),
    ]);

    const categoryStats = await Scholarship.aggregate([
      { $unwind: '$categoryRequired' },
      { $group: { _id: '$categoryRequired', count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find({ role: 'student' })
      .sort({ createdAt: -1 }).limit(5).select('name email createdAt');

    const expiringSoon = await Scholarship.find({
      verified: true,
      deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }).select('title deadline');

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalScholarships, verifiedScholarships, unverified: totalScholarships - verifiedScholarships, totalApplications },
        categoryStats,
        recentUsers,
        expiringSoon,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/scholarships
const getScholarships = async (req, res) => {
  try {
    const { verified, source, search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (verified !== undefined) filter.verified = verified === 'true';
    if (source) filter.source = { $regex: source, $options: 'i' };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Scholarship.countDocuments(filter);
    const scholarships = await Scholarship.find(filter)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: scholarships, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/scholarships
const addScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.create({ ...req.body, addedBy: req.user._id, verified: true });
    await notifyEligibleStudents(scholarship, 'new_scholarship');
    res.status(201).json({ success: true, data: scholarship });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'A scholarship with this title and deadline already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/scholarships/:id
const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    res.json({ success: true, data: scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/scholarships/:id
const deleteScholarship = async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Scholarship deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/scholarships/:id/verify
const verifyScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    await notifyEligibleStudents(scholarship, 'new_scholarship');
    res.json({ success: true, data: scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/scholarships/:id/unverify
const unverifyScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, { verified: false }, { new: true });
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    res.json({ success: true, data: scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 15 } = req.query;
    const filter = { role: 'student' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const usersWithProfile = await Promise.all(users.map(async u => {
      const profile = await StudentProfile.findOne({ userId: u._id });
      return { ...u.toObject(), hasProfile: !!profile, profile };
    }));

    res.json({ success: true, data: usersWithProfile, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'Student not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: { isActive: user.isActive }, message: `Account ${user.isActive ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/applications
const getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Application.countDocuments(filter);
    const apps = await Application.find(filter)
      .populate('userId', 'name email')
      .populate('scholarshipId', 'title deadline amount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: apps, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('userId', 'name').populate('scholarshipId', 'title');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    await Notification.create({
      userId: app.userId._id,
      scholarshipId: app.scholarshipId._id,
      type: 'status_update',
      message: `Your application for "${app.scholarshipId.title}" has been updated to: ${app.status}`,
    });

    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/api/fetch — returns preview only, nothing saved
const fetchScholarships = async (req, res) => {
  let source = 'fallback';
  let fetched = [];

  try {
    // Try data.gov.in first
    if (process.env.DATA_GOV_API_KEY) {
      try {
        fetched = await fetchFromDataGov();
        source = 'data.gov.in';
      } catch (e) {
        console.log('data.gov.in failed, trying NSP scraper...', e.message);
      }
    }

    // Try NSP scraper if data.gov failed
    if (!fetched.length) {
      try {
        fetched = await scrapeNSP();
        source = 'NSP scraper';
      } catch (e) {
        console.log('NSP scraper failed, using fallback...', e.message);
      }
    }

    // Use curated fallback
    if (!fetched.length) {
      fetched = FALLBACK_SCHOLARSHIPS;
      source = 'curated fallback';
    }

    // Deduplicate against DB
    const deduplicated = await deduplicateScholarships(fetched);

    await ApiFetchLog.create({
      fetchedBy: req.user._id,
      apiSource: source,
      recordsFetched: fetched.length,
      recordsApproved: 0,
      fetchStatus: 'success',
    });

    res.json({
      success: true,
      data: { preview: deduplicated, source, totalFetched: fetched.length, newRecords: deduplicated.length },
    });
  } catch (err) {
    await ApiFetchLog.create({
      fetchedBy: req.user._id,
      apiSource: source,
      recordsFetched: 0,
      recordsApproved: 0,
      fetchStatus: 'failed',
    }).catch(() => {});
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/api/approve — admin approves selected preview items
const approveScholarships = async (req, res) => {
  const { scholarships } = req.body; // array of scholarship objects from preview
  if (!Array.isArray(scholarships) || !scholarships.length) {
    return res.status(400).json({ success: false, message: 'No scholarships provided.' });
  }

  try {
    const saved = [];
    const skipped = [];

    for (const s of scholarships) {
      try {
        const doc = await Scholarship.create({ ...s, verified: true, addedBy: req.user._id, apiFetched: true });
        saved.push(doc);
        await notifyEligibleStudents(doc, 'new_scholarship');
      } catch (e) {
        if (e.code === 11000) skipped.push(s.title);
        else throw e;
      }
    }

    res.json({
      success: true,
      data: { saved: saved.length, skipped: skipped.length, skippedTitles: skipped },
      message: `${saved.length} scholarships approved and published.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/email/send-alerts
const sendAlerts = async (req, res) => {
  try {
    const { sendDeadlineAlerts, sendNewScholarshipAlerts: sendNew } = require('../services/mailerService');
    await sendDeadlineAlerts();
    res.json({ success: true, message: 'Email alerts triggered.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: create in-app notifications for eligible students
const notifyEligibleStudents = async (scholarship, type) => {
  try {
    const profiles = await StudentProfile.find();
    const eligible = profiles.filter(p => {
      const mock = { ...p.toObject() };
      return matchEligible([scholarship], mock).length > 0;
    });

    const notifications = eligible.map(p => ({
      userId: p.userId,
      scholarshipId: scholarship._id,
      type,
      message: type === 'new_scholarship'
        ? `New scholarship available: "${scholarship.title}" — Amount: ${scholarship.amount}`
        : `Deadline approaching for "${scholarship.title}" — Apply by ${new Date(scholarship.deadline).toLocaleDateString('en-IN')}`,
    }));

    if (notifications.length) await Notification.insertMany(notifications, { ordered: false });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = {
  getDashboard, getScholarships, addScholarship, updateScholarship,
  deleteScholarship, verifyScholarship, unverifyScholarship,
  getUsers, toggleUserStatus,
  getApplications, updateApplicationStatus,
  fetchScholarships, approveScholarships, sendAlerts,
};
