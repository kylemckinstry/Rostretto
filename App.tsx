import React from 'react';
import { Platform } from 'react-native';
import RootNavigator from './navigation/RootNavigator'; // Main navigation component
import { CustomAlertProvider } from './components/shared/CustomAlert';

export default function App() {
  // Set document title for web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'Rostretto';
    }
  }, []);

  return (
    <CustomAlertProvider>
      <RootNavigator />
    </CustomAlertProvider>
  );
}