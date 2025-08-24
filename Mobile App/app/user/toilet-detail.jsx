// app/user/toilet-detail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Linking,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URI;

// Skeleton Components
const SkeletonBox = ({ width = '100%', height = 20, className = '' }) => (
  <View className={`rounded bg-gray-200 ${className}`} style={{ width, height }} />
);

const ImageSkeleton = () => (
  <View className="mb-2 bg-white">
    <SkeletonBox height={200} className="rounded-none" />
    <View className="flex-row items-center p-2">
      <SkeletonBox width={16} height={16} className="mr-1 rounded-full" />
      <SkeletonBox width={80} height={14} />
    </View>
  </View>
);

const BasicInfoSkeleton = () => (
  <View className="mb-2 bg-white p-4">
    <View className="mb-2 flex-row items-center justify-between">
      <View className="flex-1">
        {/* Rating skeleton */}
        <View className="mb-2 flex-row items-center">
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBox key={i} width={16} height={16} className="mr-1 rounded-full" />
            ))}
          </View>
          <SkeletonBox width={60} height={16} className="ml-2" />
        </View>

        {/* Address skeleton */}
        <View className="mb-1 flex-row items-center">
          <SkeletonBox width={16} height={16} className="mr-1 rounded-full" />
          <SkeletonBox width="80%" height={14} />
        </View>

        {/* Highway skeleton */}
        <View className="flex-row items-center">
          <SkeletonBox width={16} height={16} className="mr-1 rounded-full" />
          <SkeletonBox width="60%" height={14} />
        </View>
      </View>

      {/* Status skeleton */}
      <SkeletonBox width={60} height={24} className="rounded-full" />
    </View>

    {/* Amenities skeleton */}
    <View className="mt-3">
      <SkeletonBox width={60} height={16} className="mb-2" />
      <View className="flex-row flex-wrap">
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} width={80} height={24} className="mb-1 mr-2 rounded" />
        ))}
      </View>
    </View>

    {/* Action buttons skeleton */}
    <View className="mt-4 flex-row space-x-2">
      <SkeletonBox width="48%" height={48} className="rounded-lg" />
      <SkeletonBox width="48%" height={48} className="rounded-lg" />
    </View>
  </View>
);

const ReviewsSkeleton = () => (
  <View className="mb-2 bg-white p-4">
    {/* Header skeleton */}
    <View className="mb-4 flex-row items-center">
      <SkeletonBox width={20} height={20} className="mr-2 rounded-full" />
      <SkeletonBox width={120} height={20} />
    </View>

    {/* Review items skeleton */}
    {[1, 2, 3].map((i) => (
      <View key={i} className="mb-4 border-b border-gray-100 pb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <SkeletonBox width={20} height={20} className="mr-1 rounded-full" />
            <SkeletonBox width={100} height={16} />
          </View>
          <View className="flex-row items-center">
            {[1, 2, 3, 4, 5].map((j) => (
              <SkeletonBox key={j} width={16} height={16} className="mr-1 rounded-full" />
            ))}
          </View>
        </View>
        <SkeletonBox width="90%" height={14} className="mb-1" />
        <SkeletonBox width="70%" height={14} className="mb-2" />

        {/* Photo skeleton */}
        <View className="flex-row">
          <SkeletonBox width={150} height={100} className="mr-2 rounded-lg" />
          <SkeletonBox width={150} height={100} className="rounded-lg" />
        </View>

        {/* Date skeleton */}
        <View className="mt-2 flex-row items-center">
          <SkeletonBox width={12} height={12} className="mr-1 rounded-full" />
          <SkeletonBox width={80} height={12} />
        </View>
      </View>
    ))}
  </View>
);

