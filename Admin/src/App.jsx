import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./pages/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import ProtectedRoutes from "./pages/ProtectedRoutes";

// Operator Components
import OperatorHome from "./pages/Operator/Home";
import AddToilet from "./pages/Operator/AddToilet";
import MyToilets from "./pages/Operator/MyToilets";
import Complaints from "./pages/Operator/Complaints";
import Reviews from "./pages/Operator/Reviews";
import Penalties from "./pages/Operator/Penalties";

// Admin Components
import AllToilets from "./pages/NhaiAdmin/AllToilets.jsx";
import AllComplaints from "./pages/NhaiAdmin/AllComplaints";
import Operators from "./pages/NhaiAdmin/Operators";
import AdminPenalties from "./pages/NhaiAdmin/AdminPenalties";
import Analytics from "./pages/NhaiAdmin/Analytics";

import Dashboard from "./pages/Dashboard";

// Create router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "home",
        element: (
          <ProtectedRoutes>
            <Dashboard />
            {/* <OperatorHome /> */}
          </ProtectedRoutes>
        ),
      },
      // Operator Routes
      {
        path: "home/add-toilet",
        element: (
          <ProtectedRoutes requiredRole="Operator">
            <AddToilet />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/toilets",
        element: (
          <ProtectedRoutes requiredRole="Operator">
            <MyToilets />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/complaints",
        element: (
          <ProtectedRoutes requiredRole="Operator">
            <Complaints />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/reviews",
        element: (
          <ProtectedRoutes requiredRole="Operator">
            <Reviews />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/penalties",
        element: (
          <ProtectedRoutes requiredRole="Operator">
            <Penalties />
          </ProtectedRoutes>
        ),
      },
      // Admin Routes
      {
        path: "home/all-toilets",
        element: (
          <ProtectedRoutes requiredRole="Admin">
            <AllToilets />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/all-complaints",
        element: (
          <ProtectedRoutes requiredRole="Admin">
            <AllComplaints />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/operators",
        element: (
          <ProtectedRoutes requiredRole="Admin">
            <Operators />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/admin-penalties",
        element: (
          <ProtectedRoutes requiredRole="Admin">
            <AdminPenalties />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/analytics",
        element: (
          <ProtectedRoutes requiredRole="Admin">
            <Analytics />
          </ProtectedRoutes>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
