import React from 'react';

const VehicleList = ({ vehicles, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold">License Plate</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Vehicle Type</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Size</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Owner Name</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Owner Phone</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center px-4 py-3 text-gray-500">
                No vehicles found
              </td>
            </tr>
          ) : (
            vehicles.map(vehicle => (
              <tr key={vehicle.vehicle_id} className="hover:bg-gray-100">
                <td className="px-4 py-2">{vehicle.license_plate}</td>
                <td className="px-4 py-2">{vehicle.vehicle_type}</td>
                <td className="px-4 py-2 capitalize">{vehicle.vehicle_size}</td>
                <td className="px-4 py-2">{vehicle.ownername}</td>
                <td className="px-4 py-2">{vehicle.ownerphone}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEdit(vehicle)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(vehicle.vehicle_id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
