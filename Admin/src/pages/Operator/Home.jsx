import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // ✅ Add this import
import {
  MapPin,
  MessageSquare,
  Star,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  // DollarSign, // ✅ Removed this icon
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const OperatorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ Add navigation hook
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState({
    toilets: [],
    complaints: [],
    reviews: [],
    penalties: [],
  });
  const [stats, setStats] = useState({
    toilets: {
      total: 0,
      open: 0,
      closed: 0,
      maintenance: 0,
      byType: { Gents: 0, Ladies: 0, Unisex: 0 },
    },
    complaints: {
      total: 0,
      resolved: 0,
      pending: 0,
      recent: [],
    },
    reviews: {
      total: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recent: [],
    },
    penalties: {
      total: 0,
      totalAmount: 0,
      paid: 0,
      unpaid: 0,
      recent: [],
    },
  });

  // Helper function to count toilet types (handles both array and string)
  const countToiletTypes = (toilets) => {
    const typeCounts = { Gents: 0, Ladies: 0, Unisex: 0 };

    toilets.forEach((toilet) => {
      // Handle both array and string formats
      const types = Array.isArray(toilet.type) ? toilet.type : [toilet.type];

      types.forEach((type) => {
        if (typeCounts.hasOwnProperty(type)) {
          typeCounts[type]++;
        }
      });
    });

    return typeCounts;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const config = {
          withCredentials: true,
        };

        const [toiletsRes, complaintsRes, reviewsRes, penaltiesRes] =
          await Promise.all([
            axios.get(`${BACKEND_URL}/api/toilets/my`, config),
            axios.get(`${BACKEND_URL}/api/complaints/my`, config),
            axios.get(`${BACKEND_URL}/api/reviews/my`, config),
            axios.get(`${BACKEND_URL}/api/penalties/my`, config),
          ]);

        // Store raw data
        setRawData({
          toilets: toiletsRes.data,
          complaints: complaintsRes.data,
          reviews: reviewsRes.data,
          penalties: penaltiesRes.data,
        });

        // Process toilets data with updated type counting
        const toiletStats = {
          total: toiletsRes.data.length,
          open: toiletsRes.data.filter((t) => t.status === "Open").length,
          closed: toiletsRes.data.filter((t) => t.status === "Closed").length,
          maintenance: toiletsRes.data.filter(
            (t) => t.status === "Under Maintenance"
          ).length,
          byType: countToiletTypes(toiletsRes.data), // Updated to use new counting function
        };

        // Process complaints data
        const complaintStats = {
          total: complaintsRes.data.length,
          resolved: complaintsRes.data.filter((c) => c.status === "Resolved")
            .length,
          pending: complaintsRes.data.filter(
            (c) => c.status === "Pending" || !c.status
          ).length,
          recent: complaintsRes.data.slice(0, 3),
        };

        // Process reviews data
        const reviewsData = reviewsRes.data;
        const totalRating = reviewsData.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating =
          reviewsData.length > 0
            ? (totalRating / reviewsData.length).toFixed(1)
            : 0;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach((review) => {
          ratingDistribution[review.rating]++;
        });

        const reviewStats = {
          total: reviewsData.length,
          averageRating: parseFloat(averageRating),
          ratingDistribution,
          recent: reviewsData.slice(0, 3),
        };

        // Process penalties data
        const penaltiesData = penaltiesRes.data;
        const totalAmount = penaltiesData.reduce(
          (sum, penalty) => sum + penalty.amount,
          0
        );

        const penaltyStats = {
          total: penaltiesData.length,
          totalAmount,
          paid: penaltiesData.filter((p) => p.status === "Paid").length,
          unpaid: penaltiesData.filter(
            (p) => p.status === "Unpaid" || !p.status
          ).length,
          recent: penaltiesData.slice(0, 3),
        };

        setStats({
          toilets: toiletStats,
          complaints: complaintStats,
          reviews: reviewStats,
          penalties: penaltyStats,
        });
      } catch (err) {
        console.error("Error fetching operator stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "Operator") fetchStats();
  }, [user]);

  // ✅ Updated formatCurrency to show ₹ instead of $ and remove currency symbol option
  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ Add navigation handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "toilets":
        navigate("toilets");
        break;
      case "complaints":
        navigate("complaints");
        break;
      case "reviews":
        navigate("reviews");
        break;
      case "penalties":
        navigate("penalties");
        break;
      default:
        console.log("Navigation not implemented for:", action);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2">
      <div className="p-1 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Welcome back, {user?.name} - Here's what's happening with your
            toilets
          </p>
        </div>

        {/* Primary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <EnhancedStatCard
            icon={<MapPin className="h-4 w-4" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            label="Total Toilets"
            value={stats.toilets.total}
            subtext={`${stats.toilets.open} Open, ${stats.toilets.closed} Closed`}
          />
          <EnhancedStatCard
            icon={<MessageSquare className="h-4 w-4" />}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            label="Complaints"
            value={stats.complaints.total}
            subtext={`${stats.complaints.pending} Pending`}
          />
          <EnhancedStatCard
            icon={<Star className="h-4 w-4" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            label="Reviews"
            value={stats.reviews.total}
            subtext={`${stats.reviews.averageRating}★ Average`}
          />
          <EnhancedStatCard
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            label="Penalties"
            value={stats.penalties.total}
            subtext={formatAmount(stats.penalties.totalAmount)} // ✅ Updated to use new function
          />
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Toilet Status Breakdown */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Toilet Status Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Open
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.toilets.open}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Closed
                  </span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {stats.toilets.closed}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Maintenance
                  </span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {stats.toilets.maintenance}
                </span>
              </div>
            </div>
          </div>

          {/* Toilet Types - Updated to show proper counts */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Toilet Types Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.toilets.byType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-purple-800">
                      {type}
                    </span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {/* Show percentage */}
                      {stats.toilets.total > 0
                        ? Math.round((count / stats.toilets.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {count}
                  </span>
                </div>
              ))}

              {/* Add info text about multiple types */}
              <div className="mt-3 p-2 bg-purple-25 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700">
                  💡 Toilets with multiple types (e.g., both Gents & Ladies) are
                  counted in each category
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Penalties Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />{" "}
              {/* ✅ Changed from DollarSign to AlertTriangle */}
              Penalties Overview
            </h3>
            <div className="space-y-3">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {formatAmount(stats.penalties.totalAmount)}{" "}
                  {/* ✅ Updated format */}
                </p>
                <p className="text-xs text-red-700">Total Amount</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-lg font-semibold text-gray-700">
                    {stats.penalties.paid}
                  </p>
                  <p className="text-xs text-gray-600">Paid</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-lg font-semibold text-gray-700">
                    {stats.penalties.unpaid}
                  </p>
                  <p className="text-xs text-gray-600">Unpaid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Reviews Summary
            </h3>
            <div className="space-y-3">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.reviews.averageRating}
                </p>
                <p className="text-xs text-yellow-700">Average Rating</p>
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs w-4">{rating}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.reviews.total > 0
                              ? (stats.reviews.ratingDistribution[rating] /
                                  stats.reviews.total) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs w-6">
                      {stats.reviews.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              {/* ✅ Add onClick handlers for navigation */}
              <button
                onClick={() => handleQuickAction("toilets")}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors cursor-pointer"
              >
                View All Toilets
              </button>
              <button
                onClick={() => handleQuickAction("complaints")}
                className="w-full p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 font-medium transition-colors cursor-pointer"
              >
                Handle Complaints
              </button>
              <button
                onClick={() => handleQuickAction("reviews")}
                className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors cursor-pointer"
              >
                Review Management
              </button>
              <button
                onClick={() => handleQuickAction("penalties")}
                className="w-full p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium transition-colors cursor-pointer"
              >
                Penalty Management
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.complaints.recent.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Recent Complaints
            </h3>
            <div className="space-y-3">
              {stats.complaints.recent.map((complaint, index) => (
                <div
                  key={complaint._id || index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {complaint.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        {complaint.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {complaint.toilet?.name} - {complaint.mobile}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced stat card component
const EnhancedStatCard = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtext,
}) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-300 group  shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-200 shadow-sm`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800 group-hover:text-slate-600 transition-colors">
            {value}
          </p>
          <p className="text-xs text-slate-600 font-medium">{label}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  </div>
);

export default OperatorHome;
