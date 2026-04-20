import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { username, password });
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/auth/register', {
        username: registerData.username,
        password: registerData.password,
        full_name: registerData.full_name,
        email: registerData.email
      });
      setRegisterSuccess('Account created! Please login.');
      setTimeout(() => {
        setShowRegister(false);
        setRegisterData({ username: '', password: '', confirmPassword: '', full_name: '', email: '' });
        setRegisterSuccess('');
      }, 2000);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🚗</div>
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-1">Join Car Wash Bay System</p>
          </div>
          
          {registerError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {registerError}
            </div>
          )}
          
          {registerSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {registerSuccess}
            </div>
          )}
          
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Username *"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name"
                value={registerData.full_name}
                onChange={(e) => setRegisterData({...registerData, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="Password *"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Confirm Password *"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowRegister(false)}
              className="text-blue-600 hover:underline text-sm"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🚗</div>
          <h2 className="text-2xl font-bold text-gray-800">Car Wash Bay System</h2>
          <p className="text-gray-600 mt-1">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowRegister(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Don't have an account? Register
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          <p>Demo Accounts:</p>
          <p>Admin: admin / password</p>
          <p>Cashier: cashier / password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;