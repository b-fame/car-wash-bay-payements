import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-white">
              Washing Bay System
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Dashboard
              </Link>
              <Link to="/vehicles" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Vehicles
              </Link>
              <Link to="/payments" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Payments
              </Link>
              <Link to="/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Reports
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm mr-4">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              Dashboard
            </Link>
            <Link to="/vehicles" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              Vehicles
            </Link>
            <Link to="/payments" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              Payments
            </Link>
            <Link to="/reports" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              Reports
            </Link>
            <div className="border-t border-gray-700 pt-4">
              <div className="px-3 py-2 text-sm">Welcome, {user?.username}</div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;