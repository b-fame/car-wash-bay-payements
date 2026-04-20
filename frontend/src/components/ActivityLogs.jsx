import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/activity-logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (!action) return 'text-gray-600';
    if (action.includes('LOGIN')) return 'text-green-600';
    if (action.includes('LOGOUT')) return 'text-gray-600';
    if (action.includes('PAYMENT')) return 'text-blue-600';
    if (action.includes('DELETE')) return 'text-red-600';
    return 'text-purple-600';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Access Denied. Only administrators can view activity logs.
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Activity Logs</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Date & Time</th>
                <th className="p-3 text-left text-sm font-semibold">User</th>
                <th className="p-3 text-left text-sm font-semibold">Action</th>
                <th className="p-3 text-left text-sm font-semibold">Details</th>
                <th className="p-3 text-left text-sm font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.log_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3 text-sm font-medium">{log.username}</td>
                  <td className="p-3 text-sm">
                    <span className={getActionColor(log.action)}>{log.action}</span>
                  </td>
                  <td className="p-3 text-sm">{log.details || '-'}</td>
                  <td className="p-3 text-sm">{log.ip_address || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No activity logs found
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

export default ActivityLogs;