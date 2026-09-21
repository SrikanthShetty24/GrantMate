import React, { useEffect, useState } from 'react';
import { studentAPI } from '../../services/api';

const COURSES = ['Engineering','Medical','Arts','Commerce','Science','Law','Management','Polytechnic','ITI','Other'];
const CATEGORIES = ['General','OBC','SC','ST','EWS','Minority'];
const GENDERS = ['Male','Female','Other'];
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Andaman and Nicobar Islands','Dadra and Nagar Haveli','Daman and Diu','Lakshadweep'];

const defaultForm = { course:'', category:'', annualIncome:'', state:'', gender:'', percentage:'', phone:'', institution:'', dob:'' };

const Field = ({ label, children, hint }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {hint && <p className="text-xs text-navy-400 mt-1">{hint}</p>}
  </div>
);

export default function Profile() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    studentAPI.getProfile()
      .then(res => {
        const p = res.data.data;
        setForm({ course:p.course, category:p.category, annualIncome:p.annualIncome, state:p.state, gender:p.gender, percentage:p.percentage, phone:p.phone, institution:p.institution, dob: p.dob ? p.dob.split('T')[0] : '' });
      })
      .catch(err => { if (err.response?.status === 404) setIsNew(true); })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = { ...form, annualIncome: Number(form.annualIncome), percentage: Number(form.percentage) };
      if (isNew) { await studentAPI.createProfile(payload); setIsNew(false); setSuccess('Profile created! You can now view your eligible scholarships.'); }
      else { await studentAPI.updateProfile(payload); setSuccess('Profile updated successfully.'); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to save profile.'); }
    finally { setSaving(false); }
  };

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  if (loading) return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div className="skeleton h-32 rounded-3xl" />
      <div className="card p-6 space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#065f46 0%,#0f172a 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#6ee7b7,transparent)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-1" style={{ color: '#6ee7b7' }}>Academic Information</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">👤 My Profile</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {isNew ? 'Fill in your details to get matched with scholarships.' : 'Keep your information up to date for accurate matching.'}
          </p>
        </div>
      </div>

      {isNew && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <span className="text-xl flex-shrink-0">👋</span>
          <div>
            <p className="font-bold text-emerald-900 text-sm mb-0.5">Welcome! Let's set up your profile</p>
            <p className="text-xs text-emerald-700">This takes less than 2 minutes. Your details are used only for scholarship matching.</p>
          </div>
        </div>
      )}

      <div className="card p-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: '#fee2e2', color: '#dc2626' }}>⚠ {error}</div>
        )}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: '#d1fae5', color: '#047857' }}>✓ {success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="📚 Course / Stream *">
              <select className="input" value={form.course} onChange={set('course')} required>
                <option value="">Select your course</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="🏷️ Category *">
              <select className="input" value={form.category} onChange={set('category')} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="💰 Annual Family Income (₹) *" hint="Used to check income-based eligibility">
              <input className="input" type="number" placeholder="e.g. 250000" min={0} value={form.annualIncome} onChange={set('annualIncome')} required />
            </Field>
            <Field label="📊 Last Exam Percentage *">
              <input className="input" type="number" placeholder="e.g. 78.5" min={0} max={100} step={0.01} value={form.percentage} onChange={set('percentage')} required />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="📍 State *">
              <select className="input" value={form.state} onChange={set('state')} required>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="👤 Gender *">
              <select className="input" value={form.gender} onChange={set('gender')} required>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="📱 Phone Number *" hint="Used for OTP-based password reset only">
              <input className="input" type="tel" placeholder="10-digit mobile number" maxLength={10} value={form.phone} onChange={set('phone')} required />
            </Field>
            <Field label="🎂 Date of Birth *">
              <input className="input" type="date" value={form.dob} onChange={set('dob')} required />
            </Field>
          </div>

          <Field label="🏫 Institution / College Name *">
            <input className="input" type="text" placeholder="e.g. Delhi University, IIT Bombay" value={form.institution} onChange={set('institution')} required />
          </Field>

          {/* Matching preview */}
          {form.course && form.category && (
            <div className="p-4 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-xs font-bold text-emerald-800 mb-2">✓ Matching criteria ready</p>
              <div className="flex flex-wrap gap-2">
                {[
                  form.course && `📚 ${form.course}`,
                  form.category && `🏷️ ${form.category}`,
                  form.state && `📍 ${form.state}`,
                  form.gender && `👤 ${form.gender}`,
                  form.percentage && `📊 ${form.percentage}%`,
                  form.annualIncome && `💰 ₹${Number(form.annualIncome).toLocaleString('en-IN')}`,
                ].filter(Boolean).map((item, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: '#d1fae5', color: '#065f46' }}>{item}</span>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={saving}>
            {saving
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isNew ? 'Create Profile & Find Scholarships →' : 'Update Profile'}
          </button>
        </form>
      </div>

      <p className="text-xs text-navy-400 text-center pb-4">
        🔒 Your profile data is used only for scholarship matching. Never shared with third parties.
      </p>
    </div>
  );
}
