import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import ScholarshipCard from '../../components/student/ScholarshipCard';

const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="flex gap-3"><div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div></div>
    <div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-4/5" />
    <div className="flex gap-2"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-16 rounded-full" /></div>
    <div className="skeleton h-16 rounded-xl" /><div className="skeleton h-10 rounded-xl" />
  </div>
);

export default function Eligible() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    studentAPI.getEligible()
      .then(res => setScholarships(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id) => {
    await studentAPI.save(id);
    setScholarships(prev => prev.map(s => s._id === id ? { ...s, applicationStatus: 'Saved' } : s));
  };
  const handleUnsave = async (id) => {
    await studentAPI.unsave(id);
    setScholarships(prev => prev.map(s => s._id === id ? { ...s, applicationStatus: null } : s));
  };
  const handleMarkApplied = async (id) => {
    await studentAPI.markApplied(id);
    setScholarships(prev => prev.map(s => s._id === id ? { ...s, applicationStatus: 'Applied' } : s));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#60a5fa,transparent)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#93c5fd' }}>Personalized for you</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">🎯 Eligible Scholarships</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Matched to your exact academic profile using 6 criteria
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h3 className="font-display font-semibold text-navy-900 text-lg mb-2">{error}</h3>
          {error.includes('profile') && (
            <Link to="/profile" className="btn-primary mt-4">Complete My Profile →</Link>
          )}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">No matches found yet</h3>
          <p className="text-navy-500 text-sm mb-6 max-w-sm mx-auto">
            No scholarships currently match your profile, or new ones haven't been added yet. Check back soon!
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/scholarships" className="btn-secondary text-sm">Browse All Schemes</Link>
            <Link to="/profile" className="btn-primary text-sm">Update My Profile</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: '#d1fae5', color: '#047857' }}>
              ✓ {scholarships.length} eligible scholarships found
            </div>
            <span className="text-xs text-navy-400">Based on your profile — income, category, course, state & percentage</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scholarships.map((s, i) => (
              <div key={s._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ScholarshipCard scholarship={s} onSave={handleSave} onUnsave={handleUnsave} onMarkApplied={handleMarkApplied} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
