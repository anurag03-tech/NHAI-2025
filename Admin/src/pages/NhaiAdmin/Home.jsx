import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  Search,
  Navigation,
  Star,
  Building,
  Calendar,
  Loader2,
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

// Enhanced custom marker icons for different statuses
const createCustomIcon = (status, isSelected = false) => {
  let color = "#3b82f6"; // Default blue
  let size = isSelected ? 35 : 25;
  let borderWidth = isSelected ? 4 : 3;

  switch (status) {
    case "Open":
      color = "#10b981"; // Green
      break;
    case "Closed":
      color = "#ef4444"; // Red
      break;
    case "Under Maintenance":
      color = "#f59e0b"; // Orange
      break;
  }

  const iconHtml = isSelected
    ? `
    <div style="position: relative;">
      <div style="
        background-color: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: ${borderWidth}px solid white; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        position: relative;
        animation: pulse 2s infinite;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${color}80; }
          70% { box-shadow: 0 0 0 10px ${color}00; }
          100% { box-shadow: 0 0 0 0 ${color}00; }
        }
      </style>
    </div>
  `
    : `
    <div style="
      background-color: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: ${borderWidth}px solid white; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    iconSize: [size, size],
    className: "custom-marker",
  });
};

// Configure axios defaults for cookies
axios.defaults.withCredentials = true;

const NhaiAdminHome = () => {
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedToilet, setSelectedToilet] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchAllToilets();
  }, []);

  // Auto-center map when toilet is selected
  useEffect(() => {
    if (selectedToilet && mapRef.current) {
      const map = mapRef.current;
      map.flyTo(
        [selectedToilet.location.latitude, selectedToilet.location.longitude],
        15,
        {
          duration: 1.5,
        }
      );
    }
  }, [selectedToilet]);

  // Helper function to render toilet types (handles both array and string)
  const renderToiletTypes = (types, showIcon = true) => {
    // Handle both array and string formats for backward compatibility
    const typeArray = Array.isArray(types) ? types : [types];

    if (typeArray.length === 1) {
      return (
        <div className="flex items-center gap-1">
          {showIcon && <Users className="h-3 w-3" />}
          <span>{typeArray[0]}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {showIcon && <Users className="h-3 w-3" />}
        <span>{typeArray.join(", ")}</span>
      </div>
    );
  };

  // Helper function to get toilet types as string for search
  const getTypesAsString = (types) => {
    const typeArray = Array.isArray(types) ? types : [types];
    return typeArray.join(", ");
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
          `Loaded ${response.data.length} toilet facilities on map`
        );
      } else {
        console.warn("Unexpected response format:", response.data);
        setToilets([]);
        toast.error("Failed to load toilet data");
      }
    } catch (error) {
      console.error("Error fetching toilets:", error);
      toast.error("Failed to load toilet facilities");
      setToilets([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fit map bounds to markers
  const fitMapToMarkers = (markers) => {
    if (!mapRef.current) return;

    if (markers.length === 0) {
      // No markers, return to default view
      mapRef.current.setView([20.5937, 78.9629], 5);
      return;
    }

    if (markers.length === 1) {
      // Single marker, zoom to it
      const marker = markers[0];
      mapRef.current.flyTo(
        [marker.location.latitude, marker.location.longitude],
        10,
        {
          duration: 1.5,
        }
      );
      return;
    }

    // Multiple markers, fit bounds
    const latLngs = markers.map((toilet) => [
      toilet.location.latitude,
      toilet.location.longitude,
    ]);

    const bounds = L.latLngBounds(latLngs);
    mapRef.current.fitBounds(bounds, {
      padding: [50, 50],
      duration: 1.5,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "text-green-600 bg-green-100";
      case "Closed":
        return "text-red-600 bg-red-100";
      case "Under Maintenance":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
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
        return <Settings className="h-4 w-4" />;
    }
  };

  // Enhanced filter toilets - includes moderator name, email, and toilet types search
  const filteredToilets = toilets.filter((toilet) => {
    const searchLower = searchTerm.toLowerCase();
    const typesString = getTypesAsString(toilet.type).toLowerCase();

    const matchesSearch =
      toilet.name.toLowerCase().includes(searchLower) ||
      toilet.highway.toLowerCase().includes(searchLower) ||
      toilet.location.address?.toLowerCase().includes(searchLower) ||
      // Search by moderator name and email
      toilet.createdBy?.name?.toLowerCase().includes(searchLower) ||
      toilet.createdBy?.email?.toLowerCase().includes(searchLower) ||
      // Search by toilet types
      typesString.includes(searchLower);

    const matchesFilter =
      filterStatus === "all" || toilet.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: toilets.length,
    open: toilets.filter((t) => t.status === "Open").length,
    closed: toilets.filter((t) => t.status === "Closed").length,
    maintenance: toilets.filter((t) => t.status === "Under Maintenance").length,
    totalReviews: toilets.reduce((sum, t) => sum + (t.reviews?.length || 0), 0),
  };

  // Determine which toilets to show on map
  const mapToilets = selectedToilet ? [selectedToilet] : filteredToilets;

  // Default map center (India center)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Enhanced badge filter click with map zoom
  const handleBadgeFilter = (status) => {
    if (filterStatus === status) {
      // Toggle off - show all and reset map view
      setFilterStatus("all");
      setSelectedToilet(null);
      setTimeout(() => {
        fitMapToMarkers(toilets);
      }, 100);
    } else {
      // Set new filter - clear selection and fit map to filtered markers
      setFilterStatus(status);
      setSelectedToilet(null);
      setTimeout(() => {
        const filtered = toilets.filter(
          (t) => status === "all" || t.status === status
        );
        fitMapToMarkers(filtered);
      }, 100);
    }
  };

  // Handle toilet selection
  const handleToiletSelect = (toilet) => {
    setSelectedToilet(toilet);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading NHAI Toilet Network Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Fixed height, fits viewport */}
      <div className="w-96 bg-white shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            NHAI Toilet Network
          </h1>
          <p className="text-sm text-gray-600">
            Interactive facility map dashboard
          </p>
        </div>

        {/* Clickable Stats Cards */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                filterStatus === "all"
                  ? "bg-blue-100 ring-2 ring-blue-500"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
              onClick={() => handleBadgeFilter("all")}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-blue-900">
                    {stats.total}
                  </p>
                  <p className="text-xs text-blue-600">Total Facilities</p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                filterStatus === "Open"
                  ? "bg-green-100 ring-2 ring-green-500"
                  : "bg-green-50 hover:bg-green-100"
              }`}
              onClick={() => handleBadgeFilter("Open")}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-lg font-bold text-green-900">
                    {stats.open}
                  </p>
                  <p className="text-xs text-green-600">Open</p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                filterStatus === "Closed"
                  ? "bg-red-100 ring-2 ring-red-500"
                  : "bg-red-50 hover:bg-red-100"
              }`}
              onClick={() => handleBadgeFilter("Closed")}
            >
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-lg font-bold text-red-900">
                    {stats.closed}
                  </p>
                  <p className="text-xs text-red-600">Closed</p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                filterStatus === "Under Maintenance"
                  ? "bg-orange-100 ring-2 ring-orange-500"
                  : "bg-orange-50 hover:bg-orange-100"
              }`}
              onClick={() => handleBadgeFilter("Under Maintenance")}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-lg font-bold text-orange-900">
                    {stats.maintenance}
                  </p>
                  <p className="text-xs text-orange-600">Maintenance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search facilities, types, moderators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          <div className="text-xs text-gray-500 flex items-center justify-between mt-3">
            <span>
              Showing {filteredToilets.length} facilities
              {filterStatus !== "all" && (
                <Badge className="ml-2 text-xs" variant="outline">
                  {filterStatus}
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Closed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Toilet List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredToilets.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {filterStatus === "all"
                    ? "No facilities match your search"
                    : `No ${filterStatus.toLowerCase()} facilities found`}
                </p>
                {filterStatus !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleBadgeFilter("all")}
                  >
                    Show All Facilities
                  </Button>
                )}
              </div>
            ) : (
              filteredToilets.map((toilet) => (
                <Card
                  key={toilet._id}
                  className={`cursor-pointer transition-all hover:shadow-md p-0 ${
                    selectedToilet?._id === toilet._id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => handleToiletSelect(toilet)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900 truncate flex-1">
                        {toilet.name}
                      </h3>
                      <Badge
                        className={`text-xs ml-2 ${getStatusColor(
                          toilet.status
                        )}`}
                      >
                        {getStatusIcon(toilet.status)}
                        <span className="ml-1">{toilet.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>{toilet.highway}</span>
                      </div>

                      {toilet.location.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {toilet.location.address}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Updated to show multiple types */}
                        {renderToiletTypes(toilet.type)}

                        {toilet.reviews?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>
                              {calculateAverageRating(toilet.reviews)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span>By: {toilet.createdBy?.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Map Container - Takes remaining width and full height */}
      <div className="flex-1 h-full">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
          ref={mapRef}
        >
          <TileLayer
            attribution="Google Maps"
            url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
          />
          {mapToilets.map((toilet) => (
            <Marker
              key={toilet._id}
              position={[toilet.location.latitude, toilet.location.longitude]}
              icon={createCustomIcon(
                toilet.status,
                selectedToilet?._id === toilet._id
              )}
              eventHandlers={{
                click: () => handleToiletSelect(toilet),
              }}
            >
              <Popup className="custom-popup">
                <div className="w-64">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{toilet.name}</h3>
                    <Badge
                      className={`text-xs ${getStatusColor(toilet.status)}`}
                    >
                      {toilet.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-blue-500" />
                      <span>{toilet.highway}</span>
                    </div>

                    {toilet.location.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {toilet.location.address}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Updated popup to show multiple types */}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span>{getTypesAsString(toilet.type)}</span>
                      </div>

                      {toilet.reviews?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>
                            {calculateAverageRating(toilet.reviews)} (
                            {toilet.reviews.length})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>Managed by: {toilet.createdBy?.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>Added: {formatDate(toilet.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${toilet.location.latitude},${toilet.location.longitude}`,
                          "_blank"
                        )
                      }
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default NhaiAdminHome;
