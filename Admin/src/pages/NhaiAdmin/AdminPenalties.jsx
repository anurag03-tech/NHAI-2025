import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Filter,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  UserCheck,
  CreditCard,
  FileText,
} from "lucide-react";
import axios from "axios";

axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AdminPenalties = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAllPenalties();
  }, []);

  const fetchAllPenalties = async () => {
    try {
      setLoading(true);
      console.log("Fetching all penalties...");

      const response = await axios.get(`${BACKEND_URL}/api/penalties`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setPenalties(response.data);
        toast.success(
          `Found ${response.data.length} penalt${
            response.data.length !== 1 ? "ies" : "y"
          }`
        );
      } else {
        console.warn("Unexpected response format:", response.data);
        setPenalties([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching penalties:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else {
        toast.error("Failed to fetch penalties. Please try again.");
      }
      setPenalties([]);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Paid":
        return "default";
      case "Unpaid":
        return "destructive";
      case "Overdue":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-4 w-4" />;
      case "Unpaid":
        return <Clock className="h-4 w-4" />;
      case "Overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getIconBgColor = (status) => {
    switch (status) {
      case "Total":
        return "bg-blue-100";
      case "Paid":
        return "bg-green-100";
      case "Unpaid":
        return "bg-red-100";
      case "Overdue":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  // Fixed search function - includes both name and email for moderator and issuedBy
  const filteredPenalties = penalties.filter((penalty) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      // Moderator search - name and email
      penalty.moderator?.name?.toLowerCase().includes(searchLower) ||
      penalty.moderator?.email?.toLowerCase().includes(searchLower) ||
      // IssuedBy search - name and email
      penalty.issuedBy?.name?.toLowerCase().includes(searchLower) ||
      penalty.issuedBy?.email?.toLowerCase().includes(searchLower) ||
      // Reason search
      penalty.reason?.toLowerCase().includes(searchLower);

    const matchesStatusFilter =
      filterStatus === "all" || penalty.status === filterStatus;

    return matchesSearch && matchesStatusFilter;
  });

  // Calculate statistics
  const getStats = () => {
    const total = penalties.length;
    const paid = penalties.filter((p) => p.status === "Paid").length;
    const unpaid = penalties.filter((p) => p.status === "Unpaid").length;
    const totalAmount = penalties.reduce((sum, p) => sum + p.amount, 0);

    return {
      Total: total,
      Paid: paid,
      Unpaid: unpaid,
      "Total Amount": totalAmount,
    };
  };

  const statusCounts = getStats();

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">All Penalties</h1>
            <p className="text-blue-500 text font-medium">
              View and manage all issued penalties
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading All Penalties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="space-y-1 mb-4">
          <h1 className="text-3xl font-bold text-blue-500">All Penalties</h1>
          <p className="text-blue-500 text font-medium">
            View and manage all issued penalties to moderators
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-1">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-300 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${getIconBgColor(
                      status
                    )} shadow-sm`}
                  >
                    {status === "Total" && <Package className="h-4 w-4" />}
                    {status === "Total Amount" && (
                      <span className="text-lg font-bold text-slate-800">
                        ₹
                      </span>
                    )}
                    {["Paid", "Unpaid"].includes(status) &&
                      getStatusIcon(status)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {status === "Total Amount"
                        ? formatCurrency(count)
                        : count}
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
              placeholder="Search by moderator, issued by, or reason..."
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
                <SelectTrigger className="w-40 border border-slate-400 focus:border-blue-400 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="bg-white p-2">
              {filteredPenalties.length} result
              {filteredPenalties.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Compact Penalties List with Consistent Heights */}
        {filteredPenalties.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-400">₹</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                  {penalties.length === 0
                    ? "No Penalties Found"
                    : "No Matching Results"}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {penalties.length === 0
                    ? "No penalties have been issued yet."
                    : "Try adjusting your search terms or filter criteria."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredPenalties.map((penalty) => (
              <Card
                key={penalty._id}
                className="border-0 shadow-md bg-white py-0"
              >
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Status & Amount */}
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100">
                        <div
                          className={`p-2 rounded-lg ${getIconBgColor(
                            penalty.status
                          )}`}
                        >
                          {getStatusIcon(penalty.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">
                          {formatCurrency(penalty.amount)}
                        </p>
                        <Badge
                          variant={getStatusBadgeVariant(penalty.status)}
                          className="text-xs"
                        >
                          {penalty.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Moderator Info - Reduced Width */}
                    <div className="lg:col-span-2">
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 h-20 flex flex-col justify-center">
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">
                            Moderator
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {penalty.moderator?.name}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {penalty.moderator?.email}
                        </p>
                      </div>
                    </div>

                    {/* Issued By - Reduced Width */}
                    <div className="lg:col-span-2">
                      <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-200 h-20 flex flex-col justify-center">
                        <div className="flex items-center gap-1 mb-1">
                          <UserCheck className="h-3 w-3 text-indigo-600" />
                          <span className="text-xs font-medium text-indigo-700">
                            Issued By
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {penalty.issuedBy?.name}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {penalty.issuedBy?.email}
                        </p>
                      </div>
                    </div>

                    {/* Reason - Increased Width */}
                    <div className="lg:col-span-4">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200 h-20 flex flex-col">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3 text-red-600" />
                          <span className="text-xs font-medium text-red-700">
                            Reason
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2 leading-tight">
                          {penalty.reason}
                        </p>
                      </div>
                    </div>

                    {/* Dates - Same Width */}
                    <div className="lg:col-span-2">
                      <div className="h-20 flex flex-col justify-center space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-600">
                            Issued:
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700">
                          {formatDate(penalty.issuedAt)}
                        </p>
                        {penalty.status === "Paid" && penalty.paidAt && (
                          <>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-600">
                                Paid:
                              </span>
                            </div>
                            <p className="text-xs font-medium text-green-700">
                              {formatDate(penalty.paidAt)}
                            </p>
                          </>
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

export default AdminPenalties;
