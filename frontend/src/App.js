import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import './App.css';
import {
  LayoutDashboard, Users, Building2, Calendar, Clock, Briefcase, FileText,
  Settings, LogOut, ChevronDown, Menu, X, Search, Bell, UserCircle,
  TrendingUp, UserPlus, CalendarDays, ClipboardList, DollarSign
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, data);
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Login Page
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role: 'hr' });
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary"></div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7" />
            </div>
            <h1 className="font-heading text-4xl font-bold mb-4">BambooClone HR</h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Modern HR management for growing teams. Streamline your people operations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {['Employee Management', 'Leave Tracking', 'Attendance', 'Payroll'].map((feature, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-4">
                <p className="text-sm font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">BambooClone HR</h1>
          </div>

          <div className="card p-8">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 mb-8">
              {isRegister ? 'Start managing your team today' : 'Sign in to your account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    data-testid="register-fullname-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isRegister && (
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    data-testid="forgot-password-link"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
              <button
                data-testid="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 text-base"
              >
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                data-testid="toggle-auth-mode-btn"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-primary hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Demo: admin@bambooclone.com / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forgot Password Page
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSubmitted(true);
      toast.success('Check your email for reset instructions');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 mt-2">No worries, we'll send you reset instructions</p>
        </div>

        <div className="card p-8" data-testid="forgot-password-page">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  data-testid="forgot-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <button
                data-testid="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 text-base"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Check your email</h3>
              <p className="text-slate-500 text-sm mb-6">
                We sent a password reset link to<br />
                <strong className="text-slate-700">{email}</strong>
              </p>
              <button
                onClick={() => navigate('/reset-password')}
                className="btn-primary w-full"
                data-testid="enter-token-btn"
              >
                Enter Reset Token
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reset Password Page
const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for token in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token: token,
        new_password: newPassword
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-slate-500 mt-2">Enter your reset token and new password</p>
        </div>

        <div className="card p-8" data-testid="reset-password-page">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reset Token</label>
                <input
                  data-testid="reset-token-input"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  className="input-field font-mono text-center text-lg tracking-widest"
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter the 6-character code from your email</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <input
                  data-testid="reset-new-password-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <input
                  data-testid="reset-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <button
                data-testid="reset-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 text-base"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Password Reset!</h3>
              <p className="text-slate-500 text-sm mb-6">
                Your password has been reset successfully.<br />
                You can now login with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
                data-testid="go-to-login-btn"
              >
                Go to Login
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isEmployee = user?.role === 'employee';
  const isHR = ['super_admin', 'admin', 'hr', 'manager'].includes(user?.role);

  // Role-based navigation
  const employeeNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/my-profile', icon: UserCircle },
    { name: 'Timesheets', href: '/timesheets', icon: ClipboardList },
    { name: 'My Attendance', href: '/attendance', icon: Clock },
    { name: 'My Leaves', href: '/leave', icon: CalendarDays },
  ];

  const hrNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Timesheets', href: '/timesheets', icon: ClipboardList },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leave', href: '/leave', icon: CalendarDays },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const navigation = isEmployee ? employeeNav : hrNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">BambooClone</span>
            <button className="ml-auto lg:hidden" onClick={onClose}>
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <div className="px-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isEmployee ? 'Self Service' : 'Main Menu'}
              </p>
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
              <button
                data-testid="logout-btn"
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Header
const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6">
      <button
        data-testid="mobile-menu-btn"
        className="lg:hidden p-2 -ml-2 mr-2 hover:bg-slate-100 rounded-lg"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      <div className="flex-1 flex items-center gap-4">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            data-testid="global-search-input"
            type="text"
            placeholder="Search employees, departments..."
            className="input-field pl-10 h-10 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          data-testid="notifications-btn"
          className="p-2 hover:bg-slate-100 rounded-lg relative"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.full_name}</span>
        </div>
      </div>
    </header>
  );
};

