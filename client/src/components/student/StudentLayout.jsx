import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

const navLinks = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/eligible', icon: '🎯', label: 'Eligible' },
  { to: '/scholarships', icon: '🏛️', label: 'All Schemes' },
  { to: '/saved', icon: '🔖', label: 'Saved' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
  { to: '/notifications', icon: '🔔', label: 'Notifications', badge: true },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/eligible': 'Eligible Scholarships',
  '/scholarships': 'All Schemes',
  '/saved': 'Saved Scholarships',
  '/profile': 'My Profile',
  '/notifications': 'Notifications',
};

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    studentAPI.getNotifications({ limit: 1 })
      .then(res => setUnread(res.data.unread || 0))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>G</div>
          <span className="font-display font-semibold text-navy-900 text-lg">GrantMate</span>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 mx-3 mt-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">{user?.name}</p>
            <p className="text-xs text-navy-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Menu</p>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="text-lg leading-none">{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            {link.badge && unread > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ background: '#dc2626' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-navy-100">
        <button onClick={handleLogout}
          className="nav-link w-full hover:text-red-500"
          style={{ '--hover-bg': '#fee2e2' }}>
          <span className="text-lg leading-none">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-navy-100 flex-shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col w-64 bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
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
                {pageTitles[location.pathname] || 'GrantMate'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/notifications" className="relative p-2 rounded-xl hover:bg-navy-50 text-navy-500 hover:text-navy-800 transition-colors">
              🔔
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center"
                  style={{ background: '#dc2626', fontSize: '9px' }}>{unread}</span>
              )}
            </NavLink>
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
