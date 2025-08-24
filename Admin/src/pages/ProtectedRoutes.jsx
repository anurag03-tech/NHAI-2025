import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ModeratorHome from "./Moderator/Home";
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

  console.log("ProtectedRoutes check:", {
    isAuthenticated,
    user,
    requiredRole,
    userRole: user?.role,
  });

  if (!isAuthenticated || !user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If no specific role is required (like /home route), show appropriate dashboard
  if (!requiredRole) {
    console.log(
      "No required role, showing dashboard based on user role:",
      user.role
    );

    if (user.role === "Moderator") {
      return <ModeratorHome />;
    } else if (user.role === "Admin") {
      return <NhaiAdminHome />;
    }

    // If role doesn't match any expected role, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If specific role is required, check it
  if (requiredRole && user.role !== requiredRole) {
    console.log(
      `Role mismatch. Required: ${requiredRole}, User has: ${user.role}`
    );

    // Redirect to home (which will show appropriate dashboard)
    return <Navigate to="/home" replace />;
  }

  console.log("Access granted");
  return children;
}
