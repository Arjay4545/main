import React, { useState } from 'react';
import { Search, Home, History, Users, BarChart3, Laptop, Mouse, Plus, Package } from 'lucide-react';
import Taskbar from '../components/Taskbar.jsx';

const Employee = () => {
  const [activeMenu, setActiveMenu] = useState('Home');
  const [employees, setEmployees] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [returnedItems, setReturnedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showPendings, setShowPendings] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
  // Load data based on active menu
  React.useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeMenu === 'Home') {
          // Load employees, categories, and equipment for home
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
          
          // EquipmentController returns pagination; handle both cases
          if (Array.isArray(equipData)) {
            setEquipment(equipData);
          } else if (equipData && equipData.data && Array.isArray(equipData.data.data)) {
            setEquipment(equipData.data.data);
          } else if (Array.isArray(equipData.data)) {
            setEquipment(equipData.data);
          } else {
            setEquipment([]);
          }
        } else if (activeMenu === 'Transaction') {
          // Load current holders
          const res = await fetch('/api/employees/current-holders', { signal: controller.signal });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setTransactions(data.data);
          } else {
            setTransactions([]);
          }
        } else if (activeMenu === 'Returned Items') {
          // Load returned items
          const res = await fetch('/api/employees/verify-returns', { signal: controller.signal });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setReturnedItems(data.data);
          } else {
            setReturnedItems([]);
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => controller.abort();
  }, [activeMenu]);
  
  
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: History, label: 'Transaction', active: false },
    { icon: Package, label: 'Returned Items', active: false },
  ];


  // Handle menu item click
  const handleMenuClick = (label) => {
    setActiveMenu(label);
    setShowPendings(false);
  };

  // Handle item table click - filter types by category
  const handleItemTableClick = async (category) => {
    try {
      setSelectedCategory(category.name || category);
      setLoading(true);
      const categoryId = category.id || null;
      let url = '/api/equipment?per_page=100';
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      } else if (typeof category === 'string') {
        // fallback: use search if only name provided
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

  // Handle plus button click - add to cart and scroll to items
  const handlePlusClick = (item) => {
    // Add item to cart
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

    // Scroll to items section with highlight
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

  // Handle remove from cart
  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  // Handle quantity change in cart
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Render different content based on active menu
  const renderContent = () => {
    // Show Pendings UI if button was clicked
    if (showPendings) {
      return renderPendings();
    }

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

    switch (activeMenu) {
      case 'Home':
        return renderHome();
      case 'Transaction':
        return renderTransactions();
      case 'Returned Items':
        return renderReturnedItems();
      default:
        return renderHome();
    }
  };

  const renderHome = () => (
    <div className="space-y-6">
      {/* Title at the top */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Homepage</h1>
      </div>
  
      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Item Categories */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
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
  
        {/* Equipment Types */}
        <div className="col-span-6">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
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
  
        {/* Items - Shopping Cart */}
        <div id="items-section" className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Items</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Laptop className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.name || item.brand}</div>
                      <div className="text-sm text-gray-500">{item.model || 'Model'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center"
                    >
                      <span className="text-red-600 text-sm">-</span>
                    </button>
                    <span className="text-sm text-gray-500 min-w-[20px] text-center">x{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">
                  <Laptop className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <div>Your cart is empty</div>
                  <div className="text-xs">Click + buttons to add items</div>
                </div>
              )}
            </div>
            
            {/* Request Summary */}
            {cartItems.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">REQUEST SUMMARY</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total items:</span>
                    <span className="font-medium">x{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-600">
                      <span>{item.name || item.brand}:</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span>Start:</span>
                    <span className="font-medium">Today</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return:</span>
                    <span className="font-medium">7 days</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Request →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Main Content Area */}
      <div className="col-span-8 space-y-6">

      <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-blue-600">Transaction</h1>
      </div>
        {/* Top Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90 mb-1">Item Currently Borrowed</h3>
                <div className="text-3xl font-bold">3</div>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Available Items</h3>
                <div className="text-3xl font-bold text-gray-900">24</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Overdue Items</h3>
                <div className="text-3xl font-bold text-gray-900">1</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* On Process Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-600">On Process</h2>
              <button 
  onClick={() => setShowPendings(true)}
  className="text-right text-blue-600 text-sm font-medium hover:text-blue-700"
>
  View all
</button>
            </div>
          </div>
  
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">Date</div>
              <div className="col-span-6">Item</div>
              <div className="col-span-3">Status</div>
            </div>
          </div>
  
          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/23/2025</span>
                </div>
                <div className="col-span-6">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">
                    Pending
                  </span>
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
                  <span className="text-sm text-gray-900">
                    Pending
                  </span>
                </div>
              </div>
            </div>
  
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/21/2025</span>
                </div>
                <div className="col-span-6">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Approved Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-600">Approved</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View all
              </button>
            </div>
          </div>
  
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">Date</div>
              <div className="col-span-6">Item</div>
              <div className="col-span-3">Status</div>
            </div>
          </div>
  
          {/* Table Rows */}
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
                    <span className="text-sm text-gray-900">
                      Pending
                    </span>
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
                      <span className="text-sm text-gray-900">
                        Pending
                      </span>
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
                      <span className="text-sm text-gray-900">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    
      {/* Right Sidebar */}
      <div className="col-span-4 space-y-6">
        {/* History Button */}
        <div className="flex justify-end">
          <button className="relative bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            History
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          </button>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200">
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
  
  
  
  const renderReturnedItems = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Returned Items</h2>
      <div className="space-y-4">
        {returnedItems.map((item) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{item.equipment_name || 'Equipment'}</div>
                <div className="text-sm text-gray-500">Returned by: {item.employee_name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">Date: {item.returned_at ? new Date(item.returned_at).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div className="text-sm text-blue-600 font-medium">Returned</div>
            </div>
          </div>
        ))}
        {returnedItems.length === 0 && (
          <div className="text-gray-500 text-center py-8">No returned items</div>
        )}
      </div>
    </div>
  );

  const renderPendings = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Main Content Area */}
      <div className="col-span-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Pendings</h1>
          <button 
            onClick={() => setShowPendings(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Transaction
          </button>
        </div>

        {/* Pendings Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">Date</div>
              <div className="col-span-6">Item</div>
              <div className="col-span-3">Status</div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
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

            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">09/21/2025</span>
                </div>
                <div className="col-span-6">
                  <span className="text-sm text-gray-900">Laptop, Projector, etc</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="col-span-4">
        {/* Denied Request Card */}
        <div className="bg-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Denied Request</h3>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
            </div>
          </div>
          <div className="text-4xl font-bold mb-4">3</div>
          <button className="text-sm text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            View All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 w-full pl-60">
      
      {/* Top Logo (outside sidebar) */}
      <header className="fixed top-0 left-0 w-60 bg-white flex items-center justify-center py-4 z-40">
        <div className="flex items-center space-x-2">
          <img 
            src="/images/Frame_89-removebg-preview.png"
            alt="iREPLY Logo" 
            className="h-12 w-auto object-contain"
            onError={(e) => {
              console.error('Logo failed to load:', e.target.src);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
         
        </div>
      </header>
  
      {/* Fixed Sidebar (starts below logo) */}
      <aside className="w-60 fixed top-20 inset-y-0 left-0 bg-blue-600 overflow-hidden rounded-tr-[60px] flex flex-col z-30">
        
        {/* Menu */}
        <nav className="mt-8 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => handleMenuClick(item.label)}
                className={`w-50 flex items-center space-x-5 px-7 py-2 rounded-r-full transition-colors ${
                  activeMenu === item.label
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-normal">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>
  
      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        <Taskbar title="Employee" />
  
        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Employee;