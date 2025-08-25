import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Calendar,
  Eye,
  Filter,
  Loader2,
  ImageIcon,
  Navigation,
  Star,
  MessageCircle,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  UserCheck,
  Mail,
  Camera,
  Building,
  AlertTriangle,
  ChevronDown,
  Send,
} from "lucide-react";
import axios from "axios";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const AllToilets = () => {
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedToilet, setSelectedToilet] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filterRating, setFilterRating] = useState("all"); // "all", "4", "3", etc.

  // Penalty form states
  const [penaltyForms, setPenaltyForms] = useState({});
  const [sendingPenalty, setSendingPenalty] = useState(false);
  const [penaltySuccess, setPenaltySuccess] = useState({});

  useEffect(() => {
    fetchAllToilets();
  }, []);

  // Helper function to render toilet types (handles both array and string)
  const renderToiletTypes = (types) => {
    // Handle both array and string formats for backward compatibility
    const typeArray = Array.isArray(types) ? types : [types];

    return typeArray.map((type, index) => (
      <Badge
        key={`${type}-${index}`}
        variant={getTypeBadgeVariant(type)}
        className="font-medium"
      >
        <Users className="h-3 w-3 mr-1" />
        {type}
      </Badge>
    ));
  };

  // Helper function to get toilet types as string for search
  const getTypesAsString = (types) => {
    const typeArray = Array.isArray(types) ? types : [types];
    return typeArray.join(", ");
  };

  // Helper function to check if toilet has specific type
  const toiletHasType = (toilet, typeToCheck) => {
    const typeArray = Array.isArray(toilet.type) ? toilet.type : [toilet.type];
    return typeArray.includes(typeToCheck);
  };

  // Initialize penalty form for a toilet
  const initializePenaltyForm = (toiletId) => {
    setPenaltyForms((prev) => ({
      ...prev,
      [toiletId]: {
        reason: "",
        amount: "",
      },
    }));
    setPenaltySuccess((prev) => ({
      ...prev,
      [toiletId]: false,
    }));
  };

  // Update penalty form field
  const updatePenaltyForm = (toiletId, field, value) => {
    if (!penaltyForms[toiletId]) {
      initializePenaltyForm(toiletId);
    }

    setPenaltyForms((prev) => ({
      ...prev,
      [toiletId]: {
        ...prev[toiletId],
        [field]: value,
      },
    }));

    // Reset success state when user starts typing
    setPenaltySuccess((prev) => ({
      ...prev,
      [toiletId]: false,
    }));
  };

  // Send penalty
  const sendPenalty = async (toilet) => {
    const form = penaltyForms[toilet._id] || {};

    if (!form.reason?.trim()) {
      toast.error("Please provide a reason for the penalty");
      return;
    }

    if (!form.amount || form.amount <= 0) {
      toast.error("Please provide a valid penalty amount");
      return;
    }

    try {
      setSendingPenalty(true);

      const penaltyData = {
        operator: toilet.createdBy._id,
        reason: form.reason.trim(),
        amount: parseInt(form.amount),
      };

      console.log("Sending penalty:", penaltyData);

      const response = await axios.post(
        `${BACKEND_URL}/api/penalties`,
        penaltyData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Penalty response:", response.data);

      // Set success state
      setPenaltySuccess((prev) => ({
        ...prev,
        [toilet._id]: true,
      }));

      // Reset the form after a delay
      setTimeout(() => {
        setPenaltyForms((prev) => ({
          ...prev,
          [toilet._id]: {
            reason: "",
            amount: "",
          },
        }));
        setPenaltySuccess((prev) => ({
          ...prev,
          [toilet._id]: false,
        }));
      }, 3000);
    } catch (error) {
      console.error("Error sending penalty:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(`Failed to send penalty: ${errorMessage}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to send penalty. Please try again.");
      }
    } finally {
      setSendingPenalty(false);
    }
  };

  const fetchAllToilets = async () => {
    try {
      setLoading(true);
      console.log("Fetching all toilets...");

      const response = await axios.get(`${BACKEND_URL}/api/toilets`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setToilets(response.data);
        toast.success(
          `Found ${response.data.length} toilet${
            response.data.length !== 1 ? "s" : ""
          } from all operators`
        );
      } else {
        console.warn("Unexpected response format:", response.data);
        setToilets([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching toilets:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);

        if (error.response.status === 401) {
          toast.error("Session expired. Please login again.");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
        console.error("Network error:", error.request);
      } else {
        toast.error("Failed to fetch toilets. Please try again.");
      }
      setToilets([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Open":
        return "default";
      case "Closed":
        return "destructive";
      case "Under Maintenance":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Open":
        return <CheckCircle className="h-4 w-4" />;
      case "Closed":
        return <XCircle className="h-4 w-4" />;
      case "Under Maintenance":
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getIconBgColor = (status) => {
    switch (status) {
      case "Total":
        return "bg-blue-100";
      case "Open":
        return "bg-green-100";
      case "Closed":
        return "bg-red-100";
      case "Under Maintenance":
        return "bg-orange-100";
      case "Reviews":
        return "bg-purple-100";
      case "Operators":
        return "bg-indigo-100";
      default:
        return "bg-gray-100";
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "Gents":
        return "default";
      case "Ladies":
        return "default";
      case "Unisex":
        return "default";
      default:
        return "default";
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const handleViewDetails = (toilet) => {
    setSelectedToilet(toilet);
    setShowDetailsDialog(true);
  };

  // Filter toilets based on search, status, and type (updated for multiple types)
  const filteredToilets = toilets.filter((toilet) => {
    const typesString = getTypesAsString(toilet.type).toLowerCase();

    const matchesSearch =
      toilet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toilet.highway.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toilet.location.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      toilet.createdBy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toilet.createdBy?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      typesString.includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === "all" || toilet.status === filterStatus;

    // Updated type filter to handle multiple types
    const matchesTypeFilter =
      filterType === "all" || toiletHasType(toilet, filterType);

    // Calculate average rating and filter by exact rating (not range)
    const avgRating = Math.floor(calculateAverageRating(toilet.reviews));
    const matchesRatingFilter =
      filterRating === "all" || avgRating == parseInt(filterRating);

    return (
      matchesSearch &&
      matchesStatusFilter &&
      matchesTypeFilter &&
      matchesRatingFilter
    );
  });

  // Calculate statistics
  const getStats = () => {
    const total = toilets.length;
    const open = toilets.filter((t) => t.status === "Open").length;
    const closed = toilets.filter((t) => t.status === "Closed").length;
    const maintenance = toilets.filter(
      (t) => t.status === "Under Maintenance"
    ).length;
    const totalReviews = toilets.reduce(
      (sum, t) => sum + (t.reviews?.length || 0),
      0
    );

    // Get unique operators
    const uniqueOperators = new Set(
      toilets.map((t) => t.createdBy?._id).filter(Boolean)
    ).size;

    return {
      Total: total,
      Open: open,
      Closed: closed,
      "Under Maintenance": maintenance,
      Operators: uniqueOperators,
    };
  };

  const statusCounts = getStats();

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">All Toilets</h1>
            <p className="text-blue-500 text font-medium">
              View and manage all toilets from all operators
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading All Toilets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="space-y-1 px-1 mb-4">
          <h1 className="text-3xl font-bold text-blue-500">All Toilets</h1>
          <p className="text-blue-500 text font-medium">
            Complete overview of all toilet facilities across highways
          </p>
        </div>

        {/* Stats Cards - Enhanced colors */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-1">
          {Object.entries(statusCounts).map(([status, count], index) => (
            <div
              key={status}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-1 border-gray-300 group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${getIconBgColor(
                      status
                    )} group-hover:scale-110 transition-transform duration-200 shadow-sm`}
                  >
                    {status === "Total" && <Package className="h-4 w-4" />}
                    {status === "Reviews" && (
                      <MessageCircle className="h-4 w-4" />
                    )}
                    {status === "Operators" && (
                      <UserCheck className="h-4 w-4" />
                    )}
                    {["Open", "Closed", "Under Maintenance"].includes(status) &&
                      getStatusIcon(status)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800 group-hover:text-slate-600 transition-colors">
                      {count}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 py-2 mb-1">
          {/* Search Input */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
            <Input
              placeholder="Search by name, highway, address, operator, or toilet type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-10 border border-blue-500 bg-white rounded-2xl placeholder:text-gray-400 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-1 border-slate-400 focus:border-blue-400 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Under Maintenance">
                    Under Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 border-1 border-slate-400 focus:border-blue-400 rounded-xl">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Gents">Gents</SelectItem>
                  <SelectItem value="Ladies">Ladies</SelectItem>
                  <SelectItem value="Unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-32 border-1 border-slate-400 focus:border-blue-400 rounded-xl">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Result Count */}
            <Badge variant="outline" className="bg-white p-2">
              {filteredToilets.length} result
              {filteredToilets.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Toilets List - One Per Row */}
        {filteredToilets.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                  {toilets.length === 0
                    ? "No Toilets Found"
                    : "No Matching Results"}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {toilets.length === 0
                    ? "No toilet facilities have been added to the system yet."
                    : "Try adjusting your search terms or filter criteria to find what you're looking for."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredToilets.map((toilet) => (
              <Card
                key={toilet._id}
                className="bg-white/90 backdrop-blur-sm border-0 p-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group"
              >
                <CardContent className="p-2 m-1">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image Section */}
                    <div className="lg:w-72 lg:h-56 w-full h-56 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                      {toilet.images && toilet.images.length > 0 ? (
                        <img
                          src={`data:image/jpeg;base64,${toilet.images[0].data}`}
                          alt={toilet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                          <div className="text-center">
                            <Camera className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors mb-1">
                            {toilet.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <Navigation className="h-3 w-3 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">
                              {toilet.highway}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={getStatusBadgeVariant(toilet.status)}
                          className="flex items-center gap-1 font-medium self-start"
                        >
                          {getStatusIcon(toilet.status)}
                          {toilet.status}
                        </Badge>
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Location */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-slate-600 mb-1">
                              {toilet.location.latitude.toFixed(4)},{" "}
                              {toilet.location.longitude.toFixed(4)}
                            </p>
                            {toilet.location.address && (
                              <p className="text-xs text-slate-500 line-clamp-2">
                                {toilet.location.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Type and Features */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {/* Render multiple types */}
                            {renderToiletTypes(toilet.type)}
                            {toilet.accessible && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Accessible
                              </Badge>
                            )}
                          </div>
                          {toilet.images && toilet.images.length > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200"
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {toilet.images.length} photo
                              {toilet.images.length !== 1 ? "s" : ""}
                            </Badge>
                          )}

                          {toilet.reviews && toilet.reviews.length > 0 && (
                            <div className="flex items-center gap-4 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-yellow-700 text-sm">
                                  {calculateAverageRating(toilet.reviews)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-600">
                                <MessageCircle className="h-3 w-3" />
                                <span className="text-xs">
                                  {toilet.reviews.length} review
                                  {toilet.reviews.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>Added {formatDate(toilet.createdAt)}</span>
                          </div>
                        </div>

                        {/* Operator Details */}
                        <div className="space-y-2">
                          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1 bg-indigo-100 rounded">
                                <UserCheck className="h-3 w-3 text-indigo-600" />
                              </div>
                              <span className="text-xs font-medium text-indigo-700">
                                Added By
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                              >
                                <Building className="h-2 w-2 mr-1" />
                                {toilet.createdBy.role}
                              </Badge>
                            </div>
                            {toilet.createdBy ? (
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-700">
                                  {toilet.createdBy.name}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <p className="text-xs text-slate-600">
                                    {toilet.createdBy.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500">
                                Unknown operator
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(toilet)}
                          className="flex-1 h-10 bg-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openGoogleMaps(
                              toilet.location.latitude,
                              toilet.location.longitude
                            )
                          }
                          className="flex-1 h-10 bg-blue-500 text-white border-0 hover:bg-blue-600 shadow-md hover:shadow-lg transition-all hover:text-white"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Open in Google Maps
                        </Button>
                        {/* Send Penalty Dropdown */}
                        {toilet.createdBy && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-10 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Send Penalty
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-72 p-3 pt-0 bg-white border border-red-200 shadow-xl"
                              align="end"
                              side="top"
                            >
                              {penaltySuccess[toilet._id] ? (
                                // Success Message
                                <div className="text-center py-6">
                                  <div className="flex justify-center mb-3">
                                    <div className="p-3 bg-green-100 rounded-full">
                                      <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                  </div>
                                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    Penalty Sent Successfully!
                                  </h3>
                                  <p className="text-sm text-green-700">
                                    Penalty of ₹
                                    {penaltyForms[toilet._id]?.amount} has been
                                    sent to {toilet.createdBy.name}
                                  </p>
                                </div>
                              ) : (
                                // Penalty Form
                                <div>
                                  <DropdownMenuLabel className="flex items-center gap-2 text-red-800 ">
                                    <AlertTriangle className="h-4 w-4" />
                                    Send Penalty to {toilet.createdBy.name}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-red-200" />

                                  <div className="space-y-2 mt-2">
                                    <div>
                                      <label className="block text-xs font-medium text-red-700 mb-1">
                                        Reason for Penalty
                                      </label>
                                      <Textarea
                                        placeholder="Enter the reason for penalty..."
                                        value={
                                          penaltyForms[toilet._id]?.reason || ""
                                        }
                                        onChange={(e) =>
                                          updatePenaltyForm(
                                            toilet._id,
                                            "reason",
                                            e.target.value
                                          )
                                        }
                                        className="border-red-300 focus:border-red-500 focus:ring-red-200 text-xs"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex items-end gap-2">
                                      <div className="flex-1">
                                        <label className="block text-xs font-medium text-red-700 mb-1">
                                          Penalty Amount (₹)
                                        </label>
                                        <div className="relative">
                                          <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={
                                              penaltyForms[toilet._id]
                                                ?.amount || ""
                                            }
                                            onChange={(e) =>
                                              updatePenaltyForm(
                                                toilet._id,
                                                "amount",
                                                e.target.value
                                              )
                                            }
                                            className="pl-3 border-red-300 focus:border-red-500 focus:ring-red-200 text-xs h-8 w-full"
                                            min="1"
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        onClick={() => sendPenalty(toilet)}
                                        disabled={sendingPenalty}
                                        className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                                        size="sm"
                                      >
                                        {sendingPenalty ? (
                                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                          <Send className="h-3 w-3 mr-1" />
                                        )}
                                        Send Penalty
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Enhanced Details Dialog with Optimized Layout */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto bg-white/98 backdrop-blur-sm border-0 shadow-2xl p-4">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-slate-700 flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                {selectedToilet?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-600 flex items-center gap-2 text-sm">
                <Navigation className="h-3 w-3" />
                {selectedToilet?.highway}
              </DialogDescription>
            </DialogHeader>

            {selectedToilet && (
              <div className="space-y-4">
                {/* Status and Type - Compact */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={getStatusBadgeVariant(selectedToilet.status)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                  >
                    {getStatusIcon(selectedToilet.status)}
                    {selectedToilet.status}
                  </Badge>
                  {renderToiletTypes(selectedToilet.type)}
                  {selectedToilet.accessible && (
                    <Badge
                      variant="outline"
                      className="px-2.5 py-1 text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      Wheelchair Accessible
                    </Badge>
                  )}
                </div>

                {/* Main Content Grid - Optimized Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 ">
                  {/* Images Column - Reduced from full column */}
                  <div className="lg:col-span-4">
                    <Card className="bg-purple-50/70 border-purple-200 h-full p-0">
                      <CardHeader className="pb-2 px-3 pt-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-purple-600" />
                          Images ({selectedToilet.images?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        {selectedToilet.images &&
                        selectedToilet.images.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedToilet.images.map((image, index) => (
                              <div
                                key={index}
                                className="aspect-video rounded-lg overflow-hidden bg-white border border-purple-200 hover:border-purple-400 transition-colors group"
                              >
                                <img
                                  src={`data:image/jpeg;base64,${image.data}`}
                                  alt={`${selectedToilet.name} - Image ${
                                    index + 1
                                  }`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-32 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                            <div className="text-center">
                              <Camera className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                              <p className="text-xs text-purple-600">
                                No images available
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Map Column - Expanded */}
                  <div className="lg:col-span-5">
                    <Card className="bg-slate-50/70 border-slate-200 h-full p-0">
                      <CardHeader className="pb-2 px-3 pt-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Location Map
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        <div className="h-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                          <MapContainer
                            center={[
                              selectedToilet.location.latitude,
                              selectedToilet.location.longitude,
                            ]}
                            zoom={15}
                            scrollWheelZoom={true}
                            className="h-full w-full"
                          >
                            <TileLayer
                              attribution="Google Maps"
                              url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                            />
                            <Marker
                              position={[
                                selectedToilet.location.latitude,
                                selectedToilet.location.longitude,
                              ]}
                            >
                              <Popup>
                                <div className="p-2">
                                  <h3 className="font-semibold text-sm">
                                    {selectedToilet.name}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    {selectedToilet.highway}
                                  </p>
                                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                    <p>
                                      {selectedToilet.location.latitude.toFixed(
                                        6
                                      )}
                                      ,{" "}
                                      {selectedToilet.location.longitude.toFixed(
                                        6
                                      )}
                                    </p>
                                    <p>
                                      Types:{" "}
                                      {getTypesAsString(selectedToilet.type)}
                                    </p>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Details Column - Compact */}
                  <div className="lg:col-span-3 space-y-2 p-0">
                    {/* Location Details - Compact */}
                    <Card className="bg-slate-50/70 border-slate-200 p-2">
                      <CardHeader className="px-3 py-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-green-600" />
                          Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-1 bg-white rounded text-center">
                            <span className="text text-slate-500 block">
                              Latitude
                            </span>
                            <p className="font-mono text font-medium text-slate-700 truncate">
                              {selectedToilet.location.latitude.toFixed(4)}
                            </p>
                          </div>
                          <div className="p-1 bg-white rounded text-center">
                            <span className="text text-slate-500 block">
                              Longitude
                            </span>
                            <p className="font-mono text font-medium text-slate-700 truncate">
                              {selectedToilet.location.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>

                        {selectedToilet.location.address && (
                          <div className="p-2 bg-white rounded">
                            <span className="text text-slate-500 block">
                              Address
                            </span>
                            <p className="text text-slate-700 mt-0.5 line-clamp-2">
                              {selectedToilet.location.address}
                            </p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          onClick={() =>
                            openGoogleMaps(
                              selectedToilet.location.latitude,
                              selectedToilet.location.longitude
                            )
                          }
                          className="w-full bg-green-50 hover:bg-green-100 border-green-300 text-green-700 h-8 text-xs"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigation
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Operator Details - Compact */}
                    <Card className="bg-indigo-50/70 border-indigo-200 p-2">
                      <CardHeader className=" py-0">
                        <CardTitle className="text-base flex items-center ">
                          <UserCheck className="h-4 w-4 text-indigo-600 " />
                          Added By
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 pb-1">
                        {selectedToilet.createdBy ? (
                          <div className="space-y-1">
                            <div className="p-2 bg-white rounded">
                              <span className="text-xs text-slate-500 block">
                                Name
                              </span>
                              <p className="text-xs font-semibold text-slate-700">
                                {selectedToilet.createdBy.name}
                              </p>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <span className="text-xs text-slate-500 block">
                                Email
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                <p className="text-xs text-slate-700 truncate">
                                  {selectedToilet.createdBy.email}
                                </p>
                              </div>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <span className="text-xs text-slate-500 block mb-1">
                                Role
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs"
                              >
                                <Building className="h-2 w-2 mr-1" />
                                {selectedToilet.createdBy.role}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-white rounded text-center">
                            <p className="text-xs text-slate-500">
                              Info not available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Enhanced Reviews Section - Row Layout */}
                {selectedToilet.reviews &&
                  selectedToilet.reviews.length > 0 && (
                    <Card className="bg-yellow-50/70 border-yellow-200 p-2">
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-600" />
                            Reviews ({selectedToilet.reviews.length})
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-yellow-700 text-sm">
                              {calculateAverageRating(selectedToilet.reviews)}{" "}
                              avg
                            </span>
                          </div>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-4 pb-4">
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {selectedToilet.reviews.map((review, index) => (
                            <div
                              key={review._id}
                              className="bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              {/* Row Layout: Photo Left, Content Right */}
                              <div className="flex gap-4">
                                {/* Left Side - Photo or Blank */}
                                <div className="flex-shrink-0 w-32 h-32">
                                  {review.photos && review.photos.length > 0 ? (
                                    <div className="relative w-full h-full">
                                      <img
                                        src={`data:image/jpeg;base64,${review.photos[0]}`}
                                        alt={`Review by ${review.username}`}
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          e.target.nextElementSibling.style.display =
                                            "flex";
                                        }}
                                      />
                                      {/* Fallback for broken image */}
                                      <div className="hidden w-full h-full bg-gray-100 rounded-lg border-2 border-gray-200 items-center justify-center">
                                        <Camera className="h-6 w-6 text-gray-400" />
                                      </div>
                                      {/* Multiple photos indicator */}
                                      {review.photos.length > 1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                          +{review.photos.length - 1}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    /* Blank placeholder when no photo */
                                    <div className="w-full h-full bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                      <div className="text-center">
                                        <Camera className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                        <span className="text-xs text-gray-400">
                                          No photo
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Side - Content */}
                                <div className="flex-1 min-w-0">
                                  {/* User and Rating Row */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-gray-800 truncate">
                                        {review.username}
                                      </h4>
                                      <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-3 w-3 ${
                                              i < review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>

                                  {/* Comment */}
                                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                                    {review.comment}
                                  </p>

                                  {/* Additional Photos Count (if more than 1) */}
                                  {review.photos &&
                                    review.photos.length > 1 && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                          <ImageIcon className="h-3 w-3" />
                                          {review.photos.length} photos
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Metadata - Single Row */}
                <Card className="bg-slate-50/70 border-slate-300 p-0">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-600" />
                      Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 bg-white rounded text-center">
                        <span className="text-slate-500 text block">
                          Created
                        </span>
                        <p className="font-medium text-slate-700 ">
                          {formatDate(selectedToilet.createdAt)}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded text-center">
                        <span className="text-slate-500 text block">
                          Updated
                        </span>
                        <p className="font-medium text-slate-700 text">
                          {formatDate(selectedToilet.updatedAt)}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded text-center">
                        <span className="text-slate-500 text block">ID</span>
                        <p className="font-mono text text-slate-600 truncate">
                          {selectedToilet._id.slice()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AllToilets;
