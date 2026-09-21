import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/scholarships', icon: '🏛️', label: 'Scholarships' },
  { to: '/admin/add', icon: '➕', label: 'Add Scholarship' },
  { to: '/admin/users', icon: '👥', label: 'Students' },
  { to: '/admin/applications', icon: '📋', label: 'Applications' },
];

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/scholarships': 'Scholarships',
  '/admin/add': 'Add Scholarship',
  '/admin/users': 'Students',
  '/admin/applications': 'Applications',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/admin/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>G</div>
          <div>
            <span className="font-display font-semibold text-navy-900 text-base block leading-tight">GrantMate</span>
            <span className="text-xs font-medium" style={{ color: '#059669' }}>Admin Console</span>
          </div>
        </div>
      </div>

      {/* Admin card */}
      <div className="px-4 py-4 mx-3 mt-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">{user?.name}</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#047857' }}>
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Admin Menu</p>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/admin/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="text-lg leading-none">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-navy-100">
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:bg-red-50 hover:text-red-600">
          <span className="text-lg leading-none">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-navy-100 flex-shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col w-64 bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-navy-100 px-6 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-xl hover:bg-navy-50 text-navy-600"
              onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <h2 className="font-display font-semibold text-navy-900 text-lg leading-tight">
                {pageTitles[location.pathname] || 'Admin'}
              </h2>
              <p className="text-xs text-navy-400">GrantMate Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="page-enter p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
