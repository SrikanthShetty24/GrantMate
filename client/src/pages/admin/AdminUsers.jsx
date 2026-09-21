import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== '') params.isActive = statusFilter;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleToggle = async (id) => {
    await adminAPI.toggleUser(id);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#60a5fa,transparent)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#93c5fd' }}>Student Management</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">👥 Students</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{total} registered students</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); }} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">🔍</span>
            <input className="input pl-10 text-sm" placeholder="Search name or email..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary text-sm px-4">Search</button>
        </form>
        <select className="input text-sm w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">✅ Active</option>
          <option value="false">🚫 Disabled</option>
        </select>
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
                  {['Student', 'Profile', 'Last Login', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-navy-400 text-sm">No students found.</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900 text-sm">{u.name}</p>
                          <p className="text-xs text-navy-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.hasProfile ? (
                        <div className="text-xs text-navy-600">
                          <p className="font-medium">{u.profile?.course} · {u.profile?.category}</p>
                          <p className="text-navy-400">{u.profile?.state}</p>
                        </div>
                      ) : (
                        <span className="badge-yellow text-xs">Incomplete</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-navy-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : 'Never'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-navy-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Disabled</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => handleToggle(u._id)}
                        className="px-3 py-1.5 text-xs rounded-xl font-semibold transition-all"
                        style={u.isActive
                          ? { background: '#fee2e2', color: '#dc2626' }
                          : { background: '#d1fae5', color: '#059669' }}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
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
                <button disabled={page === 1} onClick={() => fetchUsers(page - 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">← Prev</button>
                <button disabled={page === pages} onClick={() => fetchUsers(page + 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
