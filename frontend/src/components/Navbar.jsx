import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-semibold text-white hover:text-blue-400">
          Dashboard
        </Link>

        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className={`md:flex md:items-center w-full md:w-auto ${menuOpen ? 'block' : 'hidden'}`}>
          <ul className="md:flex md:space-x-6 mt-4 md:mt-0">
            <li>
              <Link to="/dashboard" className="block py-2 px-4 hover:text-blue-400">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/vehicles" className="block py-2 px-4 hover:text-blue-400">
                Vehicles
              </Link>
            </li>
            <li>
              <Link to="/payments" className="block py-2 px-4 hover:text-blue-400">
                Payments
              </Link>
            </li>
            <li>
              <Link to="/reports" className="block py-2 px-4 hover:text-blue-400">
                Reports
              </Link>
            </li>
          </ul>
          <div className="md:ml-6 mt-4 md:mt-0 flex items-center space-x-3">
            <span className="text-sm text-gray-300">Welcome, {user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
