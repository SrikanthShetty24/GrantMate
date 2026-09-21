import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [scholarships, setScholarships] = useState([]);
  const [schLoading, setSchLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/student/public/scholarships', { withCredentials: true })
      .then(res => setScholarships(res.data.data || []))
      .catch(() => setScholarships([]))
      .finally(() => setSchLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const srcColor = (source) => {
    const map = { 'NSP': '#059669', 'AICTE': '#7c3aed', 'UGC': '#2563eb', 'DST': '#d97706' };
    return map[source] || '#059669';
  };

  const urgencyDays = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Expired';
  };

  const urgencyColor = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return '#dc2626';
    if (days <= 30) return '#d97706';
    return '#6ee7b7';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #064e3b 0%, #0f172a 60%, #1e1b4b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #059669, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ background: '#059669' }}>G</div>
          <span className="font-display font-semibold text-white text-xl">GrantMate</span>
        </div>

        {/* Dynamic scholarship cards */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
          
          <h2 className="font-display text-2xl text-white font-semibold mb-6 leading-snug">
            Top scholarships<br />
            <em className="not-italic" style={{ color: '#6ee7b7' }}>available right now</em>
          </h2>

          {schLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="p-5 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                No scholarships yet. Admin needs to approve some first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scholarships.map((s, i) => (
                <div key={s._id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    animation: `fadeUp 0.4s ease-out ${i * 0.08}s both`,
                  }}>
                  {/* Source initials */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: srcColor(s.source) }}>
                    {s.source?.substring(0, 2)?.toUpperCase() || 'GM'}
                  </div>

                  {/* Title + amount */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate leading-tight">{s.title}</p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: '#6ee7b7' }}>{s.amount}</p>
                  </div>

                  {/* Days left badge */}
                  <span className="text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.3)', color: urgencyColor(s.deadline) }}>
                    {urgencyDays(s.deadline)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          ⚠️ Verify details on official sites before applying.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#059669' }}>G</div>
            <span className="font-display font-semibold text-navy-900 text-lg">GrantMate</span>
          </div>

          <h1 className="font-display text-3xl text-navy-900 mb-2">Welcome back</h1>
          <p className="text-navy-500 text-sm mb-8">Sign in to your student account</p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold" style={{ color: '#059669' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input className="input pr-12" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 text-sm">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2" disabled={loading}>
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-navy-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#059669' }}>Create one free</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-navy-100 text-center">
            <Link to="/admin/login" className="text-xs text-navy-400 hover:text-navy-600">
              Admin portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
