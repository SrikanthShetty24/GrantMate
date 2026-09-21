import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#dc2626', '#d97706', '#059669'];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 50%, #064e3b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #059669, transparent)' }} />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ background: '#059669' }}>G</div>
          <span className="font-display font-semibold text-white text-xl">GrantMate</span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-4xl text-white font-semibold mb-4 leading-snug">
            Join thousands of<br />
            <em className="not-italic" style={{ color: '#c4b5fd' }}>Indian students</em>
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Fill your profile once. Our engine matches you to every government scholarship you're eligible for — instantly.
          </p>
          <div className="space-y-3">
            {[
              { icon: '🎯', text: 'Matched to your exact profile' },
              { icon: '🏛️', text: 'NSP, AICTE, UGC, DST schemes' },
              { icon: '🔔', text: 'Deadline email alerts' },
              { icon: '🔒', text: 'Secure & completely free' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          After registering, complete your academic profile to start matching.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-fade-up py-4">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#059669' }}>G</div>
            <span className="font-display font-semibold text-navy-900 text-lg">GrantMate</span>
          </div>

          <h1 className="font-display text-3xl text-navy-900 mb-2">Create your account</h1>
          <p className="text-navy-500 text-sm mb-8">Start finding scholarships you're eligible for</p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="Rahul Sharma"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-12" type={showPass ? 'text' : 'password'}
                  placeholder="At least 8 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 text-sm">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(l => (
                      <div key={l} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: strength >= l ? strengthColor[strength] : '#e2e8f0' }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>Passwords don't match</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2" disabled={loading}>
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-navy-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#059669' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
