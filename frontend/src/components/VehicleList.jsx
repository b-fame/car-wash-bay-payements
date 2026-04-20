import React from 'react';

const VehicleList = ({ vehicles, user, onEdit, onDelete, onExit }) => {
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Plate</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Size</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Owner</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Entry Time</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.vehicle_id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-sm font-medium">{vehicle.license_plate}</td>
                <td className="p-3 text-sm">{vehicle.vehicle_type}</td>
                <td className="p-3 text-sm capitalize">{vehicle.vehicle_size}</td>
                <td className="p-3 text-sm">{vehicle.ownername}</td>
                <td className="p-3 text-sm">{vehicle.ownerphone}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    vehicle.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.payment_status}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(vehicle.entry_time).toLocaleString()}</td>
                <td className="p-3">
                  {canEdit && (
                    <button
                      onClick={() => onEdit(vehicle)}
                      className="text-blue-600 hover:text-blue-800 mr-2 text-sm"
                    >
                      Edit
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => onDelete(vehicle.vehicle_id)}
                      className="text-red-600 hover:text-red-800 mr-2 text-sm"
                    >
                      Del
                    </button>
                  )}
                  {!vehicle.exit_time && (
                    <button
                      onClick={() => onExit(vehicle.vehicle_id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Exit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No vehicles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleList;