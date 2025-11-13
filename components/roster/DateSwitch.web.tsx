// Web-specific DateSwitch with responsive behavior
import * as React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { colours } from '../../theme/colours';

// Theme-based button states
const INACTIVE_BG = colours.bg.canvas;
const ACTIVE_BG = colours.brand.primary;

export default function DateSwitchWeb({
  granularity,
  onGranularityChange,
  fluid, // When true, stretches to parent width (for grouped header container)
}: {
  granularity: 'weekly' | 'daily';
  onGranularityChange: (g: 'weekly' | 'daily') => void;
  fluid?: boolean;
}) {
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints matching Header.web.tsx
  const isCompact = width < 900;
  const isSmall = width < 640;
  
  // Dynamic toggle width based on screen size and fluid prop
  const getToggleWidth = () => {
    if (fluid) return '100%';
    if (isSmall) return width * 0.85;
    if (isCompact) return width * 0.7;
    return width * 0.5;
  };

  // Dynamic styling based on selection state
  const getStyle = (currentGranularity: 'weekly' | 'daily') => {
    const isActive = granularity === currentGranularity;
    return [
      s.toggle,
      { backgroundColor: isActive ? ACTIVE_BG : INACTIVE_BG },
    ];
  };

  return (
    <View style={[s.wrap, isCompact && s.wrapCompact, { width: getToggleWidth() }]}>
      <Pressable
        onPress={() => onGranularityChange('daily')}
        style={getStyle('daily')}
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text style={[
          s.toggleText, 
          isCompact && s.toggleTextCompact,
          granularity === 'daily' && s.toggleTextActive
        ]}>
          {isSmall ? 'Day' : 'Daily'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onGranularityChange('weekly')}
        style={getStyle('weekly')}
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text style={[
          s.toggleText, 
          isCompact && s.toggleTextCompact,
          granularity === 'weekly' && s.toggleTextActive
        ]}>
          {isSmall ? 'Week' : 'Weekly'}
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
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  wrapCompact: {
    borderRadius: 8,
    marginVertical: 4,
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24, // Enhanced web padding for better click targets
  },
  toggleText: {
    color: colours.text.muted,
    fontWeight: '400',
    fontSize: 14,
  },
  toggleTextCompact: {
    fontSize: 12,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colours.bg.canvas,
  },
});