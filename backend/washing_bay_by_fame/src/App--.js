mport React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';
import Navbar from './components/Navbar';
import AddProduct from './components/AddProduct';
import EditProduct from './components/Edit';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/check-auth', { withCredentials: true });
      setAuthenticated(res.data.authenticated);
      setUser(res.data.user || null);
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      setAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {authenticated && <Navbar user={user} onLogout={handleLogout} />}
      <div className="app-content">
        <Routes>
          <Route path="/login" element={
            authenticated ? <Navigate to="/" /> : 
            <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            authenticated ? <Navigate to="/" /> : 
            <Register />
          } />
          <Route path="/" element={
            authenticated ? <Dashboard /> : <Navigate to="/login" />
          } />
          <Route path="/products" element={
            authenticated ? <Products /> : <Navigate to="/login" />
          } />
          <Route path="/products/add" element={
            authenticated ? <AddProduct /> : <Navigate to="/login" />
          } />
          <Route path="/products/edit/:id" element={
            authenticated ? <EditProduct /> : <Navigate to="/login" />
          } />
          <Route path="/stock-in" element={
            authenticated ? <StockIn /> : <Navigate to="/login" />
          } />
          <Route path="/stock-out" element={
            authenticated ? <StockOut /> : <Navigate to="/login" />
          } />
          <Route path="/reports" element={
            authenticated ? <Reports /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;