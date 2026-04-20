import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentForm from './PaymentForm';
import PaymentList from './PaymentList';

const Payments = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, vehiclesRes, packagesRes] = await Promise.all([
        axios.get('/api/payments'),
        axios.get('/api/vehicles/active'),
        axios.get('/api/packages')
      ]);
      setPayments(paymentsRes.data);
      setVehicles(vehiclesRes.data);
      setPackages(packagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowForm(false);
    fetchData();
    setMessage('Payment recorded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 RWF';
    return amount.toLocaleString() + ' RWF';
  };

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💰 Payment Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm">Total Payments</div>
          <div className="text-2xl font-bold">{payments.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="text-gray-500 text-sm">Total Revenue</div>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="text-gray-500 text-sm">Vehicles in Bay</div>
          <div className="text-2xl font-bold">{vehicles.length}</div>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
          {message}
        </div>
      )}

      {showForm && (
        <PaymentForm
          vehicles={vehicles}
          packages={packages}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <PaymentList payments={payments} />
    </div>
  );
};

export default Payments;