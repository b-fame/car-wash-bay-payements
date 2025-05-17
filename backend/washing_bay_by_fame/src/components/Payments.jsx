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
      
      // Add payment status to vehicles
      const vehiclesWithStatus = vehiclesRes.data.vehicles.map(vehicle => {
        const payment = paymentsRes.data.payments.find(p => p.vehicle_id === vehicle.vehicle_id);
        return {
          ...vehicle,
          payment_status: payment ? 'paid' : 'unpaid'
        };
      });
      
      setPayments(paymentsRes.data.payments);
      setVehicles(vehiclesWithStatus);
      setPackages(packagesRes.data.packages);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (filter.vehicleId) params.vehicleId = filter.vehicleId;
      if (filter.paymentStatus) params.paymentStatus = filter.paymentStatus;

      const response = await axios.get('http://localhost:8000/api/payments', { params });
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching filtered payments:', error);
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
      console.error('Error creating payment:', error.response?.data?.message || 'Payment failed');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          onClick={handleAddPayment}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Record Payment
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-500">Total Payments</h3>
          <p className="text-3xl font-bold text-gray-800">{payments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-medium text-gray-500">Active Vehicles</h3>
          <p className="text-3xl font-bold text-gray-800">
            {vehicles.filter(v => v.payment_status === 'unpaid').length}
          </p>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.vehicleId}
              onChange={(e) => setFilter({...filter, vehicleId: e.target.value})}
            >
              <option value="">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.license_plate} - {vehicle.vehicle_type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex-1"
              onClick={handleFilterChange}
            >
              Apply Filters
            </button>
            <button 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
              onClick={() => {
                setFilter({ vehicleId: '', paymentStatus: '' });
                setDateRange({
                  startDate: moment().startOf('month').format('YYYY-MM-DD'),
                  endDate: moment().endOf('month').format('YYYY-MM-DD')
                });
                fetchInitialData();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <PaymentForm 
              vehicles={vehicles}
              packages={packages}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      
      {/* Payment List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <PaymentList payments={payments} />
      </div>
    </div>
  );
};

export default Payments;