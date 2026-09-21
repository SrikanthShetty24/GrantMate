import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import ScholarshipCard from '../../components/student/ScholarshipCard';

export default function Saved() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    studentAPI.getSaved()
      .then(res => setScholarships(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (id) => {
    await studentAPI.unsave(id);
    setScholarships(prev => prev.filter(s => s._id !== id));
  };
  const handleMarkApplied = async (id) => {
    await studentAPI.markApplied(id);
    setScholarships(prev => prev.map(s => s._id === id ? { ...s, applicationStatus: 'Applied' } : s));
  };

  const filtered = filter === 'All' ? scholarships : scholarships.filter(s => s.applicationStatus === filter);
  const savedCount = scholarships.filter(s => s.applicationStatus === 'Saved').length;
  const appliedCount = scholarships.filter(s => s.applicationStatus === 'Applied').length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#78350f 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#fbbf24,transparent)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#fcd34d' }}>Your application tracker</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">🔖 Saved Scholarships</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {scholarships.length} total · {savedCount} saved · {appliedCount} applied
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#059669', borderTopColor: 'transparent' }} />
        </div>
      ) : scholarships.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-6xl mb-4">🔖</p>
          <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">Nothing saved yet</h3>
          <p className="text-navy-500 text-sm mb-8 max-w-xs mx-auto">Browse scholarships and save the ones you want to apply to.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/eligible" className="btn-primary text-sm">View Eligible →</Link>
            <Link to="/scholarships" className="btn-secondary text-sm">Browse All</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Progress summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-navy-900 text-sm">Application Progress</h3>
              <span className="text-xs text-navy-400">{appliedCount}/{scholarships.length} applied</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${scholarships.length > 0 ? (appliedCount / scholarships.length) * 100 : 0}%`,
                  background: 'linear-gradient(90deg,#059669,#34d399)',
                }} />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'All', label: `All (${scholarships.length})` },
              { key: 'Saved', label: `Saved (${savedCount})` },
              { key: 'Applied', label: `Applied (${appliedCount})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: filter === tab.key ? '#059669' : 'white',
                  color: filter === tab.key ? 'white' : '#475569',
                  border: `1.5px solid ${filter === tab.key ? '#059669' : '#e2e8f0'}`,
                  boxShadow: filter === tab.key ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s, i) => (
              <div key={s._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ScholarshipCard scholarship={s} onUnsave={handleUnsave} onMarkApplied={handleMarkApplied} />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card p-10 text-center text-navy-400 text-sm">
              No scholarships in this category yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}
