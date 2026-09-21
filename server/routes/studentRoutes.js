const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getProfile, createProfile, updateProfile,
  getEligible, getScholarships,
  saveScholarship, unsaveScholarship, markApplied, getSaved,
  getDashboard,
  getNotifications, markNotificationRead, deleteNotification, markAllRead, clearAllNotifications,
} = require('../controllers/studentController');

// Public route — no auth required
router.get('/public/scholarships', async (req, res) => {
  try {
    const Scholarship = require('../models/Scholarship');
    const scholarships = await Scholarship.find({ verified: true, deadline: { $gte: new Date() } })
      .sort({ deadline: 1 })
      .limit(4)
      .select('title amount deadline source categoryRequired');
    res.json({ success: true, data: scholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// All routes require auth
router.use(protect);

router.get('/dashboard', getDashboard);

router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);

router.get('/eligible', getEligible);
router.get('/scholarships', getScholarships);

router.post('/save/:scholarshipId', saveScholarship);
router.delete('/save/:scholarshipId', unsaveScholarship);
router.put('/applied/:scholarshipId', markApplied);
router.get('/saved', getSaved);

// Notifications — specific routes before parameterized
router.put('/notifications/read-all', markAllRead);
router.delete('/notifications/clear-all', clearAllNotifications);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
