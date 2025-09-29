import React, { useState } from "react";
import {
  Eye,
  ArrowLeftRight,
  Folder,
  User,
  FileText,
  Users,
  Settings,
  Clock,
} from "lucide-react";

const HomeSidebar = ({ onSelect }) => {
  const [openTransaction, setOpenTransaction] = useState(true);
  const [openEquipment, setOpenEquipment] = useState(true);

  const isActive = (path) =>
    typeof window !== "undefined" &&
    window.location &&
    window.location.pathname === path;

  // Auto-close dropdowns when other menu items are clicked
  const handleMenuClick = (path, event) => {
    if (event) {
      event.preventDefault();
    }
    
    // Close both dropdowns when clicking any main menu item that's not Transaction or Equipment
    const transactionPaths = ["/viewrequest", "/viewapproved"];
    const equipmentPaths = ["/equipment", "/addstocks"];
    
    if (!transactionPaths.includes(path)) {
      setOpenTransaction(false);
    }
    if (!equipmentPaths.includes(path)) {
      setOpenEquipment(false);
    }
        
    // Simulate navigation (in real app, this would be handled by your router)
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = path;
      }, 100);
    }
  };

  // 🔹 Main links (Home, Employee, etc.) - Added motion animation
  const linkClass = (path) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out text-base font-semibold min-w-[140px] transform hover:scale-105 active:scale-95 ${
    isActive(path)
      ? "bg-white text-[#2262C6] shadow-sm scale-105"
      : "text-white hover:bg-white hover:text-[#2262C6] hover:shadow-sm"
  }`;

  // 🔹 Section buttons (Transaction, Equipment) - Added motion animation
  const sectionButtonClass = (active) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out text-base font-semibold min-w-[140px] transform hover:scale-105 active:scale-95 ${
    active
      ? "bg-white text-[#2262C6] shadow-sm scale-105"
      : "text-white hover:bg-white hover:text-[#2262C6] hover:shadow-sm"
  }`;

  return (
    <div className="flex flex-col">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-3">
        <img
          src="/images/Frame_89-removebg-preview.png"
          alt="iREPLY Logo"
          className="h-16 w-auto"
        />
      </div>

      {/* Sidebar */}
      <aside className="w-57 bg-gradient-to-b from-[#0064FF] to-[#053786] text-white flex flex-col h-screen overflow-hidden rounded-tr-[72px]">
        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 mt-3 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Home */}
          <a href="/dashboard" className={linkClass("/dashboard")} onClick={(e) => handleMenuClick("/dashboard", e)}>
            <Eye className="h-5 w-5" />
            <span>Home</span>
          </a>

          {/* Transaction */}
          <button
            className={sectionButtonClass(
              isActive("/viewrequest") || isActive("/viewapproved")
            )}
            onClick={() => {
              setOpenTransaction(!openTransaction);
              // Don't close other dropdowns when clicking transaction button
            }}
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>Transaction</span>
            <span className="ml-auto text-xs">
              {openTransaction ? "▾" : "▸"}
            </span>
          </button>
          {openTransaction && (
            <ul className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <li>
                <a
                  href="/viewrequest"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/viewrequest")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  View Request
                </a>
              </li>
              <li>
                <a
                  href="/viewapproved"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/viewapproved")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  View Approved
                </a>
              </li>
            </ul>
          )}

          {/* Equipment */}
          <button
            className={sectionButtonClass(
              isActive("/equipment") || isActive("/addstocks")
            )}
            onClick={() => {
              setOpenEquipment(!openEquipment);
              // Don't close other dropdowns when clicking equipment button
            }}
          >
            <Folder className="h-5 w-5" />
            <span>Equipment</span>
            <span className="ml-auto text-xs">
              {openEquipment ? "▾" : "▸"}
            </span>
          </button>
          {openEquipment && (
            <ul className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <li>
                <a
                  href="/equipment"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/equipment")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  Inventory
                </a>
              </li>
              <li>
                <a
                  href="/addstocks"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/addstocks")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  Add Stocks
                </a>
              </li>
            </ul>
          )}

          {/* Other Menus */}
          <a href="/employee" className={linkClass("/employee")} onClick={(e) => handleMenuClick("/employee", e)}>
            <User className="h-5 w-5" />
            <span>Employee</span>
          </a>

          <a href="/reports" className={linkClass("/reports")} onClick={(e) => handleMenuClick("/reports", e)}>
            <FileText className="h-5 w-5" />
            <span>Reports</span>
          </a>

          <a href="/role-management" className={linkClass("/role-management")} onClick={(e) => handleMenuClick("/role-management", e)}>
            <Users className="h-5 w-5" />
            <span>Role Management</span>
          </a>

          <a href="/control-panel" className={linkClass("/control-panel")} onClick={(e) => handleMenuClick("/control-panel", e)}>
            <Settings className="h-5 w-5" />
            <span>Control Panel</span>
          </a>

          <a href="/activitylogs" className={linkClass("/activitylogs")} onClick={(e) => handleMenuClick("/activitylogs", e)}>
            <Clock className="h-5 w-5" />
            <span>Activity Logs</span>
          </a>

          <a href="/users" className={linkClass("/users")} onClick={(e) => handleMenuClick("/users", e)}>
            <User className="h-5 w-5" />
            <span>Users</span>
          </a>
        </nav>
      </aside>
    </div>
  );
};

export default HomeSidebar;