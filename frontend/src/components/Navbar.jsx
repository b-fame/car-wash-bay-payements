import React, { useState } from 'react';

const Navbar = ({ user, onLogout, currentPage, setCurrentPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager', 'cashier'] },
    { id: 'vehicles', label: 'Vehicles', icon: '🚘', roles: ['admin', 'manager', 'cashier'] },
    { id: 'payments', label: 'Payments', icon: '💰', roles: ['admin', 'manager', 'cashier'] },
    { id: 'reports', label: 'Reports', icon: '📈', roles: ['admin', 'manager'] },
    { id: 'users', label: 'Users', icon: '👥', roles: ['admin'] },
    { id: 'packages', label: 'Packages', icon: '📦', roles: ['admin'] },
    { id: 'logs', label: 'Activity Logs', icon: '📋', roles: ['admin'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚗</span>
            <h1 className="text-xl font-bold">Car Wash Bay</h1>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {visibleItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-sm">
                <span className="text-gray-400">Welcome,</span>
                <span className="font-semibold ml-1">{user?.full_name || user?.username}</span>
              </div>
              <div className="text-xs text-gray-400 capitalize">Role: {user?.role}</div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {menuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-800">
            {visibleItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMenuOpen(false); }}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="pt-4 text-sm text-gray-400 px-4">
              <div>User: {user?.full_name || user?.username}</div>
              <div>Role: {user?.role}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;