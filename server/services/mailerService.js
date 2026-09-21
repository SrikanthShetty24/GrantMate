const nodemailer = require('nodemailer');
const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { Notification } = require('../models/index');
const { matchEligible } = require('../utils/eligibilityMatcher');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

const sendMail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"GrantMate" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// Send deadline alerts for scholarships closing within 7 days
const sendDeadlineAlerts = async () => {
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const urgentScholarships = await Scholarship.find({
    verified: true,
    deadline: { $gte: new Date(), $lte: sevenDaysLater },
  });

  if (!urgentScholarships.length) return;

  const profiles = await StudentProfile.find().populate('userId', 'name email');

  for (const profile of profiles) {
    if (!profile.userId?.email) continue;
    const eligible = matchEligible(urgentScholarships, profile);
    if (!eligible.length) continue;

    const scholarshipList = eligible.map(s =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.amount}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#e53e3e;font-weight:600;">
          ${new Date(s.deadline).toLocaleDateString('en-IN')}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
          <a href="${s.officialLink}" style="color:#1a5fff;">Apply Now</a>
        </td>
      </tr>`
    ).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#1a5fff;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">⏰ Deadline Alert</h1>
          <p style="color:#cce0ff;margin:8px 0 0;">GrantMate — Smart Scholarship Finder</p>
        </div>
        <div style="padding:24px;">
          <p>Hi ${profile.userId.name},</p>
          <p>The following scholarships you're eligible for are <strong>closing within 7 days</strong>. Don't miss out!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead>
              <tr style="background:#f7f9ff;">
                <th style="padding:8px 12px;text-align:left;">Scholarship</th>
                <th style="padding:8px 12px;text-align:left;">Amount</th>
                <th style="padding:8px 12px;text-align:left;">Deadline</th>
                <th style="padding:8px 12px;text-align:left;">Action</th>
              </tr>
            </thead>
            <tbody>${scholarshipList}</tbody>
          </table>
          <p style="color:#666;font-size:13px;border-top:1px solid #eee;padding-top:16px;margin-top:16px;">
            ⚠️ Always verify details on the official website before applying.
          </p>
        </div>
      </div>`;

    try {
      await sendMail({ to: profile.userId.email, subject: `⏰ ${eligible.length} Scholarship(s) Closing Soon — Act Now!`, html });

      await Notification.create({
        userId: profile.userId._id,
        type: 'deadline_email',
        message: `Email sent: ${eligible.length} scholarship deadline alert(s) — deadlines within 7 days.`,
      });
    } catch (err) {
      console.error(`Email failed for ${profile.userId.email}:`, err.message);
    }
  }
};

// Send notification for a newly approved scholarship
const sendNewScholarshipAlerts = async (scholarship) => {
  const profiles = await StudentProfile.find().populate('userId', 'name email');

  for (const profile of profiles) {
    if (!profile.userId?.email) continue;
    const eligible = matchEligible([scholarship], profile);
    if (!eligible.length) continue;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#1a5fff;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">🎓 New Scholarship Match!</h1>
          <p style="color:#cce0ff;margin:8px 0 0;">GrantMate — Smart Scholarship Finder</p>
        </div>
        <div style="padding:24px;">
          <p>Hi ${profile.userId.name},</p>
          <p>A new scholarship matching your profile has been added:</p>
          <div style="background:#f7f9ff;border-left:4px solid #1a5fff;padding:16px;border-radius:4px;margin:16px 0;">
            <h3 style="margin:0 0 8px;color:#1a5fff;">${scholarship.title}</h3>
            <p style="margin:4px 0;color:#555;">${scholarship.description}</p>
            <p style="margin:8px 0 0;"><strong>Amount:</strong> ${scholarship.amount}</p>
            <p style="margin:4px 0;"><strong>Deadline:</strong> ${new Date(scholarship.deadline).toLocaleDateString('en-IN')}</p>
            <p style="margin:4px 0;"><strong>Source:</strong> <a href="${scholarship.sourceUrl}">${scholarship.source}</a></p>
          </div>
          <a href="${scholarship.officialLink}" style="display:inline-block;background:#1a5fff;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Apply on Official Website</a>
          <p style="color:#666;font-size:13px;border-top:1px solid #eee;padding-top:16px;margin-top:24px;">
            ⚠️ Always verify details on the official website before applying.
          </p>
        </div>
      </div>`;

    try {
      await sendMail({ to: profile.userId.email, subject: `🎓 New Scholarship: ${scholarship.title}`, html });
    } catch (err) {
      console.error(`New scholarship email failed for ${profile.userId.email}:`, err.message);
    }
  }
};

module.exports = { sendDeadlineAlerts, sendNewScholarshipAlerts, sendMail };
