import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Vehicles from './components/Vehicles';
import Payments from './components/Payments';
import Reports from './components/Reports';
import Navbar from './components/Navbar';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/session');
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
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        Username: username,
        password
      });
      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
      <div className="container">
        <Routes>
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route path="/register" element={
              isLoggedIn ? <Navigate to="/" /> : <Register />
            } />
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/vehicles" 
            element={isLoggedIn ? <Vehicles /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/payments" 
            element={isLoggedIn ? <Payments /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reports" 
            element={isLoggedIn ? <Reports /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

