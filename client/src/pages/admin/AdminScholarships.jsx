import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', verified: '' });
  const [searchInput, setSearchInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [approving, setApproving] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchList = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15, ...filters };
      if (!params.search) delete params.search;
      if (params.verified === '') delete params.verified;
      const res = await adminAPI.getScholarships(params);
      setScholarships(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchList(1); }, [fetchList]);

  const handleVerify = async (id, current) => {
    await (current ? adminAPI.unverify(id) : adminAPI.verify(id));
    setScholarships(prev => prev.map(s => s._id === id ? { ...s, verified: !current } : s));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this scholarship permanently?')) return;
    await adminAPI.deleteScholarship(id);
    setScholarships(prev => prev.filter(s => s._id !== id));
    setTotal(t => t - 1);
  };

  const handleFetch = async () => {
    setFetching(true); setFetchResult(null); setPreview(null);
    try {
      const res = await adminAPI.fetchScholarships();
      const { preview: items, source, newRecords, totalFetched } = res.data.data;
      setPreview(items);
      setSelectedItems(items.map((_, i) => i));
      setFetchResult({ type: 'info', msg: `Fetched ${totalFetched} from ${source}. ${newRecords} new records ready for review.` });
      setShowPreview(true);
    } catch (err) {
      setFetchResult({ type: 'error', msg: err.response?.data?.message || 'Fetch failed.' });
    } finally { setFetching(false); }
  };

  const handleApprove = async () => {
    if (!selectedItems.length) return;
    setApproving(true);
    try {
      const toApprove = selectedItems.map(i => preview[i]);
      const res = await adminAPI.approveScholarships(toApprove);
      setFetchResult({ type: 'success', msg: `✓ ${res.data.data.saved} scholarships approved & published. ${res.data.data.skipped} duplicates skipped.` });
      setShowPreview(false); setPreview(null);
      fetchList(1);
    } catch (err) {
      setFetchResult({ type: 'error', msg: err.response?.data?.message || 'Approve failed.' });
    } finally { setApproving(false); }
  };

  const toggleSelect = (i) => setSelectedItems(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const resultColors = { success: { bg: '#d1fae5', color: '#047857' }, error: { bg: '#fee2e2', color: '#dc2626' }, info: { bg: '#dbeafe', color: '#1d4ed8' } };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#c4b5fd' }}>Scholarship Management</p>
            <h1 className="font-display text-2xl font-semibold text-white mb-1">🏛️ Scholarships</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{total} total scholarships</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleFetch} disabled={fetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              {fetching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '⬇️'}
              Fetch from API
            </button>
            <Link to="/admin/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-navy-900 transition-all"
              style={{ background: 'linear-gradient(135deg,#6ee7b7,#34d399)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
              ➕ Add Manually
            </Link>
          </div>
        </div>
      </div>

      {/* Fetch result */}
      {fetchResult && (
        <div className="p-4 rounded-2xl text-sm font-semibold flex items-center gap-2"
          style={{ background: resultColors[fetchResult.type]?.bg, color: resultColors[fetchResult.type]?.color }}>
          {fetchResult.msg}
        </div>
      )}

      {/* Preview modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-navy-100">
              <div>
                <h2 className="font-display font-semibold text-navy-900 text-xl">Preview Fetched Scholarships</h2>
                <p className="text-sm text-navy-500 mt-0.5">{preview.length} new records — select which to approve and publish</p>
              </div>
              <button onClick={() => setShowPreview(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-navy-400 hover:bg-navy-50 transition-colors">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {preview.length === 0 ? (
                <div className="text-center py-12 text-navy-400">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm">All fetched records already exist in the database.</p>
                </div>
              ) : preview.map((s, i) => (
                <label key={i}
                  className="flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all"
                  style={{
                    background: selectedItems.includes(i) ? '#f0fdf4' : 'white',
                    borderColor: selectedItems.includes(i) ? '#86efac' : '#e2e8f0',
                  }}>
                  <input type="checkbox" checked={selectedItems.includes(i)} onChange={() => toggleSelect(i)}
                    className="mt-0.5 accent-emerald-600 w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy-900 text-sm">{s.title}</p>
                    <p className="text-xs text-navy-500 mt-0.5 line-clamp-1">{s.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-navy-400">
                      <span>💰 {s.amount}</span>
                      <span>📅 {new Date(s.deadline).toLocaleDateString('en-IN')}</span>
                      <span>🏛 {s.source}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-4 border-t border-navy-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-3">
                <button onClick={() => setSelectedItems(preview.map((_, i) => i))}
                  className="text-sm font-semibold" style={{ color: '#059669' }}>Select all</button>
                <span className="text-navy-300">|</span>
                <button onClick={() => setSelectedItems([])}
                  className="text-sm font-semibold text-navy-400">Deselect all</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(false)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={handleApprove} disabled={approving || !selectedItems.length}
                  className="btn-primary text-sm">
                  {approving
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : `✓ Approve ${selectedItems.length} Selected`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <form onSubmit={e => { e.preventDefault(); setFilters(f => ({ ...f, search: searchInput })); }}
          className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">🔍</span>
            <input className="input pl-10 text-sm" placeholder="Search scholarships..." value={searchInput}
              onChange={e => setSearchInput(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary text-sm px-4">Search</button>
        </form>
        <select className="input text-sm w-44" value={filters.verified}
          onChange={e => setFilters(f => ({ ...f, verified: e.target.value }))}>
          <option value="">All Status</option>
          <option value="true">✅ Live / Verified</option>
          <option value="false">⏳ Draft</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Scholarship', 'Amount', 'Deadline', 'Source', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scholarships.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-navy-400 text-sm">No scholarships found.</td></tr>
                ) : scholarships.map((s, i) => (
                  <tr key={s._id}
                    className="border-t border-navy-50 transition-colors hover:bg-navy-50/50">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-navy-900 text-sm max-w-xs truncate">{s.title}</p>
                      <p className="text-xs text-navy-400 mt-0.5">{s.categoryRequired?.join(', ')}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-navy-700 whitespace-nowrap">{s.amount}</td>
                    <td className="px-4 py-3.5 text-sm text-navy-600 whitespace-nowrap">
                      {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-navy-500 whitespace-nowrap">{s.source}</td>
                    <td className="px-4 py-3.5">
                      {s.verified
                        ? <span className="badge-green">✅ Live</span>
                        : <span className="badge-yellow">⏳ Draft</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleVerify(s._id, s.verified)}
                          className="px-2.5 py-1.5 text-xs rounded-xl font-semibold transition-all"
                          style={s.verified
                            ? { background: '#fef3c7', color: '#d97706' }
                            : { background: '#d1fae5', color: '#059669' }}>
                          {s.verified ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link to={`/admin/edit/${s._id}`}
                          className="px-2.5 py-1.5 text-xs rounded-xl font-semibold transition-all"
                          style={{ background: '#dbeafe', color: '#2563eb' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(s._id)}
                          className="px-2.5 py-1.5 text-xs rounded-xl font-semibold transition-all"
                          style={{ background: '#fee2e2', color: '#dc2626' }}>
                          Del
                        </button>
                      </div>
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
                <button disabled={page === 1} onClick={() => fetchList(page - 1)}
                  className="btn-secondary text-xs py-1.5 disabled:opacity-40">← Prev</button>
                <button disabled={page === pages} onClick={() => fetchList(page + 1)}
                  className="btn-secondary text-xs py-1.5 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
