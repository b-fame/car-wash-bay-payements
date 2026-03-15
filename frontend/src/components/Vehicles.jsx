import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VehicleForm from './VehicleForm';
import VehicleList from './VehicleList';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/vehicles');
      setVehicles(response.data.vehicles);
      setError('');
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to fetch vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`http://localhost:8000/api/vehicles/${id}`);
        setSuccess('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const handleMarkExit = async (id) => {
    if (window.confirm('Mark this vehicle as exited?')) {
      try {
        await axios.post(`http://localhost:8000/api/vehicles/${id}/exit`);
        setSuccess('Vehicle exit recorded successfully');
        fetchVehicles();
      } catch (error) {
        console.error('Error marking vehicle exit:', error);
        setError('Failed to mark vehicle exit. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingVehicle) {
        await axios.put(`http://localhost:8000/api/vehicles/${editingVehicle.vehicle_id}`, formData);
        setSuccess('Vehicle updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/vehicles', formData);
        setSuccess('Vehicle added successfully');
      }
      setShowForm(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save vehicle. Please try again.';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Vehicle Management</h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={handleAddVehicle}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Vehicle
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <VehicleForm
              vehicle={editingVehicle}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <VehicleList
          vehicles={vehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
          onMarkExit={handleMarkExit}
        />
      </div>
    </div>
  );
};

export default Vehicles;