import { View, Text, Pressable, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URI;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Helper functions
const getTypesAsString = (types) => (Array.isArray(types) ? types : [types]).join(', ');
const calculateAverageRating = (reviews) => {
  if (!reviews?.length) return 0;
  return (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1);
};

export default function FindToilets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toiletLocations, setToiletLocations] = useState([]);
  const [filteredToilets, setFilteredToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [distancesCalculated, setDistancesCalculated] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  const filters = ['All', 'Open Now', 'Highly Rated', 'Near Me', 'Accessible']; // Initial data loading

  useEffect(() => {
    initializeData();
  }, []); // Filter toilets when data or filters change

  useEffect(() => {
    filterToilets();
  }, [toiletLocations, searchQuery, activeFilter]); // Calculate distances when location and toilets are available

  useEffect(() => {
    if (
      location?.coords &&
      toiletLocations.length > 0 &&
      !distancesCalculated &&
      !distanceLoading
    ) {
      calculateDistances();
    }
  }, [location, toiletLocations, distancesCalculated]); // Removed distanceLoading from dependencies

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([getUserLocation(), fetchToilets()]);
    } catch (error) {
      console.log('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    if (locationPermissionAsked) return;

    try {
      setLocationPermissionAsked(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const fetchToilets = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/toilets`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const processedToilets = data.map((toilet) => ({
          _id: toilet._id,
          name: toilet.name,
          highway: toilet.highway,
          status: toilet.status,
          location: toilet.location,
          type: toilet.type,
          typesString: getTypesAsString(toilet.type),
          accessible: toilet.accessible,
          rating: parseFloat(calculateAverageRating(toilet.reviews)) || 0,
          reviews: toilet.reviews || [],
          images: toilet.images || [],
          createdAt: toilet.createdAt,
          facilities: [
            ...getTypesAsString(toilet.type).split(', '),
            ...(toilet.accessible ? ['Disabled Access'] : []),
          ],
          lastCleaned: getLastCleanedTime(toilet.createdAt),
          distance: null,
          distanceText: 'Calculating...',
          durationText: '',
        }));
        setToiletLocations(processedToilets);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to load toilets: ${error.message}`);
    }
  };

  const calculateDistances = async () => {
    if (!location?.coords || !GOOGLE_API_KEY || distancesCalculated || distanceLoading) {
      return;
    }
    setDistanceLoading(true);

    const origin = `${location.coords.latitude},${location.coords.longitude}`;
    const updatedToilets = [...toiletLocations];

    try {
      const batchSize = 10;
      for (let i = 0; i < updatedToilets.length; i += batchSize) {
        const batch = updatedToilets.slice(i, i + batchSize);
        const destinations = batch
          .map((t) => `${t.location.latitude},${t.location.longitude}`)
          .join('|');

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&units=metric&key=${GOOGLE_API_KEY}`
          );

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();

          if (data.status === 'OK' && data.rows?.[0]?.elements) {
            // ✅ CORE FIX: Access `data.rows[0].elements` to parse the API response correctly.
            data.rows[0].elements.forEach((element, index) => {
              const toiletIndex = i + index;
              if (element.status === 'OK') {
                updatedToilets[toiletIndex] = {
                  ...updatedToilets[toiletIndex],
                  distance: element.distance.value / 1000, // in km
                  distanceText: element.distance.text,
                  durationText: element.duration.text,
                };
              } else {
                updatedToilets[toiletIndex] = {
                  ...updatedToilets[toiletIndex],
                  distanceText: 'Unavailable',
                  durationText: '',
                };
              }
            });
          } else {
            throw new Error(data.error_message || `API Error: ${data.status}`);
          }
        } catch (batchError) {
          console.log(`Batch error from index ${i}:`, batchError);
          batch.forEach((_, index) => {
            const toiletIndex = i + index;
            updatedToilets[toiletIndex] = {
              ...updatedToilets[toiletIndex],
              distanceText: 'Error',
              durationText: '',
            };
          });
        }
      }

      updatedToilets.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      setToiletLocations(updatedToilets);
      setDistancesCalculated(true);
    } catch (error) {
      console.log('Distance calculation error:', error);
      const toiletsWithError = toiletLocations.map((toilet) => ({
        ...toilet,
        distanceText: 'Calculation failed',
        durationText: '',
      }));
      setToiletLocations(toiletsWithError);
    } finally {
      setDistanceLoading(false);
    }
  };

  const refreshLocation = async () => {
    setDistancesCalculated(false);
    setToiletLocations((prevToilets) =>
      prevToilets.map((t) => ({
        ...t,
        distance: null,
        distanceText: 'Calculating...',
        durationText: '',
      }))
    );
    setDistanceLoading(true);

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 1000,
      });
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location.');
      setDistanceLoading(false);
    }
  };

  const getLastCleanedTime = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const filterToilets = () => {
    let filtered = [...toiletLocations];

    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (toilet) =>
          toilet.name.toLowerCase().includes(lowercasedQuery) ||
          toilet.highway.toLowerCase().includes(lowercasedQuery)
      );
    }

    switch (activeFilter) {
      case 'Open Now':
        filtered = filtered.filter((toilet) => toilet.status === 'Open');
        break;
      case 'Highly Rated':
        filtered = filtered.filter((toilet) => toilet.rating >= 4.0);
        break;
      case 'Near Me':
        filtered = filtered.filter((toilet) => toilet.distance && toilet.distance <= 10);
        break;
      case 'Accessible':
        filtered = filtered.filter((toilet) => toilet.accessible);
        break;
    }
    setFilteredToilets(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'text-green-600 bg-green-100';
      case 'Under Maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'Closed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openDirections = async (toilet) => {
    // ✅ FIX: Using a more reliable, cross-platform URL for Google Maps.
    const destLat = toilet.location.latitude;
    const destLng = toilet.location.longitude;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Cannot open maps URL');
      }
    } catch {
      Alert.alert(
        'Navigation Error',
        `Cannot open Google Maps. You can manually navigate to coordinates: ${destLat.toFixed(6)}, ${destLng.toFixed(6)}`
      );
    }
  };

  const viewToiletDetails = (toilet) => {
    router.push({
      pathname: '/user/toilet-detail',
      params: { id: toilet._id },
    });
  };

  // Your original UI and design are unchanged.
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 pb-4">
        <View className="mb-4 flex-row items-center gap-24">
          <Pressable onPress={() => router.back()} className="rounded-full bg-blue-700 p-2">
            <Ionicons name="arrow-back" size={20} color="white" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Find Toilets</Text>
        </View>
        {/* Search Bar */}
        <View className="flex-row items-center rounded-lg bg-white px-4 py-1">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            placeholder="Search by highway or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-gray-800"
          />
          <Pressable
            className={`mr-2 rounded-full p-2 ${distanceLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
            onPress={refreshLocation}
            disabled={distanceLoading}>
            <Ionicons
              name={distanceLoading ? 'refresh' : 'locate-outline'}
              size={16}
              color="white"
              style={distanceLoading ? { transform: [{ rotate: '180deg' }] } : {}}
            />
          </Pressable>
        </View>
        {/* Distance Loading Indicator */}
        {distanceLoading && (
          <View className="mt-2 rounded-lg bg-blue-700 px-3 py-2">
            <Text className="text-center text-xs text-white">
              📍 Calculating distances and travel times...
            </Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-2">
        {/* Loading State */}
        {loading && (
          <View className="mb-4 rounded-xl bg-blue-50 p-4">
            <Text className="text-center font-semibold text-blue-600">
              🚽 Loading toilet facilities...
            </Text>
          </View>
        )}
        {/* Location Status */}
        {!loading && !location && (
          <View className="mb-2 rounded-xl bg-orange-50 p-4">
            <Text className="text-center font-semibold text-orange-600">
              📍 Location access needed for distance calculations
            </Text>
            <Pressable
              className="mt-2 rounded-lg bg-orange-500 px-4 py-2"
              onPress={getUserLocation}>
              <Text className="text-center font-semibold text-white">Enable Location</Text>
            </Pressable>
          </View>
        )}
        {/* Filter Options */}
        <View className="mb-2 flex-row">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter, index) => (
              <Pressable
                key={index}
                className={`mr-3 rounded-full border border-gray-300 px-4 py-2 ${
                  activeFilter === filter ? 'bg-blue-600' : 'bg-white'
                }`}
                onPress={() => setActiveFilter(filter)}>
                <Text
                  className={`${
                    activeFilter === filter ? 'text-white' : 'text-gray-700'
                  } font-medium`}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {/* Results Count */}
        <View className="mb-3">
          <Text className="text-sm text-gray-600">
            {filteredToilets.length} facilities found
            {searchQuery && ` for "${searchQuery}"`}
          </Text>
        </View>
        {/* Toilet Locations */}
        {filteredToilets.length === 0 && !loading ? (
          <View className="rounded-xl bg-gray-100 p-6">
            <Text className="text-center text-gray-600">
              {searchQuery || activeFilter !== 'All'
                ? 'No facilities match your search criteria.'
                : 'No toilet facilities found.'}
            </Text>
            {(searchQuery || activeFilter !== 'All') && (
              <Pressable
                className="mt-4 rounded-lg bg-blue-500 px-4 py-2"
                onPress={() => {
                  setSearchQuery('');
                  setActiveFilter('All');
                }}>
                <Text className="text-center font-semibold text-white">Clear Filters</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredToilets.map((toilet) => (
            <View key={toilet._id} className="mb-4 rounded-xl bg-white p-4 shadow-lg">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">{toilet.name}</Text>
                  <Text className="text-sm text-gray-600">
                    {toilet.highway} • {toilet.distanceText}
                    {toilet.durationText &&
                      toilet.durationText !== 'Calculating...' &&
                      toilet.durationText !== 'Location needed' &&
                      ` • ${toilet.durationText}`}
                  </Text>
                </View>
                <View className={`rounded-full px-3 py-1 ${getStatusColor(toilet.status)}`}>
                  <Text className="text-xs font-medium">{toilet.status}</Text>
                </View>
              </View>
              {/* Rating and Last Cleaned */}
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className={`ml-1 font-semibold ${getRatingColor(toilet.rating)}`}>
                    {toilet.rating > 0 ? toilet.rating : 'N/A'}
                  </Text>
                  <Text className="ml-1 text-gray-500">/5</Text>
                  <Text className="ml-2 text-xs text-gray-500">
                    ({toilet.reviews.length} review
                    {toilet.reviews.length !== 1 ? 's' : ''})
                  </Text>
                </View>
                <Text className="text-xs text-gray-500">Added: {toilet.lastCleaned}</Text>
              </View>
              {/* Facilities */}
              <View className="mb-2">
                <Text className="mb-2 font-medium text-gray-700">Facilities:</Text>
                <View className="flex-row flex-wrap">
                  {toilet.facilities.slice(0, 4).map((facility, index) => (
                    <View key={index} className="mb-1 mr-2 rounded-full bg-blue-100 px-2 py-1">
                      <Text className="text-xs text-blue-700">{facility}</Text>
                    </View>
                  ))}
                  {toilet.facilities.length > 4 && (
                    <View className="mb-1 mr-2 rounded-full bg-gray-100 px-2 py-1">
                      <Text className="text-xs text-gray-600">
                        +{toilet.facilities.length - 4} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {/* Actions */}
              <View className="flex-row justify-between">
                <Pressable
                  className="mr-2 flex-1 rounded-lg bg-blue-600 py-3"
                  onPress={() => openDirections(toilet)}>
                  <Text className="text-center font-semibold text-white">Get Directions</Text>
                </Pressable>
                <Pressable
                  className="rounded-lg bg-green-500 px-4 py-3"
                  onPress={() => viewToiletDetails(toilet)}>
                  <Text className="text-center font-semibold text-white">View Details</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
