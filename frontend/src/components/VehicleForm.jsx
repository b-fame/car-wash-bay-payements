import React, { useState, useEffect } from 'react';

const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    license_plate: '',
    vehicle_type: '',
    vehicle_size: 'small',
    ownername: '',
    ownerphone: ''
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        license_plate: vehicle.license_plate,
        vehicle_type: vehicle.vehicle_type,
        vehicle_size: vehicle.vehicle_size,
        ownername: vehicle.ownername,
        ownerphone: vehicle.ownerphone
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">
        {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
          <input
            type="text"
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
          <input
            type="text"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Size *</label>
          <select
            name="vehicle_size"
            value={formData.vehicle_size}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="big">Big / Large</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
          <input
            type="text"
            name="ownername"
            value={formData.ownername}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone *</label>
          <input
            type="tel"
            name="ownerphone"
            value={formData.ownerphone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex space-x-3 items-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {vehicle ? 'Update' : 'Save'}
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

export default VehicleForm;