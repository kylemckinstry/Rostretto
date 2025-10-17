import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

// Define the inactive background color for clarity
const INACTIVE_BG = '#F1F5F9'; 
const ACTIVE_BG = '#E4ECE8';

export default function DateSwitch({
  granularity,
  onGranularityChange,
}: {
  granularity: 'weekly' | 'daily';
  onGranularityChange: (g: 'weekly' | 'daily') => void;
}) {
  const screenWidth = Dimensions.get('window').width;
  const toggleWidth = screenWidth * 0.92; 

  // Function to determine the style for each button
  const getStyle = (currentGranularity: 'weekly' | 'daily') => {
      const isActive = granularity === currentGranularity;
      
      return [
          s.toggle, 
          // Use a full object override to guarantee the background color is set last
          { backgroundColor: isActive ? ACTIVE_BG : INACTIVE_BG } 
      ];
  };

  return (
    <View style={[s.wrap, { width: toggleWidth }]}>
      <Pressable
        onPress={() => onGranularityChange('weekly')}
        style={getStyle('weekly')} // Apply guaranteed style
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text 
          style={[s.toggleText, granularity === 'weekly' && s.toggleTextActive]}
        >
          Weekly
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onGranularityChange('daily')}
        style={getStyle('daily')} // Apply guaranteed style
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text 
          style={[s.toggleText, granularity === 'daily' && s.toggleTextActive]}
        >
          Daily
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
    backgroundColor: 'transparent', // Transparent container
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1, 
    borderColor: '#D1D5DB', // Grey border around the whole switch
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#1A4331',
  },
});