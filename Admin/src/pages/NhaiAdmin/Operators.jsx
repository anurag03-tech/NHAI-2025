import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Mail,
  Building,
  Plus,
  Shield,
} from "lucide-react";
import axios from "axios";

// Configure axios defaults for cookies
axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Operators = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingOperator, setAddingOperator] = useState(false);
  const [newOperator, setNewOperator] = useState({ name: "", email: "" });
  const [createdOperator, setCreatedOperator] = useState(null);

  useEffect(() => {
    fetchAllOperators();
  }, []);

  const fetchAllOperators = async () => {
    try {
      setLoading(true);
      console.log("Fetching all operators...");

      const response = await axios.get(`${BACKEND_URL}/api/auth/operators`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", response.data);

      // Handle the response structure: { count, operators }
      if (response.data && Array.isArray(response.data.operators)) {
        setOperators(response.data.operators);
        toast.success(
          `Found ${response.data.count} operator${
            response.data.count !== 1 ? "s" : ""
          }`
        );
      } else {
        console.warn("Unexpected response format:", response.data);
        setOperators([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else {
        toast.error("Failed to fetch operators. Please try again.");
      }
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = async () => {
    if (!newOperator.name.trim() || !newOperator.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setAddingOperator(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/auth/create-operator`,
        {
          name: newOperator.name.trim(),
          email: newOperator.email.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Create operator response:", response.data);

      if (response.data.operator) {
        setCreatedOperator({
          ...response.data.operator,
          tempPassword: response.data.tempPassword,
        });

        // Add the new operator to the list
        setOperators((prev) => [response.data.operator, ...prev]);

        toast.success("Operator created successfully!");

        // Reset form
        setNewOperator({ name: "", email: "" });
      }
    } catch (error) {
      console.error("Error creating operator:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(`Failed to create operator: ${errorMessage}`);
      } else {
        toast.error("Failed to create operator. Please try again.");
      }
    } finally {
      setAddingOperator(false);
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
      case "Active":
        return "default";
      case "Inactive":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4" />;
      case "Inactive":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getIconBgColor = (status) => {
    switch (status) {
      case "Total":
        return "bg-blue-100";
      case "Active":
        return "bg-green-100";
      case "Inactive":
        return "bg-red-100";
      case "Pending":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  // Filter operators
  const filteredOperators = operators.filter((operator) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      operator.name?.toLowerCase().includes(searchLower) ||
      operator.email?.toLowerCase().includes(searchLower);

    // For now, we'll assume all operators are "Active" since the API doesn't return status
    const matchesStatusFilter =
      filterStatus === "all" || filterStatus === "Active";

    return matchesSearch && matchesStatusFilter;
  });

  // Calculate statistics
  const getStats = () => {
    const total = operators.length;
    // Since we don't have status from API, we'll assume all are active
    const active = operators.length;
    const inactive = 0;
    const pending = 0;

    return {
      Total: total,
      Active: active,
      Inactive: inactive,
      Pending: pending,
    };
  };

  const statusCounts = getStats();

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">All Operators</h1>
            <p className="text-blue-500 text font-medium">
              View and manage all operators
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading All Operators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-blue-500">All Operators</h1>
            <p className="text-blue-500 text font-medium">
              View and manage all operators in the system
            </p>
          </div>

          {/* Add Operator Button */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Operator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Added New Operator
                </DialogTitle>
              </DialogHeader>

              {createdOperator ? (
                // Success state with email notification message
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-green-100 rounded-full">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-3">
                      Operator Created Successfully!
                    </h3>
                    <p className="text-green-700 mb-2">
                      Account has been created for{" "}
                      <strong>{createdOperator.name}</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Login Credentials Sent via Email
                        </h4>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          Login credentials have been sent to{" "}
                          <strong>{createdOperator.email}</strong>. Please
                          inform the operator to check their email inbox
                          (including spam folder) for login credentials.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setCreatedOperator(null);
                      setShowAddDialog(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                // Add operator form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      placeholder="Enter operator's full name"
                      value={newOperator.name}
                      onChange={(e) =>
                        setNewOperator((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter operator's email"
                      value={newOperator.email}
                      onChange={(e) =>
                        setNewOperator((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddOperator}
                      disabled={addingOperator}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {addingOperator ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Create Operator
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
                    {status === "Total" && <Users className="h-4 w-4" />}
                    {["Active", "Inactive", "Pending"].includes(status) &&
                      getStatusIcon(status)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{count}</p>
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
              placeholder="Search by name or email..."
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="bg-white p-2">
              {filteredOperators.length} result
              {filteredOperators.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Operators List */}
        {filteredOperators.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                  {operators.length === 0
                    ? "No Operators Found"
                    : "No Matching Results"}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {operators.length === 0
                    ? "No operators have been created yet."
                    : "Try adjusting your search terms or filter criteria."}
                </p>
                {operators.length === 0 && (
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Operator
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredOperators.map((operator) => (
              <Card
                key={operator._id}
                className="border-0 shadow-md bg-white p-2"
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Avatar & Status */}
                    <div className="lg:col-span-3 flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-200">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">
                          {operator.name}
                        </h3>
                        <Badge
                          variant={getStatusBadgeVariant("Active")}
                          className="text-xs mt-1"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-4">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 h-20 flex flex-col justify-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span className="text-xs font-medium text-slate-600">
                            Email Address
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          {operator.email}
                        </p>
                      </div>
                    </div>

                    {/* Role Info */}
                    <div className="lg:col-span-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 h-20 flex flex-col justify-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Building className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">
                            Role & Permissions
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {operator.role}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="lg:col-span-2">
                      <div className="h-20 flex flex-col justify-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-600">
                            Created:
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700">
                          {formatDate(operator.createdAt)}
                        </p>
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

export default Operators;