const WriteReviewSkeleton = () => (
  <View className="mb-6 bg-white p-4">
    {/* Header skeleton */}
    <View className="mb-4 flex-row items-center">
      <SkeletonBox width={20} height={20} className="mr-2 rounded-full" />
      <SkeletonBox width={120} height={20} />
    </View>

    {/* Username skeleton */}
    <View className="mb-3 flex-row items-center rounded-lg bg-gray-50 p-3">
      <SkeletonBox width={16} height={16} className="mr-2 rounded-full" />
      <SkeletonBox width={150} height={16} />
    </View>

    {/* Rating skeleton */}
    <View className="mb-3">
      <SkeletonBox width={80} height={16} className="mb-2" />
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox key={i} width={28} height={28} className="mr-2 rounded-full" />
        ))}
      </View>
    </View>

    {/* Review text skeleton */}
    <View className="mb-3">
      <SkeletonBox width={80} height={16} className="mb-2" />
      <SkeletonBox width="100%" height={80} className="rounded-lg" />
    </View>

    {/* Photo section skeleton */}
    <View className="mb-4">
      <SkeletonBox width={120} height={16} className="mb-2" />
      <SkeletonBox width="100%" height={60} className="rounded-lg border-2 border-dashed" />
    </View>

    {/* Submit button skeleton */}
    <SkeletonBox width="100%" height={48} className="rounded-lg" />
  </View>
);

const LoadingSkeleton = () => (
  <ScrollView className="flex-1 bg-gray-50">
    {/* Header skeleton */}
    <View className="border-b border-gray-200 bg-white px-4 py-3">
      <View className="flex-row items-center">
        <SkeletonBox width={24} height={24} className="mr-4 rounded-full" />
        <SkeletonBox width={200} height={20} />
      </View>
    </View>

    {/* Image skeleton */}
    <ImageSkeleton />

    {/* Basic info skeleton */}
    <BasicInfoSkeleton />

    {/* Reviews skeleton */}
    <ReviewsSkeleton />

    {/* Write review skeleton */}
    <WriteReviewSkeleton />
  </ScrollView>
);

