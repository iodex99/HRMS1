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

// Sidebar
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leave', href: '/leave', icon: CalendarDays },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
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
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, attendanceRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/stats`),
        axios.get(`${API_URL}/api/attendance/today`)
      ]);
      setStats(statsRes.data);
      setTodayAttendance(attendanceRes.data);
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
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    days_allowed: 12,
    carry_forward: false,
    encashable: false
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/leave-types`);
      setLeaveTypes(res.data);
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

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage system configurations</p>
      </div>

      <div className="grid gap-6">
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
          <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Account Information</h3>
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
