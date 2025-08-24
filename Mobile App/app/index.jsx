import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function WelcomeScreen() {
  return (
    <ScrollView className="flex-1">
      <View className="min-h-screen flex-1 items-center justify-center bg-gray-100 p-6">
        {/* App Logo */}
        <View className="mb-12 items-center">
          <View className="mb-6 rounded-full border border-blue-100 bg-blue-50 p-4">
            <Image
              source={require('../assets/icon.png')}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>

          {/* App Name */}
          <Text className="mb-3 text-center text-3xl font-bold text-gray-800">NHAI Toilets</Text>

          {/* Tagline */}
          <Text className="mb-4 text-center text-lg font-medium text-gray-600">
            Smart Toilet Management
          </Text>

          {/* Description */}
          <Text className="max-w-sm px-2 text-center text-base leading-6 text-gray-500">
            Find, rate, and report toilet facilities on Indian National Highways
          </Text>
        </View>

        {/* Features Icons */}
        <View className="mb-12 w-full max-w-xs flex-row justify-around">
          <View className="items-center">
            <View className="mb-3 rounded-full bg-blue-100 p-4">
              <Ionicons name="location-outline" size={24} color="#2563eb" />
            </View>
            <Text className="text-center text-sm font-medium text-gray-600">Find</Text>
          </View>

          <View className="items-center">
            <View className="mb-3 rounded-full bg-blue-100 p-4">
              <Ionicons name="document-text-outline" size={24} color="#2563eb" />
            </View>
            <Text className="text-center text-sm font-medium text-gray-600">Report</Text>
          </View>

          <View className="items-center">
            <View className="mb-3 rounded-full bg-blue-100 p-4">
              <Ionicons name="star-outline" size={24} color="#2563eb" />
            </View>
            <Text className="text-center text-sm font-medium text-gray-600">Rate</Text>
          </View>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={() => {
            router.push('/user');
          }}
          className="rounded-lg bg-blue-600 px-16 py-4 active:opacity-75">
          <View className="flex-row items-center">
            <Text className="mr-2 text-lg font-semibold text-white">Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </Pressable>

        {/* NHAI Attribution */}
        <View className="mt-12 items-center">
          <Text className="text-sm font-medium text-gray-500">NHAI Innovation Hackathon 2025</Text>
        </View>
      </View>
    </ScrollView>
  );
}
