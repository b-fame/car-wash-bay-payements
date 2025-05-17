import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleForm from './VehicleForm';
import VehicleList from './VehicleList';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/vehicles');
      setVehicles(response.data.vehicles);
      setError(null);
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
    setError(null);
    setSuccessMessage(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`http://localhost:8000/api/vehicles/${id}`);
        setSuccessMessage('Vehicle deleted successfully');
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
        setSuccessMessage('Vehicle exit recorded successfully');
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
        setSuccessMessage('Vehicle updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/vehicles', {
          ...formData,
          entry_time: new Date().toISOString(),
          payment_status: 'unpaid'
        });
        setSuccessMessage('Vehicle added successfully');
      }
      setShowForm(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      let errorMessage = 'Failed to save vehicle. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Vehicle Management
          </h2>
          <p className="mt-3 text-xl text-gray-500">
            Manage all vehicles in the washing bay
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={handleAddVehicle}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add New Vehicle
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6 max-w-3xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 mb-6 max-w-3xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <VehicleForm 
              vehicle={editingVehicle} 
              onSubmit={handleFormSubmit} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <VehicleList 
            vehicles={vehicles} 
            onEdit={handleEditVehicle} 
            onDelete={handleDeleteVehicle}
            onMarkExit={handleMarkExit}
          />
        </div>
      </div>
    </div>
  );
};

export default Vehicles;