import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Star,
  MessageCircle,
  AlertTriangle,
  FileText,
  Target,
  Loader2,
  Award,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last30days");
  const [moderators, setModerators] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    moderatorPerformance: [],
    monthlyTrends: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [toiletsRes, moderatorsRes, complaintsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/toilets`).catch(() => ({ data: [] })),
        axios
          .get(`${BACKEND_URL}/api/auth/moderators`)
          .catch(() => ({ data: { moderators: [] } })),
        axios.get(`${BACKEND_URL}/api/complaints`).catch(() => ({ data: [] })),
      ]);

      const toilets = Array.isArray(toiletsRes.data) ? toiletsRes.data : [];
      const moderatorsData = moderatorsRes.data.moderators || [];
      const complaints = Array.isArray(complaintsRes.data)
        ? complaintsRes.data
        : [];

      setModerators(moderatorsData);

      const analytics = processAnalyticsData(
        toilets,
        moderatorsData,
        complaints
      );
      setAnalyticsData(analytics);

      toast.success("Analytics data loaded successfully");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (toilets, moderators, complaints) => {
    // Calculate moderator performance metrics
    const moderatorPerformance = moderators.map((moderator) => {
      const moderatorToilets = toilets.filter(
        (t) => t.createdBy?._id === moderator._id
      );

      const moderatorToiletIds = new Set(moderatorToilets.map((t) => t._id));

      const moderatorComplaints = complaints.filter((complaint) => {
        if (!complaint.toilet || complaint.toilet === null) {
          return false;
        }
        const toiletId = complaint.toilet._id;
        return toiletId && moderatorToiletIds.has(toiletId);
      });

      const allReviews = moderatorToilets.flatMap((t) => t.reviews || []);

      return {
        name: moderator.name,
        email: moderator.email,
        id: moderator._id,
        toiletsManaged: moderatorToilets.length,
        averageRating:
          allReviews.length > 0
            ? (
                allReviews.reduce((sum, r) => sum + r.rating, 0) /
                allReviews.length
              ).toFixed(1)
            : 0,
        totalReviews: allReviews.length,
        complaintsReceived: moderatorComplaints.length,
        operationalToilets: moderatorToilets.filter((t) => t.status === "Open")
          .length,
        performanceScore: calculatePerformanceScore(
          moderatorToilets,
          allReviews,
          moderatorComplaints
        ),
      };
    });

    // Process monthly trends combining reviews and complaints
    const monthlyTrends = processMonthlyTrends(toilets, complaints);

    return {
      moderatorPerformance,
      monthlyTrends,
    };
  };

  const processMonthlyTrends = (toilets, complaints) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = {};

    // Initialize all months with 0
    months.forEach((month) => {
      monthlyData[month] = {
        month,
        reviews: 0,
        complaints: 0,
      };
    });

    // Process reviews from toilets
    toilets.forEach((toilet) => {
      if (toilet.reviews && toilet.reviews.length > 0) {
        toilet.reviews.forEach((review) => {
          const date = new Date(review.createdAt);
          const month = months[date.getMonth()];
          monthlyData[month].reviews += 1;
        });
      }
    });

    // Process complaints (only those with toilet associations)
    complaints.forEach((complaint) => {
      if (
        complaint.createdAt &&
        complaint.toilet &&
        complaint.toilet !== null
      ) {
        const date = new Date(complaint.createdAt);
        const month = months[date.getMonth()];
        monthlyData[month].complaints += 1;
      }
    });

    return Object.values(monthlyData);
  };

  const calculatePerformanceScore = (toilets, reviews, complaints) => {
    let score = 100;
    score -= complaints.length * 5;
    const maintenanceRatio =
      toilets.length > 0
        ? toilets.filter((t) => t.status === "Under Maintenance").length /
          toilets.length
        : 0;
    score -= maintenanceRatio * 30;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 3;
    score += (avgRating - 3) * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getPerformanceIcon = (score) => {
    if (score >= 80) return <Award className="h-4 w-4" />;
    if (score >= 60) return <Target className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-2">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const totalReviews = analyticsData.monthlyTrends.reduce(
    (sum, item) => sum + item.reviews,
    0
  );
  const totalComplaints = analyticsData.monthlyTrends.reduce(
    (sum, item) => sum + item.complaints,
    0
  );

  return (
    <div className="min-h-screen p-2 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Moderator Performance Analytics
            </h1>
            <p className="text-gray-600">
              Track reviews and complaints received by moderators
            </p>
          </div>
        </div>
        {/* Key Metrics Cards - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Active Moderators */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Moderators
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {moderators.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-yellow-100 shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Reviews
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {totalReviews}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Complaints */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-red-100 shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <MessageCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Complaints
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {totalComplaints}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Charts Row - Reviews & Complaints + Moderator Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
          {/* Combined Reviews and Complaints Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Reviews and Complaints Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.monthlyTrends.some(
                (item) => item.reviews > 0 || item.complaints > 0
              ) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="complaints"
                      fill="#ef4444"
                      name="Complaints"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="reviews"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                      name="Reviews"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg">No data available</p>
                    <p className="text-sm">
                      Reviews and complaints will appear here over time
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moderator Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Moderator Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.moderatorPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.moderatorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalReviews" fill="#10b981" name="Reviews" />
                    <Bar
                      dataKey="complaintsReceived"
                      fill="#ef4444"
                      name="Complaints"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No moderator performance data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Moderator Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-purple-600" />
              Detailed Moderator Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.moderatorPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Moderator</th>
                      <th className="text-left p-3">Facilities</th>
                      <th className="text-left p-3">Avg Rating</th>
                      <th className="text-left p-3">Reviews</th>
                      <th className="text-left p-3">Complaints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.moderatorPerformance
                      .sort((a, b) => b.performanceScore - a.performanceScore)
                      .map((moderator) => (
                        <tr
                          key={moderator.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {moderator.name}
                              </p>
                              <p className="text-gray-600 text-xs">
                                {moderator.email}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {moderator.toiletsManaged}
                              </span>
                              <span className="text-green-600 text">
                                ({moderator.operationalToilets} open)
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{moderator.averageRating}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-green-600 font-medium">
                              {moderator.totalReviews}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-red-600 font-medium">
                              {moderator.complaintsReceived}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No moderator performance data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
