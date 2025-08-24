// components/UserHeader.jsx
import { View, Text, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex h-20 justify-center  bg-blue-600">
      <View className="px-4 ">
        <View className="flex-row items-center justify-between">
          {/* Logo and App Name */}
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 rounded-xl bg-white p-1">
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/National_Highways_Authority_of_India_logo.svg/1200px-National_Highways_Authority_of_India_logo.svg.png',
                }}
                className="h-10 w-12"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">NHAI Toilets</Text>
              <Text className="text-sm text-white">National Highway Authority of India</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
