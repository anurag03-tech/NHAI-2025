import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🔑 Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {});
        console.log("Auth check response:", res.data);
        setUser(res.data);
      } catch (err) {
        console.log("No existing session");
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log("Login response:", res.data);
      setUser(res.data); // response contains user info
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      setIsLoading(false);
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    }
  };

  // 🔑 Logout function
  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {});
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout API fails, clear user state
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
