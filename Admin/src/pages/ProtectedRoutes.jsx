import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import OperatorHome from "./Operator/Home";
import NhaiAdminHome from "./NhaiAdmin/Home";

export default function ProtectedRoutes({ children, requiredRole }) {
  const { user, isAuthenticated, isInitialized } = useAuth();

  // Show loading while checking auth status
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If specific role is required, check it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  // ✅ ALWAYS return children - let React Router handle the routing
  return children;
}
