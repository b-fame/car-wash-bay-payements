import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Payments from './components/Payments';
import Reports from './components/Reports';
import Users from './components/Users';
import Packages from './components/Packages';
import ActivityLogs from './components/ActivityLogs';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await axios.get('/api/auth/session');
      if (res.data.loggedIn) {
        setLoggedIn(true);
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setLoggedIn(true);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'vehicles':
        return <Vehicles user={user} />;
      case 'payments':
        return <Payments user={user} />;
      case 'reports':
        return <Reports user={user} />;
      case 'users':
        return <Users user={user} />;
      case 'packages':
        return <Packages user={user} />;
      case 'logs':
        return <ActivityLogs user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
      <div className="container mx-auto px-4 py-6">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;