import React from 'react';

const PaymentList = ({ payments }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '0 RWF';
    return amount.toLocaleString() + ' RWF';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Package</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Cashier</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.payment_id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-sm">{new Date(payment.payment_date).toLocaleString()}</td>
                <td className="p-3 text-sm font-medium">{payment.license_plate}</td>
                <td className="p-3 text-sm">{payment.package_name}</td>
                <td className="p-3 text-sm text-green-600 font-semibold">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="p-3 text-sm">{payment.cashier}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentList;