const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { OtpToken } = require('../models/index');
const { sendOtpSms } = require('../services/smsService');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    setCookie(res, token);

    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled.' });
    }
    if (user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Use the admin login portal.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    setCookie(res, token);

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    setCookie(res, token);

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
};

// POST /api/auth/forgot-password  → Step 1: Enter email → send OTP to stored phone
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, an OTP has been sent.', data: { userId: '' } });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await OtpToken.updateMany({ userId: user._id, used: false }, { used: true });
    await OtpToken.create({
      userId: user._id,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP to email instead of phone
    const { sendMail } = require('../services/mailerService');
    await sendMail({
      to: user.email,
      subject: 'GrantMate — Your OTP for Password Reset',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
          <div style="background:#4f46e5;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;">GrantMate Password Reset</h2>
          </div>
          <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
            <p style="color:#374151;">Hi <strong>${user.name}</strong>,</p>
            <p style="color:#374151;">Your OTP for password reset is:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;">${otp}</span>
            </div>
            <p style="color:#6b7280;font-size:14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <p style="color:#6b7280;font-size:14px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `
    });

    console.log(`📧 OTP sent to email: ${user.email}`);

    res.json({
      success: true,
      message: 'OTP sent to your email address.',
      data: { userId: user._id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp  → Step 2
const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const tokenDoc = await OtpToken.findOne({
      userId,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!tokenDoc) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    const valid = await bcrypt.compare(otp, tokenDoc.otpHash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Mark as used
    tokenDoc.used = true;
    await tokenDoc.save();

    // Issue a short-lived reset token
    const resetToken = jwt.sign({ id: userId, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.json({ success: true, data: { resetToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password  → Step 3
const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(decoded.id, { passwordHash });

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const profile = req.user.role === 'student'
      ? await StudentProfile.findOne({ userId: req.user._id })
      : null;
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        hasProfile: !!profile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, adminLogin, logout, forgotPassword, verifyOtp, resetPassword, getMe };
