// app/index.jsx
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

const languages = {
  en: {
    name: 'English',
    appName: 'NHToilets',
    tagline: 'Smart Toilet Management for National Highways',
    description: 'Find, monitor, and report toilet facilities on Indian National Highways',
    continueText: 'Continue',
    selectLanguage: 'Select Language',
  },
  hi: {
    name: 'हिंदी',
    appName: 'एनएच टॉयलेट्स',
    tagline: 'राष्ट्रीय राजमार्गों के लिए स्मार्ट टॉयलेट प्रबंधन',
    description:
      'भारतीय राष्ट्रीय राजमार्गों पर शौचालय सुविधाओं को खोजें, मॉनिटर करें और रिपोर्ट करें',
    continueText: 'जारी रखें',
    selectLanguage: 'भाषा चुनें',
  },
  te: {
    name: 'తెలుగు',
    appName: 'ఎన్హెచ్ టాయిలెట్స్',
    tagline: 'జాతీయ రహదారుల కోసం స్మార్ట్ టాయిలెట్ నిర్వహణ',
    description:
      'భారతీయ జాతీయ రహదారులపై టాయిలెట్ సౌకర్యాలను కనుగొనండి, పర్యవేక్షించండి మరియు నివేదించండి',
    continueText: 'కొనసాగించు',
    selectLanguage: 'భాష ఎంచుకోండి',
  },
  ta: {
    name: 'தமிழ்',
    appName: 'என்ஹெச் டாய்லெட்ஸ்',
    tagline: 'தேசிய நெடுஞ்சாலைகளுக்கான ஸ்மார்ட் கழிப்பறை மேலாண்மை',
    description:
      'இந்திய தேசிய நெடுஞ்சாலைகளில் கழிப்பறை வசதிகளைக் கண்டறியவும், கண்காணிக்கவும் மற்றும் அறிக்கை செய்யவும்',
    continueText: 'தொடரவும்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
  },
  bn: {
    name: 'বাংলা',
    appName: 'এনএইচ টয়লেট',
    tagline: 'জাতীয় মহাসড়কের জন্য স্মার্ট টয়লেট ব্যবস্থাপনা',
    description: 'ভারতীয় জাতীয় মহাসড়কে টয়লেট সুবিধা খুঁজুন, পর্যবেক্ষণ করুন এবং রিপোর্ট করুন',
    continueText: 'চালিয়ে যান',
    selectLanguage: 'ভাষা নির্বাচন করুন',
  },
  mr: {
    name: 'मराठी',
    appName: 'एनएच टॉयलेट्स',
    tagline: 'राष्ट्रीय महामार्गांसाठी स्मार्ट शौचालय व्यवस्थापन',
    description: 'भारतीय राष्ट्रीय महामार्गांवर शौचालय सुविधा शोधा, निरीक्षण करा आणि अहवाल द्या',
    continueText: 'सुरू ठेवा',
    selectLanguage: 'भाषा निवडा',
  },
  gu: {
    name: 'ગુજરાતી',
    appName: 'એનએચ ટોઇલેટ્સ',
    tagline: 'રાષ્ટ્રીય ધોરીમાર્ગો માટે સ્માર્ટ શૌચાલય વ્યવસ્થાપન',
    description: 'ભારતીય રાષ્ટ્રીય ધોરીમાર્ગો પર શૌચાલય સુવિધાઓ શોધો, મોનિટર કરો અને જાણ કરો',
    continueText: 'ચાલુ રાખો',
    selectLanguage: 'ભાષા પસંદ કરો',
  },
  kn: {
    name: 'ಕನ್ನಡ',
    appName: 'ಎನ್ಎಚ್ ಟಾಯ್ಲೆಟ್ಸ್',
    tagline: 'ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ಶೌಚಾಲಯ ನಿರ್ವಹಣೆ',
    description:
      'ಭಾರತೀಯ ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿಗಳಲ್ಲಿ ಶೌಚಾಲಯ ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ, ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ವರದಿ ಮಾಡಿ',
    continueText: 'ಮುಂದುವರಿಸಿ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
  },
  ml: {
    name: 'മലയാളം',
    appName: 'എൻഎച്ച് ടോയ്‌ലറ്റുകൾ',
    tagline: 'ദേശീയ ഹൈവേകൾക്കായുള്ള സ്മാർട്ട് ടോയ്‌ലറ്റ് മാനേജ്‌മെന്റ്',
    description:
      'ഇന്ത്യൻ ദേശീയ ഹൈവേകളിൽ ടോയ്‌ലറ്റ് സൗകര്യങ്ങൾ കണ്ടെത്തുക, നിരീക്ഷിക്കുക, റിപ്പോർട്ട് ചെയ്യുക',
    continueText: 'തുടരുക',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
  },
  pa: {
    name: 'ਪੰਜਾਬੀ',
    appName: 'ਐੱਨਐੱਚ ਟਾਇਲੇਟਸ',
    tagline: 'ਨੈਸ਼ਨਲ ਹਾਈਵੇਜ਼ ਲਈ ਸਮਾਰਟ ਟਾਇਲੇਟ ਪ੍ਰਬੰਧਨ',
    description: 'ਭਾਰਤੀ ਨੈਸ਼ਨਲ ਹਾਈਵੇਜ਼ ਤੇ ਟਾਇਲੇਟ ਸਹੂਲਤਾਂ ਲੱਭੋ, ਮਾਨੀਟਰ ਕਰੋ ਅਤੇ ਰਿਪੋਰਟ ਕਰੋ',
    continueText: 'ਜਾਰੀ ਰੱਖੋ',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
  },
};

