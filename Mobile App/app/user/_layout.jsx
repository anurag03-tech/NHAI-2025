// app/user/_layout.jsx
import { Stack } from 'expo-router';
import { View } from 'react-native';
import UserHeader from '../../components/UserHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function UserLayout() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="#2563eb" />
      <UserHeader />
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" />
          <Stack.Screen name="find" />
          <Stack.Screen name="report" />
        </Stack>
      </View>
    </SafeAreaView>
  );
}
