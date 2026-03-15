import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import PaymentForm from './PaymentForm';
import PaymentList from './PaymentList';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD')
  });
  const [filter, setFilter] = useState({
    vehicleId: '',
    paymentStatus: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [paymentsRes, vehiclesRes, packagesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/payments'),
        axios.get('http://localhost:8000/api/vehicles'),
        axios.get('http://localhost:8000/api/packages')
      ]);
      
      // Properly determine payment status
      const vehiclesWithStatus = vehiclesRes.data.vehicles.map(vehicle => {
        const payment = paymentsRes.data.payments.find(p => p.vehicle_id === vehicle.vehicle_id);
        const hasExited = vehicle.exit_time !== null;
        const isPaid = payment && hasExited;
        
        return {
          ...vehicle,
          payment_status: isPaid ? 'paid' : 'unpaid'
        };
      });
      
      setPayments(paymentsRes.data.payments);
      setVehicles(vehiclesWithStatus);
      setPackages(packagesRes.data.packages);
      setError('');
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (filter.vehicleId) params.vehicleId = filter.vehicleId;
      if (filter.paymentStatus) params.paymentStatus = filter.paymentStatus;

      const response = await axios.get('http://localhost:8000/api/payments', { params });
      setPayments(response.data.payments);
      setError('');
    } catch (error) {
      console.error('Error fetching filtered payments:', error);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await axios.post('http://localhost:8000/api/payments', formData);
      setShowForm(false);
      fetchInitialData();
    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  if (loading && !payments.length) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Payment Management</h1>
          <button
            onClick={handleAddPayment}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Record Payment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{payments.length}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Vehicles</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {vehicles.filter(v => !v.exit_time).length}
              </dd>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filter.vehicleId}
                  onChange={(e) => setFilter({...filter, vehicleId: e.target.value})}
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                      {vehicle.license_plate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleFilterChange}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setFilter({ vehicleId: '', paymentStatus: '' });
                    setDateRange({
                      startDate: moment().startOf('month').format('YYYY-MM-DD'),
                      endDate: moment().endOf('month').format('YYYY-MM-DD')
                    });
                    fetchInitialData();
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <PaymentForm
              vehicles={vehicles.filter(v => !v.exit_time || v.payment_status === 'unpaid')}
              packages={packages}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <PaymentList payments={payments} />
      </div>
    </div>
  );
};

export default Payments;