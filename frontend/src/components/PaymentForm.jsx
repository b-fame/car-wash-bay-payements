import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const PaymentForm = ({ vehicles, packages, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    package_id: '',
    payment_date: moment().format('YYYY-MM-DD')
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState(null);
  const [showPackageDetails, setShowPackageDetails] = useState(false);

  // Check vehicle status when selected
  useEffect(() => {
    if (formData.vehicle_id) {
      axios.get(`http://localhost:8000/api/vehicles/${formData.vehicle_id}/status`)
        .then(response => {
          setVehicleStatus(response.data.status);
        })
        .catch(error => {
          console.error('Error checking vehicle status:', error);
        });
    }
  }, [formData.vehicle_id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (vehicleStatus === 'paid') {
      alert('This vehicle has already been paid for');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/payments', formData);
      setPaymentDetails(response.data);
      setPaymentSuccess(true);
      setVehicleStatus('paid');
      onSubmit(response.data);
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v.vehicle_id == formData.vehicle_id);
  const selectedPackage = packages.find(p => p.pack_id == formData.package_id);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {paymentSuccess ? 'Payment Confirmation' : 'Record New Payment'}
          </h3>
        </div>

        <div className="p-6">
          {paymentSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Payment successful!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Amount: {formatCurrency(paymentDetails.amount)}</p>
                      <p>Date: {moment(paymentDetails.payment_date).format('MMMM D, YYYY')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                  onClick={() => {
                    setPaymentSuccess(false);
                    onCancel();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle {vehicleStatus === 'paid' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  )}
                </label>
                <select
                  name="vehicle_id"
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                    vehicleStatus === 'paid' ? 'bg-gray-100' : 'border-gray-300'
                  } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  disabled={loading}
                  required
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
                {vehicleStatus === 'paid' && (
                  <p className="mt-1 text-sm text-red-600">This vehicle has already been paid for</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Package</label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500"
                    onClick={() => setShowPackageDetails(!showPackageDetails)}
                  >
                    {showPackageDetails ? 'Hide details' : 'View packages'}
                  </button>
                </div>
                <select
                  name="package_id"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.package_id}
                  onChange={handleChange}
                  disabled={loading || vehicleStatus === 'paid'}
                  required
                >
                  <option value="">Select a package</option>
                  {packages.map(pkg => (
                    <option key={pkg.pack_id} value={pkg.pack_id}>
                      {pkg.package_name} - {selectedVehicle && formatCurrency(pkg.pricing?.[selectedVehicle.vehicle_size.toLowerCase()] || 0)}
                    </option>
                  ))}
                </select>
                
                {showPackageDetails && selectedVehicle && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Package Details</h4>
                    <div className="space-y-2">
                      {packages.map(pkg => (
                        <div key={pkg.pack_id} className="flex justify-between text-sm">
                          <span className="font-medium">{pkg.package_name}</span>
                          <span>{formatCurrency(pkg.pricing?.[selectedVehicle.vehicle_size.toLowerCase()] || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.payment_date}
                  onChange={handleChange}
                  disabled={loading || vehicleStatus === 'paid'}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center ${
                    loading || vehicleStatus === 'paid' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || vehicleStatus === 'paid'}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Record Payment'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;