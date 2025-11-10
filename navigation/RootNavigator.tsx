import * as React from 'react';
import { Image, View, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../components/Header';
import SchedulerScreen from '../screens/SchedulerScreen';
import CapabilitiesNavigator from './CapabilitiesNavigator';
import FairnessScreen from '../screens/FairnessScreen';
import EmployeeScreen from '../screens/EmployeeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import { colours } from '../theme/colours';

// SVG icons for tab navigation
import CalendarIcon from '../assets/calendar.svg';
import TeamIcon from '../assets/team.svg';
import FairnessIcon from '../assets/fairness.svg';
import RostrettoLogo from '../assets/Rostretto-logo.svg';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomHeader() {
  const insets = useSafeAreaInsets();
  
  // Only shows custom header on mobile platforms
  if (Platform.OS === 'web') {
    return null;
  }
  
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colours.bg.canvas }}>
      <Header logoComponent={RostrettoLogo} />
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : undefined,
        tabBarActiveTintColor: colours.brand.primary,
        tabBarInactiveTintColor: colours.text.muted,
        tabBarItemStyle: { paddingHorizontal: 8, paddingVertical: 4 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIcon: ({ focused }) => {
          const iconColor = focused ? colours.brand.primary : colours.text.muted;
          const iconSize = 28;
          const strokeWidth = focused ? 0.5 : 0;

          switch (route.name) {
            case 'Roster':
              return <CalendarIcon width={iconSize} height={iconSize} fill={iconColor} stroke={iconColor} strokeWidth={strokeWidth} />;
            case 'Team':
              return <TeamIcon width={iconSize} height={iconSize} fill={iconColor} stroke={iconColor} strokeWidth={strokeWidth} />;
            case 'Fairness':
              return <FairnessIcon width={iconSize} height={iconSize} fill={iconColor} stroke={iconColor} strokeWidth={strokeWidth} />;
            default:
              return <CalendarIcon width={iconSize} height={iconSize} fill={iconColor} stroke={iconColor} strokeWidth={strokeWidth} />;
          }
        },
      })}
    >
      <Tab.Screen name="Roster" component={SchedulerScreen} />
      <Tab.Screen 
        name="Team" 
        component={CapabilitiesNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always navigate to CapabilitiesMain when Team tab is pressed
            e.preventDefault();
            navigation.navigate('Team', { screen: 'CapabilitiesMain' });
          },
        })}
      />
      <Tab.Screen name="Fairness" component={FairnessScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colours.bg.canvas },
      }}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="Root"
          component={Tabs}
          options={{
            // ✅ Only show the global header on native (iOS/Android)
            header: Platform.OS === 'web' ? undefined : () => <CustomHeader />,
            headerShown: Platform.OS !== 'web',
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}