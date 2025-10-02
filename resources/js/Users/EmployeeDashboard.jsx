import React, { useState } from 'react';
import { Home, History, Package } from 'lucide-react';
import EmployeeTaskbar from './EmployeeTaskbar.jsx';
import EmployeeHome from './EmployeeHome.jsx';
import EmployeeTransaction from './EmployeeTransaction.jsx';
import EmployeeReturnItems from './EmployeeReturnItems.jsx';

const EmployeeDashboard = ({ 
  employeeName = "Employee User",
  notifications = 3 
}) => {
  const [activeMenu, setActiveMenu] = useState('Home');
  
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: History, label: 'Transaction', active: false },
    { icon: Package, label: 'Returned Items', active: false },
  ];

  const handleMenuClick = (label) => {
    setActiveMenu(label);
  };

  const handleSearch = (searchTerm) => {
    // Handle search functionality specific to employee dashboard
    console.log('Employee searching for:', searchTerm);
    // You can implement search logic here that filters across all employee components
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    // Navigate to employee profile page
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    // Navigate to employee settings page
  };

  const handleLogoutClick = () => {
    console.log('Logout clicked');
    // Handle employee logout
    if (confirm('Are you sure you want to sign out?')) {
      // Redirect to login page or handle logout
      window.location.href = '/login';
    }
  };

  // Render different content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'Home':
        return <EmployeeHome />;
      case 'Transaction':
        return <EmployeeTransaction />;
      case 'Returned Items':
        return <EmployeeReturnItems />;
      default:
        return <EmployeeHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full pl-60">
      {/* Logo Header */}
      <header className="fixed top-0 left-0 w-60 bg-white flex items-center justify-center py-4 z-40 border-r border-gray-200">
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
  
      {/* Sidebar Navigation */}
      <aside className="w-60 fixed top-20 inset-y-0 left-0 bg-blue-600 overflow-hidden rounded-tr-[60px] flex flex-col z-30 shadow-lg">
        <nav className="mt-8 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => handleMenuClick(item.label)}
                className={`w-50 flex items-center space-x-5 px-7 py-3 rounded-r-full transition-all duration-200 ${
                  activeMenu === item.label
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-blue-700 hover:bg-opacity-80'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-medium">{item.label}</span>
              </button>
            </div>
          ))}
         </nav>
       </aside>
  
      {/* Main Content Area with Employee Taskbar */}
      <div className="flex-1 flex flex-col">
        <EmployeeTaskbar 
          onSearch={handleSearch}
          employeeName={employeeName}
          notifications={notifications}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onLogoutClick={handleLogoutClick}
        />
  
        <div className="flex-1 p-6 bg-gray-50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
