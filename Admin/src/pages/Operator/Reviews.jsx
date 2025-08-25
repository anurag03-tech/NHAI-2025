import React, { useState, useEffect } from "react";
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
  MapPin,
  Calendar,
  Loader2,
  ImageIcon,
  User,
  Star,
  MessageSquare,
  Filter,
} from "lucide-react";
import axios from "axios";

axios.defaults.withCredentials = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterToilet, setFilterToilet] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/reviews/my`, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Fetched Reviews:", response.data);
      if (Array.isArray(response.data)) {
        setReviews(response.data);
        toast.success(
          `Found ${response.data.length} review${
            response.data.length !== 1 ? "s" : ""
          }`
        );
      } else {
        setReviews([]);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reviews");
      setReviews([]);
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

  const getRatingColor = (rating) => {
    if (rating >= 4)
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (rating >= 3) return "bg-blue-100 text-blue-800 border-blue-300";
    if (rating >= 2) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
        }`}
      />
    ));
  };

  // Get unique toilets for filter dropdown
  const getUniqueToilets = () => {
    const toilets = new Map();
    reviews.forEach((review) => {
      const toilet = review.toilet;
      if (!toilets.has(toilet._id)) {
        toilets.set(toilet._id, {
          id: toilet._id,
          name: toilet.name,
          highway: toilet.highway,
          location:
            toilet.location.address || `${toilet.highway} - ${toilet.name}`,
        });
      }
    });
    return Array.from(toilets.values());
  };

  const uniqueToilets = getUniqueToilets();

  // Filter reviews based on selected toilet
  const filteredReviews = reviews.filter((review) => {
    if (filterToilet === "all") return true;
    return review.toilet._id === filterToilet;
  });

  // Check if review has user-uploaded photos
  const hasUserPhotos = (review) => {
    return (
      review.photos &&
      review.photos.length > 0 &&
      review.uploadedBy !== "operator"
    );
  };

  // Average Rating
  const getAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const total = filteredReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / filteredReviews.length).toFixed(1);
  };

  const averageRating = getAverageRating();

  if (loading) {
    return (
      <div className="p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 ">
          <div className="space-y-1 p-1 py-0">
            <h1 className="text-3xl font-bold text-blue-500">
              Reviews Dashboard
            </h1>
            <p className="text-blue-500 text font-medium">
              View and manage your toilet reviews ({reviews.length} total)
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading Reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="container mx-auto space-y-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 ">
          <div className="space-y-2 px-1">
            <h1 className="text-3xl font-bold text-blue-500 ">
              Reviews Dashboard
            </h1>
            <p className="text-blue-500 text font-medium">
              View and manage your toilet reviews ({reviews.length} total)
            </p>
          </div>
        </div>

        {/* Top Row: Filter + Avg Rating */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Filter - full width until avg rating */}
          <div className="flex-1">
            <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 border border-blue-400 w-full">
              <Filter className="text-slate-500 h-4 w-4 mr-2" />
              <Select value={filterToilet} onValueChange={setFilterToilet}>
                <SelectTrigger className="border-0 p-2 h-8 text-sm focus:none focus:outline-none w-full text-left">
                  <SelectValue placeholder="All Toilet Locations" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 shadow-lg rounded-xl border">
                  <SelectItem value="all">All Toilet Locations</SelectItem>
                  {uniqueToilets.map((toilet) => (
                    <SelectItem key={toilet.id} value={toilet.id}>
                      {toilet.name} - {toilet.highway}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Avg Rating Card */}
          <div className="flex items-center gap-2 bg-white shadow-md px-4 py-1 rounded-xl border border-slate-200 md:self-start">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
              <Star className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold">{averageRating}</span>
              <span className="text-slate-600 text-sm">Avg Rating</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
                <MessageSquare className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                {reviews.length === 0
                  ? "No reviews found"
                  : "No matching reviews"}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                {reviews.length === 0
                  ? "You haven't submitted any reviews yet. When you do, they'll appear here."
                  : "Try selecting a different toilet location to view reviews."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card
                key={review._id}
                className="transition-all duration-200 border-0 shadow-lg hover:shadow-2xl p-4 bg-white/95 backdrop-blur-sm group"
              >
                <CardContent className="p-1">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Images Column */}
                    <div className="lg:w-48 flex-shrink-0">
                      {hasUserPhotos(review) ? (
                        <div className="space-y-1">
                          <div className=" gap-1">
                            {review.photos.slice(0, 4).map((photo, index) => (
                              <div
                                key={index}
                                className="aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow"
                              >
                                <img
                                  src={`data:image/jpeg;base64,${photo}`}
                                  alt={`Review photo ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    console.log(
                                      "Failed to load image:",
                                      photo.substring(0, 50) + "..."
                                    );
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {review.photos.length > 4 && (
                            <p className="text-xs text-slate-500 text-center">
                              +{review.photos.length - 4} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-1" />
                            <p className="text-slate-500 text-xs font-medium">
                              No photo uploaded by user
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 pb-2 border-b border-slate-200">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            {review.toilet.name}
                          </h3>
                          <p className="text-slate-600 text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-purple-500" />
                            {review.toilet.highway}
                          </p>
                        </div>

                        <Badge
                          className={`${getRatingColor(
                            review.rating
                          )} flex items-center gap-1 text-xs px-2 py-1 font-medium shadow-sm`}
                        >
                          <Star className="h-3 w-3" />
                          {review.rating}/5
                        </Badge>
                      </div>

                      {/* Info + Comment (2 columns on desktop, stacked on mobile) */}
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Left column: User, Date, Rating stacked */}
                        <div className="flex flex-col gap-3 md:w-1/3">
                          {/* Username */}
                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border shadow-sm">
                            <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <p className="text-xs text-slate-600 font-medium truncate">
                              {review.username}
                            </p>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border shadow-sm">
                            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <p className="text-xs text-slate-600 font-medium truncate">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>

                          {/* Rating Stars */}
                          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 shadow-sm">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>

                        {/* Right column: Comment */}
                        <div className="flex-1 bg-red-50 p-3 rounded-lg border border-blue-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                            <MessageSquare className="h-3 w-3 text-blue-500" />
                            Comment
                          </h4>
                          <p className="text-slate-700 leading-relaxed">
                            {review.comment}
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

export default Reviews;
