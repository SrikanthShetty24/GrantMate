import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = end / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
};

const schemes = [
  { name: 'NSP Central Sector Scheme', amount: '₹20,000/yr', tag: 'All Categories', color: '#059669' },
  { name: 'AICTE Pragati for Girls', amount: '₹30,000/yr', tag: 'Engineering · Girls', color: '#7c3aed' },
  { name: 'Post Matric SC Scholarship', amount: 'Full tuition', tag: 'SC Category', color: '#2563eb' },
  { name: 'DST INSPIRE SHE', amount: '₹80,000/yr', tag: 'Science · Merit', color: '#d97706' },
  { name: 'UGC PG SC/ST Scholarship', amount: '₹3,100/mo', tag: 'SC / ST', color: '#dc2626' },
  { name: 'OBC Post Matric Scheme', amount: 'Variable', tag: 'OBC Category', color: '#059669' },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="22" fill="#d1fae5"/>
        <path d="M14 24l7 7 13-14" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Smart Matching',
    desc: 'Our engine matches 6 criteria simultaneously — income, category, course, state, percentage, and gender — in real time.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="22" fill="#fef3c7"/>
        <path d="M24 14v10l6 4" stroke="#d97706" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="8" stroke="#d97706" strokeWidth="2.5"/>
      </svg>
    ),
    title: 'Deadline Alerts',
    desc: 'Get email notifications 7 days before any scholarship deadline that matches your profile. Never miss a chance.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="22" fill="#dbeafe"/>
        <rect x="14" y="16" width="20" height="16" rx="3" stroke="#2563eb" strokeWidth="2.5"/>
        <path d="M19 22h10M19 26h6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Official Sources Only',
    desc: 'Every scheme is from NSP, AICTE, UGC, DST, or data.gov.in. Admin-verified before it reaches you.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="22" fill="#ede9fe"/>
        <path d="M18 24h12M24 18v12" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Track Applications',
    desc: 'Save scholarships, mark them applied, and see your full application history in one place.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="22" fill="#fee2e2"/>
        <path d="M24 14c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 14l4 4-4 4" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'OTP Password Reset',
    desc: 'Secure account recovery via email OTP — your registered email receives the code directly.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="22" fill="#d1fae5"/>
        <path d="M16 24l2.5 2.5L24 21M28 17l4 4-8 8" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Secure & Private',
    desc: 'JWT in HTTP-only cookies, bcrypt-12 hashing, rate-limited APIs. Your data is never sold.',
  },
];

