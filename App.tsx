import React from 'react';
import { Platform, View } from 'react-native';
import RootNavigator from './navigation/RootNavigator'; // Main navigation component
import { CustomAlertProvider } from './components/shared/CustomAlert';
import SplashScreen from './components/shared/SplashScreen';
import Constants from 'expo-constants';

// CRITICAL DEBUG LOGGING - This runs immediately on app start
console.log('========================================');
console.log('🚀 APP STARTING - CRITICAL DEBUG INFO');
console.log('========================================');
console.log('Platform:', Platform.OS);
console.log('');
console.log('Constants.expoConfig?.extra:');
console.log(JSON.stringify(Constants.expoConfig?.extra, null, 2));
console.log('');
console.log('Key Environment Variables:');
console.log('  EXPO_PUBLIC_USE_API:', Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API);
console.log('  Type:', typeof Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API);
console.log('  EXPO_PUBLIC_API_BASE_URL:', Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL);
console.log('');
console.log('USE_API Computation:');
const USE_API_TEST = Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API === 'true' || Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API === true;
console.log('  Result:', USE_API_TEST);
console.log('  === "true":', Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API === 'true');
console.log('  === true:', Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API === true);
console.log('========================================');

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  // Set document title for web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'Rostretto';
    }
  }, []);

  // Simulate app initialisation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <CustomAlertProvider>
      <RootNavigator />
    </CustomAlertProvider>
  );
}