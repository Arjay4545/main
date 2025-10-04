import React, { useState, useEffect } from 'react';
import { Laptop, X } from 'lucide-react';

const EmployeeTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionStats, setTransactionStats] = useState({
    borrowed: 0,
    available: 0,
    overdue: 0
  });
  const [showPendings, setShowPendings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRow, setSelectedRow] = useState(1);
  const [currentView, setCurrentView] = useState('transactions');
  const [showHistory, setShowHistory] = useState(false);

  // Static data for denied requests and approved transactions
  const deniedRequests = [
    { id: 1, date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Denied' },
    { id: 2, date: '09/22/2025', item: 'Laptop, Projector, etc', status: 'Denied' },
    { id: 3, date: '09/21/2025', item: 'Laptop, Projector, etc', status: 'Denied' }
  ];

  const approvedTransactions = [
    { date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Approved' },
    { date: '09/22/2025', item: 'Laptop, Projector, etc', status: 'Approved' },
    { date: '09/21/2025', item: 'Laptop, Projector, etc', status: 'Approved' },
  ];

  const exchangeItems = [
    { 
      name: 'Laptop', 
      brand: 'Lenovo',
      details: 'Core 5 16gb RAM, 1T storage, Windows 11',
      icon: '💻'
    },
    { 
      name: 'Mouse', 
      brand: 'Mouse',
      details: 'Logitech G Pro Wireless',
      icon: '🖱️'
    },
    { 
      name: 'Projector', 
      brand: 'Mouse',
      details: 'Acer X1128H',
      icon: '📽️'
    },
  ];

  const historyData = [
    { date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Approved', returnDate: '09/30/2025' },
    { date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Denied', returnDate: '' },
    { date: '09/24/2025', item: 'Laptop, Projector, etc', status: 'Approved', returnDate: '09/30/2025' },
    { date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Approved', returnDate: '09/30/2025' },
    { date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Denied', returnDate: '' },
    { date: '09/23/2025', item: 'Laptop, Projector, etc', status: 'Approved', returnDate: '09/30/2025' },
  ];

  // Database connection functions for transactions
  const fetchTransactionStats = async () => {
    try {
      const response = await fetch('/api/transactions/stats');
      const data = await response.json();
      
      if (data.success) {
        setTransactionStats({
          borrowed: data.data.borrowed || 0,
          available: data.data.available || 0,
          overdue: data.data.overdue || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error);
      // Keep default values if fetch fails
    }
  };

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      // Fetch pending requests from the requests table
      const response = await fetch('/api/requests?status=pending');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setPendingTransactions(data.data);
      } else {
        setPendingTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      setError('Failed to load pending requests');
      setPendingTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/approved');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setTransactions(data.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch approved transactions:', error);
      setError('Failed to load approved transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/history');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      setError('Failed to load transaction history');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadTransactionData = async () => {
      await fetchTransactionStats();
      await fetchPendingTransactions();
      await fetchApprovedTransactions();
      
      // Legacy fallback
      try {
        const res = await fetch('/api/employees/current-holders');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          if (transactions.length === 0) {
            setTransactions(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch legacy transaction data:', error);
      }
    };

    loadTransactionData();
  }, []);

  const handleRowClick = (request) => {
    setSelectedRequest(request);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

// ItemsList component moved outside EmployeeTransaction
function ItemsList() {
  const items = [
    "Laptop", "Mouse", "Keyboard", "Monitor", "Printer",
    "Desk", "Chair", "Projector", "Router", "Cable"
  ];

  const [limit, setLimit] = useState(5); // default rows

  return (
    <div className="p-4">
      <div className="mb-3">
        <label className="mr-2">Show:</label>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <span className="ml-2">entries</span>
      </div>

      <ul className="border rounded p-2">
        {items.slice(0, limit).map((item, i) => (
          <li key={i} className="py-1 border-b last:border-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

  // Show History page if showHistory is true
  if (showHistory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">History</h1>
          <button 
            onClick={() => setShowHistory(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Transactions
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-12 gap-6 pb-4 border-b border-gray-200 font-semibold text-gray-700">
            <div className="col-span-3">Date</div>
            <div className="col-span-3">Item</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3">Return Date</div>
          </div>

          <div className="divide-y divide-gray-100">
            {historyData.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">{item.date}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">{item.item}</span>
                </div>
                <div className="col-span-3">
                  {item.status === 'Approved' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Denied
                    </span>
                  )}
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">{item.returnDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show Approved page if currentView is 'approved'
  if (currentView === 'approved') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Approved</h1>
          <button 
            onClick={() => setCurrentView('transactions')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Transactions
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="bg-gray-200 px-6 py-4 rounded-lg mb-1">
                <div className="grid grid-cols-3 gap-4 font-semibold text-gray-700">
                  <span>Date</span>
                  <span>Item</span>
                  <span>Status</span>
                </div>
              </div>

              <div className="space-y-0">
                {approvedTransactions.map((transaction, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedRow(index)}
                    className={`px-6 py-4 cursor-pointer transition-colors ${
                      selectedRow === index 
                        ? 'bg-blue-200' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-3 gap-4 text-gray-700">
                      <span>{transaction.date}</span>
                      <span>{transaction.item}</span>
                      <span>{transaction.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg shadow-gray-400/60">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Exchange</h3>
              
              <div className="space-y-4 mb-6">
                {exchangeItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.brand}</div>
                      <div className="text-xs text-gray-600 mt-1">{item.details}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Exchange
                </button>
              </div>
            </div>

            <div className="rounded-xl shadow-lg border-gray-200 shadow-gray-400/60 bg-blue-600 text-white p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium">Item Currently Borrowed</span>
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full"></div>
              </div>
              <div className="text-5xl font-bold">{transactionStats.borrowed}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Pendings UI if button was clicked
  if (showPendings) {
    return (
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Pendings</h1>
            <button 
              onClick={() => setShowPendings(false)}
              className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Transaction
            </button>
          </div>

          <div className="rounded-xl shadow-lg shadow-gray-400/60 bg-white">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-10 gap-10 text-sm font-medium text-gray-700">
                <div className="col-span-2">Item</div>
                <div className="col-span-2">Start Date</div>
                <div className="col-span-2">Return Date</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {pendingTransactions.length > 0 ? pendingTransactions.map((transaction, index) => (
                <div key={transaction.id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-10 gap-10 items-center">
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {transaction.equipment_name || transaction.item || "Laptop, Projector, etc"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {transaction.expected_start_date
                          ? new Date(transaction.expected_start_date).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : "09/24/2025"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {transaction.expected_end_date
                          ? new Date(transaction.expected_end_date).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : "09/24/2025"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {transaction.created_at
                          ? new Date(transaction.created_at).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : "09/23/2025"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {transaction.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <>
                  <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/24/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/24/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/23/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/24/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/24/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/22/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/24/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/24/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">09/21/2025</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">Pending</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="mt-4 bg-white p-6 h-88 rounded-xl shadow-lg shadow-gray-400/60 font-bold">Inspect</div>
          <div className="rounded-xl shadow-lg shadow-gray-400/60 mt-4 bg-blue-600 p-9 text-white">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-medium opacity-90">Denied Request</h3>
    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
      <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
    </div>
  </div>

  {/* Number and Button in one flex row */}
  <div className="flex items-center justify-between">
    <div className="text-4xl font-bold">3</div>
    <button
      onClick={() => setIsModalOpen(true)}
      className="text-sm text-white bg-blue-700 px-7 mt-7 py-2 rounded-md hover:bg-blue-800 transition-colors">
      View All
    </button>
  </div>
</div>
        </div>

        {isModalOpen && (
          <div className= "absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 p-4 ">
            <div className="shadow-lg shadow-gray-500 h-full bg-gray-100 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-blue-600">Denied Requests</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 text-gray-600 font-medium">Date</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Item</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deniedRequests.map((request) => (
                        <tr 
                          key={request.id}
                          onClick={() => handleRowClick(request)}
                          className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                            selectedRequest?.id === request.id ? 'bg-blue-200' : ''
                          }`}
                        >
                          <td className="p-3 text-gray-700">{request.date}</td>
                          <td className="p-3 text-gray-700">{request.item}</td>
                          <td className="p-3 text-gray-700">{request.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-80 bg-gray-50 p-6 border-l overflow-y-auto">
                  <h3 className="font-semibold text-gray-800 mb-4">Inspect</h3>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 flex items-start gap-3">
                    <Laptop size={40} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">Laptop</p>
                      <p className="text-sm text-gray-500">Razer</p>
                      <p className="text-sm text-gray-500">Blade 14 RGB</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Denied Reason</h4>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        You have an overdue item you need to bring it to the office first
                      </p>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Appeal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main transaction view
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Transaction</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg shadow-lg shadow-black-400/60 p-6 h-full bg-blue-600 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90 mb-1">Item Currently Borrowed</h3>
                <div className="text-3xl font-bold">{transactionStats.borrowed}</div>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-lg shadow-gray-400/60 p-6 h-full bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Available Items</h3>
                <div className="text-3xl font-bold text-gray-900">{transactionStats.available}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="shadow-lg shadow-gray-500/70 h-full bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Overdue Items</h3>
                <div className="text-3xl font-bold text-gray-900">{transactionStats.overdue}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-600">On Process</h2>
              <button 
                onClick={() => setShowPendings(true)}
                className="text-right text-blue-600 text-sm font-medium hover:text-blue-700">
                View all
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-10 gap-10 text-sm font-medium text-gray-700">
              <div className="col-span-2">Item</div>
              <div className="col-span-2">Start Date</div>
              <div className="col-span-2">Return Date</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingTransactions.length > 0 ? pendingTransactions.slice(0, 3).map((transaction, index) => (
              <div key={transaction.id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-10 gap-10 items-center">
                  <div className="col-span-2">
                    <span className="text-sm text-gray-900">
                      {transaction.equipment_name || transaction.item || "Laptop, Projector, etc"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-900">
                      {transaction.expected_start_date
                        ? new Date(transaction.expected_start_date).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "09/24/2025"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-900">
                      {transaction.expected_end_date
                        ? new Date(transaction.expected_end_date).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "09/24/2025"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-900">
                      {transaction.created_at
                        ? new Date(transaction.created_at).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "09/23/2025"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-900">
                      {transaction.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/24/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/24/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/23/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Pending</span>
                    </div>
                  </div>
                </div>
    
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/24/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/24/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/22/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Pending</span>
                    </div>
                  </div>
                </div>
    
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/24/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/24/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">09/21/2025</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Pending</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-600">Approved</h2>
              <button               
                onClick={() => setCurrentView('approved')}               
                className="text-right text-blue-600 text-sm font-medium hover:text-blue-700">
                View all             
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">Date</div>
              <div className="col-span-6">Item</div>
              <div className="col-span-3">Status</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.length > 0 ? transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <span className="text-sm text-gray-900">
                      {transaction.created_at
                        ? new Date(transaction.created_at).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "09/23/2025"}
                    </span>
                  </div>
                  <div className="col-span-6">
                    <span className="text-sm text-gray-900">
                      {transaction.equipment_name || "Laptop, Projector, etc"}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-gray-900">Pending</span>
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <span className="text-sm text-gray-900">09/23/2025</span>
                    </div>
                    <div className="col-span-6">
                      <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-gray-900">Pending</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <span className="text-sm text-gray-900">09/22/2025</span>
                    </div>
                    <div className="col-span-6">
                      <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-gray-900">Pending</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  
      <div className="col-span-4 space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => setShowHistory(true)}
            className="relative bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            History
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          </button>
        </div>

        <div className="shadow-lg shadow-gray-400/60 p-6 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Borrowed Laptop, Projector, etc</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Return Laptop, Projector, etc</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Request Laptop, Projector, etc</p>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeTransaction;