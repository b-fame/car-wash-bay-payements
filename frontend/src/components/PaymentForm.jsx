import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const PaymentForm = ({ vehicles, packages, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    package_id: '',
    payment_date: moment().format('YYYY-MM-DD')
  });
  const [vehicleStatus, setVehicleStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.vehicle_id) {
      fetchVehicleStatus();
    }
  }, [formData.vehicle_id]);

  const fetchVehicleStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/vehicles/${formData.vehicle_id}/status`);
      setVehicleStatus(response.data);
    } catch (error) {
      console.error('Error checking vehicle status:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (vehicleStatus?.payment_status === 'paid') {
      setError('This vehicle has already been paid for');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v.vehicle_id == formData.vehicle_id);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Record New Payment
        </h3>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <select
              name="vehicle_id"
              id="vehicle_id"
              required
              value={formData.vehicle_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option 
                  key={vehicle.vehicle_id} 
                  value={vehicle.vehicle_id}
                  disabled={vehicle.payment_status === 'paid'}
                >
                  {vehicle.license_plate} - {vehicle.vehicle_type} ({vehicle.vehicle_size})
                  {vehicle.payment_status === 'paid' && ' (Paid)'}
                </option>
              ))}
            </select>
            {vehicleStatus?.bay_status === 'in_bay' && (
              <p className="mt-1 text-sm text-green-600">Vehicle is currently in the bay</p>
            )}
          </div>

          <div>
            <label htmlFor="package_id" className="block text-sm font-medium text-gray-700">
              Package
            </label>
            <select
              name="package_id"
              id="package_id"
              required
              value={formData.package_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a package</option>
              {packages.map(pkg => (
                <option key={pkg.pack_id} value={pkg.pack_id}>
                  {pkg.package_name} - {selectedVehicle && formatCurrency(pkg.pricing?.[selectedVehicle.vehicle_size?.toLowerCase()] || 0)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
              Payment Date
            </label>
            <input
              type="date"
              name="payment_date"
              id="payment_date"
              required
              value={formData.payment_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || vehicleStatus?.payment_status === 'paid'}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || vehicleStatus?.payment_status === 'paid'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;