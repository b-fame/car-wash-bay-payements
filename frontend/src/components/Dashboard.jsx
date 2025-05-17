import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalPayments: 0,
    todayRevenue: 0,
    activeVehicles: 0,
    monthlyRevenue: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = moment().format('YYYY-MM-DD');
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
        
        const [
          paymentsRes, 
          todayRes, 
          vehiclesRes, 
          monthlyRes,
          recentPaymentsRes
        ] = await Promise.all([
          axios.get('http://localhost:8000/api/payments'),
          axios.get(`http://localhost:8000/api/reports/daily-summary?date=${today}`),
          axios.get('http://localhost:8000/api/vehicles'),
          axios.get(`http://localhost:8000/api/reports/vehicle-type-summary?startDate=${startOfMonth}&endDate=${endOfMonth}`),
          axios.get('http://localhost:8000/api/payments?limit=5')
        ]);
        
        const todayRevenue = todayRes.data.summary.reduce((sum, item) => sum + item.total_revenue, 0);
        const monthlyRevenue = monthlyRes.data.summary.reduce((sum, item) => sum + item.total_revenue, 0);
        
        // Prepare chart data
        const vehicleTypeData = monthlyRes.data.summary.reduce((acc, item) => {
          if (!acc[item.vehicle_type]) {
            acc[item.vehicle_type] = 0;
          }
          acc[item.vehicle_type] += item.total_revenue;
          return acc;
        }, {});
        
        setChartData({
          labels: Object.keys(vehicleTypeData),
          values: Object.values(vehicleTypeData),
          colors: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
        });

        setStats({
          totalPayments: paymentsRes.data.payments.length,
          todayRevenue,
          activeVehicles: vehiclesRes.data.vehicles.length,
          monthlyRevenue
        });

        setRecentPayments(recentPaymentsRes.data.payments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate percentages for the chart
  const totalRevenue = chartData?.values?.reduce((sum, value) => sum + value, 0) || 1;
  const chartItems = chartData?.labels?.map((label, index) => ({
    label,
    value: chartData.values[index],
    percentage: Math.round((chartData.values[index] / totalRevenue) * 100),
    color: chartData.colors[index]
  })) || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back, {user.username}!</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Today's Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.todayRevenue.toLocaleString()} RWF
              </p>
            </div>
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Monthly Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.monthlyRevenue.toLocaleString()} RWF
              </p>
            </div>
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Total Vehicles Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.activeVehicles}
              </p>
            </div>
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Total Payments Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Total Payments</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalPayments}
              </p>
            </div>
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue by Vehicle Type</h3>
          </div>
          {chartItems.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center">
              {/* Donut Chart */}
              <div className="relative w-64 h-64 mb-6 md:mb-0 md:mr-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xl font-bold text-gray-700">
                    {totalRevenue.toLocaleString()} RWF
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {chartItems.reduce((acc, item, index) => {
                    const circumference = 2 * Math.PI * 40;
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const rotation = acc.rotation;
                    
                    const element = (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={circumference / 4}
                        transform={`rotate(${rotation} 50 50)`}
                      />
                    );
                    
                    return {
                      rotation: rotation + (item.percentage / 100) * 360,
                      elements: [...acc.elements, element]
                    };
                  }, { rotation: -90, elements: [] }).elements}
                </svg>
              </div>
              
              {/* Legend */}
              <div className="w-full">
                {chartItems.map((item, index) => (
                  <div key={index} className="flex items-center mb-3">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-medium text-gray-700">{item.percentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.value.toLocaleString()} RWF
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No chart data available</p>
            </div>
          )}
        </div>
        
        {/* Recent Payments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map(payment => (
                <div key={payment.payment_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800">{payment.license_plate}</h4>
                    <span className="text-xs text-gray-500">{moment(payment.payment_date).fromNow()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {payment.package_name} - {payment.amount.toLocaleString()} RWF
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Processed by {payment.cashier}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent payments</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}


    <div className="bg-white rounded-lg shadow p-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Manage Vehicles Button - Blue for navigation/management */}
    <a 
      href="/vehicles" 
      className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
    >
      <div className="w-5 h-5 mr-2 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-sm"></div>
      </div>
      <span>Manage Vehicles</span>
    </a>
    
    {/* Record Payment Button - Purple for financial actions */}
    <a 
      href="/payments" 
      className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
    >
      <div className="w-5 h-5 mr-2 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
        <div className="w-3 h-3 rounded-full border border-white"></div>
      </div>
      <span>Record Payment</span>
    </a>
    
    {/* View Reports Button - Indigo for data/analytics */}
    <a 
      href="/reports" 
      className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
    >
      <div className="w-5 h-5 mr-2 bg-white bg-opacity-30 rounded-sm flex items-center justify-center">
        <div className="w-3 h-3 border-t-2 border-l-2 border-white transform rotate-45"></div>
      </div>
      <span>View Reports</span>
    </a>
  </div>
      </div>
    </div>
  );
};

export default Dashboard;