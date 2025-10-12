import * as React from 'react';
import { Image } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SchedulerScreen from '../screens/SchedulerScreen';
import CapabilitiesScreen from '../screens/CapabilitiesScreen';
import FairnessScreen from '../screens/FairnessScreen';
import EmployeeScreen from '../screens/EmployeeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // color for active label (matches the green icon variant)
        tabBarActiveTintColor: '#00B392',
        tabBarInactiveTintColor: '#64748B',
        // add padding around each tab item and label
        tabBarItemStyle: { paddingHorizontal: 8, paddingVertical: 4 },
        tabBarLabelStyle: {fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          // static map of assets to avoid dynamic require
          const icons: Record<string, { on: any; off: any }> = {
            Roster: { on: require('../assets/calendar-green.png'), off: require('../assets/calendar.png') },
            Team: { on: require('../assets/team-green.png'), off: require('../assets/team.png') },
            Fairness: { on: require('../assets/fairness-green.png'), off: require('../assets/fairness.png') },
          };
          const entry = icons[route.name] || icons.Roster;
          return <Image source={focused ? entry.on : entry.off} style={{ width: 28, height: 28 }} />;
        },
      })}
    >
      <Tab.Screen name="Roster" component={SchedulerScreen} />
      <Tab.Screen name="Team" component={CapabilitiesScreen} />
      <Tab.Screen name="Fairness" component={FairnessScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: '#fff' },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={Tabs} />
        <Stack.Screen name="Employee" component={EmployeeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
