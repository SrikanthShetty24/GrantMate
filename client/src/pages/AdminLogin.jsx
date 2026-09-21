import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminLogin(form);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #064e3b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 rounded-full opacity-20"
              style={{
                background: '#6ee7b7',
                left: `${(i * 23 + 8) % 90}%`,
                top: `${(i * 17 + 5) % 88}%`,
                animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }} />
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ background: '#059669' }}>G</div>
          <div>
            <span className="font-display font-semibold text-white text-xl block leading-tight">GrantMate</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Console</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', border: '1px solid rgba(5,150,105,0.3)' }}>
            🔐 Restricted Access
          </div>
          <h2 className="font-display text-4xl text-white font-semibold mb-4 leading-snug">
            Manage the<br />
            <em className="not-italic" style={{ color: '#6ee7b7' }}>scholarship platform</em>
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Verify scholarships, manage students, fetch from government APIs, and send deadline alerts.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { icon: '🏛️', label: 'Manage Schemes' },
              { icon: '👥', label: 'Student Accounts' },
              { icon: '📊', label: 'Analytics' },
              { icon: '📧', label: 'Email Alerts' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span>{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Authorized personnel only. All actions are logged.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 mesh-bg">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#059669' }}>G</div>
            <span className="font-display font-semibold text-navy-900 text-lg">GrantMate</span>
          </div>

          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #064e3b, #059669)' }}>
                🔐
              </div>
              <h1 className="font-display text-2xl text-navy-900 mb-1">Admin Sign In</h1>
              <p className="text-sm text-navy-500">Restricted to authorized personnel</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{ background: '#fee2e2', color: '#dc2626' }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Admin Email</label>
                <input className="input" type="email" placeholder="admin@grantmate.in"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input pr-12" type={showPass ? 'text' : 'password'}
                    placeholder="••••••••" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 text-sm">
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={loading}>
                {loading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Sign In as Admin →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-navy-500 mt-6">
            Student account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#059669' }}>Login here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
