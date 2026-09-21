import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const STEPS = ['Enter Email', 'Verify OTP', 'New Password'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1 = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setUserId(res.data.data?.userId || '');
      setSuccess('OTP sent to your email address.');
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleStep2 = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ userId, otp });
      setResetToken(res.data.data.resetToken);
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || 'Invalid or expired OTP.'); }
    finally { setLoading(false); }
  };

  const handleStep3 = async (e) => {
    e.preventDefault(); setError('');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await authAPI.resetPassword({ resetToken, newPassword });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setError(err.response?.data?.message || 'Reset failed. Please start over.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 mesh-bg">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>G</div>
          <span className="font-display font-semibold text-navy-900 text-xl">GrantMate</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${step > i + 1 ? 'text-white' : step === i + 1 ? 'text-white' : 'text-navy-400'}`}
                  style={{
                    background: step > i + 1 ? '#059669' : step === i + 1 ? 'linear-gradient(135deg,#059669,#047857)' : '#e2e8f0',
                    boxShadow: step === i + 1 ? '0 4px 12px rgba(5,150,105,0.4)' : 'none',
                  }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${step === i + 1 ? 'text-navy-900' : 'text-navy-400'}`}>
                  {s}
                </span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-0.5 mx-2 max-w-16 rounded transition-all duration-500"
                  style={{ background: step > i + 1 ? '#059669' : '#e2e8f0' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-8">
          <h1 className="font-display text-2xl text-navy-900 mb-1">Reset Password</h1>
          <p className="text-sm text-navy-500 mb-6">Step {step} of 3 — {STEPS[step - 1]}</p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#fee2e2', color: '#dc2626' }}>⚠ {error}</div>
          )}
          {success && (
            <div className="mb-4 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#d1fae5', color: '#047857' }}>✓ {success}</div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <p className="text-sm text-navy-500">Enter your registered email. We'll send an OTP to your email address.</p>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send OTP →'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <p className="text-sm text-navy-500">Enter the 6-digit OTP sent to <strong>{email}</strong>. Expires in 10 minutes.</p>
              <div>
                <label className="label">One-Time Password</label>
                <input className="input text-center text-3xl tracking-widest font-mono" type="text"
                  placeholder="○ ○ ○ ○ ○ ○" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={loading || otp.length !== 6}>
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify OTP →'}
              </button>
              <button type="button" className="btn-ghost w-full text-sm"
                onClick={() => { setStep(1); setError(''); setSuccess(''); setOtp(''); }}>
                ← Back to email
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <p className="text-sm text-navy-500">Choose a strong new password for your account.</p>
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" placeholder="At least 8 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input className="input" type="password" placeholder="Re-enter new password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-navy-500 mt-6">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#059669' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
