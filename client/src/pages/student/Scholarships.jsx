import React, { useEffect, useState, useCallback } from 'react';
import { studentAPI } from '../../services/api';
import ScholarshipCard from '../../components/student/ScholarshipCard';

const CATEGORIES = ['All','General','OBC','SC','ST','EWS','Minority'];
const COURSES = ['All','Engineering','Medical','Arts','Commerce','Science','Law','Management','Polytechnic','ITI','Other'];
const STATES = ['All','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];

const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="flex gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div></div>
    <div className="skeleton h-3 w-full" /><div className="skeleton h-16 rounded-xl" /><div className="skeleton h-10 rounded-xl" />
  </div>
);

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: 'All', course: 'All', state: 'All', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchScholarships = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12, ...filters };
      if (params.category === 'All') delete params.category;
      if (params.course === 'All') delete params.course;
      if (params.state === 'All') delete params.state;
      if (!params.search) delete params.search;
      const res = await studentAPI.getScholarships(params);
      setScholarships(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchScholarships(1); }, [fetchScholarships]);

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

  const activeFilterCount = [filters.category !== 'All', filters.course !== 'All', filters.state !== 'All', !!filters.search].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#c4b5fd' }}>All verified schemes</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">🏛️ All Scholarships</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {total} government scholarships — search, filter, apply
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">🔍</span>
            <input className="input pl-10" placeholder="Search scholarship name..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setFilters(f => ({ ...f, search: searchInput }))} />
          </div>
          <button onClick={() => setFilters(f => ({ ...f, search: searchInput }))}
            className="btn-primary text-sm px-4">Search</button>
          <button onClick={() => setShowFilters(s => !s)}
            className={`btn-secondary text-sm px-4 relative ${showFilters ? 'border-emerald-500' : ''}`}>
            ⚙️ Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                style={{ background: '#059669', fontSize: '10px' }}>{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilters({ category: 'All', course: 'All', state: 'All', search: '' }); setSearchInput(''); }}
              className="btn-ghost text-sm px-3 text-red-500">Clear</button>
          )}
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-navy-100 animate-fade-up">
            {[
              { key: 'category', label: '📂 Category', options: CATEGORIES },
              { key: 'course', label: '🎓 Course', options: COURSES },
              { key: 'state', label: '📍 State', options: STATES },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <select className="input text-sm py-2"
                  value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-500 font-medium">
          {loading ? 'Loading...' : `${total} scholarship${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">No scholarships found</h3>
          <p className="text-navy-500 text-sm mb-6">Try adjusting your filters or search term.</p>
          <button onClick={() => { setFilters({ category: 'All', course: 'All', state: 'All', search: '' }); setSearchInput(''); }}
            className="btn-secondary text-sm">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scholarships.map((s, i) => (
              <div key={s._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <ScholarshipCard scholarship={s} onSave={handleSave} onUnsave={handleUnsave} onMarkApplied={handleMarkApplied} />
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button disabled={page === 1} onClick={() => fetchScholarships(page - 1)}
                className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
              <div className="flex gap-1">
                {[...Array(Math.min(pages, 5))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => fetchScholarships(p)}
                      className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: page === p ? '#059669' : 'white',
                        color: page === p ? 'white' : '#475569',
                        border: `1.5px solid ${page === p ? '#059669' : '#e2e8f0'}`,
                      }}>
                      {p}
                    </button>
                  );
                })}
              </div>
              <button disabled={page === pages} onClick={() => fetchScholarships(page + 1)}
                className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
