// app/user/my-complaints.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, ScrollView, Pressable, Alert, RefreshControl, Image } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URI;

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    initializeUsername();
  }, []);

  useEffect(() => {
    if (username) {
      fetchComplaints();
    }
  }, [username]);

  // Generate random username in format "user + 9-digit number"
  const generateRandomUsername = () => {
    const randomNumber = Math.floor(100000000 + Math.random() * 900000000); // 9-digit number
    return `user${randomNumber}`;
  };

  // Initialize username - generate if doesn't exist, load if exists
  const initializeUsername = async () => {
    try {
      let storedUsername = await AsyncStorage.getItem('username');

      if (!storedUsername) {
        // Generate new random username
        storedUsername = generateRandomUsername();
        await AsyncStorage.setItem('username', storedUsername);
        console.log('Generated new username:', storedUsername);
      } else {
        console.log('Loaded existing username:', storedUsername);
      }

      setUsername(storedUsername);
    } catch (error) {
      console.error('Error initializing username:', error);
      // Fallback: generate username without saving
      const fallbackUsername = generateRandomUsername();
      setUsername(fallbackUsername);
      Alert.alert('Info', 'Using temporary username for this session');
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/complaints/user/${username}`);
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Alert.alert('Error', 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'resolved':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'resolved':
        return 'checkmark-circle-outline';
      case 'in-progress':
        return 'refresh-outline';
      case 'rejected':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  // Loading screen with username initialization
  if (loading && !refreshing && !username) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
          <View className="mb-4 rounded-full bg-blue-50 p-4">
            <Ionicons name="person-add-outline" size={32} color="#3b82f6" />
          </View>
          <Text className="text-lg font-medium text-gray-700">Setting up your profile...</Text>
          <Text className="mt-1 text-sm text-gray-500">Initializing username</Text>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
          <View className="mb-4 rounded-full bg-blue-50 p-4">
            <Ionicons name="hourglass-outline" size={32} color="#3b82f6" />
          </View>
          <Text className="text-lg font-medium text-gray-700">Loading your complaints...</Text>
          <Text className="mt-1 text-sm text-gray-500">Please wait a moment</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 rounded-full p-2 active:bg-gray-100">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">My Complaints</Text>
            <Text className="text-sm text-gray-500">@{username}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }>
        {/* Stats Card */}
        <View className="mx-4 my-2 rounded-2xl bg-blue-100 px-4 py-3 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-800">{complaints.length}</Text>
              <Text className="text-gray-500">Total Complaints</Text>
            </View>
            <View className="items-end space-y-1">
              <View className="flex-row items-center">
                <View className="mr-2 h-2 w-2 rounded-full bg-amber-400"></View>
                <Text className="text-sm text-gray-600">
                  {complaints.filter((c) => c.status.toLowerCase() === 'pending').length} Pending
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="mr-2 h-2 w-2 rounded-full bg-emerald-400"></View>
                <Text className="text-sm text-gray-600">
                  {complaints.filter((c) => c.status.toLowerCase() === 'resolved').length} Resolved
                </Text>
              </View>
            </View>
          </View>
        </View>

        {complaints.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
              <View className="mb-4 rounded-full bg-gray-50 p-6">
                <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              </View>
              <Text className="mb-2 text-xl font-semibold text-gray-700">No Complaints Yet</Text>
              <Text className="max-w-sm text-center text-gray-500">
                You haven't submitted any complaints. When you do, they'll appear here.
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-2 pb-4">
            {complaints.map((complaint, index) => (
              <View key={complaint._id} className="mb-4 rounded-2xl bg-white shadow-sm">
                {/* Header */}
                <View className="p-4 pb-2">
                  <View className="mb-3 flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                      <Text className="mb-2 text-lg font-bold text-gray-800">
                        {complaint.toilet.name}
                      </Text>
                      <View className="mb-1 flex-row items-center">
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text className="ml-1 flex-1 text-sm text-gray-600">
                          {complaint.toilet.location?.address}
                        </Text>
                      </View>
                      {complaint.toilet.highway && (
                        <View className="flex-row items-center">
                          <Ionicons name="car-outline" size={16} color="#6b7280" />
                          <Text className="ml-1 text-sm text-gray-600">
                            Highway: {complaint.toilet.highway}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Status Badge */}
                    <View
                      className={`flex-row items-center rounded-xl border px-3 py-2 ${getStatusColor(complaint.status)}`}>
                      <Ionicons
                        name={getStatusIcon(complaint.status)}
                        size={14}
                        color={
                          getStatusColor(complaint.status).includes('amber')
                            ? '#b45309'
                            : getStatusColor(complaint.status).includes('emerald')
                              ? '#047857'
                              : getStatusColor(complaint.status).includes('blue')
                                ? '#1d4ed8'
                                : getStatusColor(complaint.status).includes('red')
                                  ? '#dc2626'
                                  : '#374151'
                        }
                      />
                      <Text
                        className={`ml-1 text-xs font-medium capitalize ${getStatusColor(complaint.status).split(' ')[2]}`}>
                        {complaint.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Content */}
                <View className="px-4">
                  <View className="flex-row space-x-3">
                    {/* Toilet Image */}
                    {complaint.toilet.images && complaint.toilet.images.length > 0 && (
                      <View className="w-1/2">
                        <Image
                          source={{
                            uri: `data:image/jpeg;base64,${complaint.toilet.images[0].data}`,
                          }}
                          className="h-32 w-full rounded-xl"
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    {/* Complaint Details */}
                    <View className="mx-1 flex-1 rounded-xl bg-red-50 p-3">
                      <View className="mb-2 flex-row items-center">
                        <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                        <Text className="ml-1 font-semibold text-red-700">Complaint</Text>
                      </View>
                      <Text className="text-sm leading-5 text-red-600">
                        {complaint.description}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Footer */}
                <View className="p-4 pt-3">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color="#6b7280" />
                      <Text className="ml-1 text-xs text-gray-600">
                        {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={14} color="#6b7280" />
                      <Text className="ml-1 text-xs text-gray-600">{complaint.mobile}</Text>
                    </View>
                  </View>

                  {/* Complaint ID */}
                  <View className="rounded-lg bg-blue-50 px-3 py-2">
                    <Text className="font-mono text-xs text-blue-700">ID: {complaint._id}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
