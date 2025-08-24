import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Download,
  MessageSquareWarning,
  Monitor,
  MessageSquare,
  Shield,
  Smartphone,
  Users,
  MapPin,
  Star,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Globe,
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
      title: "NHAI Toilets Mobile App",
      subtitle: "Find & Rate Toilet Facilities",
      tag: "For Users ",
      type: "mobile",

      color: "from-green-500 to-emerald-600",
    },
    {
      id: 2,
      image: "/admin-dash.png",
      title: "NHAI Toilets Admin Dashboard",
      subtitle: "Comprehensive System Management",
      tag: "For NHAI Admin",
      type: "web",

      color: "from-blue-500 to-indigo-600",
    },
    {
      id: 3,
      image: "/mode-dash.png",
      title: "NHAI Toilets Moderator Dashboard",
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
      icon: Globe,
      title: "Real-time Updates",
      desc: "Get current facility status, cleanliness, and availability",
    },
    {
      icon: Star,
      title: "Rate & Review",
      desc: "Share your experience and help improve facilities for everyone",
    },

    {
      icon: MessageSquareWarning,
      title: "Submit Complaints",
      desc: "Report facility issues, cleanliness problems, and maintenance concerns",
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
      desc: "Comprehensive Moderator statistics and performance metrics",
    },
    {
      icon: MessageCircle,
      title: "Complaint Resolution",
      desc: "Efficient handling of user feedback and issues",
    },
    {
      icon: Shield,
      title: "Send Penalties",
      desc: "Issue penalties for Moderator violations and non-compliance",
    },
  ];

  const moderatorFeatures = [
    {
      icon: Shield,
      title: "Facility Management",
      desc: "Add and update toilet information and details",
    },
    {
      icon: MessageSquare,
      title: "Resolve User Complaints",
      desc: "Handle and respond to facility-related issues",
    },
    {
      icon: CheckCircle,
      title: "Status Updates",
      desc: "Maintain real-time facility availability status",
    },
    {
      icon: Star,
      title: "Review Monitoring",
      desc: "Oversee and manage user feedback and ratings",
    },
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
                      NHAI
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

                <p className="text-lg  text-gray-700 leading-relaxed">
                  Complete solution for managing toilet facilities across
                  National Highways. Mobile app for travelers and comprehensive
                  web dashboard for moderators and NHAI admins.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <a
                  href="https://drive.google.com/file/d/1gwN6LDuOGszCzBJ49tpcCIHqDoa_PC9O/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="h-5 w-5" />
                  <span className="font-semibold text-lg">
                    Download Android APK for Users
                  </span>
                </a>

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
      <div className="py-4">
        <div className="w-full px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive solutions for all user types
            </p>
          </div>

          {/* Three Column Layout */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Users Column */}
            <div className="flex-1 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    For Users
                  </h3>
                  <p className="text-green-600 font-medium">
                    Mobile App Features
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {userFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-white/50 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600  leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderators Column */}
            <div className="flex-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    For Moderators
                  </h3>
                  <p className="text-purple-600 font-medium">Webapp Features</p>
                </div>
              </div>

              <div className="space-y-2">
                {moderatorFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-white/50 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900  mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admins Column */}
            <div className="flex-1 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    For NHAI Admins
                  </h3>
                  <p className="text-blue-600 font-medium">Webapp Features</p>
                </div>
              </div>

              <div className="space-y-2">
                {adminFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-white/50 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900  mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
