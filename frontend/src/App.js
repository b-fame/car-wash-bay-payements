import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Vehicles from './components/Vehicles';
import Payments from './components/Payments';
import Reports from './components/Reports';
import Navbar from './components/Navbar';

// Axios configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get('/api/auth/session');
      setIsLoggedIn(response.data.isLoggedIn);
      setUser(response.data.user);
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        Username: username,
        password
      });
      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading screen with Tailwind CSS
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated loader */}
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-24 h-24 rounded-full border-4 border-blue-200 border-t-blue-600 border-r-blue-600 animate-spin"></div>
            
            {/* Inner circle with logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg flex items-center justify-center transform rotate-3 animate-pulse">
                <span className="text-2xl font-bold text-white">WB</span>
              </div>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="mt-6 space-y-2">
            <p className="text-gray-700 font-medium text-lg">Loading Washing Bay System</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Navbar - only show when logged in */}
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
      
      {/* Main content area with gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        {/* Decorative background elements */}
        {isLoggedIn && (
          <>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>
          </>
        )}

        {/* Routes with animation */}
        <div className="relative z-10 animate-fade-in">
          <Routes>
            <Route 
              path="/login" 
              element={
                isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            
            <Route 
              path="/register" 
              element={
                isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Register />
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                isLoggedIn ? 
                <Dashboard user={user} /> : 
                <Navigate to="/login" replace />
              } 
            />
            
            <Route 
              path="/vehicles" 
              element={
                isLoggedIn ? 
                <Vehicles /> : 
                <Navigate to="/login" replace />
              } 
            />
            
            <Route 
              path="/payments" 
              element={
                isLoggedIn ? 
                <Payments /> : 
                <Navigate to="/login" replace />
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                isLoggedIn ? 
                <Reports /> : 
                <Navigate to="/login" replace />
              } 
            />
            
            <Route 
              path="/" 
              element={
                isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
              } 
            />
            
            {/* 404 page */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;