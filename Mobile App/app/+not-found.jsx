// app/+not-found.jsx

import { Link, Stack } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      {/* This sets the title for the screen in the header */}
      <Stack.Screen options={{ title: 'Oops!' }} />

      <View className="flex-1 items-center justify-center bg-white p-5">
        <Text className="text-2xl font-bold">This screen doesn't exist.</Text>

        {/* Use the Link component to navigate back to the home screen. */}
        <Link href="/" className="mt-4 rounded-md bg-blue-500 px-5 py-3">
          <Text className="font-bold text-white">Go to Home Screen</Text>
        </Link>
      </View>
    </>
  );
}
