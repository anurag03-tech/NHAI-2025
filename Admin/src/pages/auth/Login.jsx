import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Key,
  Shield,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Operator") {
        navigate("/home");
      } else if (user.role === "Admin") {
        navigate("/home");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleQuickLogin = (email, password) => {
    setFormData({
      email: email,
      password: password,
    });
    setError("");
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-center gap-2 mb-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/National_Highways_Authority_of_India_logo.svg/1200px-National_Highways_Authority_of_India_logo.svg.png"
            alt="NHAI Logo"
            className="h-16 w-16 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NHAI Portal
            </h1>
            <p className="text-gray-600">
              National Highways Authority Dashboard
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Credentials Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Test Accounts
                </h3>
                <p className="text-sm text-gray-500">Demo credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Admin Credentials */}
              <div className="group bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Administrator
                    </h4>
                    <p className="text-sm text-blue-700 font-medium">
                      {import.meta.env.VITE_ADMIN_EMAIL}
                    </p>
                    <p className="text-xs text-gray-600">
                      Password: {import.meta.env.VITE_ADMIN_PASSWORD}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        import.meta.env.VITE_ADMIN_EMAIL,
                        import.meta.env.VITE_ADMIN_PASSWORD
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg group-hover:scale-105 transform duration-200 cursor-pointer"
                  >
                    <span className="text-sm font-medium">Quick Fill</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Operator Credentials */}
              <div className="group bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-600 rounded-xl shadow-md">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Operator</h4>
                    <p className="text-sm text-emerald-700 font-medium">
                      {import.meta.env.VITE_OPERATOR_EMAIL}
                    </p>
                    <p className="text-xs text-gray-600">
                      Password: {import.meta.env.VITE_OPERATOR_PASSWORD}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        import.meta.env.VITE_OPERATOR_EMAIL,
                        import.meta.env.VITE_OPERATOR_PASSWORD
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg group-hover:scale-105 transform duration-200 cursor-pointer"
                  >
                    <span className="text-sm font-medium">Quick Fill</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">💡 Demo Mode:</span> Click any
                "Quick Fill" button to instantly fill credentials for testing.
              </p>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to your NHAI dashboard</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white/50"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-3 py-3.5 px-6 border-2 border-transparent text-base font-semibold rounded-xl text-white transition-all transform ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-4 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                © 2025 National Highways Authority of India
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Secure Portal Access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
