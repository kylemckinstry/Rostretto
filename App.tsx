import * as React from 'react';
// Imports core React Native components (View and Text)
import { View, Text } from 'react-native'; 
import { initializeFirebase } from './services/firebase';
import RootNavigator from './navigation/RootNavigator'; // Assuming this is your root navigator

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Initialises Firebase and Auth services when the app loads
    const setupFirebase = async () => {
      try {
        await initializeFirebase();
      } catch (error) {
        console.error("Failed to set up core services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setupFirebase();
  }, []);

  if (isLoading) {
    // These components are now correctly imported
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
  }

  return <RootNavigator />;
}