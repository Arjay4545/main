import React, { useState, useEffect } from 'react';

const EmployeeReturnItems = () => {
  const [returnedItems, setReturnedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load returned items data on component mount
  useEffect(() => {
    const loadReturnedItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/employees/verify-returns');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReturnedItems(data.data);
        } else {
          setReturnedItems([]);
        }
      } catch (e) {
        setError('Failed to load returned items');
      } finally {
        setLoading(false);
      }
    };

    loadReturnedItems();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">Return Items</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-6 pb-4 border-b border-gray-200 font-semibold text-gray-700">
          <div className="col-span-3">Date</div>
          <div className="col-span-3">Item</div>
          <div className="col-span-3">Returned Status</div>
          <div className="col-span-3">Returned Date</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {returnedItems.length > 0 ? returnedItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-6 py-4 items-center">
              <div className="col-span-3">
                <span className="text-sm text-gray-900">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  }) : '09/23/2025'}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-sm text-gray-900">{item.equipment_name || 'Laptop, Projector, etc'}</span>
              </div>
              <div className="col-span-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Approved
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-sm text-gray-900">
                  {item.returned_at ? new Date(item.returned_at).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  }) : '09/30/2025'}
                </span>
              </div>
            </div>
          )) : (
            <>
              <div className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/30/2025</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Denied
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900"></span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/30/2025</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/30/2025</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Denied
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900"></span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 py-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/30/2025</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeReturnItems;
