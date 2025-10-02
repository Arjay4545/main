import React, { useState } from "react";
import { Search, Bell, User, Settings, LogOut } from "lucide-react";

const EmployeeTaskbar = ({ 
  onSearch, 
  employeeName = "Employee",
  notifications = 0,
  onProfileClick,
  onSettingsClick,
  onLogoutClick 
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuItemClick = (action) => {
    setShowProfileMenu(false);
    if (action === 'profile' && onProfileClick) {
      onProfileClick();
    } else if (action === 'settings' && onSettingsClick) {
      onSettingsClick();
    } else if (action === 'logout' && onLogoutClick) {
      onLogoutClick();
    }
  };

  return (
    <header className="flex items-center justify-between px-10 py-6 bg-white shadow-sm border-b border-gray-200">
      {/* Search Section */}
      <div className="flex-1" style={{ maxWidth: "644px" }}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search equipment, requests, or transactions..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {employeeName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {employeeName}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  Signed in as <strong>{employeeName}</strong>
                </div>
                
                <button
                  onClick={() => handleMenuItemClick('profile')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </button>
                
                <button
                  onClick={() => handleMenuItemClick('settings')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => handleMenuItemClick('logout')}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default EmployeeTaskbar;
