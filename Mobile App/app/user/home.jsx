// app/user/home.jsx
import { View, Text, Pressable, ScrollView, Alert, Linking, Image } from 'react-native';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URI;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Skeleton Components
const SkeletonBox = ({ width = '100%', height = 20, className = '' }) => (
  <View className={`rounded bg-gray-200 ${className}`} style={{ width, height }} />
);

const MapSkeleton = () => (
  <View className="rounded-xl bg-white p-4 shadow-md">
    <View className="h-80 items-center justify-center rounded-lg bg-gray-200">
      <Ionicons name="map-outline" size={48} color="#9ca3af" />
      <Text className="mt-2 text-sm text-gray-500">Loading map...</Text>
    </View>
    <View className="mt-2 flex flex-row flex-wrap justify-around rounded-lg bg-gray-100 p-2">
      {[...Array(4)].map((_, i) => (
        <View key={i} className="flex-row items-center">
          <SkeletonBox width={12} height={12} className="mr-1 rounded-full" />
          <SkeletonBox width={40} height={16} />
        </View>
      ))}
    </View>
  </View>
);

const FacilitySkeleton = ({ index }) => (
  <View className="mb-3 rounded-lg bg-white p-2 shadow-sm">
    {/* Header with number and name */}
    <View className="mb-3 flex-row items-center">
      <View className="mr-2 h-6 w-6 items-center justify-center rounded-full bg-gray-200">
        <Text className="text-xs font-bold text-gray-400">{index + 1}</Text>
      </View>
      <SkeletonBox width="60%" height={20} />
    </View>

    {/* Image and Action Buttons */}
    <View className="flex flex-row">
      {/* Image Placeholder */}
      <View className="relative w-2/3">
        <View className="h-[120px] items-center justify-center overflow-hidden rounded-lg bg-gray-200">
          <Ionicons name="image-outline" size={32} color="#9ca3af" />
        </View>
        {/* Status Overlay Skeleton */}
        <View className="absolute left-2 top-2">
          <SkeletonBox width={60} height={24} className="rounded-full" />
        </View>
      </View>

      {/* Action Buttons Skeleton */}
      <View className="flex-1 justify-center gap-1 p-2">
        <SkeletonBox width="100%" height={32} className="rounded-lg" />
        <SkeletonBox width="100%" height={32} className="rounded-lg" />
        <SkeletonBox width="100%" height={32} className="rounded-lg" />
      </View>
    </View>

    {/* Info Section Skeleton */}
    <View className="mt-2">
      {/* Highway info */}
      <View className="mb-2 flex-row items-center">
        <SkeletonBox width="70%" height={16} />
      </View>

      {/* Distance and details */}
      <View className="flex flex-row items-center gap-2">
        <View className="flex-1 rounded-lg bg-gray-100 px-3 py-2">
          <SkeletonBox width="80%" height={16} />
        </View>
        <View className="flex-1 rounded-lg bg-gray-100 px-2 py-2">
          <SkeletonBox width="90%" height={16} />
        </View>
      </View>
    </View>
  </View>
);