// Dashboard Layout
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="py-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, attendanceRes, onboardingRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/stats`),
        axios.get(`${API_URL}/api/attendance/today`),
        axios.get(`${API_URL}/api/onboarding/status`)
      ]);
      setStats(statsRes.data);
      setTodayAttendance(attendanceRes.data);
      setOnboardingStatus(onboardingRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      await axios.post(`${API_URL}/api/attendance/clock-in`);
      toast.success('Clocked in successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await axios.post(`${API_URL}/api/attendance/clock-out`);
      toast.success('Clocked out successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to clock out');
    }
  };

  const statCards = [
    { label: 'Total Employees', value: stats?.total_employees || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Departments', value: stats?.total_departments || 0, icon: Building2, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Leaves', value: stats?.pending_leaves || 0, icon: CalendarDays, color: 'bg-amber-50 text-amber-600' },
    { label: 'Present Today', value: stats?.present_today || 0, icon: Clock, color: 'bg-green-50 text-green-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your HR overview.</p>
        </div>
        <div className="flex gap-3">
          {!todayAttendance?.check_in ? (
            <button data-testid="clock-in-btn" onClick={handleClockIn} className="btn-primary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Clock In
            </button>
          ) : !todayAttendance?.check_out ? (
            <button data-testid="clock-out-btn" onClick={handleClockOut} className="btn-secondary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Clock Out
            </button>
          ) : (
            <span className="badge badge-success">Day Complete</span>
          )}
        </div>
      </div>

      {/* Onboarding Banner */}
      {onboardingStatus && !onboardingStatus.completed && (
        <div className="mb-8 card p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20" data-testid="onboarding-banner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-slate-900">Complete Your Setup</h3>
                <p className="text-sm text-slate-600">
                  Get started by setting up departments, leave types, and inviting your team.
                </p>
              </div>
            </div>
            <button
              data-testid="start-onboarding-btn"
              onClick={() => navigate('/onboarding')}
              className="btn-primary"
            >
              Start Setup
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <div className={`flex items-center gap-2 text-sm ${onboardingStatus.departments_created ? 'text-green-600' : 'text-slate-500'}`}>
              {onboardingStatus.departments_created ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current" />
              )}
              Departments ({onboardingStatus.counts?.departments || 0})
            </div>
            <div className={`flex items-center gap-2 text-sm ${onboardingStatus.leave_types_created ? 'text-green-600' : 'text-slate-500'}`}>
              {onboardingStatus.leave_types_created ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current" />
              )}
              Leave Types ({onboardingStatus.counts?.leave_types || 0})
            </div>
            <div className={`flex items-center gap-2 text-sm ${onboardingStatus.employees_invited ? 'text-green-600' : 'text-slate-500'}`}>
              {onboardingStatus.employees_invited ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current" />
              )}
              Employees ({onboardingStatus.counts?.employees || 0})
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="card stat-card" data-testid={`stat-card-${i}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 font-heading">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/employees" data-testid="quick-add-employee" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center">
              <UserPlus className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">Add Employee</span>
            </Link>
            <Link to="/leave" data-testid="quick-leave-requests" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center">
              <CalendarDays className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">Leave Requests</span>
            </Link>
            <Link to="/departments" data-testid="quick-departments" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center">
              <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">Departments</span>
            </Link>
            <Link to="/attendance" data-testid="quick-attendance" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center">
              <ClipboardList className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">Attendance</span>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Today's Attendance</h3>
          {todayAttendance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Check In</span>
                <span className="font-medium text-slate-900">
                  {todayAttendance.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString() : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Check Out</span>
                <span className="font-medium text-slate-900">
                  {todayAttendance.check_out ? new Date(todayAttendance.check_out).toLocaleTimeString() : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Status</span>
                <span className={`badge ${todayAttendance.status === 'present' ? 'badge-success' : 'badge-neutral'}`}>
                  {todayAttendance.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No attendance recorded today</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Employees Page
const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
    designation: '',
    date_of_joining: '',
    employment_type: 'full-time',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get(`${API_URL}/api/employees`),
        axios.get(`${API_URL}/api/departments`)
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/employees`, formData);
      toast.success('Employee added successfully!');
      setShowModal(false);
      setFormData({
        employee_id: '', full_name: '', email: '', phone: '',
        department_id: '', designation: '', date_of_joining: '',
        employment_type: 'full-time', status: 'active'
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${API_URL}/api/employees/${id}`);
      toast.success('Employee deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || '-';

  return (
    <div data-testid="employees-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 mt-1">Manage your team members</p>
        </div>
        <button data-testid="add-employee-btn" onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            data-testid="employee-search-input"
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="table-row" data-testid={`employee-row-${emp.id}`}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{emp.full_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{emp.full_name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{getDeptName(emp.department_id)}</td>
                  <td>{emp.designation || '-'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button
                      data-testid={`delete-employee-${emp.id}`}
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" data-testid="add-employee-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Add Employee</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                  <input
                    data-testid="emp-id-input"
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    data-testid="emp-name-input"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    data-testid="emp-email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    data-testid="emp-phone-input"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select
                    data-testid="emp-dept-select"
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                  <input
                    data-testid="emp-designation-input"
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Joining</label>
                  <input
                    data-testid="emp-doj-input"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({...formData, date_of_joining: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                  <select
                    data-testid="emp-type-select"
                    value={formData.employment_type}
                    onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                    className="input-field"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="submit-employee-btn" className="btn-primary flex-1">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Departments Page
const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/departments`);
      setDepartments(res.data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/departments`, formData);
      toast.success('Department created!');
      setShowModal(false);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await axios.delete(`${API_URL}/api/departments/${id}`);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to delete department');
    }
  };

  return (
    <div data-testid="departments-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-500 mt-1">Manage organization structure</p>
        </div>
        <button data-testid="add-dept-btn" onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="card p-6 card-hover" data-testid={`dept-card-${dept.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <span className="badge badge-neutral">{dept.code}</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{dept.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{dept.description || 'No description'}</p>
              <button
                data-testid={`delete-dept-${dept.id}`}
                onClick={() => handleDelete(dept.id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No departments found. Create your first department.
            </div>
          )}
        </div>
      )}

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="add-dept-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Add Department</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                <input
                  data-testid="dept-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Code</label>
                <input
                  data-testid="dept-code-input"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  data-testid="dept-desc-input"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field h-24 py-2"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="submit-dept-btn" className="btn-primary flex-1">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Page
const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/attendance`);
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="attendance-page">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">Attendance</h1>
        <p className="text-slate-500 mt-1">Track daily attendance records</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr key={i} className="table-row" data-testid={`attendance-row-${i}`}>
                  <td className="font-medium">{rec.date}</td>
                  <td>{rec.check_in ? new Date(rec.check_in).toLocaleTimeString() : '-'}</td>
                  <td>{rec.check_out ? new Date(rec.check_out).toLocaleTimeString() : '-'}</td>
                  <td>
                    <span className={`badge ${rec.status === 'present' ? 'badge-success' : 'badge-neutral'}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Leave Page
const LeavePage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, typesRes] = await Promise.all([
        axios.get(`${API_URL}/api/leave-requests`),
        axios.get(`${API_URL}/api/leave-types`)
      ]);
      setRequests(reqRes.data);
      setLeaveTypes(typesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/leave-requests`, formData);
      toast.success('Leave request submitted!');
      setShowModal(false);
      setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/api/leave-requests/${id}/approve`);
      toast.success('Leave approved!');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/api/leave-requests/${id}/reject`);
      toast.success('Leave rejected');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject leave');
    }
  };

  const getTypeName = (id) => leaveTypes.find(t => t.id === id)?.name || '-';
  const canApprove = ['super_admin', 'admin', 'hr', 'manager'].includes(user?.role);

  return (
    <div data-testid="leave-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500 mt-1">Request and manage leaves</p>
        </div>
        <button data-testid="request-leave-btn" onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="table-row" data-testid={`leave-row-${req.id}`}>
                  <td className="font-medium">{getTypeName(req.leave_type_id)}</td>
                  <td>{req.start_date}</td>
                  <td>{req.end_date}</td>
                  <td className="max-w-xs truncate">{req.reason || '-'}</td>
                  <td>
                    <span className={`badge ${
                      req.status === 'approved' ? 'badge-success' :
                      req.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            data-testid={`approve-leave-${req.id}`}
                            onClick={() => handleApprove(req.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            data-testid={`reject-leave-${req.id}`}
                            onClick={() => handleReject(req.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={canApprove ? 6 : 5} className="text-center py-12 text-slate-500">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="request-leave-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Request Leave</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                <select
                  data-testid="leave-type-select"
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({...formData, leave_type_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Type</option>
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.days_allowed} days)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                  <input
                    data-testid="leave-start-input"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                  <input
                    data-testid="leave-end-input"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  data-testid="leave-reason-input"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="input-field h-24 py-2"
                  placeholder="Optional reason for leave"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="submit-leave-btn" className="btn-primary flex-1">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Page
const SettingsPage = () => {
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [emailConfig, setEmailConfig] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    days_allowed: 12,
    carry_forward: false,
    encashable: false
  });
  const [emailFormData, setEmailFormData] = useState({
    smtp_email: '',
    smtp_password: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    company_name: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchLeaveTypes();
    fetchEmailConfig();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/leave-types`);
      setLeaveTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings/email`);
      setEmailConfig(res.data);
      if (res.data.configured) {
        setEmailFormData({
          smtp_email: res.data.smtp_email || '',
          smtp_password: '',
          smtp_host: res.data.smtp_host || 'smtp.gmail.com',
          smtp_port: res.data.smtp_port || 587,
          company_name: res.data.company_name || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/leave-types`, formData);
      toast.success('Leave type created!');
      setShowModal(false);
      setFormData({ name: '', code: '', days_allowed: 12, carry_forward: false, encashable: false });
      fetchLeaveTypes();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create leave type');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/settings/email`, emailFormData);
      toast.success('Email configuration saved!');
      setShowEmailModal(false);
      fetchEmailConfig();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save email configuration');
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await axios.post(`${API_URL}/api/settings/email/test`);
      toast.success(`Test email sent to ${res.data.sent_to}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordFormData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await axios.post(`${API_URL}/api/auth/change-password`, {
        current_password: passwordFormData.current_password,
        new_password: passwordFormData.new_password
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage system configurations</p>
      </div>

      <div className="grid gap-6">
        {/* Email Configuration */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-semibold text-lg text-slate-900">Email Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Configure SMTP settings for sending employee invitations</p>
            </div>
            <button 
              data-testid="configure-email-btn" 
              onClick={() => setShowEmailModal(true)} 
              className={emailConfig?.configured ? "btn-secondary text-sm" : "btn-primary text-sm"}
            >
              {emailConfig?.configured ? 'Update Settings' : 'Configure Email'}
            </button>
          </div>
          
          {emailConfig?.configured ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">Email Configured</p>
                  <p className="text-sm text-green-600">Emails will be sent from: {emailConfig.smtp_email}</p>
                </div>
                <button
                  data-testid="test-email-btn"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="btn-secondary text-sm"
                >
                  {testingEmail ? 'Sending...' : 'Send Test'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">SMTP Host</p>
                  <p className="font-medium text-slate-900">{emailConfig.smtp_host}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Company Name</p>
                  <p className="font-medium text-slate-900">{emailConfig.company_name || 'Not set'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Email not configured</p>
                <p className="text-sm text-slate-500">Set up Gmail SMTP to send welcome emails to new employees</p>
              </div>
            </div>
          )}
        </div>

        {/* Leave Types */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-lg text-slate-900">Leave Types</h3>
            <button data-testid="add-leave-type-btn" onClick={() => setShowModal(true)} className="btn-primary text-sm">
              Add Leave Type
            </button>
          </div>
          <div className="space-y-3">
            {leaveTypes.map((lt) => (
              <div key={lt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg" data-testid={`leave-type-${lt.id}`}>
                <div>
                  <p className="font-medium text-slate-900">{lt.name}</p>
                  <p className="text-sm text-slate-500">{lt.code} · {lt.days_allowed} days/year</p>
                </div>
                <div className="flex gap-2">
                  {lt.carry_forward && <span className="badge badge-neutral">Carry Forward</span>}
                  {lt.encashable && <span className="badge badge-success">Encashable</span>}
                </div>
              </div>
            ))}
            {leaveTypes.length === 0 && (
              <p className="text-center py-8 text-slate-500">No leave types configured</p>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg text-slate-900">Account Information</h3>
            <button
              data-testid="change-password-btn"
              onClick={() => setShowPasswordModal(true)}
              className="btn-secondary text-sm"
            >
              Change Password
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Email</span>
              <span className="font-medium text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Role</span>
              <span className="badge badge-success">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="change-password-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  data-testid="current-password-input"
                  type="password"
                  value={passwordFormData.current_password}
                  onChange={(e) => setPasswordFormData({...passwordFormData, current_password: e.target.value})}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  data-testid="new-password-input"
                  type="password"
                  value={passwordFormData.new_password}
                  onChange={(e) => setPasswordFormData({...passwordFormData, new_password: e.target.value})}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  data-testid="confirm-new-password-input"
                  type="password"
                  value={passwordFormData.confirm_password}
                  onChange={(e) => setPasswordFormData({...passwordFormData, confirm_password: e.target.value})}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="submit-password-change-btn" className="btn-primary flex-1" disabled={changingPassword}>
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Configuration Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg" data-testid="email-config-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Email Configuration</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">How to get Gmail App Password:</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to your Google Account → Security</li>
                <li>Enable 2-Factor Authentication if not enabled</li>
                <li>Go to "App passwords" under 2FA settings</li>
                <li>Create a new app password and copy the 16-digit code</li>
              </ol>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gmail Address</label>
                <input
                  data-testid="email-smtp-email-input"
                  type="email"
                  value={emailFormData.smtp_email}
                  onChange={(e) => setEmailFormData({...emailFormData, smtp_email: e.target.value})}
                  className="input-field"
                  placeholder="your-email@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  App Password (16 digits)
                  {emailConfig?.password_set && <span className="text-slate-400 font-normal"> - Leave empty to keep existing</span>}
                </label>
                <input
                  data-testid="email-smtp-password-input"
                  type="password"
                  value={emailFormData.smtp_password}
                  onChange={(e) => setEmailFormData({...emailFormData, smtp_password: e.target.value})}
                  className="input-field font-mono"
                  placeholder="xxxx xxxx xxxx xxxx"
                  required={!emailConfig?.password_set}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  data-testid="email-company-name-input"
                  type="text"
                  value={emailFormData.company_name}
                  onChange={(e) => setEmailFormData({...emailFormData, company_name: e.target.value})}
                  className="input-field"
                  placeholder="Your Company Name"
                />
                <p className="text-xs text-slate-500 mt-1">Used in email subject and body</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={emailFormData.smtp_host}
                    onChange={(e) => setEmailFormData({...emailFormData, smtp_host: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={emailFormData.smtp_port}
                    onChange={(e) => setEmailFormData({...emailFormData, smtp_port: parseInt(e.target.value)})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEmailModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="save-email-config-btn" className="btn-primary flex-1">
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Leave Type Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="add-leave-type-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Add Leave Type</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  data-testid="lt-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="e.g., Casual Leave"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                  <input
                    data-testid="lt-code-input"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="input-field"
                    placeholder="CL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Days/Year</label>
                  <input
                    data-testid="lt-days-input"
                    type="number"
                    value={formData.days_allowed}
                    onChange={(e) => setFormData({...formData, days_allowed: parseInt(e.target.value)})}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    data-testid="lt-carry-checkbox"
                    type="checkbox"
                    checked={formData.carry_forward}
                    onChange={(e) => setFormData({...formData, carry_forward: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700">Allow carry forward</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    data-testid="lt-encash-checkbox"
                    type="checkbox"
                    checked={formData.encashable}
                    onChange={(e) => setFormData({...formData, encashable: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700">Encashable</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="submit-lt-btn" className="btn-primary flex-1">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Timesheets Page
const TimesheetsPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [entryForm, setEntryForm] = useState({
    project_id: '',
    hours: '',
    description: '',
    is_billable: true
  });

  const isManager = ['super_admin', 'admin', 'hr', 'manager'].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, [weekStart]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, projectsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/api/timesheets/entries?week_start=${weekStart}`),
        axios.get(`${API_URL}/api/projects?active_only=true`),
        axios.get(`${API_URL}/api/timesheets/summary?week_start=${weekStart}`)
      ]);
      setEntries(entriesRes.data);
      setProjects(projectsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const navigateWeek = (direction) => {
    const current = new Date(weekStart);
    current.setDate(current.getDate() + (direction * 7));
    setWeekStart(current.toISOString().split('T')[0]);
  };

  const getEntriesForDate = (date) => {
    return entries.filter(e => e.date === date);
  };

  const getTotalForDate = (date) => {
    return getEntriesForDate(date).reduce((sum, e) => sum + (e.hours || 0), 0);
  };

  const openEntryModal = (date) => {
    setSelectedDate(date);
    setEntryForm({ project_id: '', hours: '', description: '', is_billable: true });
    setShowEntryModal(true);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/timesheets/entries`, {
        date: selectedDate,
        project_id: entryForm.project_id,
        hours: parseFloat(entryForm.hours),
        description: entryForm.description,
        is_billable: entryForm.is_billable
      });
      toast.success('Time entry added!');
      setShowEntryModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`${API_URL}/api/timesheets/entries/${entryId}`);
      toast.success('Entry deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleSubmitWeek = async () => {
    try {
      await axios.post(`${API_URL}/api/timesheets/submit`, {
        week_start: weekStart,
        entries: entries.filter(e => e.status === 'draft').map(e => e.id)
      });
      toast.success('Timesheet submitted for approval!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit');
    }
  };

  const hasDraftEntries = entries.some(e => e.status === 'draft');
  const weekTotal = weekDates.reduce((sum, date) => sum + getTotalForDate(date), 0);

  return (
    <div data-testid="timesheets-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Timesheets</h1>
          <p className="text-slate-500 mt-1">Track your work hours by project</p>
        </div>
        {hasDraftEntries && (
          <button
            data-testid="submit-timesheet-btn"
            onClick={handleSubmitWeek}
            className="btn-primary"
          >
            Submit Week for Approval
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-sm text-slate-500">Total Hours</p>
            <p className="text-2xl font-bold text-slate-900 font-heading">{summary.total_hours.toFixed(1)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Billable Hours</p>
            <p className="text-2xl font-bold text-green-600 font-heading">{summary.billable_hours.toFixed(1)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Non-Billable</p>
            <p className="text-2xl font-bold text-slate-600 font-heading">{summary.non_billable_hours.toFixed(1)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Billable %</p>
            <p className="text-2xl font-bold text-primary font-heading">{summary.billable_percentage}%</p>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg"
            data-testid="prev-week-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-900">
              {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekDates[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-sm text-slate-500">Week Total: {weekTotal.toFixed(1)} hours</p>
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-slate-100 rounded-lg"
            data-testid="next-week-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {weekDates.map((date, i) => {
              const dayTotal = getTotalForDate(date);
              const isToday = date === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={date}
                  className={`p-4 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <p className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-slate-500'}`}>{dayNames[i]}</p>
                  <p className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-slate-900'}`}>
                    {new Date(date).getDate()}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{dayTotal.toFixed(1)}h</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7">
            {weekDates.map((date) => {
              const dayEntries = getEntriesForDate(date);
              return (
                <div
                  key={date}
                  className="min-h-[200px] p-2 border-r border-slate-100 last:border-r-0 bg-white"
                >
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-2 mb-2 rounded-lg text-xs ${
                        entry.status === 'approved' ? 'bg-green-50 border border-green-200' :
                        entry.status === 'submitted' ? 'bg-blue-50 border border-blue-200' :
                        entry.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                        'bg-slate-50 border border-slate-200'
                      }`}
                      data-testid={`entry-${entry.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-700 truncate">{entry.project_name}</span>
                        {entry.status === 'draft' && (
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-500 truncate">{entry.client_name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold text-slate-900">{entry.hours}h</span>
                        {entry.is_billable && (
                          <span className="text-green-600">$</span>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openEntryModal(date)}
                    className="w-full p-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-primary hover:text-primary transition-colors text-xs"
                    data-testid={`add-entry-${date}`}
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="add-entry-modal">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Add Time Entry</h2>
                <p className="text-sm text-slate-500">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setShowEntryModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <select
                  data-testid="entry-project-select"
                  value={entryForm.project_id}
                  onChange={(e) => setEntryForm({...entryForm, project_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.client_name} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                <input
                  data-testid="entry-hours-input"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={entryForm.hours}
                  onChange={(e) => setEntryForm({...entryForm, hours: e.target.value})}
                  className="input-field"
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  data-testid="entry-desc-input"
                  value={entryForm.description}
                  onChange={(e) => setEntryForm({...entryForm, description: e.target.value})}
                  className="input-field h-20"
                  placeholder="What did you work on?"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entryForm.is_billable}
                  onChange={(e) => setEntryForm({...entryForm, is_billable: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-primary"
                />
                <span className="text-sm text-slate-700">Billable</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEntryModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="save-entry-btn" className="btn-primary flex-1">
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Projects Page (Admin)
const ProjectsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', code: '', description: '' });
  const [projectForm, setProjectForm] = useState({
    name: '', code: '', client_id: '', description: '',
    budget_hours: '', is_billable: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        axios.get(`${API_URL}/api/clients`),
        axios.get(`${API_URL}/api/projects`)
      ]);
      setClients(clientsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/clients`, clientForm);
      toast.success('Client created!');
      setShowClientModal(false);
      setClientForm({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create client');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/projects`, {
        ...projectForm,
        budget_hours: projectForm.budget_hours ? parseFloat(projectForm.budget_hours) : null
      });
      toast.success('Project created!');
      setShowProjectModal(false);
      setProjectForm({ name: '', code: '', client_id: '', description: '', budget_hours: '', is_billable: true });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Delete this client? This will affect all related projects.')) return;
    try {
      await axios.delete(`${API_URL}/api/clients/${id}`);
      toast.success('Client deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div data-testid="projects-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Projects & Clients</h1>
          <p className="text-slate-500 mt-1">Manage clients and projects for timesheets</p>
        </div>
        <div className="flex gap-3">
          <button
            data-testid="add-client-btn"
            onClick={() => setShowClientModal(true)}
            className="btn-secondary"
          >
            Add Client
          </button>
          <button
            data-testid="add-project-btn"
            onClick={() => setShowProjectModal(true)}
            className="btn-primary"
          >
            Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clients */}
          <div className="card p-6">
            <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Clients ({clients.length})</h3>
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg" data-testid={`client-${client.id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <span className="badge badge-neutral">{client.code}</span>
                    </div>
                    <p className="text-sm text-slate-500">{client.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-center py-8 text-slate-500">No clients yet</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="card p-6">
            <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Projects ({projects.length})</h3>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="p-4 bg-slate-50 rounded-lg" data-testid={`project-${project.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{project.name}</p>
                      <span className="badge badge-neutral">{project.code}</span>
                      {project.is_billable && <span className="badge badge-success">Billable</span>}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{project.client_name}</p>
                  {project.budget_hours && (
                    <p className="text-xs text-slate-400 mt-1">Budget: {project.budget_hours} hours</p>
                  )}
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-center py-8 text-slate-500">No projects yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="add-client-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Add Client</h2>
              <button onClick={() => setShowClientModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                <input
                  data-testid="client-name-input"
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input
                  data-testid="client-code-input"
                  type="text"
                  value={clientForm.code}
                  onChange={(e) => setClientForm({...clientForm, code: e.target.value.toUpperCase()})}
                  className="input-field"
                  placeholder="e.g., ACME"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={clientForm.description}
                  onChange={(e) => setClientForm({...clientForm, description: e.target.value})}
                  className="input-field h-20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowClientModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="save-client-btn" className="btn-primary flex-1">
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md" data-testid="add-project-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Add Project</h2>
              <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <select
                  data-testid="project-client-select"
                  value={projectForm.client_id}
                  onChange={(e) => setProjectForm({...projectForm, client_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                  <input
                    data-testid="project-name-input"
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                  <input
                    data-testid="project-code-input"
                    type="text"
                    value={projectForm.code}
                    onChange={(e) => setProjectForm({...projectForm, code: e.target.value.toUpperCase()})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget Hours (optional)</label>
                <input
                  type="number"
                  value={projectForm.budget_hours}
                  onChange={(e) => setProjectForm({...projectForm, budget_hours: e.target.value})}
                  className="input-field"
                  placeholder="e.g., 100"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={projectForm.is_billable}
                  onChange={(e) => setProjectForm({...projectForm, is_billable: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-primary"
                />
                <span className="text-sm text-slate-700">Billable Project</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" data-testid="save-project-btn" className="btn-primary flex-1">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// My Profile Page (Employee Self-Service)
const MyProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
    address: '',
    blood_group: '',
    date_of_birth: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, balanceRes] = await Promise.all([
        axios.get(`${API_URL}/api/me/profile`),
        axios.get(`${API_URL}/api/me/leave-balance`)
      ]);
      setProfile(profileRes.data);
      setLeaveBalance(balanceRes.data);
      setFormData({
        phone: profileRes.data.phone || '',
        emergency_contact: profileRes.data.emergency_contact || '',
        emergency_phone: profileRes.data.emergency_phone || '',
        address: profileRes.data.address || '',
        blood_group: profileRes.data.blood_group || '',
        date_of_birth: profileRes.data.date_of_birth || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/me/profile`, formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div data-testid="my-profile-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">View and manage your personal information</p>
        </div>
        {!editing ? (
          <button
            data-testid="edit-profile-btn"
            onClick={() => setEditing(true)}
            className="btn-primary"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              data-testid="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-primary">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-900">{profile?.full_name}</h2>
            <p className="text-slate-500">{profile?.designation || 'Employee'}</p>
            <span className="badge badge-success mt-2">{profile?.status || 'Active'}</span>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{profile?.department_name || 'No Department'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{profile?.employee_id || '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">Joined {profile?.date_of_joining || '-'}</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-heading font-semibold text-lg text-slate-900 mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
              <p className="text-slate-900">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Phone</label>
              {editing ? (
                <input
                  data-testid="profile-phone-input"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-slate-900">{profile?.phone || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Date of Birth</label>
              {editing ? (
                <input
                  data-testid="profile-dob-input"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="input-field"
                />
              ) : (
                <p className="text-slate-900">{profile?.date_of_birth || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Blood Group</label>
              {editing ? (
                <select
                  data-testid="profile-blood-select"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              ) : (
                <p className="text-slate-900">{profile?.blood_group || '-'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1">Address</label>
              {editing ? (
                <textarea
                  data-testid="profile-address-input"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field h-20"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-slate-900">{profile?.address || '-'}</p>
              )}
            </div>
          </div>

          <h3 className="font-heading font-semibold text-lg text-slate-900 mt-8 mb-6">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Contact Name</label>
              {editing ? (
                <input
                  data-testid="profile-emergency-name-input"
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  className="input-field"
                  placeholder="Emergency contact name"
                />
              ) : (
                <p className="text-slate-900">{profile?.emergency_contact || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Contact Phone</label>
              {editing ? (
                <input
                  data-testid="profile-emergency-phone-input"
                  type="text"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                  className="input-field"
                  placeholder="Emergency contact phone"
                />
              ) : (
                <p className="text-slate-900">{profile?.emergency_phone || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      {leaveBalance && leaveBalance.balances?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Leave Balance ({leaveBalance.year})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveBalance.balances.map((balance, i) => (
              <div key={i} className="card p-5" data-testid={`leave-balance-${i}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-neutral">{balance.leave_type_code}</span>
                  {balance.carry_forward && <span className="text-xs text-slate-400">Carry Forward</span>}
                </div>
                <p className="font-medium text-slate-900">{balance.leave_type_name}</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-primary font-heading">{balance.remaining_days}</span>
                  <span className="text-slate-500 mb-1">/ {balance.total_days} days</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(balance.remaining_days / balance.total_days) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Used: {balance.used_days} days</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Onboarding Wizard Page
const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([
    { name: 'Engineering', code: 'ENG', description: 'Software development team' },
    { name: 'Human Resources', code: 'HR', description: 'People operations' },
    { name: 'Finance', code: 'FIN', description: 'Financial operations' },
  ]);
  const [leaveTypes, setLeaveTypes] = useState([
    { name: 'Casual Leave', code: 'CL', days_allowed: 12, carry_forward: false, encashable: false },
    { name: 'Sick Leave', code: 'SL', days_allowed: 10, carry_forward: false, encashable: false },
    { name: 'Earned Leave', code: 'EL', days_allowed: 15, carry_forward: true, encashable: true },
  ]);
  const [employees, setEmployees] = useState([
    { full_name: '', email: '', designation: '', department_id: '' }
  ]);
  const [createdDepts, setCreatedDepts] = useState([]);

  const totalSteps = 4;

  const addDepartment = () => {
    setDepartments([...departments, { name: '', code: '', description: '' }]);
  };

  const removeDepartment = (index) => {
    if (departments.length > 1) {
      setDepartments(departments.filter((_, i) => i !== index));
    }
  };

  const updateDepartment = (index, field, value) => {
    const updated = [...departments];
    updated[index][field] = field === 'code' ? value.toUpperCase() : value;
    setDepartments(updated);
  };

  const addLeaveType = () => {
    setLeaveTypes([...leaveTypes, { name: '', code: '', days_allowed: 10, carry_forward: false, encashable: false }]);
  };

  const removeLeaveType = (index) => {
    if (leaveTypes.length > 1) {
      setLeaveTypes(leaveTypes.filter((_, i) => i !== index));
    }
  };

  const updateLeaveType = (index, field, value) => {
    const updated = [...leaveTypes];
    updated[index][field] = field === 'code' ? value.toUpperCase() : value;
    setLeaveTypes(updated);
  };

  const addEmployee = () => {
    setEmployees([...employees, { full_name: '', email: '', designation: '', department_id: '' }]);
  };

  const removeEmployee = (index) => {
    if (employees.length > 1) {
      setEmployees(employees.filter((_, i) => i !== index));
    }
  };

  const updateEmployee = (index, field, value) => {
    const updated = [...employees];
    updated[index][field] = value;
    setEmployees(updated);
  };

  const handleSaveDepartments = async () => {
    const validDepts = departments.filter(d => d.name && d.code);
    if (validDepts.length === 0) {
      toast.error('Please add at least one department');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/onboarding/departments`, { departments: validDepts });
      setCreatedDepts(res.data.departments);
      toast.success(`Created ${res.data.departments.length} departments!`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLeaveTypes = async () => {
    const validTypes = leaveTypes.filter(lt => lt.name && lt.code);
    if (validTypes.length === 0) {
      toast.error('Please add at least one leave type');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/onboarding/leave-types`, { leave_types: validTypes });
      toast.success(`Created ${validTypes.length} leave types!`);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmployees = async () => {
    const validEmps = employees.filter(e => e.full_name && e.email);
    if (validEmps.length === 0) {
      // Skip if no employees
      setStep(4);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/onboarding/employees`, { employees: validEmps });
      toast.success(`Invited ${res.data.employees.length} employees!`);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to invite employees');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/onboarding/complete`);
      toast.success('Setup complete! Welcome to BambooClone HR.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await axios.post(`${API_URL}/api/onboarding/skip`);
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="onboarding-page">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">BambooClone HR</span>
          </div>
          <button
            data-testid="skip-onboarding-btn"
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Quick Setup</h2>
            <span className="text-sm text-slate-500">Step {step} of {totalSteps}</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span className={step >= 1 ? 'text-primary font-medium' : ''}>Departments</span>
            <span className={step >= 2 ? 'text-primary font-medium' : ''}>Leave Types</span>
            <span className={step >= 3 ? 'text-primary font-medium' : ''}>Team Members</span>
            <span className={step >= 4 ? 'text-primary font-medium' : ''}>Complete</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Step 1: Departments */}
        {step === 1 && (
          <div className="animate-fade-in" data-testid="onboarding-step-1">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">Set Up Your Departments</h1>
              <p className="text-slate-500 max-w-lg mx-auto">
                Create the departments in your organization. We've added some common ones to get you started.
              </p>
            </div>

            <div className="card p-6 mb-6">
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <input
                        data-testid={`dept-name-${index}`}
                        type="text"
                        placeholder="Department name"
                        value={dept.name}
                        onChange={(e) => updateDepartment(index, 'name', e.target.value)}
                        className="input-field"
                      />
                      <input
                        data-testid={`dept-code-${index}`}
                        type="text"
                        placeholder="Code"
                        value={dept.code}
                        onChange={(e) => updateDepartment(index, 'code', e.target.value)}
                        className="input-field"
                        maxLength={5}
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={dept.description}
                        onChange={(e) => updateDepartment(index, 'description', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={() => removeDepartment(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                data-testid="add-dept-btn"
                onClick={addDepartment}
                className="mt-4 flex items-center gap-2 text-primary hover:text-primary-600 font-medium text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Another Department
              </button>
            </div>

            <div className="flex justify-end">
              <button
                data-testid="save-depts-btn"
                onClick={handleSaveDepartments}
                disabled={loading}
                className="btn-primary px-8"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Leave Types */}
        {step === 2 && (
          <div className="animate-fade-in" data-testid="onboarding-step-2">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">Configure Leave Types</h1>
              <p className="text-slate-500 max-w-lg mx-auto">
                Define the leave types available to your employees. Set the annual quota for each.
              </p>
            </div>

            <div className="card p-6 mb-6">
              <div className="space-y-4">
                {leaveTypes.map((lt, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <input
                        data-testid={`lt-name-${index}`}
                        type="text"
                        placeholder="Leave type name"
                        value={lt.name}
                        onChange={(e) => updateLeaveType(index, 'name', e.target.value)}
                        className="input-field"
                      />
                      <input
                        data-testid={`lt-code-${index}`}
                        type="text"
                        placeholder="Code"
                        value={lt.code}
                        onChange={(e) => updateLeaveType(index, 'code', e.target.value)}
                        className="input-field"
                        maxLength={4}
                      />
                      <input
                        type="number"
                        placeholder="Days/year"
                        value={lt.days_allowed}
                        onChange={(e) => updateLeaveType(index, 'days_allowed', parseInt(e.target.value) || 0)}
                        className="input-field"
                        min={1}
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={lt.carry_forward}
                            onChange={(e) => updateLeaveType(index, 'carry_forward', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary"
                          />
                          Carry
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={lt.encashable}
                            onChange={(e) => updateLeaveType(index, 'encashable', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary"
                          />
                          Encash
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => removeLeaveType(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                data-testid="add-lt-btn"
                onClick={addLeaveType}
                className="mt-4 flex items-center gap-2 text-primary hover:text-primary-600 font-medium text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Another Leave Type
              </button>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary px-6">
                Back
              </button>
              <button
                data-testid="save-lt-btn"
                onClick={handleSaveLeaveTypes}
                disabled={loading}
                className="btn-primary px-8"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Invite Employees */}
        {step === 3 && (
          <div className="animate-fade-in" data-testid="onboarding-step-3">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">Invite Your Team</h1>
              <p className="text-slate-500 max-w-lg mx-auto">
                Add your first team members. You can always add more later from the Employees page.
              </p>
            </div>

            <div className="card p-6 mb-6">
              <div className="space-y-4">
                {employees.map((emp, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <input
                        data-testid={`emp-name-${index}`}
                        type="text"
                        placeholder="Full name"
                        value={emp.full_name}
                        onChange={(e) => updateEmployee(index, 'full_name', e.target.value)}
                        className="input-field"
                      />
                      <input
                        data-testid={`emp-email-${index}`}
                        type="email"
                        placeholder="Email"
                        value={emp.email}
                        onChange={(e) => updateEmployee(index, 'email', e.target.value)}
                        className="input-field"
                      />
                      <input
                        type="text"
                        placeholder="Job title"
                        value={emp.designation}
                        onChange={(e) => updateEmployee(index, 'designation', e.target.value)}
                        className="input-field"
                      />
                      <select
                        value={emp.department_id}
                        onChange={(e) => updateEmployee(index, 'department_id', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Department</option>
                        {createdDepts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeEmployee(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                data-testid="add-emp-btn"
                onClick={addEmployee}
                className="mt-4 flex items-center gap-2 text-primary hover:text-primary-600 font-medium text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Another Employee
              </button>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary px-6">
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="btn-secondary px-6"
                >
                  Skip
                </button>
                <button
                  data-testid="invite-emp-btn"
                  onClick={handleInviteEmployees}
                  disabled={loading}
                  className="btn-primary px-8"
                >
                  {loading ? 'Inviting...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="animate-fade-in text-center" data-testid="onboarding-step-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-3">You're All Set!</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Your HR system is ready to go. Start managing your team, tracking attendance, and processing leaves.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
              <div className="card p-6 text-center">
                <Building2 className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold text-slate-900 font-heading">{createdDepts.length}</p>
                <p className="text-sm text-slate-500">Departments</p>
              </div>
              <div className="card p-6 text-center">
                <CalendarDays className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold text-slate-900 font-heading">{leaveTypes.length}</p>
                <p className="text-sm text-slate-500">Leave Types</p>
              </div>
              <div className="card p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold text-slate-900 font-heading">{employees.filter(e => e.full_name).length}</p>
                <p className="text-sm text-slate-500">Team Members</p>
              </div>
            </div>

            <button
              data-testid="go-to-dashboard-btn"
              onClick={handleComplete}
              disabled={loading}
              className="btn-primary px-10 py-3 text-lg"
            >
              {loading ? 'Loading...' : 'Go to Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App
function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/my-profile" element={
            <ProtectedRoute>
              <DashboardLayout><MyProfilePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/timesheets" element={
            <ProtectedRoute>
              <DashboardLayout><TimesheetsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <DashboardLayout><ProjectsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute>
              <DashboardLayout><EmployeesPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute>
              <DashboardLayout><DepartmentsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute>
              <DashboardLayout><AttendancePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/leave" element={
            <ProtectedRoute>
              <DashboardLayout><LeavePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout><SettingsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
