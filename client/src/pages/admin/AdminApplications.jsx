import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchApps = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getApplications(params);
      setApps(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchApps(1); }, [fetchApps]);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await adminAPI.updateAppStatus(id, status);
      setApps(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#312e81 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#c4b5fd' }}>Application Tracking</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">📋 Applications</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{total} total applications</p>
        </div>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <select className="input text-sm w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Saved">🔖 Saved</option>
          <option value="Applied">✅ Applied</option>
        </select>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: `All (${total})`, value: '' },
            { label: 'Saved', value: 'Saved' },
            { label: 'Applied', value: 'Applied' },
          ].map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: statusFilter === tab.value ? '#059669' : 'white',
                color: statusFilter === tab.value ? 'white' : '#475569',
                border: `1.5px solid ${statusFilter === tab.value ? '#059669' : '#e2e8f0'}`,
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-4 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Student', 'Scholarship', 'Amount', 'Status', 'Date', 'Update'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-navy-400 text-sm">No applications found.</td></tr>
                ) : apps.map(a => (
                  <tr key={a._id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
                          {a.userId?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900 text-sm">{a.userId?.name}</p>
                          <p className="text-xs text-navy-400">{a.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-navy-800 font-medium max-w-xs truncate">{a.scholarshipId?.title}</p>
                      <p className="text-xs text-navy-400">
                        {a.scholarshipId?.deadline ? `Deadline: ${new Date(a.scholarshipId.deadline).toLocaleDateString('en-IN')}` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-navy-600">{a.scholarshipId?.amount || '—'}</td>
                    <td className="px-4 py-3.5">
                      {a.status === 'Applied'
                        ? <span className="badge-green">✅ Applied</span>
                        : <span className="badge-yellow">🔖 Saved</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-navy-500">
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        className="text-xs border rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none transition-all"
                        style={{ borderColor: '#e2e8f0', background: 'white', color: '#475569' }}
                        value={a.status} disabled={updating === a._id}
                        onChange={e => handleStatusChange(a._id, e.target.value)}>
                        <option value="Saved">🔖 Saved</option>
                        <option value="Applied">✅ Applied</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="px-4 py-3.5 border-t border-navy-100 flex items-center justify-between">
              <span className="text-sm text-navy-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => fetchApps(page - 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">← Prev</button>
                <button disabled={page === pages} onClick={() => fetchApps(page + 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
