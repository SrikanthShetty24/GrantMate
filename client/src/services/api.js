import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/admin/login'];
      const isPublic = publicPaths.some(p => path === p || path.startsWith(p));
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Student
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  createProfile: (data) => api.post('/student/profile', data),
  updateProfile: (data) => api.put('/student/profile', data),
  getEligible: () => api.get('/student/eligible'),
  getScholarships: (params) => api.get('/student/scholarships', { params }),
  save: (id) => api.post(`/student/save/${id}`),
  unsave: (id) => api.delete(`/student/save/${id}`),
  markApplied: (id) => api.put(`/student/applied/${id}`),
  getSaved: () => api.get('/student/saved'),
  getNotifications: (params) => api.get('/student/notifications', { params }),
  markRead: (id) => api.put(`/student/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/student/notifications/${id}`),
  markAllRead: () => api.put('/student/notifications/read-all'),
  clearAll: () => api.delete('/student/notifications/clear-all'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getScholarships: (params) => api.get('/admin/scholarships', { params }),
  addScholarship: (data) => api.post('/admin/scholarships', data),
  updateScholarship: (id, data) => api.put(`/admin/scholarships/${id}`, data),
  deleteScholarship: (id) => api.delete(`/admin/scholarships/${id}`),
  verify: (id) => api.put(`/admin/scholarships/${id}/verify`),
  unverify: (id) => api.put(`/admin/scholarships/${id}/unverify`),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getApplications: (params) => api.get('/admin/applications', { params }),
  updateAppStatus: (id, status) => api.put(`/admin/applications/${id}/status`, { status }),
  fetchScholarships: () => api.post('/admin/api/fetch'),
  approveScholarships: (scholarships) => api.post('/admin/api/approve', { scholarships }),
  sendAlerts: () => api.post('/admin/email/send-alerts'),
};

export default api;
