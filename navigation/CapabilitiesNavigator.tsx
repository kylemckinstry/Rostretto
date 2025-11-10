import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CapabilitiesScreen from '../screens/CapabilitiesScreen';
import EmployeeScreen from '../screens/EmployeeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Stack = createNativeStackNavigator();

export default function CapabilitiesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CapabilitiesMain"
        component={CapabilitiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Employee"
        component={EmployeeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}