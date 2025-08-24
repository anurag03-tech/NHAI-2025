import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const getRoleBasedTitle = () => {
    if (user?.role === "Moderator") {
      return "Moderator Portal";
    } else if (user?.role === "Admin") {
      return "NHAI Admin Portal";
    } else {
      return "NHAI Portal";
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes("moderator")) {
      return "Moderator Dashboard";
    } else if (location.pathname.includes("nhai-admin")) {
      return "NHAI Admin Dashboard";
    } else if (location.pathname === "/login") {
      return "Login";
    } else {
      return getRoleBasedTitle();
    }
  };

  const getShortPageTitle = () => {
    if (location.pathname.includes("moderator")) {
      return "Dashboard";
    } else if (location.pathname.includes("nhai-admin")) {
      return "Admin";
    } else if (location.pathname === "/login") {
      return "Login";
    } else {
      return user?.role === "Moderator"
        ? "Moderator"
        : user?.role === "Admin"
        ? "Admin"
        : "Portal";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            {isAuthenticated && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Logo/Brand */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/National_Highways_Authority_of_India_logo.svg/1200px-National_Highways_Authority_of_India_logo.svg.png"
                alt="NHAI Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg sm:text-xl font-bold">
                <span className="hidden sm:inline">NHAI Toilets</span>
                <span className="sm:hidden">NHAI</span>
              </span>
            </button>

            {/* Role-based Title - Hidden on very small screens */}
            {isAuthenticated && (
              <>
                <span className="hidden sm:block text-gray-400">|</span>
                <h1 className="hidden sm:block text-lg font-medium text-gray-800">
                  <span className="hidden md:inline">
                    {getRoleBasedTitle()}
                  </span>
                  <span className="md:hidden">{getShortPageTitle()}</span>
                </h1>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                {/* Desktop User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-sm hover:bg-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </button>
                </div>

                {/* Mobile User Menu */}
                <div className="md:hidden">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {/* Mobile User Dropdown */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      ></div>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-600">{user.role}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="h-3 w-3" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
