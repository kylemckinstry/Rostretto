import React from 'react';
import { Platform, View } from 'react-native';
import RootNavigator from './navigation/RootNavigator'; // Main navigation component
import { CustomAlertProvider } from './components/shared/CustomAlert';
import SplashScreen from './components/shared/SplashScreen';

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