export default function ToiletDetail() {
  const params = useLocalSearchParams();
  const [toiletData, setToiletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [storedUsername, setStoredUsername] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewPhoto, setReviewPhoto] = useState(null);

  // Complaint Modal States
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complaintPhone, setComplaintPhone] = useState('');
  const [complaintUsername, setComplaintUsername] = useState('');

  const { id } = params;

  useEffect(() => {
    fetchToiletDetails();
    initializeUsername();
  }, []);

  // Generate random username in format "user + 9-digit number"
  const generateRandomUsername = () => {
    const randomNumber = Math.floor(100000000 + Math.random() * 900000000); // 9-digit number
    return `user${randomNumber}`;
  };

  // Initialize username - generate if doesn't exist, load if exists
  const initializeUsername = async () => {
    try {
      let username = await AsyncStorage.getItem('username');

      if (!username) {
        // Generate new random username
        username = generateRandomUsername();
        await AsyncStorage.setItem('username', username);
        console.log('Generated new username:', username);
      }

      setStoredUsername(username);
      setComplaintUsername(username);
    } catch (error) {
      console.log('Error initializing username:', error);
      // Fallback: generate username without saving
      const fallbackUsername = generateRandomUsername();
      setStoredUsername(fallbackUsername);
      setComplaintUsername(fallbackUsername);
    }
  };

  // Single API call for toilet details (includes reviews)
  const fetchToiletDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/toilets/${id}`);
      setToiletData(response.data);
    } catch (error) {
      console.error('Error fetching toilet details:', error);
      Alert.alert('Error', 'Failed to load toilet details');
    } finally {
      setLoading(false);
    }
  };

  const saveUsername = async (username) => {
    try {
      await AsyncStorage.setItem('username', username);
      setStoredUsername(username);
    } catch (error) {
      console.log('Error saving username:', error);
    }
  };

  const openDirections = async () => {
    if (!toiletData?.location) {
      Alert.alert('Error', 'Location not available');
      return;
    }
    try {
      const { latitude, longitude } = toiletData.location;
      const googleMapsUrl = `google.navigation:q=${latitude},${longitude}`;
      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
      if (canOpenGoogleMaps) {
        await Linking.openURL(googleMapsUrl);
      } else {
        const webUrl = `https://www.google.com/maps/dir//${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open directions');
    }
  };

  const openComplaintModal = () => {
    if (storedUsername) {
      setComplaintUsername(storedUsername);
    }
    setComplaintModalVisible(true);
  };

  const takePhoto = async () => {
    if (!storedUsername.trim()) {
      Alert.alert('Error', 'Username not available');
      return;
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        setReviewPhoto(result.assets[0]);
        Alert.alert('Success', 'Photo added! Submit your review to save it.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Convert image to base64
  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // POST method for submitting reviews using axios
  const submitReview = async () => {
    if (!newReview.trim() || !storedUsername.trim()) {
      Alert.alert('Error', 'Please enter your review');
      return;
    }
    try {
      let photos = [];

      // Convert photo to base64 if exists
      if (reviewPhoto) {
        const base64Image = await convertImageToBase64(reviewPhoto.uri);
        if (base64Image) {
          photos = [base64Image];
        }
      }

      const reviewData = {
        toilet: id, // Use the toilet ID from params
        username: storedUsername,
        rating: newRating,
        comment: newReview,
        photos: photos, // Array of base64 images
      };

      const response = await axios.post(`${BACKEND_URL}/api/reviews`, reviewData);

      if (response.status === 200 || response.status === 201) {
        // Refresh toilet data to get updated reviews
        await fetchToiletDetails();
        setNewReview('');
        setNewRating(5);
        setReviewPhoto(null);
        Alert.alert('Success', 'Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    }
  };

  const submitComplaint = async () => {
    if (!complaintText.trim() || !complaintPhone.trim() || !complaintUsername.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(complaintPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const complaintData = {
        toilet: id, // Changed from 'toiletId' to 'toilet'
        username: complaintUsername,
        mobile: complaintPhone, // Changed from 'phone' to 'mobile'
        description: complaintText, // Changed from 'complaint' to 'description'
      };

      const response = await axios.post(`${BACKEND_URL}/api/complaints`, complaintData);

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          'Complaint Submitted',
          `Thank you ${complaintUsername}! Your complaint has been submitted with ID: ${response.data._id}. Status: ${response.data.status}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setComplaintText('');
                setComplaintPhone('');
                setComplaintUsername(storedUsername || '');
                setComplaintModalVisible(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const removePhoto = () => {
    setReviewPhoto(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={16} color="#fbbf24" />
    ));
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round(totalRating / reviews.length);
  };

  // Show skeleton loading screen
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!toiletData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-2 text-center text-red-600">Failed to load toilet details</Text>
        <Pressable className="mt-4 rounded-lg bg-blue-600 px-6 py-3" onPress={fetchToiletDetails}>
          <View className="flex-row items-center">
            <Ionicons name="refresh" size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Retry</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // Get reviews from toiletData (single API response)
  const allReviews = toiletData.reviews || [];
  const averageRating = calculateAverageRating(allReviews);
  const mainImage = toiletData.images?.[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="ml-4 text-lg font-semibold text-gray-800">{toiletData.name}</Text>
          </View>
        </View>

        {/* Official Photo */}
        {mainImage && (
          <View className=" bg-white">
            <Image
              source={{ uri: `data:image/jpeg;base64,${mainImage.data}` }}
              style={{ width: '100%', height: 240 }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Basic Info */}
        <View className="mb-2 bg-white p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center">
                {renderStars(averageRating)}
                <Text className="ml-2 text-gray-600">{averageRating || 'No rating'}</Text>
              </View>
              {toiletData.location?.address && (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text className="ml-1 text-gray-600">{toiletData.location.address}</Text>
                </View>
              )}
              {toiletData.highway && (
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="car-outline" size={16} color="#6b7280" />
                  <Text className="ml-1 text-gray-600">Highway: {toiletData.highway}</Text>
                </View>
              )}
            </View>
            <View
              className={`rounded-full px-3 py-1 ${
                toiletData.status === 'Open' ? 'bg-green-100' : 'bg-red-100'
              }`}>
              <Text
                className={`text-sm font-medium ${
                  toiletData.status === 'Open' ? 'text-green-600' : 'text-red-600'
                }`}>
                {toiletData.status}
              </Text>
            </View>
          </View>

          {/* Amenities */}
          {toiletData.type && toiletData.type.length > 0 && (
            <View className="mt-3">
              <Text className="mb-2 text-sm font-medium text-gray-800">Available:</Text>
              <View className="flex-row flex-wrap">
                {toiletData.type.map((type, index) => (
                  <View
                    key={index}
                    className="mb-1 mr-2 flex-row items-center rounded bg-gray-100 px-2 py-1">
                    <Ionicons name="checkmark-circle" size={12} color="#059669" />
                    <Text className="text ml-1 text-gray-700">{type}</Text>
                  </View>
                ))}
                {toiletData.accessible && (
                  <View className="mb-1 mr-2 flex-row items-center rounded bg-green-100 px-2 py-1">
                    <Ionicons name="accessibility" size={12} color="#059669" />
                    <Text className="ml-1 text-xs text-green-700">Accessible</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-4 flex-row gap-1 space-x-2">
            <Pressable className="flex-1  rounded-lg bg-blue-600 py-3" onPress={openDirections}>
              <View className="flex-row items-center justify-center">
                <Ionicons name="navigate" size={20} color="white" />
                <Text className="ml-2 font-semibold text-white">Directions</Text>
              </View>
            </Pressable>
            <Pressable className="flex-1 rounded-lg bg-red-600 py-3" onPress={openComplaintModal}>
              <View className="flex-row items-center justify-center">
                <Ionicons name="warning" size={20} color="white" />
                <Text className="ml-2 font-semibold text-white">Complaint</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Reviews Section */}
        <View className=" bg-white px-4">
          <View className="mb-4 flex-row items-center">
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              Reviews ({allReviews.length})
            </Text>
          </View>
          {allReviews.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
              <Text className="mt-2 text-center text-gray-500">
                No reviews yet. Be the first to review!
              </Text>
            </View>
          ) : (
            allReviews.map((review, index) => (
              <View key={review._id || index} className="mb-2 border-b border-gray-100 pb-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="person-circle" size={20} color="#6b7280" />
                    <Text className="ml-1 font-semibold text-gray-800">@{review.username}</Text>
                  </View>
                  <View className="flex-row items-center">
                    {renderStars(review.rating)}
                    <Text className="ml-1 text-sm text-gray-600">{review.rating}</Text>
                  </View>
                </View>
                <Text className="mb-2 text-gray-700">{review.comment}</Text>
                {review.photos && review.photos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {review.photos.map((photo, photoIndex) => (
                      <Image
                        key={photoIndex}
                        source={{ uri: `data:image/jpeg;base64,${photo}` }}
                        style={{ width: 150, height: 100, marginRight: 8 }}
                        className="rounded-lg"
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                  <Text className="ml-1 text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Enhanced Write Review Section */}
        <View className="mb-6 bg-white p-4">
          <View className="mb-4 flex-row items-center">
            <Ionicons name="create" size={20} color="#3b82f6" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Write a Review</Text>
          </View>

          {/* Show current username */}
          <View className="mb-3 flex-row items-center rounded-lg bg-blue-50 p-3">
            <Ionicons name="person" size={16} color="#3b82f6" />
            <Text className="ml-2 text-sm text-blue-800">
              Reviewing as: <Text className="font-semibold">@{storedUsername}</Text>
            </Text>
          </View>

          {/* Rating */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-medium text-gray-800">Your Rating:</Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setNewRating(star)}>
                  <Ionicons
                    name={star <= newRating ? 'star' : 'star-outline'}
                    size={28}
                    color="#fbbf24"
                    style={{ marginRight: 8 }}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Enhanced Review Text Input */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-medium text-gray-800">Your Review:</Text>
            <TextInput
              className="rounded-lg border border-gray-300 p-3"
              placeholder="Share your experience..."
              placeholderTextColor="#9CA3AF"
              value={newReview}
              onChangeText={setNewReview}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                color: '#1F2937',
                fontSize: 16,
                lineHeight: 20,
                minHeight: 100,
              }}
              autoCorrect={true}
              autoCapitalize="sentences"
            />
          </View>

          {/* Photo Section */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-800">Add Photo (Optional):</Text>
            {reviewPhoto ? (
              <View className="relative">
                <Image
                  source={{ uri: reviewPhoto.uri }}
                  style={{ width: '100%', height: 150 }}
                  className="rounded-lg"
                  resizeMode="cover"
                />
                <Pressable
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-2"
                  onPress={removePhoto}>
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                className="flex-row items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-4"
                onPress={takePhoto}>
                <Ionicons name="camera-outline" size={24} color="#6b7280" />
                <Text className="ml-2 text-gray-600">Take Photo</Text>
              </Pressable>
            )}
          </View>

          {/* Submit Button */}
          <Pressable className="rounded-lg bg-blue-600 py-3" onPress={submitReview}>
            <View className="flex-row items-center justify-center">
              <Ionicons name="send" size={16} color="white" />
              <Text className="ml-2 text-center font-semibold text-white">Submit Review</Text>
            </View>
          </Pressable>
        </View>

        {/* Enhanced Complaint Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={complaintModalVisible}
          onRequestClose={() => setComplaintModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <View className="flex-1 items-center justify-center bg-black/50">
              <View className="mx-4 w-80 rounded-lg bg-white p-6">
                <View className="mb-4 flex-row items-center justify-center">
                  <Ionicons name="warning" size={24} color="#ef4444" />
                  <Text className="ml-2 text-center text-lg font-semibold text-gray-800">
                    Submit Complaint
                  </Text>
                </View>

                {/* Show username */}
                <View className="mb-4 flex-row items-center">
                  <Ionicons name="person" size={16} color="#6b7280" />
                  <Text className="ml-2 text-sm text-gray-600">
                    Reporting as: <Text className="font-semibold">@{storedUsername}</Text>
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium text-gray-800">Phone Number:</Text>
                  <View className="flex-row items-center rounded-lg border border-gray-300 px-3">
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <TextInput
                      className="ml-2 flex-1 py-3"
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9CA3AF"
                      value={complaintPhone}
                      onChangeText={setComplaintPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={{ color: '#1F2937' }}
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium text-gray-800">
                    Describe the Issue:
                  </Text>
                  <View className="rounded-lg border border-gray-300 px-3 pt-2">
                    <TextInput
                      className="h-20"
                      placeholder="Please provide details about the issue..."
                      placeholderTextColor="#9CA3AF"
                      value={complaintText}
                      onChangeText={setComplaintText}
                      multiline
                      textAlignVertical="top"
                      style={{
                        color: '#1F2937',
                        fontSize: 16,
                        lineHeight: 20,
                      }}
                    />
                  </View>
                </View>

                <View className="flex-row space-x-2">
                  <Pressable
                    className="flex-1 rounded-lg bg-red-600 py-3"
                    onPress={submitComplaint}>
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="send" size={16} color="white" />
                      <Text className="ml-2 text-center font-semibold text-white">Submit</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    className="flex-1 rounded-lg bg-gray-300 py-3"
                    onPress={() => setComplaintModalVisible(false)}>
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="close" size={16} color="#374151" />
                      <Text className="ml-2 text-center font-semibold text-gray-700">Cancel</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
