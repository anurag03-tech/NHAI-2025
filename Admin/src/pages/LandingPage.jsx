import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Download,
  Smartphone,
  Monitor,
  Users,
  Shield,
  MapPin,
  Star,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Globe,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Wait for auth to be initialized
    if (!isInitialized) return;

    // If user is authenticated, redirect to home
    if (isAuthenticated && user) {
      console.log("User is authenticated, redirecting to home");
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, user, isInitialized, navigate]);

  const slides = [
    {
      id: 1,
      image: "/mobile-user.png",
      title: "NHAI Mobile App",
      subtitle: "Find & Rate Toilet Facilities",
      tag: "For Users ",
      type: "mobile",

      color: "from-green-500 to-emerald-600",
    },
    {
      id: 2,
      image: "/admin-dash.png",
      title: "NHAI Admin Dashboard",
      subtitle: "Comprehensive System Management",
      tag: "For NHAI Admin",
      type: "web",

      color: "from-blue-500 to-indigo-600",
    },
    {
      id: 3,
      image: "/mode-dash.png",
      title: "Moderator Portal",
      subtitle: "Facility Management & Updates",
      tag: "For Moderators",
      type: "web",

      color: "from-purple-500 to-pink-600",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    if (!isInitialized || (isAuthenticated && user)) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isInitialized, isAuthenticated, user]);

  const userFeatures = [
    {
      icon: MapPin,
      title: "Find Nearby Toilets",
      desc: "Locate facilities along your route with real-time GPS tracking",
    },
    {
      icon: Star,
      title: "Rate & Review",
      desc: "Share your experience and help improve facilities for everyone",
    },
    {
      icon: Globe,
      title: "Real-time Updates",
      desc: "Get current facility status, cleanliness, and availability",
    },
    {
      icon: Smartphone,
      title: "Offline Access",
      desc: "Download facility data for use without internet connection",
    },
  ];

  const adminFeatures = [
    {
      icon: Monitor,
      title: "Dashboard Control",
      desc: "Centralized management of all highway facilities",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      desc: "Comprehensive usage statistics and performance metrics",
    },
    {
      icon: Users,
      title: "User Management",
      desc: "Monitor user activity and manage system access",
    },
    {
      icon: MessageCircle,
      title: "Complaint Resolution",
      desc: "Efficient handling of user feedback and issues",
    },
  ];

  const moderatorFeatures = [
    {
      icon: Shield,
      title: "Facility Management",
      desc: "Add and update toilet information",
    },
    {
      icon: CheckCircle,
      title: "Status Updates",
      desc: "Maintain real-time facility status",
    },
    { icon: Star, title: "Review Monitoring", desc: "Oversee user feedback" },
    { icon: Zap, title: "Quick Actions", desc: "Fast facility updates" },
  ];

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Loading NHAI Portal...
          </p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Show landing page only for non-authenticated users
  return (
    <div className="p-2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Left Content - 2/5 width */}
            <div className="lg:col-span-2 space-y-6 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/National_Highways_Authority_of_India_logo.svg/1200px-National_Highways_Authority_of_India_logo.svg.png"
                    alt="NHAI Logo"
                    className="h-16 w-16 object-contain drop-shadow-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600 uppercase tracking-wide">
                      NHAI Toilets
                    </h2>
                    <p className="text-base text-gray-700 font-medium">
                      National Highway Authority of India
                    </p>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Highway Toilet
                  </span>
                  <br />
                  <span className="text-xl lg:text-2xl text-gray-700">
                    Management System
                  </span>
                </h1>

                <p className="text-base text-gray-600 leading-relaxed">
                  Complete solution for managing toilet facilities across
                  National Highways. Mobile app for travelers and comprehensive
                  web dashboard for administrators.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Download className="h-5 w-5" />
                  <span className="font-semibold text-lg">
                    Download Android APK for Users
                  </span>
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Monitor className="h-5 w-5" />
                  <span className="font-semibold text-lg">
                    Get Started - Admin Portal
                  </span>
                </button>
              </div>
            </div>

            {/* Right - Enhanced Slideshow - 3/5 width */}
            <div className="lg:col-span-3 relative">
              <div className="bg-white p-1 ">
                <div className="relative h-[400px] lg:h-[550px] rounded-xl overflow-hidden">
                  {/* Slideshow Images */}
                  <div className="relative h-full">
                    {slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-1000 transform ${
                          index === currentSlide
                            ? "opacity-100 translate-x-0 scale-100"
                            : index < currentSlide
                            ? "opacity-0 -translate-x-full scale-95"
                            : "opacity-0 translate-x-full scale-95"
                        }`}
                      >
                        {/* Background Gradient */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10 rounded-xl `}
                        />

                        {/* Content Container */}
                        <div className="flex flex-col h-full p-4">
                          {/* Tag */}
                          <div className="">
                            <span
                              className={`inline-block px-4 py-2 bg-gradient-to-r ${slide.color} text-white text-sm font-bold rounded-full shadow-lg`}
                            >
                              {slide.tag}
                            </span>
                          </div>

                          {/* Image */}
                          <div className="flex-1 flex items-center justify-center ">
                            <div className="relative">
                              <img
                                src={slide.image}
                                alt={slide.title}
                                className="max-h-96 w-auto object-contain mx-auto rounded-xl stransform hover:scale-105 transition-transform duration-500"
                              />
                              {/* Image glow effect */}
                              <div
                                className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-20 rounded-xl blur-xl -z-10`}
                              ></div>
                            </div>
                          </div>

                          {/* Text Content */}
                          <div className="text-center py-2 ">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {slide.title}
                            </h3>
                            <p className="text-lg text-gray-700 font-semibold">
                              {slide.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Slide Indicators - Only dots, no manual navigation */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {slides.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? "bg-white scale-125 shadow-lg ring-2 ring-white/50"
                            : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slide Counter */}
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white font-semibold text-xs">
                      {currentSlide + 1} / {slides.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Features */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                For Users
              </h2>
              <p className="text-lg text-gray-600">Mobile App Features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/30 group"
                >
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Features */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                For NHAI Administrators
              </h2>
              <p className="text-lg text-gray-600">Web Dashboard Features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/30 group"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Moderator Features */}
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                For Moderators
              </h2>
              <p className="text-lg text-gray-600">
                Management Dashboard Features
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {moderatorFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/30 group"
                >
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
