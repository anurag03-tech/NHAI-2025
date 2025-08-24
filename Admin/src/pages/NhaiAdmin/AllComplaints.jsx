// AllComplaints.jsx - pages/NhaiAdmin/AllComplaints.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Filter,
  Loader2,
  Navigation,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  User,
  Building,
  UserCheck,
  Camera,
  Send,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

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

// Configure axios defaults for cookies
axios.defaults.withCredentials = true;

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Penalty form states
  const [penaltyForms, setPenaltyForms] = useState({});
  const [sendingPenalty, setSendingPenalty] = useState(false);
  const [penaltySuccess, setPenaltySuccess] = useState({});

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const fetchAllComplaints = async () => {
    try {
      setLoading(true);
      console.log("Fetching all complaints...");

      const response = await axios.get(`${BACKEND_URL}/api/complaints`, {});

      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setComplaints(response.data);
        toast.success(
          `Found ${response.data.length} complaint${
            response.data.length !== 1 ? "s" : ""
          }`
        );
      } else {
        console.warn("Unexpected response format:", response.data);
        setComplaints([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else {
        toast.error("Failed to fetch complaints. Please try again.");
      }
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Penalty form handlers
  const updatePenaltyForm = (complaintId, field, value) => {
    if (!penaltyForms[complaintId]) {
      setPenaltyForms((prev) => ({
        ...prev,
        [complaintId]: { reason: "", amount: "" },
      }));
    }

    setPenaltyForms((prev) => ({
      ...prev,
      [complaintId]: {
        ...prev[complaintId],
        [field]: value,
      },
    }));

    setPenaltySuccess((prev) => ({
      ...prev,
      [complaintId]: false,
    }));
  };

  const sendPenalty = async (complaint) => {
    if (!complaint.toilet?.createdBy) {
      toast.error("No moderator information available for this complaint");
      return;
    }

    const form = penaltyForms[complaint._id] || {};

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
        moderator: complaint.toilet.createdBy,
        reason: form.reason.trim(),
        amount: parseInt(form.amount),
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/penalties`,
        penaltyData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setPenaltySuccess((prev) => ({
        ...prev,
        [complaint._id]: true,
      }));

      setTimeout(() => {
        setPenaltyForms((prev) => ({
          ...prev,
          [complaint._id]: { reason: "", amount: "" },
        }));
        setPenaltySuccess((prev) => ({
          ...prev,
          [complaint._id]: false,
        }));
      }, 3000);
    } catch (error) {
      console.error("Error sending penalty:", error);
      toast.error("Failed to send penalty. Please try again.");
    } finally {
      setSendingPenalty(false);
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
      case "Pending":
        return "destructive";
      case "In Progress":
        return "secondary";
      case "Resolved":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "In Progress":
        return <AlertTriangle className="h-4 w-4" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getIconBgColor = (status) => {
    switch (status) {
      case "Total":
        return "bg-blue-100";
      case "Pending":
        return "bg-red-100";
      case "In Progress":
        return "bg-orange-100";
      case "Resolved":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.mobile.includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.toilet?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.toilet?.highway
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === "all" || complaint.status === filterStatus;

    return matchesSearch && matchesStatusFilter;
  });

  // Calculate statistics
  const getStats = () => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const inProgress = complaints.filter(
      (c) => c.status === "In Progress"
    ).length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;

    return {
      Total: total,
      Pending: pending,
      "In Progress": inProgress,
      Resolved: resolved,
    };
  };

  const statusCounts = getStats();

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">All Complaints</h1>
            <p className="text-blue-500 text font-medium">
              View and manage all toilet facility complaints
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading All Complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="space-y-1  mb-4">
          <h1 className="text-3xl font-bold text-blue-500">All Complaints</h1>
          <p className="text-blue-500 text font-medium">
            Complete overview of all toilet facility complaints
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-1">
          {Object.entries(statusCounts).map(([status, count]) => (
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
                    {["Pending", "In Progress", "Resolved"].includes(status) &&
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
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
            <Input
              placeholder="Search by username, mobile, description, or toilet..."
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
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-1 border-slate-400 focus:border-blue-400 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="bg-white p-2">
              {filteredComplaints.length} result
              {filteredComplaints.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md ">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                  {complaints.length === 0
                    ? "No Complaints Found"
                    : "No Matching Results"}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {complaints.length === 0
                    ? "No complaints have been submitted yet."
                    : "Try adjusting your search terms or filter criteria."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <Card
                key={complaint._id}
                className="transition-all duration-200 border-0 shadow-lg hover:shadow-2xl bg-white/95 backdrop-blur-sm group p-2"
              >
                <CardContent className="p-1">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Image and Map Column */}
                    <div className="lg:w-64 flex-shrink-0 space-y-3">
                      {/* Image */}
                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-md group-hover:shadow-lg transition-shadow">
                        {complaint.toilet?.images?.length > 0 ? (
                          <img
                            src={`data:image/jpeg;base64,${complaint.toilet.images[0].data}`}
                            alt={complaint.toilet.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <Camera className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Map */}
                      {complaint.toilet?.location && (
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
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            {complaint.toilet?.name || "General Complaint"}
                          </h3>
                          {complaint.toilet?.highway && (
                            <p className="text-slate-600 text-sm flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              {complaint.toilet.highway}
                            </p>
                          )}
                        </div>

                        <Badge
                          variant={getStatusBadgeVariant(complaint.status)}
                          className="flex items-center gap-1 font-medium self-start"
                        >
                          {getStatusIcon(complaint.status)}
                          {complaint.status}
                        </Badge>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {/* User Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-300">
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

                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-300">
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

                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-300">
                            <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-600 font-medium">
                                Date
                              </p>
                              <p className="font-semibold text-sm text-slate-800">
                                {formatDate(complaint.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gradient-to-br from-red-50 via-orange-50/80 to-red-50 p-2 rounded-lg border-1 border-red-200">
                          <h4 className="font-semibold text-slate-800 text mb-1 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Description
                          </h4>
                          <p className="text-slate-700 text leading-relaxed">
                            {complaint.description}
                          </p>
                        </div>

                        {/* Moderator Info */}
                        {complaint.toilet?.createdBy && (
                          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck className="h-4 w-4 text-indigo-600" />
                              <span className="text-xs font-medium text-indigo-700">
                                Toilet Managed By
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-slate-700">
                                Moderator Name
                              </p>
                              <p className="text-xs text-slate-600">
                                ID: {complaint.toilet.createdBy}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                              >
                                <Building className="h-2 w-2 mr-1" />
                                Moderator
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 ">
                        {complaint.toilet?.location && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-10 bg-blue-500 text-white border-0 hover:bg-blue-600 shadow-md hover:shadow-lg transition-all hover:text-white"
                            onClick={() =>
                              openGoogleMaps(
                                complaint.toilet.location.latitude,
                                complaint.toilet.location.longitude
                              )
                            }
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Open in Google Maps
                          </Button>
                        )}

                        {/* Send Penalty Dropdown */}
                        {complaint.toilet?.createdBy && (
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
                              className="w-80 p-4 bg-white border border-red-200 shadow-xl"
                              align="end"
                              side="top"
                            >
                              {penaltySuccess[complaint._id] ? (
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
                                    {penaltyForms[complaint._id]?.amount} has
                                    been sent to the moderator
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <DropdownMenuLabel className="flex items-center gap-2 text-red-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    Send Penalty to Moderator
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
                                          penaltyForms[complaint._id]?.reason ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          updatePenaltyForm(
                                            complaint._id,
                                            "reason",
                                            e.target.value
                                          )
                                        }
                                        className="border-red-300 focus:border-red-500 focus:ring-red-200 text-xs"
                                        rows={3}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-red-700 mb-1">
                                        Penalty Amount (₹)
                                      </label>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          placeholder="Enter amount"
                                          value={
                                            penaltyForms[complaint._id]
                                              ?.amount || ""
                                          }
                                          onChange={(e) =>
                                            updatePenaltyForm(
                                              complaint._id,
                                              "amount",
                                              e.target.value
                                            )
                                          }
                                          className="pl-3 border-red-300 focus:border-red-500 focus:ring-red-200 text-xs h-8"
                                          min="1"
                                        />
                                      </div>
                                    </div>

                                    <Button
                                      onClick={() => sendPenalty(complaint)}
                                      disabled={sendingPenalty}
                                      className="w-full bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
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
      </div>
    </div>
  );
};

export default AllComplaints;
