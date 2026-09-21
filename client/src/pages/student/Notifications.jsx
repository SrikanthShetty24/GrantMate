import React, { useEffect, useState } from 'react';
import { studentAPI } from '../../services/api';

const typeConfig = {
  deadline:             { icon: '⏰', label: 'Deadline Alert', bg: '#fee2e2', color: '#dc2626' },
  new_scholarship:      { icon: '🎓', label: 'New Scheme',     bg: '#d1fae5', color: '#059669' },
  status_update:        { icon: '📋', label: 'Status Update',  bg: '#dbeafe', color: '#2563eb' },
  system:               { icon: '🔧', label: 'System',         bg: '#f1f5f9', color: '#64748b' },
  deadline_email:       { icon: '📧', label: 'Email Sent',     bg: '#fef3c7', color: '#d97706' },
  new_scholarship_email:{ icon: '📧', label: 'Email Sent',     bg: '#fef3c7', color: '#d97706' },
};

const TYPES = ['all','deadline','new_scholarship','status_update','system'];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetch = async (pg = 1, type = typeFilter) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: LIMIT };
      if (type !== 'all') params.type = type;
      const res = await studentAPI.getNotifications(params);
      setNotifications(res.data.data);
      setTotal(res.data.total);
      setUnread(res.data.unread);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(1, typeFilter); }, [typeFilter]);

  const markRead = async (id) => {
    await studentAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(u => Math.max(0, u - 1));
  };

  const deleteOne = async (id) => {
    const n = notifications.find(n => n._id === id);
    await studentAPI.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (!n?.isRead) setUnread(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await studentAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    await studentAPI.clearAll();
    setNotifications([]); setUnread(0); setTotal(0);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#60a5fa,transparent)' }} />
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#93c5fd' }}>Stay updated</p>
            <h1 className="font-display text-2xl font-semibold text-white mb-1 flex items-center gap-2">
              🔔 Notifications
              {unread > 0 && (
                <span className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: '#dc2626', color: 'white' }}>{unread}</span>
              )}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{total} total notifications</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {unread > 0 && (
              <button onClick={markAllRead}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
                🗑 Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              background: typeFilter === t ? '#059669' : 'white',
              color: typeFilter === t ? 'white' : '#475569',
              border: `1.5px solid ${typeFilter === t ? '#059669' : '#e2e8f0'}`,
              boxShadow: typeFilter === t ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
            }}>
            {t === 'all' ? 'All' : typeConfig[t]?.label || t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 flex gap-3 animate-pulse">
              <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-6xl mb-4">🔔</p>
          <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">All caught up!</h3>
          <p className="text-navy-500 text-sm">You'll be notified about new scholarships and upcoming deadlines.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.system;
              return (
                <div key={n._id}
                  className="card flex items-start gap-3 p-4 transition-all animate-fade-up hover:shadow-card-hover"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    borderLeft: !n.isRead ? `3px solid ${cfg.color}` : '3px solid transparent',
                    background: !n.isRead ? '#fafffe' : 'white',
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge text-xs" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                      )}
                    </div>
                    <p className="text-sm text-navy-800 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-navy-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors"
                        style={{ background: '#d1fae5', color: '#059669' }} title="Mark read">✓</button>
                    )}
                    <button onClick={() => deleteOne(n._id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors hover:bg-red-50"
                      style={{ color: '#dc2626' }} title="Delete">🗑</button>
                  </div>
                </div>
              );
            })}
          </div>

          {total > LIMIT && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page === 1} onClick={() => fetch(page - 1)}
                className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-navy-500 font-medium">{page} / {Math.ceil(total / LIMIT)}</span>
              <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => fetch(page + 1)}
                className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