export default function WelcomeScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentLang = languages[selectedLanguage];

  return (
    <ScrollView className="flex-1">
      <View className="min-h-screen flex-1 items-center justify-center bg-blue-600 p-6">
        {/* Language Selector */}
        <View className="absolute right-4 top-12 z-10">
          <Pressable
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            className="min-w-[150px] flex-row items-center justify-between rounded-lg bg-white p-3 shadow-lg">
            <Text className="text-sm font-semibold text-gray-700">{currentLang.name}</Text>
            <Ionicons
              name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#374151"
            />
          </Pressable>

          {isDropdownOpen && (
            <View className="absolute left-0 right-0 top-12 max-h-60 rounded-lg border border-gray-200 bg-white shadow-lg">
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(languages).map(([code, lang]) => (
                  <Pressable
                    key={code}
                    onPress={() => {
                      setSelectedLanguage(code);
                      setIsDropdownOpen(false);
                    }}
                    className={`border-b border-gray-100 p-3 ${selectedLanguage === code ? 'bg-blue-50' : 'bg-white'}`}>
                    <Text
                      className={`text-sm ${selectedLanguage === code ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                      {lang.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* App Logo */}
        <View className="mb-8 items-center">
          <View className="mb-4 rounded-full bg-white p-6 shadow-lg">
            <Ionicons name="business-outline" size={64} color="#2563eb" />
          </View>

          {/* App Name */}
          <Text className="mb-2 text-center text-4xl font-bold text-white">
            {currentLang.appName}
          </Text>

          {/* Tagline */}
          <Text className="mb-4 text-center text-xl font-semibold text-blue-100">
            {currentLang.tagline}
          </Text>

          {/* Description */}
          <Text className="max-w-sm px-4 text-center text-lg leading-6 text-blue-200">
            {currentLang.description}
          </Text>
        </View>

        {/* Features Icons */}
        <View className="mb-8 w-full max-w-md flex-row justify-around px-4">
          <View className="items-center">
            <View className="mb-2 rounded-full bg-blue-500 p-3">
              <Ionicons name="location-outline" size={24} color="white" />
            </View>
            <Text className="text-center text-xs text-blue-200">Find</Text>
          </View>

          <View className="items-center">
            <View className="mb-2 rounded-full bg-blue-500 p-3">
              <Ionicons name="eye-outline" size={24} color="white" />
            </View>
            <Text className="text-center text-xs text-blue-200">Monitor</Text>
          </View>

          <View className="items-center">
            <View className="mb-2 rounded-full bg-blue-500 p-3">
              <Ionicons name="document-text-outline" size={24} color="white" />
            </View>
            <Text className="text-center text-xs text-blue-200">Report</Text>
          </View>

          <View className="items-center">
            <View className="mb-2 rounded-full bg-blue-500 p-3">
              <Ionicons name="star-outline" size={24} color="white" />
            </View>
            <Text className="text-center text-xs text-blue-200">Rate</Text>
          </View>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={() => {
            // Store selected language in AsyncStorage or context here
            router.push('/user');
          }}
          className="rounded-xl bg-white px-12 py-4 shadow-lg active:opacity-75">
          <View className="flex-row items-center">
            <Text className="mr-2 text-xl font-bold text-blue-600">{currentLang.continueText}</Text>
            <Ionicons name="arrow-forward" size={20} color="#2563eb" />
          </View>
        </Pressable>

        {/* NHAI Attribution */}
        <View className="mt-8 items-center">
          <Text className="text-xs font-medium text-blue-300">Powered by NHAI Innovation</Text>
          <View className="mt-1 flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={16} color="#93c5fd" />
            <Text className="ml-1 text-xs text-blue-300">Government of India Initiative</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
