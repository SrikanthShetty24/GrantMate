import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import ScholarshipCard from '../../components/student/ScholarshipCard';

const CountUp = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = end / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}</span>;
};

const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-1/2" />
    <div className="skeleton h-16 w-full" />
    <div className="skeleton h-8 w-full" />
  </div>
);

const StatCard = ({ label, value, icon, color, bg, to, sub }) => (
  <Link to={to || '#'} className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
      style={{ background: bg }}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-display font-bold" style={{ color }}>
        <CountUp end={typeof value === 'number' ? value : 0} />
      </p>
      <p className="text-sm font-semibold text-navy-700">{label}</p>
      {sub && <p className="text-xs text-navy-400">{sub}</p>}
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { stats, upcomingDeadlines, hasProfile } = data || {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-up">

      {/* Welcome banner */}
      <div className="rounded-3xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #d97706, transparent)' }} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#6ee7b7' }}>{greeting} 👋</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-2">
              {user?.name?.split(' ')[0]}, welcome back!
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {hasProfile
                ? `You're eligible for ${stats?.eligible || 0} scholarships right now`
                : 'Complete your profile to start discovering scholarships'}
            </p>
          </div>
          {!hasProfile && (
            <Link to="/profile"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-navy-900 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#6ee7b7,#34d399)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)' }}>
              Complete Profile →
            </Link>
          )}
        </div>
      </div>

      {/* Profile incomplete alert */}
      {!hasProfile && (
        <div className="flex items-start gap-4 p-5 rounded-2xl border animate-fade-up"
          style={{ background: '#fefce8', borderColor: '#fde68a' }}>
          <span className="text-2xl flex-shrink-0">📝</span>
          <div className="flex-1">
            <p className="font-bold text-amber-900 mb-0.5">Your profile is incomplete</p>
            <p className="text-sm text-amber-700">Fill in your academic details to get matched with scholarships. Takes less than 2 minutes.</p>
          </div>
          <Link to="/profile" className="flex-shrink-0 btn-primary text-xs py-2 px-4">Fill Now</Link>
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Schemes" value={stats?.totalScholarships} icon="🏛️"
            color="#059669" bg="#d1fae5" to="/scholarships" />
          <StatCard label="You're Eligible" value={stats?.eligible} icon="🎯"
            color="#2563eb" bg="#dbeafe" to="/eligible"
            sub={hasProfile ? 'Based on your profile' : 'Complete profile first'} />
          <StatCard label="Saved" value={stats?.saved} icon="🔖"
            color="#d97706" bg="#fef3c7" to="/saved" />
          <StatCard label="Applied" value={stats?.applied} icon="✅"
            color="#7c3aed" bg="#ede9fe" to="/saved" />
        </div>
      )}

      {/* Progress section */}
      {!loading && stats && (
        <div className="card p-6 animate-fade-up stagger-3">
          <h3 className="font-display font-semibold text-navy-900 mb-4">Your Application Journey</h3>
          <div className="flex items-center gap-2">
            {[
              { label: 'Profile Created', done: true },
              { label: 'Scholarships Saved', done: stats.saved > 0 },
              { label: 'Applications Started', done: stats.applied > 0 },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
                    style={{
                      background: step.done ? 'linear-gradient(135deg,#059669,#047857)' : '#e2e8f0',
                      color: step.done ? 'white' : '#94a3b8',
                      boxShadow: step.done ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
                    }}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-center font-medium" style={{ color: step.done ? '#059669' : '#94a3b8' }}>
                    {step.label}
                  </span>
                </div>
                {i < 2 && <div className="h-0.5 flex-1 mb-5 rounded"
                  style={{ background: step.done ? '#059669' : '#e2e8f0' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming deadlines */}
      {!loading && upcomingDeadlines?.length > 0 && (
        <div className="animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-900">⏰ Closing Soon</h2>
              <p className="text-sm text-navy-500 mt-0.5">Deadlines within the next 30 days</p>
            </div>
            <Link to="/eligible" className="text-sm font-semibold" style={{ color: '#059669' }}>View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingDeadlines.map(s => (
              <ScholarshipCard key={s._id} scholarship={s} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="animate-fade-up stagger-5">
        <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/eligible', icon: '🎯', label: 'View Eligible', desc: 'Matched to your profile', color: '#d1fae5', textColor: '#059669' },
            { to: '/scholarships', icon: '🏛️', label: 'Browse All Schemes', desc: 'All verified scholarships', color: '#dbeafe', textColor: '#2563eb' },
            { to: '/saved', icon: '🔖', label: 'My Saved List', desc: 'Track applications', color: '#fef3c7', textColor: '#d97706' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: item.color }}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-navy-900 text-sm">{item.label}</p>
                <p className="text-xs text-navy-500">{item.desc}</p>
              </div>
              <span className="ml-auto text-navy-300 group-hover:text-navy-600 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips card */}
      <div className="card p-6 animate-fade-up stagger-6" style={{ borderLeft: '4px solid #059669' }}>
        <h3 className="font-display font-semibold text-navy-900 mb-3">💡 Tips for applying</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            '📄 Keep your marksheets and income certificate ready',
            '🏦 Have your bank account details (for DBT)',
            '🎓 Get institution verification letter in advance',
            '📱 Apply well before deadline — portals get busy',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-navy-600">
              <span className="flex-shrink-0">{tip.split(' ')[0]}</span>
              <span>{tip.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
