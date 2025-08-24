import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./pages/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import ProtectedRoutes from "./pages/ProtectedRoutes";

// Moderator Components
import ModeratorHome from "./pages/Moderator/Home";
import AddToilet from "./pages/Moderator/AddToilet";
import MyToilets from "./pages/Moderator/MyToilets";
import Complaints from "./pages/Moderator/Complaints";
import Reviews from "./pages/Moderator/Reviews";
import Penalties from "./pages/Moderator/Penalties";

// Admin Components
import NhaiAdminHome from "./pages/NhaiAdmin/Home";
import AllToilets from "./pages/NhaiAdmin/AllToilets.jsx";
import AllComplaints from "./pages/NhaiAdmin/AllComplaints";
import Moderators from "./pages/NhaiAdmin/Moderators";
import AdminPenalties from "./pages/NhaiAdmin/AdminPenalties";
import Analytics from "./pages/NhaiAdmin/Analytics";

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
            <ModeratorHome />
          </ProtectedRoutes>
        ),
      },
      // Moderator Routes
      {
        path: "home/add-toilet",
        element: (
          <ProtectedRoutes requiredRole="Moderator">
            <AddToilet />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/toilets",
        element: (
          <ProtectedRoutes requiredRole="Moderator">
            <MyToilets />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/complaints",
        element: (
          <ProtectedRoutes requiredRole="Moderator">
            <Complaints />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/reviews",
        element: (
          <ProtectedRoutes requiredRole="Moderator">
            <Reviews />
          </ProtectedRoutes>
        ),
      },
      {
        path: "home/penalties",
        element: (
          <ProtectedRoutes requiredRole="Moderator">
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
        path: "home/moderators",
        element: (
          <ProtectedRoutes requiredRole="Admin">
            <Moderators />
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
