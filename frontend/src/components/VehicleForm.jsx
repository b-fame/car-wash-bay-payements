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
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                License Plate
              </label>
              <input
                type="text"
                name="license_plate"
                id="license_plate"
                required
                value={formData.license_plate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>
              <input
                type="text"
                name="vehicle_type"
                id="vehicle_type"
                required
                value={formData.vehicle_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="vehicle_size" className="block text-sm font-medium text-gray-700">
                Vehicle Size
              </label>
              <select
                name="vehicle_size"
                id="vehicle_size"
                required
                value={formData.vehicle_size}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="big">Big</option>
              </select>
            </div>

            <div>
              <label htmlFor="ownername" className="block text-sm font-medium text-gray-700">
                Owner Name
              </label>
              <input
                type="text"
                name="ownername"
                id="ownername"
                required
                value={formData.ownername}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="ownerphone" className="block text-sm font-medium text-gray-700">
                Owner Phone
              </label>
              <input
                type="text"
                name="ownerphone"
                id="ownerphone"
                required
                value={formData.ownerphone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;