import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    total_vehicles: 0,
    total_payments: 0,
    total_revenue: 0,
    active_vehicles: 0,
    today_revenue: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/payments')
      ]);
      setStats(statsRes.data);
      setRecentPayments(paymentsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 RWF';
    return amount.toLocaleString() + ' RWF';
  };

  const statCards = [
    { title: 'Total Vehicles', value: stats.total_vehicles, icon: '🚗', color: 'blue' },
    { title: 'Total Payments', value: stats.total_payments, icon: '💰', color: 'green' },
    { title: 'Total Revenue', value: formatCurrency(stats.total_revenue), icon: '💵', color: 'yellow' },
    { title: 'Active Vehicles', value: stats.active_vehicles, icon: '🔧', color: 'purple' },
    { title: "Today's Revenue", value: formatCurrency(stats.today_revenue), icon: '📅', color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getBorderColor = (color) => {
    const colors = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      yellow: 'border-yellow-500',
      purple: 'border-purple-500',
      orange: 'border-orange-500'
    };
    return colors[color] || 'border-gray-500';
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.full_name || user?.username}!
        </h2>
        <p className="text-gray-600">Here's what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getBorderColor(card.color)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Vehicle</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Package</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Cashier</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(p => (
                <tr key={p.payment_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-medium">{p.license_plate}</td>
                  <td className="p-3 text-sm">{p.package_name}</td>
                  <td className="p-3 text-sm text-green-600 font-semibold">
                    {p.amount?.toLocaleString()} RWF
                  </td>
                  <td className="p-3 text-sm">{p.cashier}</td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No payments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;