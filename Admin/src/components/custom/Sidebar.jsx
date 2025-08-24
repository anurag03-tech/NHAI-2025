import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  Plus,
  MapPin,
  MessageSquare,
  Star,
  AlertTriangle,
  Users,
  BarChart3,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  // Icon mapping
  const iconMap = {
    "🏠": <Home className="h-5 w-5" />,
    "🚻": <Plus className="h-5 w-5" />,
    "📍": <MapPin className="h-5 w-5" />,
    "📝": <MessageSquare className="h-5 w-5" />,
    "⭐": <Star className="h-5 w-5" />,
    "⚠️": <AlertTriangle className="h-5 w-5" />,
    "👥": <Users className="h-5 w-5" />,
    "📊": <BarChart3 className="h-5 w-5" />,
  };

  // Define menu items based on current user role
  const getMenuItems = () => {
    if (user?.role === "Moderator") {
      return [
        { name: "Dashboard", path: "/home", icon: "🏠" },
        { name: "Add Toilet", path: "/home/add-toilet", icon: "🚻" },
        { name: "My Toilets", path: "/home/toilets", icon: "📍" },
        { name: "Complaints", path: "/home/complaints", icon: "📝" },
        { name: "Reviews", path: "/home/reviews", icon: "⭐" },
        { name: "Penalties", path: "/home/penalties", icon: "⚠️" },
      ];
    } else if (user?.role === "Admin") {
      return [
        { name: "Dashboard", path: "/home", icon: "🏠" },
        { name: "All Toilets", path: "/home/all-toilets", icon: "📍" },
        { name: "All Complaints", path: "/home/all-complaints", icon: "📝" },
        { name: "Moderators", path: "/home/moderators", icon: "👥" },
        { name: "Penalties", path: "/home/admin-penalties", icon: "⚠️" },
        { name: "Analytics", path: "/home/analytics", icon: "📊" },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  if (!user) return null;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-64 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {user.role === "Moderator" ? "Moderator" : "Admin"} Panel
          </h2>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user.name}</p>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105"
                  }
                `}
              >
                <span
                  className={`
                  mr-3 flex-shrink-0 transition-transform duration-200
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }
                  group-hover:scale-110
                `}
                >
                  {iconMap[item.icon] || item.icon}
                </span>
                <span className="truncate">{item.name}</span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            NHAI Innovation Hackathon 2025
          </p>
        </div>
      </div>
    </div>
  );
}