const QuickActionsSkeleton = () => (
  <View className="px-2">
    <View className="flex-row flex-wrap rounded-xl bg-white pt-3 shadow-sm">
      {/* Location Status Skeleton */}
      <View className="w-1/2 rounded-md bg-gray-100 px-2 py-3">
        <View className="mb-1 flex-row items-center">
          <Ionicons name="location-outline" size={14} color="#9ca3af" />
          <SkeletonBox width={60} height={14} className="ml-1" />
        </View>
        <SkeletonBox width="90%" height={12} />
      </View>

      {/* Action Buttons Skeleton */}
      <View className="w-1/2 flex-row justify-around pb-3">
        {[...Array(3)].map((_, i) => (
          <View key={i} className="items-center">
            <View className="mb-2 h-12 w-12 rounded-full bg-gray-200 p-3" />
            <SkeletonBox width={50} height={12} />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Helper function to get toilet types as string
const getTypesAsString = (types) => {
  const typeArray = Array.isArray(types) ? types : [types];
  return typeArray.join(', ');
};

// Helper function to get average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

// Leaflet Map Component with Google Maps Tiles
const LeafletMap = ({ location, facilities }) => {
  const userLat = location?.coords?.latitude || 28.7041;
  const userLng = location?.coords?.longitude || 77.1025;

  const mapHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .toilet-icon {
            background: #22c55e;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 13px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        }
        .closed-icon { background: #ef4444; }
        .maintenance-icon { background: #f59e0b; }
        .user-icon {
            background: #3b82f6;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        }
        .direction-btn, .view-btn {
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            margin: 3px;
            font-weight: bold;
        }
        .direction-btn { background: #2563eb; color: white; }
        .direction-btn:hover { background: #1d4ed8; }
        .view-btn { background: #059669; color: white; }
        .view-btn:hover { background: #047857; }
        .popup-buttons {
            display: flex;
            gap: 5px;
            justify-content: center;
            margin-top: 10px;
        }
        .popup-content {
            min-width: 260px;
            text-align: center;
            font-family: 'Arial', sans-serif;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        try {
            var map = L.map('map').setView([${userLat}, ${userLng}], 13);
            
          
              L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                  attribution: '© Google Maps',
                  maxZoom: 20,
                  subdomains: ['0', '1', '2', '3']
              }).addTo(map);

            var userIcon = L.divIcon({
                html: '<div class="user-icon"></div>',
                className: 'custom-div-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            L.marker([${userLat}, ${userLng}], { icon: userIcon })
                .addTo(map)
                .bindPopup('<div style="text-align: center;"><b>📍 Your Current Location</b><br>You are here</div>');

            var facilities = ${JSON.stringify(
              facilities.map((f, i) => ({
                ...f,
                id: i + 1,
              }))
            )};
            
            facilities.forEach(function(facility, index) {
                var iconClass = 'toilet-icon';
                if (facility.status === 'Closed') iconClass += ' closed-icon';
                else if (facility.status === 'Under Maintenance') iconClass += ' maintenance-icon';
                
                var toiletIcon = L.divIcon({
                    html: '<div class="' + iconClass + '">' + (index + 1) + '</div>',
                    className: 'custom-div-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                
                var statusColor = facility.status === 'Open' ? '#16a34a' : facility.status === 'Closed' ? '#dc2626' : '#f59e0b';
                var accessibleText = facility.accessible ? 'Accessible' : 'Not Accessible';
                var trafficInfo = facility.durationInTrafficText ? 
                    '<div style="margin: 5px 0; color: #dc2626;"><strong>With Traffic:</strong> ' + facility.durationInTrafficText + '</div>' : '';
                
                var marker = L.marker([facility.location.latitude, facility.location.longitude], { icon: toiletIcon })
                    .addTo(map)
                    .bindPopup(
                        '<div class="popup-content">' +
                        '<b style="font-size: 16px;">🚽 ' + facility.name + '</b><br>' +
                        '<div style="margin: 5px 0; color: #666; font-size: 13px;">' + facility.highway + '</div>' +
                        '<div style="margin: 8px 0;"><strong>Status:</strong> <span style="color: ' + statusColor + ';">' + facility.status + '</span></div>' +
                        '<div style="margin: 5px 0;"><strong>Types:</strong> ' + facility.typesString + '</div>' +
                        '<div style="margin: 5px 0;"><strong>Accessibility:</strong> ' + accessibleText + '</div>' +
                        '<div style="margin: 5px 0;"><strong>Rating:</strong> ' + (facility.averageRating > 0 ? facility.averageRating + '⭐' : 'No ratings yet') + '</div>' +
                        '<div style="margin: 8px 0; padding: 5px; background: #f0f9ff; border-radius: 5px;">' +
                        '<div><strong>🎯 Distance:</strong> ' + (facility.distanceText || 'Loading...') + '</div>' +
                        '<div style="color: #059669;"><strong>🕒 Drive Time:</strong> ' + (facility.durationText || 'Loading...') + '</div>' +
                        trafficInfo +
                        '</div>' +
                        '<div class="popup-buttons">' +
                        '<button class="direction-btn" onclick="getDirections(' + facility.location.latitude + ',' + facility.location.longitude + ',\\'' + facility.name + '\\')">Get Directions</button>' +
                        '<button class="view-btn" onclick="viewToilet(' + index + ')">View Details</button>' +
                        '</div>' +
                        '</div>'
                    );
            });

            function getDirections(lat, lng, name) {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'directions',
                    facility: { lat: lat, lng: lng, name: name }
                }));
            }

            function viewToilet(index) {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'view',
                    facilityIndex: index
                }));
            }

            // Notify React Native that map is loaded
            setTimeout(function() {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'mapLoaded'
                }));
            }, 1000);

        } catch(error) {
            console.error('Map initialization error:', error);
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'mapError',
                error: error.message
            }));
        }
    </script>
</body>
</html>`;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'directions') {
        openDirections(data.facility);
      } else if (data.type === 'view') {
        const facility = facilities[data.facilityIndex];
        router.push(
          `/user/toilet-detail?id=${facility._id}&name=${encodeURIComponent(facility.name)}`
        );
      } else if (data.type === 'mapLoaded') {
        console.log('Map loaded successfully');
      } else if (data.type === 'mapError') {
        console.error('Map error:', data.error);
      }
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  };

  const openDirections = async (facility) => {
    try {
      const googleMapsUrl = `google.navigation:q=${facility.lat},${facility.lng}`;
      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);

      if (canOpenGoogleMaps) {
        console.log('Opening Google Maps app...');
        await Linking.openURL(googleMapsUrl);
      } else {
        const webUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${facility.lat},${facility.lng}`;
        console.log('Opening web Google Maps...');
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.log('Error opening maps:', error);
      Alert.alert(
        'Navigation Info',
        `Destination: ${facility.name}\nCoordinates: ${facility.lat.toFixed(6)}, ${facility.lng.toFixed(6)}\n\nPlease open your maps app and navigate to these coordinates.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View className="rounded-xl bg-white p-4 shadow-md">
      <View style={{ height: 320 }}>
        <WebView
          source={{ html: mapHTML }}
          className="h-full w-full"
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          nestedScrollEnabled={true}
          scrollEnabled={false}
          onLoad={() => console.log('WebView loaded')}
          onError={(error) => console.log('WebView error:', error)}
        />
      </View>
      <View className="mt-2 flex flex-row flex-wrap justify-around rounded-lg bg-gray-100 p-2">
        <View className="flex-row items-center">
          <View className="mr-1 h-3 w-3 rounded-full bg-blue-500" />
          <Text className="text-sm text-gray-600">You</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-1 h-3 w-3 rounded-full bg-green-500" />
          <Text className="text-sm text-gray-600">Open</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-1 h-3 w-3 rounded-full bg-red-500" />
          <Text className="text-sm text-gray-600">Closed</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-1 h-3 w-3 rounded-full bg-yellow-500" />
          <Text className="text-sm text-gray-600">Maintenance</Text>
        </View>
      </View>
    </View>
  );
};

export default function UserHome() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [facilitiesWithDistance, setFacilitiesWithDistance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastFocusTime = useRef(0);

  // FIXED: Use focus effect more intelligently - only refresh if data is stale or first load
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime.current;

      console.log('Home screen focused. Time since last focus:', timeSinceLastFocus, 'ms');

      // Only refresh if:
      // 1. Not initialized yet (first time)
      // 2. Been away for more than 5 minutes (stale data)
      // 3. No data loaded yet
      if (!isInitialized || timeSinceLastFocus > 300000 || facilitiesWithDistance.length === 0) {
        console.log('Refreshing data due to:', {
          notInitialized: !isInitialized,
          staleData: timeSinceLastFocus > 300000,
          noData: facilitiesWithDistance.length === 0,
        });
        refreshData();
      } else {
        console.log('Skipping refresh - data is recent');
      }

      lastFocusTime.current = now;
    }, [isInitialized, facilitiesWithDistance.length])
  );

  useEffect(() => {
    // Initial load only once
    if (!isInitialized) {
      console.log('Initial app load - fetching location and toilets');
      getUserLocation();
      fetchToilets();
    }
  }, [isInitialized]);

  // Fetch toilets from API
  const fetchToilets = async () => {
    try {
      setApiLoading(true);
      console.log('Fetching toilets from API...', BACKEND_URL);

      const response = await fetch(`${BACKEND_URL}/api/toilets`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data.length, 'toilets found');

      if (Array.isArray(data) && data.length > 0) {
        const processedFacilities = data.map((toilet) => ({
          _id: toilet._id,
          name: toilet.name,
          highway: toilet.highway,
          status: toilet.status,
          location: toilet.location,
          type: toilet.type,
          typesString: getTypesAsString(toilet.type),
          accessible: toilet.accessible,
          rating: parseFloat(calculateAverageRating(toilet.reviews)) || 0,
          averageRating: calculateAverageRating(toilet.reviews),
          images: toilet.images || [],
          reviews: toilet.reviews || [],
          complaints: toilet.complaints || [],
          createdBy: toilet.createdBy,
          createdAt: toilet.createdAt,
          amenities: toilet.accessible ? ['Wheelchair Accessible'] : [],
        }));

        console.log('Processed facilities:', processedFacilities.length);
        setFacilitiesWithDistance(processedFacilities);

        // Calculate distances after setting facilities
        if (location?.coords) {
          await calculateDistancesForFacilities(processedFacilities, location);
        }
      } else {
        console.warn('No toilets found or unexpected API response format');
        setFacilitiesWithDistance([]);
      }
    } catch (error) {
      console.error('Error fetching toilets:', error);
      Alert.alert('API Error', `Failed to load toilet facilities: ${error.message}`);
      setFacilitiesWithDistance([]);
    } finally {
      setApiLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      setLoading(true);
      console.log('Getting user location...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to find nearby toilets.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      console.log('Location obtained:', currentLocation.coords);
      setLocation(currentLocation);

      // Calculate distances if facilities are already loaded
      if (facilitiesWithDistance.length > 0) {
        await calculateDistancesForFacilities(facilitiesWithDistance, currentLocation);
      }

      // Get address
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode.length > 0) {
          const first = geocode[0];
          const addressParts = [
            first.name,
            first.street,
            first.streetNumber,
            first.city,
            first.district,
            first.region,
            first.postalCode,
            first.country,
          ].filter(Boolean);

          const formattedAddress = addressParts.join(', ');
          setAddress(formattedAddress || 'Address not available');
        } else {
          setAddress('Address not available');
        }
      } catch (addressError) {
        console.log('Address error:', addressError);
        setAddress('Unable to fetch address');
      }
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location settings.'
      );
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // Calculate distances using Google API
  const calculateDistancesForFacilities = async (facilities, currentLocation) => {
    if (
      !currentLocation?.coords ||
      !GOOGLE_API_KEY ||
      GOOGLE_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY'
    ) {
      console.warn('Missing location or API key for distance calculation');
      setLoading(false);
      return;
    }

    setDistanceLoading(true);
    const origin = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;

    console.log('Calculating distances for', facilities.length, 'facilities');

    try {
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < facilities.length; i += batchSize) {
        batches.push(facilities.slice(i, i + batchSize));
      }

      const facilitiesWithDist = [];

      for (const batch of batches) {
        const destinations = batch
          .map((f) => `${f.location.latitude},${f.location.longitude}`)
          .join('|');

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&key=${GOOGLE_API_KEY}`
          );

          const data = await response.json();

          if (data.status === 'OK') {
            batch.forEach((facility, index) => {
              const element = data.rows[0].elements[index];
              if (element.status === 'OK') {
                facilitiesWithDist.push({
                  ...facility,
                  distance: element.distance.value / 1000,
                  distanceText: element.distance.text,
                  duration: element.duration.value / 60,
                  durationText: element.duration.text,
                  durationInTraffic: element.duration_in_traffic
                    ? element.duration_in_traffic.value / 60
                    : null,
                  durationInTrafficText: element.duration_in_traffic
                    ? element.duration_in_traffic.text
                    : null,
                  isAccurate: true,
                });
              } else {
                facilitiesWithDist.push({
                  ...facility,
                  distanceText: 'Distance unavailable',
                  durationText: 'Time unavailable',
                  isAccurate: false,
                });
              }
            });
          } else {
            batch.forEach((facility) => {
              facilitiesWithDist.push({
                ...facility,
                distanceText: 'Distance unavailable',
                durationText: 'Time unavailable',
                isAccurate: false,
              });
            });
          }
        } catch (batchError) {
          console.error('Batch distance calculation error:', batchError);
          batch.forEach((facility) => {
            facilitiesWithDist.push({
              ...facility,
              distanceText: 'Distance unavailable',
              durationText: 'Time unavailable',
              isAccurate: false,
            });
          });
        }
      }

      // Sort by distance
      facilitiesWithDist.sort((a, b) => {
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });

      setFacilitiesWithDistance(facilitiesWithDist);
      console.log('Distance calculation completed for', facilitiesWithDist.length, 'facilities');
    } catch (error) {
      console.error('Distance calculation error:', error);
      Alert.alert(
        'Distance Calculation Failed',
        'Unable to calculate accurate distances. Please check your internet connection and try again.'
      );
    } finally {
      setDistanceLoading(false);
      setLoading(false);
    }
  };

  const openDirectionsFromList = async (facility) => {
    try {
      const userLat = location?.coords?.latitude || 28.7041;
      const userLng = location?.coords?.longitude || 77.1025;

      const googleMapsUrl = `google.navigation:q=${facility.location.latitude},${facility.location.longitude}`;
      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);

      if (canOpenGoogleMaps) {
        console.log('Opening Google Maps app from list...');
        await Linking.openURL(googleMapsUrl);
      } else {
        const webUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${facility.location.latitude},${facility.location.longitude}`;
        console.log('Opening web Google Maps from list...');
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.log('Error opening maps from list:', error);
      Alert.alert(
        'Navigation Info',
        `Destination: ${facility.name}\nCoordinates: ${facility.location.latitude.toFixed(6)}, ${facility.location.longitude.toFixed(6)}\n\nPlease open your maps app and navigate to these coordinates.`,
        [{ text: 'OK' }]
      );
    }
  };

  const viewToiletDetails = (facility, index) => {
    router.push({
      pathname: '/user/toilet-detail',
      params: {
        id: facility._id,
      },
    });
  };

  const renderToiletImage = (facility) => {
    if (facility.images && facility.images.length > 0 && facility.images[0].data) {
      return (
        <View className="mb-3 overflow-hidden rounded-lg">
          <Image
            source={{ uri: `data:image/jpeg;base64,${facility.images[0].data}` }}
            className="contain h-[120px] w-full "
          />
        </View>
      );
    }
    return null;
  };

  // FIXED: Manual refresh function - forces refresh regardless of timing
  const refreshData = async () => {
    console.log('Manual refresh triggered...');
    setLoading(true);
    setApiLoading(true);
    lastFocusTime.current = Date.now(); // Update timestamp to prevent double refresh
    await getUserLocation();
    await fetchToilets();
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Quick Actions - Show skeleton while loading */}
      {loading ? (
        <QuickActionsSkeleton />
      ) : (
        <View className="px-2">
          <View className="flex-row flex-wrap rounded-xl bg-white pt-3 shadow-sm">
            {/* Enhanced Location Status - 2/5 width, wraps below if needed */}
            <View className="w-1/2 rounded-md bg-green-50 px-2">
              {location?.coords ? (
                <View className="rounded-lg bg-green-50 p-2">
                  <View className="mb-1 flex-row items-center">
                    <Ionicons name="location" size={14} color="#059669" />
                    <Text className="ml-1 font-semibold text-green-800">Location:</Text>
                  </View>
                  <Text className="flex-wrap text-xs text-green-700">
                    {address || 'Fetching address...'}
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-center p-3">
                  <Ionicons name="location-outline" size={14} color="#ef4444" />
                  <Text className="ml-1 text-xs text-red-600">Unavailable</Text>
                </View>
              )}
            </View>
            {/* Action Buttons - 3/5 width */}
            <View className="w-1/2 flex-row justify-around">
              <Pressable className="items-center" onPress={refreshData}>
                <View className="mb-2 rounded-full bg-blue-100 p-3">
                  <Ionicons name="refresh-outline" size={24} color="#2563eb" />
                </View>
                <Text className="text-sm font-medium text-gray-700">Refresh</Text>
              </Pressable>
              <Pressable className="items-center" onPress={() => router.push('/user/report')}>
                <View className="mb-2 rounded-full bg-red-100 p-3">
                  <Ionicons name="alert-circle-outline" size={24} color="#dc2626" />
                </View>
                <Text className="text-sm font-medium text-gray-700">Complaint</Text>
              </Pressable>

              <Pressable className="items-center" onPress={() => router.push('/user/find')}>
                <View className="mb-2 rounded-full bg-green-100 p-3">
                  <Ionicons name="search-outline" size={24} color="#059669" />
                </View>
                <Text className="text-sm font-medium text-gray-700">Search</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Interactive Map - Show skeleton while loading */}
      {loading || !location || facilitiesWithDistance.length === 0 ? (
        <View className="mt-2 px-2">
          <MapSkeleton />
        </View>
      ) : (
        <View className="mt-2 px-2">
          <LeafletMap location={location} facilities={facilitiesWithDistance} />
        </View>
      )}

      {/* Enhanced Facilities List */}
      <View className="mb-2 mt-2 px-2 py-2">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="business" size={18} color="#374151" />
            <Text className="ml-1 px-1 text-lg font-semibold text-gray-800">
              Nearby Facilities ({facilitiesWithDistance.length})
            </Text>
          </View>

          <Pressable onPress={() => router.push('/user/find')} className="flex-row items-center">
            <Text className="font-medium text-blue-600">View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563eb" />
          </Pressable>
        </View>

        {/* Show skeleton while loading or actual data when loaded */}
        {loading || apiLoading ? (
          <>
            {[...Array(3)].map((_, index) => (
              <FacilitySkeleton key={index} index={index} />
            ))}
          </>
        ) : facilitiesWithDistance.length === 0 ? (
          <View className="items-center rounded-lg bg-gray-100 p-6">
            <Ionicons name="business-outline" size={48} color="#9ca3af" />
            <Text className="mt-2 text-center text-gray-600">
              No toilet facilities found. Please try refreshing or check your internet connection.
            </Text>
            <Pressable
              className="mt-4 flex-row items-center rounded-lg bg-blue-500 px-4 py-2"
              onPress={refreshData}>
              <Ionicons name="refresh" size={16} color="white" />
              <Text className="ml-2 font-semibold text-white">Try Again</Text>
            </Pressable>
          </View>
        ) : (
          facilitiesWithDistance.map((facility, index) => (
            <View key={facility._id || index} className="mb-3 rounded-lg bg-white p-2 shadow-sm">
              {/* Toilet Name at Top */}
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <Text className="text-xs font-bold text-white">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-base font-bold text-gray-900">{facility.name}</Text>
              </View>

              {/* Photo Preview with Status Overlay */}
              <View className="flex flex-row">
                {/* Image with Status */}
                <View className="relative w-2/3">
                  <View className="overflow-hidden rounded-lg">{renderToiletImage(facility)}</View>

                  {/* Status Overlay */}
                  <View className="absolute left-2 top-2">
                    <View
                      className={`rounded-full px-3 py-1 ${
                        facility.status === 'Open'
                          ? 'bg-green-500'
                          : facility.status === 'Closed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }`}>
                      <Text className="text-xs font-semibold text-white">{facility.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-1 justify-center gap-1 p-2">
                  <Pressable
                    className="w-full flex-row items-center justify-center rounded-lg bg-green-600 px-4 py-2"
                    onPress={() => viewToiletDetails(facility, index)}>
                    <Text className=" ml-1 font-medium text-white">View</Text>
                  </Pressable>

                  <Pressable
                    className="w-full flex-row items-center justify-center rounded-lg bg-blue-600 px-4 py-2"
                    onPress={() => openDirectionsFromList(facility)}>
                    <Ionicons name="navigate" size={14} color="white" />
                    <Text className="ml-1  font-medium text-white">Navigate</Text>
                  </Pressable>

                  <View className="w-full flex-row items-center justify-center rounded-lg bg-yellow-100 px-3 py-2">
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text className="ml-1  font-semibold text-gray-700">
                      {facility.rating || facility.averageRating || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info Section */}
              <View className="">
                {/* Highway */}
                <View className="mb-2 flex-row items-center">
                  <Text className="mr-2 text-sm text-gray-600">{facility.location.address}</Text>
                  <Ionicons name="car-outline" size={14} color="#6b7280" />
                  <Text className="ml-1 text-sm text-gray-600">{facility.highway}</Text>
                </View>

                <View className="flex flex-row items-center gap-2 space-x-3">
                  {/* Distance and Time */}
                  <View className="flex flex-row items-center justify-center gap-3 rounded-lg bg-blue-50 px-3 py-2">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={14} color="#2563eb" />
                      <Text className="text-sm font-semibold text-blue-700">
                        {distanceLoading ? 'Cal...' : facility.distanceText || 'Cal...'}
                      </Text>
                    </View>

                    <View className="flex-row items-center ">
                      <Ionicons name="time-outline" size={14} color="#059669" />
                      <Text className="text-sm text-green-700">
                        {distanceLoading ? 'Cal...' : facility.durationText || 'Cal...'}
                      </Text>
                    </View>
                  </View>

                  {/* Toilet Types & Accessibility */}
                  <View className="flex flex-row items-center justify-center gap-3 rounded-lg bg-blue-50 px-2 py-2">
                    <View className="gap flex-row items-center">
                      <Ionicons name="people-outline" size={14} color="#7c3aed" />
                      <Text className="text-sm text-purple-600" numberOfLines={2}>
                        {facility.typesString || getTypesAsString(facility.type)}
                      </Text>
                    </View>

                    {facility.accessible && (
                      <View className="gap flex-row items-center">
                        <Ionicons name="accessibility" size={14} color="#059669" />
                        <Text className="text-sm text-green-600">Accessible</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
