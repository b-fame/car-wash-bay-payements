import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'daily', label: 'Daily Summary' },
    { value: 'vehicle', label: 'Vehicle Type Summary' },
    { value: 'time', label: 'Time Analysis' },
    { value: 'active', label: 'Active Vehicles' }
  ];

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      let params = {};
      
      switch(reportType) {
        case 'daily':
          endpoint = '/api/reports/daily-summary';
          params = { date };
          break;
        case 'vehicle':
          endpoint = '/api/reports/vehicle-type-summary';
          params = { startDate, endDate };
          break;
        case 'time':
          endpoint = '/api/reports/time-analysis';
          params = { startDate, endDate };
          break;
        case 'active':
          endpoint = '/api/vehicles/active';
          break;
        default:
          endpoint = '/api/reports/daily-summary';
      }

      const response = await axios.get(`http://localhost:8000${endpoint}`, { params });
      console.log('Report data received:', response.data); // Debug log
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    generateReport();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatMinutes = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Helper function to calculate total revenue based on report type
  const calculateTotalRevenue = () => {
    if (!reportData) return 0;
    
    switch(reportType) {
      case 'daily':
        return reportData.summary?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0;
      case 'vehicle':
        return reportData.summary?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0;
      case 'active':
        return reportData.vehicles?.length || 0;
      default:
        return 0;
    }
  };

  // Check if data exists based on report type
  const hasData = () => {
    if (!reportData) return false;
    
    switch(reportType) {
      case 'daily':
        return reportData.summary && reportData.summary.length > 0;
      case 'vehicle':
        return reportData.summary && reportData.summary.length > 0;
      case 'time':
        return reportData.report && reportData.report.length > 0;
      case 'active':
        return reportData.vehicles && reportData.vehicles.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports Dashboard</h1>

        {/* Report Controls */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                {reportType === 'daily' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                ) : reportType !== 'active' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {reportData && !loading && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Report Header */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {reportType === 'daily' 
                  ? `Daily Report for ${moment(date).format('MMMM D, YYYY')}`
                  : reportType === 'vehicle'
                    ? `Vehicle Type Report (${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D, YYYY')})`
                    : reportType === 'time'
                      ? `Time Analysis Report (${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D, YYYY')})`
                      : 'Currently Active Vehicles'
                }
              </h3>
            </div>

            {/* Summary Stats */}
            {(reportType === 'daily' || reportType === 'vehicle') && hasData() && (
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Revenue:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculateTotalRevenue())}
                  </span>
                </div>
              </div>
            )}

            {reportType === 'active' && hasData() && (
              <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Active Vehicles:</span>
                  <span className="text-lg font-bold text-green-600">
                    {reportData.vehicles?.length || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Report Table */}
            {hasData() ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'daily' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        </>
                      )}
                      {reportType === 'vehicle' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        </>
                      )}
                      {reportType === 'time' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vehicles</th>
                        </>
                      )}
                      {reportType === 'active' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In Bay</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportType === 'daily' && reportData.summary?.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.vehicle_size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.package_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_payments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatCurrency(item.total_revenue)}</td>
                      </tr>
                    ))}
                    
                    {reportType === 'vehicle' && reportData.summary?.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicle_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_payments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatCurrency(item.total_revenue)}</td>
                      </tr>
                    ))}
                    
                    {reportType === 'time' && reportData.report?.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicle_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMinutes(item.avg_time_minutes)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_vehicles}</td>
                      </tr>
                    ))}
                    
                    {reportType === 'active' && reportData.vehicles?.map((vehicle, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.license_plate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.vehicle_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{vehicle.vehicle_size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(vehicle.entry_time).format('MMM D, YYYY h:mm A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatMinutes(moment().diff(moment(vehicle.entry_time), 'minutes'))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {reportType === 'daily' 
                    ? `No payments recorded for ${moment(date).format('MMMM D, YYYY')}`
                    : reportType === 'vehicle' || reportType === 'time'
                      ? `No data found for the selected date range`
                      : 'No active vehicles in the bay'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;