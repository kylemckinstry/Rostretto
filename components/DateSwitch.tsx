import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

export default function DateSwitch({
  granularity,
  onGranularityChange,
}: {
  granularity: 'weekly' | 'daily';
  onGranularityChange: (g: 'weekly' | 'daily') => void;
}) {
  const screenWidth = Dimensions.get('window').width;
  const toggleWidth = screenWidth * 0.8; // 80% of screen width

  return (
    <View style={[s.wrap, { width: toggleWidth }]}>
      <Pressable
        onPress={() => onGranularityChange('weekly')}
        style={[s.toggle, granularity === 'weekly' && s.toggleActive]}
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text style={[s.toggleText, granularity === 'weekly' && s.toggleTextActive]}>
          Weekly
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onGranularityChange('daily')}
        style={[s.toggle, granularity === 'daily' && s.toggleActive]}
        android_ripple={{ color: '#e0f2fe' }}
      >
        <Text style={[s.toggleText, granularity === 'daily' && s.toggleTextActive]}>
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
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleActive: {
    backgroundColor: '#E0F2FE',
  },
  toggleText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#0284C7',
  },
});
