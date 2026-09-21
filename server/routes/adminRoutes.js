const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const {
  getDashboard, getScholarships, addScholarship, updateScholarship,
  deleteScholarship, verifyScholarship, unverifyScholarship,
  getUsers, toggleUserStatus,
  getApplications, updateApplicationStatus,
  fetchScholarships, approveScholarships, sendAlerts,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);

router.get('/scholarships', getScholarships);
router.post('/scholarships', addScholarship);
router.put('/scholarships/:id', updateScholarship);
router.delete('/scholarships/:id', deleteScholarship);
router.put('/scholarships/:id/verify', verifyScholarship);
router.put('/scholarships/:id/unverify', unverifyScholarship);

router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);

router.get('/applications', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);

router.post('/api/fetch', fetchScholarships);
router.post('/api/approve', approveScholarships);

router.post('/email/send-alerts', sendAlerts);

module.exports = router;
