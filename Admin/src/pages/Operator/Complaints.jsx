import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Calendar,
  Loader2,
  ImageIcon,
  Phone,
  User,
  Navigation,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import axios from "axios";

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/complaints/my`, {
        headers: { "Content-Type": "application/json" },
      });
      if (Array.isArray(response.data)) {
        setComplaints(response.data);
        toast.success(
          `Found ${response.data.length} complaint${
            response.data.length !== 1 ? "s" : ""
          }`
        );
      } else {
        setComplaints([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      setUpdatingStatus(complaintId);
      const response = await axios.patch(
        `${BACKEND_URL}/api/complaints/${complaintId}/status`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data) {
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === complaintId ? { ...c, status: newStatus } : c
          )
        );
        toast.success(`Complaint status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "In Progress":
        return <AlertCircle className="h-4 w-4" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getIconBgColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-600 border border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-600 border border-blue-200";
      case "Resolved":
        return "bg-emerald-100 text-emerald-600 border border-emerald-200";
      case "Rejected":
        return "bg-red-100 text-red-600 border border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.toilet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.toilet.highway
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || complaint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusCounts = () => {
    const counts = complaints.reduce(
      (acc, complaint) => {
        acc[complaint.status] = (acc[complaint.status] || 0) + 1;
        return acc;
      },
      { Pending: 0, "In Progress": 0, Resolved: 0, Rejected: 0 }
    );
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 ">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">
              Complaints Dashboard
            </h1>
            <p className="text-blue-500 text-sm font-medium">
              Manage and track your complaints efficiently
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="container mx-auto  space-y-2">
        {/* Header - Enhanced with gradient */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 ">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">
              Complaints Dashboard
            </h1>
            <p className="text-blue-500 text-sm font-medium">
              Manage and track your complaints efficiently
            </p>
          </div>
        </div>

        {/* Stats Cards - Enhanced colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
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
                    {getStatusIcon(status)}
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

        {/* Search & Filter - Ultra Clean */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border border-blue-500 bg-white rounded-2xl placeholder:text-gray-400 shadow-sm "
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

            {/* Status Filter */}
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-10 h-12 border border-gray-200 bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 text-sm transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Results indicator */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-1">
              <span className="inline-flex h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredComplaints.length}
                </span>{" "}
                of {complaints.length} complaints
              </span>
            </div>

            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              >
                <RefreshCw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
                <AlertCircle className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                {complaints.length === 0
                  ? "No complaints found"
                  : "No matching complaints"}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                {complaints.length === 0
                  ? "You haven't submitted any complaints yet. When you do, they'll appear here."
                  : "Try adjusting your search terms or filters to find what you're looking for."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card
                key={complaint._id}
                className="transition-all duration-200 border-0 shadow-lg hover:shadow-2xl p-4 bg-white/95 backdrop-blur-sm group"
              >
                <CardContent className="p-1">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Image and Map Column */}
                    <div className="lg:w-64 flex-shrink-0 space-y-3">
                      {/* Image */}
                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-md group-hover:shadow-lg transition-shadow">
                        {complaint.toilet.images?.length > 0 ? (
                          <img
                            src={`data:image/jpeg;base64,${complaint.toilet.images[0].data}`}
                            alt={complaint.toilet.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <ImageIcon className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Map */}
                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-slate-200 shadow-md group-hover:shadow-lg transition-shadow">
                        <MapContainer
                          center={[
                            complaint.toilet.location.latitude,
                            complaint.toilet.location.longitude,
                          ]}
                          zoom={15}
                          scrollWheelZoom={false}
                          className="h-full w-full"
                        >
                          <TileLayer
                            attribution="Google Maps"
                            url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                          />
                          <Marker
                            position={[
                              complaint.toilet.location.latitude,
                              complaint.toilet.location.longitude,
                            ]}
                          >
                            <Popup>{complaint.toilet.name}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            {complaint.toilet.name}
                          </h3>
                          <p className="text-slate-600 text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            {complaint.toilet.highway}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge
                            className={`${getStatusColor(
                              complaint.status
                            )} flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium shadow-sm`}
                          >
                            {getStatusIcon(complaint.status)}
                            {complaint.status}
                          </Badge>

                          <select
                            value={complaint.status}
                            onChange={(e) =>
                              updateComplaintStatus(
                                complaint._id,
                                e.target.value
                              )
                            }
                            disabled={updatingStatus === complaint._id}
                            className="px-3 py-1.5 border-2 border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white disabled:opacity-50 min-w-[110px] transition-all"
                          >
                            {[
                              "Pending",
                              "In Progress",
                              "Resolved",
                              "Rejected",
                            ].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingStatus === complaint._id && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* User Info Column */}
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-600 font-medium">
                                  User
                                </p>
                                <p className="font-semibold text-sm truncate text-slate-800">
                                  {complaint.username}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <Phone className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-600 font-medium">
                                  Phone
                                </p>
                                <p className="font-semibold text-sm text-slate-800">
                                  {complaint.mobile}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                            <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-600 font-medium">
                                Date Submitted
                              </p>
                              <p className="font-semibold text-sm text-slate-800">
                                {formatDate(complaint.createdAt)}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-10 bg-blue-500 text-white border-0 hover:bg-blue-600 shadow-md hover:shadow-lg transition-all hover:text-white"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${complaint.toilet.location.latitude},${complaint.toilet.location.longitude}`,
                                "_blank"
                              )
                            }
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Open in Google Maps
                          </Button>
                        </div>

                        {/* Description Column */}
                        <div className="flex-1 bg-gradient-to-br from-red-50 via-orange-50/80 to-red-50 p-4 rounded-lg border-1 border-red-200">
                          <h4 className="font-semibold text-slate-800 text mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Description
                          </h4>
                          <p className="text-slate-700 text leading-relaxed">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
