import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = ({ vehicles, packages, onSuccess, onCancel }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    
    try {
      await axios.post('/api/payments', {
        vehicle_id: selectedVehicle,
        package_id: selectedPackage
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Record Payment</h3>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle *</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Vehicle --</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                {vehicle.license_plate} - {vehicle.vehicle_type} ({vehicle.vehicle_size})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Package *</label>
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Package --</option>
            {packages.map(pkg => (
              <option key={pkg.pack_id} value={pkg.pack_id}>
                {pkg.package_name} - {pkg.fee_charged?.toLocaleString()} RWF
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={processing}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Process Payment'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;