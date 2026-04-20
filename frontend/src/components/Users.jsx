import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Users = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'cashier'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', formData);
      setMessage({ type: 'success', text: 'User created successfully' });
      setShowForm(false);
      setFormData({ username: '', password: '', email: '', full_name: '', role: 'cashier' });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create user' });
    }
  };

  const handleToggleStatus = async (selectedUser) => {
    try {
      await axios.put(`/api/users/${selectedUser.user_id}`, {
        ...selectedUser,
        is_active: selectedUser.is_active ? 0 : 1
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Access Denied. Only administrators can manage users.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👥 User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add User
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Username *"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex space-x-3">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm">Username</th>
                <th className="p-3 text-left text-sm">Full Name</th>
                <th className="p-3 text-left text-sm">Email</th>
                <th className="p-3 text-left text-sm">Role</th>
                <th className="p-3 text-left text-sm">Status</th>
                <th className="p-3 text-left text-sm">Last Login</th>
                <th className="p-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm">{u.username}</td>
                  <td className="p-3 text-sm">{u.full_name || '-'}</td>
                  <td className="p-3 text-sm">{u.email || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      u.role === 'admin' ? 'bg-red-100 text-red-800' :
                      u.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-2 py-1 rounded text-xs ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3 text-sm">{u.last_login ? new Date(u.last_login).toLocaleString() : '-'}</td>
                  <td className="p-3">
                    {u.role !== 'admin' && (
                      <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;