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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 mb-1">
            License Plate
          </label>
          <input
            type="text"
            id="license_plate"
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type
          </label>
          <input
            type="text"
            id="vehicle_type"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="vehicle_size" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Size
          </label>
          <select
            id="vehicle_size"
            name="vehicle_size"
            value={formData.vehicle_size}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="big">Big/Long</option>
          </select>
        </div>

        <div>
          <label htmlFor="ownername" className="block text-sm font-medium text-gray-700 mb-1">
            Owner Name
          </label>
          <input
            type="text"
            id="ownername"
            name="ownername"
            value={formData.ownername}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="ownerphone" className="block text-sm font-medium text-gray-700 mb-1">
            Owner Phone
          </label>
          <input
            type="text"
            id="ownerphone"
            name="ownerphone"
            value={formData.ownerphone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;