import React, { useState, useEffect } from 'react';
import { Laptop, Plus } from 'lucide-react';

const EmployeeHome = () => {
  const [employees, setEmployees] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Load data on component mount
  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [empRes, catRes, equipRes] = await Promise.all([
          fetch('/api/employees', { signal: controller.signal }),
          fetch('/api/categories', { signal: controller.signal }),
          fetch('/api/equipment?per_page=100', { signal: controller.signal })
        ]);
        
        const empData = await empRes.json();
        const catData = await catRes.json();
        const equipData = await equipRes.json();
        
        if (empData.success && Array.isArray(empData.data)) {
          setEmployees(empData.data);
        } else if (Array.isArray(empData)) {
          setEmployees(empData);
        } else {
          setEmployees([]);
        }
        
        if (catData && Array.isArray(catData.data)) {
          setCategories(catData.data);
        } else if (Array.isArray(catData)) {
          setCategories(catData);
        } else {
          setCategories([]);
        }
        
        if (Array.isArray(equipData)) {
          setEquipment(equipData);
        } else if (equipData && equipData.data && Array.isArray(equipData.data.data)) {
          setEquipment(equipData.data.data);
        } else if (Array.isArray(equipData.data)) {
          setEquipment(equipData.data);
        } else {
          setEquipment([]);
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => controller.abort();
  }, []);

  const handleItemTableClick = async (category) => {
    try {
      setSelectedCategory(category.name || category);
      setLoading(true);
      const categoryId = category.id || null;
      let url = '/api/equipment?per_page=100';
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      } else if (typeof category === 'string') {
        url += `&search=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEquipment(data);
      } else if (data && data.data && Array.isArray(data.data.data)) {
        setEquipment(data.data.data);
      } else if (Array.isArray(data.data)) {
        setEquipment(data.data);
      } else {
        setEquipment([]);
      }
    } catch (e) {
      setError('Failed to load equipment for category');
    } finally {
      setLoading(false);
    }
  };

  const handlePlusClick = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    const itemsSection = document.getElementById('items-section');
    if (itemsSection) {
      itemsSection.style.border = '3px solid #3B82F6';
      itemsSection.style.borderRadius = '8px';
      
      itemsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      
      setTimeout(() => {
        itemsSection.style.border = '';
        itemsSection.style.borderRadius = '';
      }, 2000);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const submitRequest = async () => {
    if (cartItems.length === 0) {
      alert('Please add items to your cart before submitting a request.');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        items: cartItems.map(item => ({
          equipment_id: item.id,
          quantity: item.quantity,
          equipment_name: item.name || item.brand,
          specifications: item.specifications
        })),
        total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        requested_date: new Date().toISOString(),
        return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'pending'
      };

      const response = await fetch('/api/transactions/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Request submitted successfully!');
        setCartItems([]); // Clear cart
      } else {
        alert('Failed to submit request: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Homepage</h1>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-3">
          <div className="rounded-lg shadow-lg shadow-gray-500/70 p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Item Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleItemTableClick(category)}
                  className={`aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${
                    selectedCategory === (category.name || category) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Laptop className="h-6 w-6 text-gray-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">{category.name || 'Category'}</span>
                </button>
              ))}
              {categories.length === 0 && (
                <div className="col-span-2 text-center text-sm text-gray-500 py-8">No categories found</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-6">
          <div className="rounded-lg shadow-lg shadow-gray-500/70 p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {selectedCategory ? `${selectedCategory} Types` : 'Equipment Types'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 pb-2">
                <div className="col-span-3">Brand</div>
                <div className="col-span-7">Specs</div>
                <div className="col-span-2"></div>
              </div>
              
              {equipment.slice(0, 4).map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100">
                  <div className="col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Laptop className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.brand || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">x{item.quantity || 1}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-7">
                    <p className="text-sm text-gray-600">{item.specifications || 'No specs available'}</p>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => handlePlusClick(item)}
                      className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
              {equipment.length === 0 && (
                <div className="text-gray-500 text-sm">
                  {selectedCategory ? `No ${selectedCategory} equipment found` : 'No equipment found'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div id="items-section" className="col-span-3">
          <div className="rounded-lg shadow-lg shadow-gray-400/60 p-6 h-full bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Laptop className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.name || item.brand}</div>
                      <div className="text-xs text-gray-500">{item.model || item.brand}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-red-50 border border-red-200 hover:bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <span className="text-red-600 text-sm font-bold">−</span>
                    </button>
                    <span className="text-xs text-gray-600 min-w-[20px] text-center font-medium">x{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-full flex items-center justify-center">
                      <Plus className="h-3 w-3 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="text-gray-400 text-sm text-center py-6">
                  <Laptop className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <div className="text-xs">Your cart is empty</div>
                  <div className="text-xs">Click + buttons to add items</div>
                </div>
              )}
            </div>

            {/* Date Pickers Section - Only show when items are in cart */}
            {cartItems.length > 0 && (
              <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Request Summary Section */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Request Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-semibold text-gray-900">x{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-600">
                        <span>{item.name || item.brand}</span>
                        <span className="font-medium">x{item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Start</span>
                        <span className="font-medium text-gray-900">
                          {new Date(startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Return</span>
                        <span className="font-medium text-gray-900">
                          {new Date(returnDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium text-gray-900">
                          {Math.ceil((new Date(returnDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))}days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCartItems([])}
                    className="flex-1 bg-white border border-red-300 hover:bg-red-50 text-red-600 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={submitRequest}
                    disabled={loading || cartItems.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    {loading ? 'Submitting...' : (
                      <>
                        Request
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
