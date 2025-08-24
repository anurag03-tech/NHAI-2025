import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import Header from "../components/custom/Header";
import Sidebar from "../components/custom/Sidebar";

export default function Layout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show sidebar for authenticated users on the home page and its sub-routes
  const showSidebar = isAuthenticated && location.pathname.startsWith("/home");

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header - Always on top with highest z-index */}
      <div className="relative z-50 flex-shrink-0">
        <Header
          onToggleSidebar={showSidebar ? toggleSidebar : undefined}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop - Below header but above content */}
        {showSidebar && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            style={{ top: "60px" }} // Start below header
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar - Below header, above backdrop */}
        {showSidebar && (
          <div
            className={`
            fixed lg:static lg:flex-shrink-0 z-30
            transform transition-transform duration-300 ease-in-out
            lg:transform-none
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
            style={{ top: "64px", height: "calc(100vh - 56px)" }} // Position below header
          >
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          </div>
        )}

        {/* Main Content */}
        <main
          className={`
          flex-1 overflow-hidden
          ${showSidebar ? "lg:ml-0" : ""}
        `}
        >
          <div className="h-full overflow-y-auto p-2 lg:p-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