const steps = [
  { n: '01', title: 'Create Account', desc: 'Register in 30 seconds with your name, email and password.' },
  { n: '02', title: 'Fill Your Profile', desc: 'Enter your course, category, income, state and percentage once.' },
  { n: '03', title: 'Get Matched', desc: 'Our engine instantly shows every scholarship you qualify for.' },
  { n: '04', title: 'Apply & Track', desc: 'Save schemes, apply on official sites, track your progress here.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>G</div>
            <span className="font-display font-semibold text-navy-900 text-lg tracking-tight">GrantMate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost hidden sm:flex">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #059669, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #d97706, transparent)' }} />
          {/* Floating dots */}
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full opacity-20"
              style={{
                background: i % 3 === 0 ? '#059669' : i % 3 === 1 ? '#d97706' : '#fff',
                left: `${(i * 17 + 5) % 95}%`,
                top: `${(i * 13 + 10) % 85}%`,
                animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-up stagger-1"
                style={{ background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', border: '1px solid rgba(5,150,105,0.3)' }}>
                🇮🇳 Built for Indian Students
              </div>
              <h1 className="font-display text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6 animate-fade-up stagger-2">
                Find Scholarships<br />
                <em className="not-italic" style={{ color: '#6ee7b7' }}>You Actually</em><br />
                Qualify For
              </h1>
              <p className="text-lg mb-10 leading-relaxed animate-fade-up stagger-3"
                style={{ color: 'rgba(255,255,255,0.7)' }}>
                Stop scrolling through hundreds of schemes. GrantMate matches NSP, AICTE, UGC and DST scholarships to your exact profile in seconds.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up stagger-4">
                <Link to="/register" className="btn-primary text-base py-3.5 px-8">
                  Find My Scholarships →
                </Link>
                <Link to="/login" className="btn text-base py-3.5 px-8 rounded-xl font-semibold"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                  Sign In
                </Link>
              </div>
              <p className="text-sm mt-5 animate-fade-up stagger-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Free forever · No hidden fees · Government data only
              </p>
            </div>

            {/* Right: floating scholarship cards */}
            <div className="hidden lg:block relative h-96">
              <div className="absolute top-0 right-8 w-72 card p-4 animate-fade-up stagger-2"
                style={{ animation: 'float 4s ease-in-out infinite' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#059669' }}>N</div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">NSP Central Sector Scheme</p>
                    <p className="text-xs text-navy-500">National Scholarship Portal</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="badge-green">₹20,000/yr</span>
                  <span className="text-xs text-red-500 font-semibold">45 days left</span>
                </div>
              </div>

              <div className="absolute top-32 left-0 w-64 card p-4"
                style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#7c3aed' }}>A</div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">AICTE Pragati</p>
                    <p className="text-xs text-navy-500">For Girl Students</p>
                  </div>
                </div>
                <span className="badge-purple">₹30,000/yr</span>
              </div>

              <div className="absolute bottom-8 right-16 w-68 card p-4"
                style={{ animation: 'float 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#d97706' }}>D</div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">DST INSPIRE SHE</p>
                    <p className="text-xs text-navy-500">Science Excellence</p>
                  </div>
                </div>
                <span className="badge-yellow">₹80,000/yr</span>
              </div>

              {/* Matched badge */}
              <div className="absolute top-16 right-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-white"
                style={{ background: 'rgba(5,150,105,0.9)', backdropFilter: 'blur(8px)', animation: 'pulse-ring 2s infinite' }}>
                ✓ 8 scholarships matched!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
<section className="py-14 border-b border-navy-100" style={{ background: '#f8fafc' }}>
  <div className="max-w-6xl mx-auto px-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
      {[
        { value: 12, suffix: '+', label: 'Government Schemes' },
        { value: 50, suffix: 'L+', label: 'Max Scholarship Amount' },
        { value: 6, suffix: '', label: 'Matching Criteria' },
        { value: 100, suffix: '%', label: 'Free to Use' },
      ].map((s, i) => (
        <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <p className="font-display text-4xl font-bold mb-1" style={{ color: '#059669' }}>
            <CountUp end={s.value} suffix={s.suffix} />
          </p>
          <p className="text-sm font-medium" style={{ color: '#475569' }}>{s.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
       

      {/* ── How it works ── */}
      <section className="py-24 px-6 mesh-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-green text-xs mb-3 inline-block">Simple Process</span>
            <h2 className="font-display text-4xl text-navy-900 mb-4">How GrantMate works</h2>
            <p className="text-navy-500 max-w-xl mx-auto">Four simple steps from registration to finding your scholarship</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="card-hover p-6 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="font-mono text-4xl font-bold mb-4" style={{ color: '#d1fae5' }}>{s.n}</div>
                <h3 className="font-display text-lg text-navy-900 mb-2">{s.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Scholarships ── */}
      <section className="py-24 px-6" style={{ background: '#0f172a' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge text-xs mb-3 inline-block" style={{ background: 'rgba(5,150,105,0.2)', color: '#6ee7b7' }}>
              Real Government Schemes
            </span>
            <h2 className="font-display text-4xl text-white mb-4">Scholarships available on GrantMate</h2>
            <p className="text-navy-400 max-w-xl mx-auto">All verified, all official, updated regularly</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((s, i) => (
              <div key={i} className="p-5 rounded-2xl border animate-fade-up"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  animationDelay: `${i * 0.1}s`,
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: s.color }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{s.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: '#6ee7b7' }}>{s.amount}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary text-sm">
              See All Scholarships You Qualify For →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 mesh-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-blue text-xs mb-3 inline-block">Everything you need</span>
            <h2 className="font-display text-4xl text-navy-900 mb-4">Built for Indian students</h2>
            <p className="text-navy-500 max-w-xl mx-auto">Not a generic scholarship site — built specifically for navigating India's government scholarship ecosystem</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-hover p-6 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-display text-lg text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg, #064e3b, #0f172a)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl text-white mb-4">Ready to find your scholarship?</h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Create your profile once. Get matched to every government scheme you're eligible for — instantly.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-navy-900 font-bold text-base transition-all hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', boxShadow: '0 8px 30px rgba(5,150,105,0.4)' }}>
            Get Started Free →
          </Link>
          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            ⚠️ Always verify details on the official website before applying.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-navy-200/20" style={{ background: '#0f172a' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: '#059669' }}>G</div>
            <span className="font-display font-semibold text-white">GrantMate</span>
          </div>
          <p className="text-xs text-center text-navy-500">
            GrantMate is an information aggregator. Always verify on official websites before applying.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-navy-400 hover:text-white transition-colors">Student Login</Link>
            <Link to="/admin/login" className="text-xs text-navy-400 hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
