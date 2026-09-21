import React from 'react';

const urgencyConfig = {
  red:     { label: 'Closing Soon', bg: '#fee2e2', color: '#dc2626', bar: '#dc2626' },
  yellow:  { label: 'This Month',   bg: '#fef3c7', color: '#d97706', bar: '#d97706' },
  green:   { label: 'Open',         bg: '#d1fae5', color: '#059669', bar: '#059669' },
  expired: { label: 'Expired',      bg: '#f1f5f9', color: '#64748b', bar: '#94a3b8' },
};

const sourceColors = {
  'NSP': '#059669', 'AICTE': '#7c3aed', 'UGC': '#2563eb',
  'DST': '#d97706', 'data.gov.in': '#059669', 'default': '#64748b',
};

export default function ScholarshipCard({ scholarship, onSave, onUnsave, onMarkApplied, showActions = true }) {
  const {
    _id, title, description, amount, deadline, source, sourceUrl,
    officialLink, categoryRequired, courseRequired,
    urgency = 'green', applicationStatus,
  } = scholarship;

  const urg = urgencyConfig[urgency] || urgencyConfig.green;
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const srcColor = sourceColors[source] || sourceColors.default;
  const initials = source?.substring(0, 2)?.toUpperCase() || 'GM';

  return (
    <div className="card-hover flex flex-col relative overflow-hidden animate-fade-up"
      style={{ borderRadius: '20px' }}>
      {/* Urgency top bar */}
      <div className="h-1 w-full" style={{ background: urg.bar }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${srcColor}, ${srcColor}cc)` }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy-900 text-sm leading-snug line-clamp-2 mb-0.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium hover:underline transition-colors"
              style={{ color: srcColor }}>
              {source} ↗
            </a>
          </div>
          <span className="badge flex-shrink-0 text-xs"
            style={{ background: urg.bg, color: urg.color }}>
            {urg.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {categoryRequired?.filter(c => c !== 'All').slice(0, 2).map(c => (
            <span key={c} className="badge-blue text-xs">{c}</span>
          ))}
          {categoryRequired?.includes('All') && <span className="badge-green text-xs">All Categories</span>}
          {courseRequired?.filter(c => c !== 'All').slice(0, 1).map(c => (
            <span key={c} className="badge-purple text-xs">{c}</span>
          ))}
          {courseRequired?.includes('All') && <span className="badge-purple text-xs">All Courses</span>}
        </div>

        {/* Amount & deadline */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl"
          style={{ background: '#f8fafc' }}>
          <div>
            <p className="text-xs text-navy-400 font-medium">Amount</p>
            <p className="text-sm font-bold text-navy-900">{amount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-navy-400 font-medium">Deadline</p>
            <p className={`text-sm font-bold ${daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-navy-700'}`}>
              {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
            </p>
          </div>
        </div>

        {/* Deadline date */}
        <p className="text-xs text-navy-400">
          📅 {new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl text-xs"
          style={{ background: '#fefce8', color: '#a16207' }}>
          <span className="flex-shrink-0">⚠️</span>
          <span>Verify details on the official website before applying.</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-1 mt-auto">
            <a href={officialLink} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 text-xs font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
              Apply Official ↗
            </a>

            {applicationStatus === 'Applied' ? (
              <div className="px-3 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1"
                style={{ background: '#d1fae5', color: '#047857' }}>
                ✓ Applied
              </div>
            ) : applicationStatus === 'Saved' ? (
              <div className="flex gap-1.5">
                <button onClick={() => onMarkApplied?.(_id)}
                  className="px-2.5 py-2 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: '#d1fae5', color: '#047857' }}>
                  ✓ Applied
                </button>
                <button onClick={() => onUnsave?.(_id)}
                  className="px-2.5 py-2 text-xs font-bold rounded-xl transition-all"
                  style={{ background: '#fee2e2', color: '#dc2626' }}>
                  🗑
                </button>
              </div>
            ) : (
              <button onClick={() => onSave?.(_id)}
                className="px-3 py-2.5 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: '#f1f5f9', color: '#475569' }}
                onMouseEnter={e => { e.target.style.background = '#d1fae5'; e.target.style.color = '#059669'; }}
                onMouseLeave={e => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#475569'; }}>
                🔖 Save
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
