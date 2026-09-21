const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const {
  register, login, adminLogin, logout,
  forgotPassword, verifyOtp, resetPassword, getMe,
} = require('../controllers/authController');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').notEmpty(),
], login);

router.post('/admin/login', authLimiter, adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);

router.post('/forgot-password', otpLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
], forgotPassword);

router.post('/verify-otp', [
  body('userId').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], verifyOtp);

router.post('/reset-password', [
  body('resetToken').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], resetPassword);

module.exports = router;
