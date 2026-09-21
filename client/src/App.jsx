import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/AdminLogin';

// Student pages
import StudentLayout from './components/student/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import Scholarships from './pages/student/Scholarships';
import Eligible from './pages/student/Eligible';
import Saved from './pages/student/Saved';
import Profile from './pages/student/Profile';
import Notifications from './pages/student/Notifications';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminScholarships from './pages/admin/AdminScholarships';
import AddScholarship from './pages/admin/AddScholarship';
import EditScholarship from './pages/admin/EditScholarship';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApplications from './pages/admin/AdminApplications';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

          {/* Student */}
          <Route path="/" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scholarships" element={<Scholarships />} />
            <Route path="eligible" element={<Eligible />} />
            <Route path="saved" element={<Saved />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="scholarships" element={<AdminScholarships />} />
            <Route path="add" element={<AddScholarship />} />
            <Route path="edit/:id" element={<EditScholarship />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="applications" element={<AdminApplications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
