import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  X,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Loader2,
  Navigation,
  RotateCcw,
  Camera,
  Map,
} from "lucide-react";
import axios from "axios";

// Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
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

// Component to handle map view changes
function MapViewController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position[0] && position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
}

// Component for draggable marker with click events
function InteractiveMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = [marker.getLatLng().lat, marker.getLatLng().lng];
        setPosition(newPos);
      }
    },
  };

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  ) : null;
}

const AddToilet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdToilet, setCreatedToilet] = useState(null);
  const [position, setPosition] = useState([28.6139, 77.209]);
  const [mapKey, setMapKey] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    highway: "",
    location: {
      latitude: "28.6139",
      longitude: "77.209",
      address: "",
    },
    type: ["Unisex"], // Changed to array with default value
    accessible: true,
    status: "Open",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));

      // Update map position when lat/lng changes (with validation)
      if (child === "latitude" || child === "longitude") {
        const lat =
          child === "latitude"
            ? parseFloat(value)
            : parseFloat(formData.location.latitude);
        const lng =
          child === "longitude"
            ? parseFloat(value)
            : parseFloat(formData.location.longitude);

        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          setPosition([lat, lng]);
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle toilet type changes (multiple selection)
  const handleTypeChange = (typeValue, checked) => {
    setFormData((prev) => {
      const currentTypes = prev.type || [];

      if (checked) {
        // Add type if checked
        if (!currentTypes.includes(typeValue)) {
          return {
            ...prev,
            type: [...currentTypes, typeValue],
          };
        }
      } else {
        // Remove type if unchecked
        const updatedTypes = currentTypes.filter((type) => type !== typeValue);
        // Ensure at least one type is selected
        if (updatedTypes.length === 0) {
          toast.error("At least one toilet type must be selected");
          return prev;
        }
        return {
          ...prev,
          type: updatedTypes,
        };
      }

      return prev;
    });
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      accessible: checked,
    }));
  };

  // Update form data when map position changes (CORRECTED)
  const handleMapPositionChange = (pos) => {
    if (!pos || !Array.isArray(pos) || pos.length < 2) {
      console.error("Invalid position:", pos);
      return;
    }

    setPosition(pos);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: pos[0]?.toFixed(6),
        longitude: pos[1]?.toFixed(6),
      },
    }));
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = [latitude, longitude];
          handleMapPositionChange(newPos);
          toast.dismiss();
          toast.success("Location updated!");
        },
        (error) => {
          toast.dismiss();
          toast.error("Failed to get location. Please enter manually.");
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  // Reset location to default
  const resetLocation = () => {
    const defaultPos = [28.6139, 77.209];
    handleMapPositionChange(defaultPos);
    setMapKey((prev) => prev + 1);
    toast.success("Location reset to Delhi");
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum 5MB allowed.`);
        continue;
      }

      try {
        const base64 = await convertToBase64(file);
        newImages.push({
          data: base64,
          name: file.name,
          size: file.size,
          preview: `data:${file.type};base64,${base64}`,
          uploadedAt: new Date(),
        });
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate that at least one type is selected
    if (!formData.type || formData.type.length === 0) {
      toast.error("Please select at least one toilet type");
      setLoading(false);
      return;
    }

    try {
      const toiletData = {
        ...formData,
        location: {
          ...formData.location,
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude),
        },
        images: images.map((img) => ({
          data: img.data,
          uploadedAt: img.uploadedAt,
        })),
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/toilets`,
        toiletData
      );

      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.data.message
      ) {
        setCreatedToilet(response.data.toilet);
        setShowSuccessDialog(true);
        toast.success(response.data.message || "Toilet added successfully!");

        // Reset form
        setFormData({
          name: "",
          highway: "",
          location: { latitude: "28.6139", longitude: "77.209", address: "" },
          type: ["Unisex"], // Reset to default array
          accessible: true,
          status: "Open",
        });
        setImages([]);
        setPosition([28.6139, 77.209]);
        setMapKey((prev) => prev + 1);
      } else {
        toast.error("Failed to add toilet");
      }
    } catch (error) {
      console.error("Error adding toilet:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to add toilet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setCreatedToilet(null);
  };

  return (
    <div className="min-h-screen p-2">
      <div className="container space-y-2 max-w-6xl">
        {/* Header */}
        <div className=" p-1 rounded-2xl ">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-500 mb-2">
            Add New Toilet
          </h1>
          <p className="text-blue-500 text-sm font-medium">
            Add a new toilet location with detailed information and images
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0  shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">
              Toilet Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Toilet Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Rest Area Block A"
                    className="border-2 border-slate-200 focus:border-blue-400 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="highway">Highway *</Label>
                  <Input
                    id="highway"
                    name="highway"
                    value={formData.highway}
                    onChange={handleInputChange}
                    placeholder="e.g., NH-1"
                    className="border-2 border-slate-200 focus:border-blue-400 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Location Section - Coordinates only */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Location *
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="text-xs hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Use Current
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetLocation}
                      className="text-xs hover:bg-slate-50 hover:border-slate-300"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lat/Long Inputs in same vertical column */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        name="location.latitude"
                        type="number"
                        step="any"
                        value={formData.location.latitude}
                        onChange={handleInputChange}
                        placeholder="28.7041"
                        className="border-2 border-slate-200 focus:border-blue-400 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        name="location.longitude"
                        type="number"
                        step="any"
                        value={formData.location.longitude}
                        onChange={handleInputChange}
                        placeholder="77.1025"
                        className="border-2 border-slate-200 focus:border-blue-400 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Address on the right */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      placeholder="Full address or landmark details"
                      rows={5}
                      className="border-2 border-slate-200 focus:border-blue-400 rounded-xl h-2/3"
                    />
                  </div>
                </div>
              </div>

              {/* Map and Image Upload Side by Side */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Map Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Map className="h-5 w-5 text-green-600" />
                    Interactive Map
                  </Label>
                  <div className="space-y-2">
                    <div className="h-80 xl:h-96 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md">
                      <MapContainer
                        key={mapKey}
                        center={position}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                      >
                        <TileLayer
                          attribution="Google Maps"
                          url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                        />
                        <MapViewController position={position} />
                        <InteractiveMarker
                          position={position}
                          setPosition={handleMapPositionChange}
                        />
                      </MapContainer>
                    </div>
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                      💡 <strong>Tip:</strong> Click on the map or drag the red
                      pin to set the exact location. The coordinates will be
                      automatically updated.
                    </p>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-600" />
                    Images
                  </Label>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Upload toilet images
                          </p>
                          <p className="text-xs text-slate-500">
                            Max 5 images, 5MB each
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("image-upload").click()
                          }
                          className="flex items-center gap-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl"
                          disabled={images.length >= 5}
                        >
                          <Upload className="h-4 w-4" />
                          {images.length === 0 ? "Upload" : "Add More"}
                        </Button>
                      </div>

                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {images.length}/5 images uploaded
                        </span>
                        {images.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Total:{" "}
                            {images.reduce(
                              (total, img) => total + img.size,
                              0
                            ) /
                              (1024 * 1024) <
                            1
                              ? `${Math.round(
                                  images.reduce(
                                    (total, img) => total + img.size,
                                    0
                                  ) / 1024
                                )} KB`
                              : `${(
                                  images.reduce(
                                    (total, img) => total + img.size,
                                    0
                                  ) /
                                  (1024 * 1024)
                                ).toFixed(1)} MB`}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="max-h-72 xl:max-h-72 overflow-x-hidden p-2">
                      {images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-purple-300 transition-colors">
                                <img
                                  src={image.preview}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <div className="mt-1">
                                <div className="text-xs text-slate-500 truncate font-medium">
                                  {image.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {image.size > 1024 * 1024
                                    ? `${(image.size / (1024 * 1024)).toFixed(
                                        1
                                      )} MB`
                                    : `${Math.round(image.size / 1024)} KB`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-40 xl:h-64 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50">
                          <div className="text-center">
                            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">
                              No images uploaded
                            </p>
                            <p className="text-slate-400 text-xs">
                              Click "Upload" to add images
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Multiple Toilet Types Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Toilet Types *
                  </Label>
                  <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    {["Gents", "Ladies", "Unisex"].map((typeOption) => (
                      <div
                        key={typeOption}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={`type-${typeOption}`}
                          checked={formData.type.includes(typeOption)}
                          onCheckedChange={(checked) =>
                            handleTypeChange(typeOption, checked)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label
                          htmlFor={`type-${typeOption}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                        >
                          {typeOption}
                        </Label>
                      </div>
                    ))}

                    {/* Display selected types */}
                    {formData.type.length > 0 && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-blue-200">
                        <span className="text-xs text-slate-600">
                          Selected:
                        </span>
                        {formData.type.map((type) => (
                          <Badge
                            key={type}
                            variant={getTypeBadgeVariant(type)}
                            className="text-xs"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange(value, "status")
                    }
                  >
                    <SelectTrigger className="border-2 border-slate-200 focus:border-blue-400 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Under Maintenance">
                        Under Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Accessibility */}
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <Checkbox
                  id="accessible"
                  checked={formData.accessible}
                  onCheckedChange={handleCheckboxChange}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <div>
                  <Label
                    htmlFor="accessible"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                  >
                    Wheelchair Accessible
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    This facility is accessible for people with disabilities
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t-2 border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-2 border-slate-200 hover:border-slate-400 rounded-xl order-2 sm:order-1 px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl order-1 sm:order-2 px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Toilet...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Add Toilet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog
          open={showSuccessDialog}
          onOpenChange={handleCloseSuccessDialog}
        >
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Toilet Added Successfully!
              </DialogTitle>
              <DialogDescription>
                Your toilet has been successfully added to the system.
              </DialogDescription>
            </DialogHeader>

            {createdToilet && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">
                    {createdToilet.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {createdToilet.highway}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      {createdToilet.location.latitude},{" "}
                      {createdToilet.location.longitude}
                    </span>
                  </div>

                  {createdToilet.location.address && (
                    <div className="text-sm text-slate-600">
                      {createdToilet.location.address}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-slate-500" />
                    {/* Display multiple types */}
                    {Array.isArray(createdToilet.type) ? (
                      createdToilet.type.map((type) => (
                        <Badge key={type} variant={getTypeBadgeVariant(type)}>
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant={getTypeBadgeVariant(createdToilet.type)}>
                        {createdToilet.type}
                      </Badge>
                    )}
                    <Badge
                      variant={getStatusBadgeVariant(createdToilet.status)}
                    >
                      {createdToilet.status}
                    </Badge>
                    {createdToilet.accessible && (
                      <Badge variant="outline">Wheelchair Accessible</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    Created: {formatDate(createdToilet.createdAt)}
                  </div>

                  <div className="text-xs text-slate-500 break-all">
                    ID: {createdToilet._id}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={handleCloseSuccessDialog}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddToilet;
