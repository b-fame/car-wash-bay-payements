import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Register form state with role
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    role: 'cashier'  // Default role
  });

  // Handle login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/login', {
        username: loginData.username,
        password: loginData.password
      });
      
      if (res.data.success) {
        onLogin(res.data.user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle register with role
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (registerData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('/api/auth/register', {
        username: registerData.username,
        password: registerData.password,
        full_name: registerData.full_name,
        email: registerData.email,
        role: registerData.role  // Send selected role to backend
      });
      
      setSuccess(`Account created successfully with ${registerData.role} role! Please login.`);
      
      // Clear form
      setRegisterData({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        email: '',
        role: 'cashier'
      });
      
      // Switch to login tab after 2 seconds
      setTimeout(() => {
        setActiveTab('login');
        setSuccess('');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🚗</div>
          <h2 className="text-2xl font-bold text-gray-800">Car Wash Bay System</h2>
          <p className="text-gray-600 mt-1">Manage your car wash business</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-center font-medium transition ${
              activeTab === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-center font-medium transition ${
              activeTab === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-400 text-green-700">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Register Form with Role Selection */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username (min 3 characters)"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={registerData.full_name}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Role *</label>
              <select
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="cashier">🧑‍💼 Cashier - Basic operations</option>
                <option value="manager">📊 Manager - Can view reports</option>
                <option value="admin">👑 Admin - Full system access</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {registerData.role === 'admin' && '⚠️ Admin has complete control over the system'}
                {registerData.role === 'manager' && '📈 Manager can view reports and manage vehicles'}
                {registerData.role === 'cashier' && '💰 Cashier can add vehicles and record payments'}
              </p>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Demo Credentials */}
        {activeTab === 'login' && (
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="px-2 py-1 bg-gray-100 rounded">
                <span className="font-semibold">Admin:</span> admin / admin123
              </div>
              <div className="px-2 py-1 bg-gray-100 rounded">
                <span className="font-semibold">Manager:</span> manager1 / manager123
              </div>
              <div className="px-2 py-1 bg-gray-100 rounded">
                <span className="font-semibold">Cashier:</span> cashier1 / cashier123
              </div>
              <div className="px-2 py-1 bg-gray-100 rounded">
                <span className="font-semibold">User:</span> bfame / bfame123
              </div>
            </div>
          </div>
        )}

        {/* Role Info for Register */}
        {activeTab === 'register' && (
          <div className="mt-6 pt-4 border-t text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p>📋 <span className="font-semibold">Role Descriptions:</span></p>
              <p>👑 <span className="font-semibold">Admin:</span> Full system access, user management, packages, reports</p>
              <p>📊 <span className="font-semibold">Manager:</span> View reports, manage vehicles, record payments</p>
              <p>💰 <span className="font-semibold">Cashier:</span> Add vehicles, record payments, mark exits</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;