// Toggle switch for daily/weekly view
import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

// Background colour when button is not selected
const INACTIVE_BG = '#F4F4F1';
const ACTIVE_BG = '#1A4331';

export default function DateSwitch({
  granularity,
  onGranularityChange,
  fluid, // When true, stretches to parent width (for grouped header container)
}: {
  granularity: 'weekly' | 'daily';
  onGranularityChange: (g: 'weekly' | 'daily') => void;
  fluid?: boolean;
}) {
  const screenWidth = Dimensions.get('window').width;
  const toggleWidth = screenWidth * 0.92;

  // Choose button appearance based on selection
  const getStyle = (currentGranularity: 'weekly' | 'daily') => {
    const isActive = granularity === currentGranularity;
    return [
      s.toggle,
      // Override background to ensure correct colour
      { backgroundColor: isActive ? ACTIVE_BG : INACTIVE_BG },
    ];
  };

  return (
    <View style={[s.wrap, fluid ? { width: '100%' } : { width: toggleWidth }]}>
      <Pressable
        onPress={() => onGranularityChange('daily')}
        style={getStyle('daily')} // Get styling for daily button
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text style={[s.toggleText, granularity === 'daily' && s.toggleTextActive]}>
          Daily
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onGranularityChange('weekly')}
        style={getStyle('weekly')} // Get styling for weekly button
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text style={[s.toggleText, granularity === 'weekly' && s.toggleTextActive]}>
          Weekly
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // Parent handles background
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB', // Light grey border
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleText: {
    color: '#475569',
    fontWeight: '400',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
});
