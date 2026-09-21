import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { adminAPI } from '../../services/api';

const COLORS = ['#059669','#2563eb','#d97706','#7c3aed','#dc2626','#0891b2'];

const StatCard = ({ label, value, icon, color, bg, sub }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: bg }}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-display font-bold" style={{ color }}>{value ?? 0}</p>
      <p className="text-sm font-semibold text-navy-700">{label}</p>
      {sub && <p className="text-xs text-navy-400">{sub}</p>}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-4 w-1/2" />
    <div className="skeleton h-8 w-1/3" />
    <div className="skeleton h-3 w-2/3" />
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertSending, setAlertSending] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendAlerts = async () => {
    setAlertSending(true); setAlertMsg('');
    try {
      await adminAPI.sendAlerts();
      setAlertMsg('success');
    } catch { setAlertMsg('error'); }
    finally { setAlertSending(false); }
  };

  const { stats, categoryStats, recentUsers, expiringSoon } = data || {};

  const barData = [
    { name: 'Verified', count: stats?.verifiedScholarships || 0 },
    { name: 'Draft', count: stats?.unverified || 0 },
    { name: 'Applications', count: stats?.totalApplications || 0 },
    { name: 'Students', count: stats?.totalUsers || 0 },
  ];

  const pieData = categoryStats?.map(c => ({ name: c._id, value: c.count })) || [];

  return (
    <div className="space-y-8 animate-fade-up">

      {/* Header */}
      <div className="rounded-3xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#6ee7b7' }}>Admin Console</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-1">
              System Overview
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Manage scholarships, students and notifications
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSendAlerts} disabled={alertSending}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              {alertSending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📧'}
              Send Deadline Alerts
            </button>
            <Link to="/admin/add"
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-navy-900 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#6ee7b7,#34d399)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)' }}>
              ➕ Add Scholarship
            </Link>
          </div>
        </div>
        {alertMsg && (
          <div className={`relative z-10 mt-4 p-3 rounded-xl text-sm font-medium inline-flex items-center gap-2
            ${alertMsg === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
            {alertMsg === 'success' ? '✓ Deadline alerts sent to eligible students.' : '✗ Failed to send alerts.'}
          </div>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={stats?.totalUsers} icon="👥" color="#059669" bg="#d1fae5" />
          <StatCard label="Total Schemes" value={stats?.totalScholarships} icon="🏛️" color="#2563eb" bg="#dbeafe" />
          <StatCard label="Live / Verified" value={stats?.verifiedScholarships} icon="✅" color="#d97706" bg="#fef3c7"
            sub={`${stats?.unverified || 0} drafts pending`} />
          <StatCard label="Applications" value={stats?.totalApplications} icon="📋" color="#7c3aed" bg="#ede9fe" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-4 gap-3 animate-fade-up stagger-2">
        {[
          { to: '/admin/scholarships', icon: '🏛️', label: 'Manage Schemes', sub: 'View, verify, delete', color: '#d1fae5', text: '#059669' },
          { to: '/admin/users', icon: '👥', label: 'Student Accounts', sub: 'Enable / disable', color: '#dbeafe', text: '#2563eb' },
          { to: '/admin/applications', icon: '📋', label: 'Applications', sub: 'Update statuses', color: '#ede9fe', text: '#7c3aed' },
          { to: '/admin/scholarships', icon: '⬇️', label: 'Fetch from API', sub: 'NSP, data.gov.in', color: '#fef3c7', text: '#d97706' },
        ].map((item, i) => (
          <Link key={i} to={item.to}
            className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ background: item.color }}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-navy-900">{item.label}</p>
              <p className="text-xs text-navy-400">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 animate-fade-up stagger-3">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-navy-900 mb-1">Platform Overview</h3>
          <p className="text-xs text-navy-400 mb-5">Key metrics at a glance</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-navy-900 mb-1">Schemes by Category</h3>
          <p className="text-xs text-navy-400 mb-5">Distribution across categories</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-navy-300 text-sm">
              No scholarship data yet. Fetch and approve some scholarships first.
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 animate-fade-up stagger-4">
        {/* Expiring soon */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-navy-900">⏰ Expiring This Week</h3>
              <p className="text-xs text-navy-400 mt-0.5">Scholarships closing within 7 days</p>
            </div>
            <Link to="/admin/scholarships" className="text-xs font-semibold" style={{ color: '#059669' }}>View all →</Link>
          </div>
          {!expiringSoon?.length ? (
            <div className="text-center py-8 text-navy-300">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm">No scholarships expiring this week.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringSoon.map(s => (
                <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-navy-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#dc2626' }}>
                    {s.title?.charAt(0)}
                  </div>
                  <p className="text-sm text-navy-800 font-medium flex-1 line-clamp-1">{s.title}</p>
                  <span className="badge-red text-xs flex-shrink-0">
                    {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent students */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-navy-900">👥 Recent Registrations</h3>
              <p className="text-xs text-navy-400 mt-0.5">Latest students who joined</p>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold" style={{ color: '#059669' }}>View all →</Link>
          </div>
          {!recentUsers?.length ? (
            <div className="text-center py-8 text-navy-300">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-sm">No students yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-navy-50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{u.name}</p>
                    <p className="text-xs text-navy-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-navy-400 flex-shrink-0">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 flex items-center gap-3" style={{ borderLeft: '4px solid #d97706' }}>
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-sm text-navy-600">
          Always verify scholarship details before publishing. Ensure official links point to government portals.
          GrantMate is an aggregator — accuracy depends on admin verification.
        </p>
      </div>
    </div>
  );
}
