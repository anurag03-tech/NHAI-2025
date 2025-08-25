import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
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
  Calendar,
  Loader2,
  User,
  Filter,
  IndianRupee,
  Receipt,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Penalties = () => {
  const { user } = useAuth();
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState(null);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/penalties/my`, {
        headers: { "Content-Type": "application/json" },
      });

      if (Array.isArray(response.data)) {
        setPenalties(response.data);
        toast.success(
          `Found ${response.data.length} penalt${
            response.data.length !== 1 ? "ies" : "y"
          }`
        );
      } else {
        setPenalties([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch penalties");
      setPenalties([]);
    } finally {
      setLoading(false);
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

  // ✅ Added formatCurrency function for Indian rupee formatting
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Unpaid":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const filteredPenalties = penalties.filter((p) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  const handlePayClick = (penalty) => {
    setSelectedPenalty(penalty);
    setOpen(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedPenalty) return;

    try {
      const { data } = await axios.put(
        `${BACKEND_URL}/api/penalties/${selectedPenalty._id}/pay`,
        {
          operator: selectedPenalty.operator,
          reason: selectedPenalty.reason,
          amount: selectedPenalty.amount,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(data.message || "Penalty paid successfully ✅");

      // Update locally
      setPenalties((prev) =>
        prev.map((p) =>
          p._id === selectedPenalty._id
            ? { ...p, status: "Paid", paidAt: new Date().toISOString() }
            : p
        )
      );

      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Payment failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 ">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">
              Penalties Dashboard
            </h1>
            <p className="text-blue-500 text font-medium">
              View and track your penalties ({penalties.length} total)
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading Penalties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 ">
      <div className="container mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-1 px-1 mb-4">
          <h1 className="text-3xl font-bold text-blue-500">
            Penalties Dashboard
          </h1>
          <p className="text-blue-500 text font-medium">
            View and track your penalties ({penalties.length} total)
          </p>
        </div>

        {/* Top Row: Filter */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 border border-blue-400 w-full">
              <Filter className="text-slate-500 h-4 w-4 mr-2" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-0 p-2 h-8 text-sm w-full text-left">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 shadow-lg rounded-xl border">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Penalties List */}
        {filteredPenalties.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
                <Receipt className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                {penalties.length === 0
                  ? "No penalties found 🎉"
                  : "No matching penalties"}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                {penalties.length === 0
                  ? "You have no penalties at the moment."
                  : "Try selecting a different filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPenalties.map((penalty) => (
              <Card
                key={penalty._id}
                className="transition-all duration-200 border-0 shadow-lg hover:shadow-2xl p-4 bg-white/95 backdrop-blur-sm group"
              >
                <CardContent className="p-1 space-y-3">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        {/* ✅ Updated to use formatCurrency */}
                        {formatCurrency(penalty.amount)}
                      </h3>
                      <p className="text-slate-600 text-xs">{penalty.reason}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getStatusColor(
                          penalty.status
                        )} text-xs px-2 py-1 font-medium shadow-sm`}
                      >
                        {penalty.status}
                      </Badge>
                      {penalty.status === "Unpaid" && (
                        <Button
                          size="sm"
                          onClick={() => handlePayClick(penalty)}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                      <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 font-medium">
                        Issued By: {penalty.issuedBy?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border">
                      <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 font-medium">
                        Issued At: {formatDate(penalty.issuedAt)}
                      </p>
                    </div>

                    {penalty.paidAt && (
                      <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-xs text-slate-600 font-medium">
                          Paid At: {formatDate(penalty.paidAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-600">
              Payment Checkout
            </DialogTitle>
          </DialogHeader>

          {/* Order Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Penalty Reason:</span>{" "}
              {selectedPenalty?.reason}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Amount:</span>{" "}
              <span className="text-lg font-bold text-blue-700">
                {/* ✅ Updated to use formatCurrency */}
                {formatCurrency(selectedPenalty?.amount || 0)}
              </span>
            </p>
          </div>

          {/* Dummy Payment Form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">CVV</label>
                <input
                  type="password"
                  placeholder="***"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Name on Card
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6 flex justify-between">
            <Button
              variant="outline"
              className="w-28"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPay}
              className="w-40 bg-blue-600 hover:bg-blue-700"
            >
              {/* ✅ Updated to use formatCurrency */}
              Pay {formatCurrency(selectedPenalty?.amount || 0)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Penalties;
