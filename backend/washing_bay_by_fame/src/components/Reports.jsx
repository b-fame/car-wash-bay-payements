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
  const [error, setError] = useState(null);

  const reportTypes = [
    { value: 'daily', label: 'Daily Summary' },
    { value: 'vehicle', label: 'Vehicle Type Summary' },
    { value: 'time', label: 'Time Analysis' },
    { value: 'active', label: 'Active Vehicles' }
  ];

  const generateReport = async () => {
    setLoading(true);
    setError(null);
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
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Reports Dashboard
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Analyze and track washing bay performance
          </p>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              ) : (reportType !== 'active' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              ))}
              
              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Generate Report'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Report Content */}
        {reportData && !loading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
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

            {/* Summary Card */}
            {(reportType === 'daily' || reportType === 'vehicle' || reportType === 'active') && (
              <div className="bg-blue-50 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-lg font-medium text-gray-700">
                      {reportType === 'active' ? 'Active Vehicles' : 'Total Revenue'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {reportType === 'active' 
                      ? reportData.vehicles.length 
                      : formatCurrency(reportType === 'daily' 
                        ? reportData.summary.reduce((sum, item) => sum + item.total_revenue, 0)
                        : reportData.summary.reduce((sum, item) => sum + item.total_revenue, 0))
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Report Table */}
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
                  {reportType === 'daily' && reportData.summary.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{item.vehicle_size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.package_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_payments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatCurrency(item.total_revenue)}</td>
                    </tr>
                  ))}
                  {reportType === 'vehicle' && reportData.summary.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.vehicle_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_payments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatCurrency(item.total_revenue)}</td>
                    </tr>
                  ))}
                  {reportType === 'time' && reportData.report.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.vehicle_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMinutes(item.avg_time_minutes)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_vehicles}</td>
                    </tr>
                  ))}
                  {reportType === 'active' && reportData.vehicles.map((vehicle, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.license_plate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.vehicle_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{vehicle.vehicle_size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(vehicle.entry_time).format('h:mm A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatMinutes(moment().diff(moment(vehicle.entry_time), 'minutes'))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;













































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import moment from 'moment';

// const Reports = () => {
//   const [reportType, setReportType] = useState('daily');
//   const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
//   const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
//   const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const reportTypes = [
//     { value: 'daily', label: 'Daily Summary' },
//     { value: 'vehicle', label: 'Vehicle Type Summary' },
//     { value: 'time', label: 'Time Analysis' },
//     { value: 'active', label: 'Active Vehicles' }
//   ];

//   const generateReport = async () => {
//     setLoading(true);
//     try {
//       let endpoint = '';
//       let params = {};
      
//       switch(reportType) {
//         case 'daily':
//           endpoint = '/api/reports/daily-summary';
//           params = { date };
//           break;
//         case 'vehicle':
//           endpoint = '/api/reports/vehicle-type-summary';
//           params = { startDate, endDate };
//           break;
//         case 'time':
//           endpoint = '/api/reports/time-analysis';
//           params = { startDate, endDate };
//           break;
//         case 'active':
//           endpoint = '/api/vehicles/active';
//           break;
//         default:
//           endpoint = '/api/reports/daily-summary';
//       }

//       const response = await axios.get(`http://localhost:8000${endpoint}`, { params });
//       setReportData(response.data);
//     } catch (error) {
//       console.error('Error generating report:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     generateReport();
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     generateReport();
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-RW', { 
//       style: 'currency', 
//       currency: 'RWF',
//       minimumFractionDigits: 0 
//     }).format(amount);
//   };

//   const formatMinutes = (minutes) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports Dashboard</h2>
      
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={reportType}
//                 onChange={(e) => setReportType(e.target.value)}
//               >
//                 {reportTypes.map((type) => (
//                   <option key={type.value} value={type.value}>{type.label}</option>
//                 ))}
//               </select>
//             </div>
            
//             {reportType === 'daily' ? (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                 <input
//                   type="date"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                 />
//               </div>
//             ) : (reportType !== 'active' && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                   />
//                 </div>
//               </>
//             ))}
            
//             <div className="flex items-end">
//               <button 
//                 type="submit" 
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
//                 disabled={loading}
//               >
//                 {loading ? 'Generating...' : 'Generate Report'}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
      
//       {loading && (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       )}
      
//       {reportData && !loading && (
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-xl font-semibold text-gray-800 mb-4">
//             {reportType === 'daily' 
//               ? `Daily Report for ${moment(date).format('MMMM D, YYYY')}`
//               : reportType === 'vehicle'
//                 ? `Vehicle Type Report (${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D, YYYY')})`
//                 : reportType === 'time'
//                   ? `Time Analysis Report (${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D, YYYY')})`
//                   : 'Currently Active Vehicles'
//             }
//           </h3>
          
//           {reportType === 'daily' ? (
//             <div>
//               <div className="bg-blue-50 p-4 rounded-md mb-4">
//                 <p className="text-lg font-medium">
//                   Total Revenue: <span className="text-blue-600">{formatCurrency(reportData.summary.reduce((sum, item) => sum + item.total_revenue, 0))}</span>
//                 </p>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Size</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {reportData.summary.map((item, index) => (
//                       <tr key={index}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.vehicle_size}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.package_name}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_payments}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.total_revenue)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : reportType === 'vehicle' ? (
//             <div>
//               <div className="bg-blue-50 p-4 rounded-md mb-4">
//                 <p className="text-lg font-medium">
//                   Total Revenue: <span className="text-blue-600">{formatCurrency(reportData.summary.reduce((sum, item) => sum + item.total_revenue, 0))}</span>
//                 </p>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {reportData.summary.map((item, index) => (
//                       <tr key={index}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.vehicle_type}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_payments}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.total_revenue)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : reportType === 'time' ? (
//             <div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Time</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vehicles</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {reportData.report.map((item, index) => (
//                       <tr key={index}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.vehicle_type}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMinutes(item.avg_time_minutes)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_vehicles}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <div className="bg-blue-50 p-4 rounded-md mb-4">
//                 <p className="text-lg font-medium">
//                   Active Vehicles: <span className="text-blue-600">{reportData.vehicles.length}</span>
//                 </p>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In Bay</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {reportData.vehicles.map((vehicle, index) => (
//                       <tr key={index}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.license_plate}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.vehicle_type}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.vehicle_size}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {moment(vehicle.entry_time).format('h:mm A')}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {formatMinutes(moment().diff(moment(vehicle.entry_time), 'minutes'))}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reports;