import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleForm from './VehicleForm';
import VehicleList from './VehicleList';

const Vehicles = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('/api/vehicles');
      setVehicles(res.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setMessage({ type: 'error', text: 'Failed to load vehicles' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'admin') {
      setMessage({ type: 'error', text: 'Only admin can delete vehicles' });
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/vehicles/${id}`);
      setMessage({ type: 'success', text: 'Vehicle deleted successfully' });
      fetchVehicles();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete vehicle' });
    }
  };

  const handleExit = async (id) => {
    try {
      await axios.post(`/api/vehicles/${id}/exit`);
      setMessage({ type: 'success', text: 'Exit recorded successfully' });
      fetchVehicles();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to record exit' });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingVehicle) {
        await axios.put(`/api/vehicles/${editingVehicle.vehicle_id}`, formData);
        setMessage({ type: 'success', text: 'Vehicle updated successfully' });
      } else {
        await axios.post('/api/vehicles', formData);
        setMessage({ type: 'success', text: 'Vehicle added successfully' });
      }
      setShowForm(false);
      setEditingVehicle(null);
      fetchVehicles();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Operation failed' });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

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
        <h2 className="text-2xl font-bold text-gray-800">🚘 Vehicle Management</h2>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Vehicle
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
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      <VehicleList
        vehicles={vehicles}
        user={user}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExit={handleExit}
      />
    </div>
  );
};

export default Vehicles;