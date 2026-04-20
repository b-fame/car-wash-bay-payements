import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = ({ user }) => {
  const [dailyReport, setDailyReport] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [vehicleReport, setVehicleReport] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [selectedDate, user]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const dailyResponse = await axios.get(`/api/reports/daily?date=${selectedDate}`);
      const monthlyResponse = await axios.get('/api/reports/monthly');
      const vehiclesResponse = await axios.get('/api/reports/vehicles');
      
      setDailyReport(dailyResponse.data || []);
      setMonthlyReport(monthlyResponse.data || []);
      setVehicleReport(vehiclesResponse.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
      setDailyReport([]);
      setMonthlyReport([]);
      setVehicleReport([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 RWF';
    return Number(amount).toLocaleString() + ' RWF';
  };

  // Check access permission
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Access Denied. Only managers and admins can view reports.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Reports & Analytics</h2>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date for Daily Report</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Summary Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">📅 Daily Summary - {selectedDate}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Size</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Package</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Count</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dailyReport && dailyReport.length > 0 ? (
                  dailyReport.map((item, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm capitalize">{item.vehicle_size || '-'}</td>
                      <td className="p-3 text-sm">{item.package_name || '-'}</td>
                      <td className="p-3 text-sm">{item.count || 0}</td>
                      <td className="p-3 text-sm font-semibold text-green-600">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No data available for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">📈 Monthly Revenue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Payments</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport && monthlyReport.length > 0 ? (
                  monthlyReport.map((item, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm">{item.date || '-'}</td>
                      <td className="p-3 text-sm">{item.payments || 0}</td>
                      <td className="p-3 text-sm font-semibold text-green-600">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-gray-500">
                      No data available for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vehicle Statistics Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">🚗 Vehicle Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Vehicle Type</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Size</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Paid</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Unpaid</th>
              </tr>
            </thead>
            <tbody>
              {vehicleReport && vehicleReport.length > 0 ? (
                vehicleReport.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm">{item.vehicle_type || '-'}</td>
                    <td className="p-3 text-sm capitalize">{item.vehicle_size || '-'}</td>
                    <td className="p-3 text-sm">{item.total || 0}</td>
                    <td className="p-3 text-sm text-green-600 font-medium">{item.paid || 0}</td>
                    <td className="p-3 text-sm text-red-600 font-medium">{(item.total || 0) - (item.paid || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No vehicle statistics available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;