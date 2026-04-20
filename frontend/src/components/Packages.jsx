import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Packages = ({ user }) => {
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ package_name: '', fee_charged: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPackages();
    }
  }, [user]);

  const fetchPackages = async () => {
    try {
      const res = await axios.get('/api/packages');
      setPackages(res.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setMessage({ type: 'error', text: 'Failed to load packages' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/packages/${editing.pack_id}`, formData);
        setMessage({ type: 'success', text: 'Package updated successfully' });
      } else {
        await axios.post('/api/packages', formData);
        setMessage({ type: 'success', text: 'Package added successfully' });
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ package_name: '', fee_charged: '' });
      fetchPackages();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Operation failed' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await axios.delete(`/api/packages/${id}`);
      setMessage({ type: 'success', text: 'Package deleted successfully' });
      fetchPackages();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete package' });
    }
  };

  const handleEdit = (pkg) => {
    setEditing(pkg);
    setFormData({ package_name: pkg.package_name, fee_charged: pkg.fee_charged });
    setShowForm(true);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Access Denied. Only administrators can manage packages.
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
        <h2 className="text-2xl font-bold text-gray-800">📦 Service Packages</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Package
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
          <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Package</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Package Name"
              value={formData.package_name}
              onChange={(e) => setFormData({...formData, package_name: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Fee (RWF)"
              value={formData.fee_charged}
              onChange={(e) => setFormData({...formData, fee_charged: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex space-x-3">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                {editing ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Package Name</th>
              <th className="p-3 text-left text-sm font-semibold">Fee (RWF)</th>
              <th className="p-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.pack_id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-sm">{pkg.package_name}</td>
                <td className="p-3 text-sm">{pkg.fee_charged?.toLocaleString()} RWF</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-blue-600 hover:text-blue-800 mr-3 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.pack_id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Packages;