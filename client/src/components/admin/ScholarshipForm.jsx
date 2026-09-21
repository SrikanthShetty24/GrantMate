import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const COURSES = ['All','Engineering','Medical','Arts','Commerce','Science','Law','Management','Polytechnic','ITI','Other'];
const CATEGORIES = ['All','General','OBC','SC','ST','EWS','Minority'];
const STATES = ['All','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];

const defaultForm = { title:'', description:'', amount:'', officialLink:'', sourceUrl:'', source:'', deadline:'', incomeLimit:0, minPercentage:0, genderRequired:'All', courseRequired:['All'], categoryRequired:['All'], state:['All'] };

const MultiSelect = ({ label, options, value, onChange }) => {
  const toggle = (opt) => {
    if (opt === 'All') return onChange(['All']);
    const without = value.filter(v => v !== 'All');
    const next = without.includes(opt) ? without.filter(v => v !== opt) : [...without, opt];
    onChange(next.length === 0 ? ['All'] : next);
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={value.includes(opt)
              ? { background: '#059669', color: 'white', borderColor: '#059669' }
              : { background: 'white', color: '#475569', borderColor: '#e2e8f0' }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ScholarshipForm({ mode = 'add' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && id) {
      adminAPI.getScholarships({})
        .then(res => {
          const s = res.data.data.find(x => x._id === id);
          if (s) setForm({ title:s.title, description:s.description, amount:s.amount, officialLink:s.officialLink, sourceUrl:s.sourceUrl, source:s.source, deadline:s.deadline ? s.deadline.split('T')[0] : '', incomeLimit:s.incomeLimit, minPercentage:s.minPercentage, genderRequired:s.genderRequired, courseRequired:s.courseRequired, categoryRequired:s.categoryRequired, state:s.state });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  const setArr = key => val => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...form, incomeLimit: Number(form.incomeLimit), minPercentage: Number(form.minPercentage) };
      if (mode === 'add') await adminAPI.addScholarship(payload);
      else await adminAPI.updateScholarship(id, payload);
      navigate('/admin/scholarships');
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <div className="skeleton h-32 rounded-3xl" />
      <div className="card p-6 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#065f46 0%,#0f172a 100%)' }}>
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#6ee7b7' }}>
            {mode === 'add' ? 'New Entry' : 'Editing'}
          </p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">
            {mode === 'add' ? '➕ Add Scholarship' : '✏️ Edit Scholarship'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {mode === 'add' ? 'Manually add a verified government scholarship.' : 'Update scholarship details.'}
          </p>
        </div>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl text-sm font-medium" style={{ background: '#fee2e2', color: '#dc2626' }}>⚠ {error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">📋 Title *</label>
            <input className="input" value={form.title} onChange={set('title')} required placeholder="e.g. NSP Central Sector Scheme" />
          </div>
          <div>
            <label className="label">📝 Description *</label>
            <textarea className="input h-24 resize-none" value={form.description} onChange={set('description')} required placeholder="Brief description..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">💰 Amount *</label>
              <input className="input" value={form.amount} onChange={set('amount')} required placeholder="e.g. ₹10,000 per annum" />
            </div>
            <div>
              <label className="label">📅 Deadline *</label>
              <input className="input" type="date" value={form.deadline} onChange={set('deadline')} required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">💰 Income Limit (₹)</label>
              <input className="input" type="number" min={0} value={form.incomeLimit} onChange={set('incomeLimit')} placeholder="0 = no limit" />
            </div>
            <div>
              <label className="label">📊 Min Percentage</label>
              <input className="input" type="number" min={0} max={100} value={form.minPercentage} onChange={set('minPercentage')} placeholder="0 = no minimum" />
            </div>
          </div>
          <div>
            <label className="label">👤 Gender Requirement</label>
            <select className="input" value={form.genderRequired} onChange={set('genderRequired')}>
              <option value="All">All Genders</option>
              <option value="Female">Female Only</option>
              <option value="Male">Male Only</option>
            </select>
          </div>
          <MultiSelect label="🎓 Eligible Courses" options={COURSES} value={form.courseRequired} onChange={setArr('courseRequired')} />
          <MultiSelect label="🏷️ Eligible Categories" options={CATEGORIES} value={form.categoryRequired} onChange={setArr('categoryRequired')} />
          <MultiSelect label="📍 Eligible States" options={STATES} value={form.state} onChange={setArr('state')} />
          <div>
            <label className="label">🔗 Official Application Link *</label>
            <input className="input" type="url" value={form.officialLink} onChange={set('officialLink')} required placeholder="https://scholarships.gov.in/..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">🏛️ Source Name *</label>
              <input className="input" value={form.source} onChange={set('source')} required placeholder="e.g. NSP, AICTE, UGC" />
            </div>
            <div>
              <label className="label">🌐 Source URL *</label>
              <input className="input" type="url" value={form.sourceUrl} onChange={set('sourceUrl')} required placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 py-3.5" disabled={saving}>
              {saving
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : mode === 'add' ? 'Add & Publish Scholarship' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/admin/scholarships')} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
