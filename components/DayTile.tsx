import * as React from 'react';
import { Pressable, View, Text, StyleSheet, Image } from 'react-native';
import { DayIndicators } from '../state/types';
import { fmtDayLabel, fmtShortDate } from '../utils/date';

// NOTE: Since you are using fmtDayLabel, it gives "Mon", "Tue", etc. 
// I'll adjust the style to only show the first letter for the day.

// Utility function to get color for traffic (green=low, red=high)
function trafficColor(traffic: DayIndicators['traffic']) {
  if (traffic === 'high') return '#EF476F'; // Red
  if (traffic === 'medium') return '#FF7D00'; // Yellow
  return '#00B392'; // Green (low traffic)
}

// Utility function to get color for mismatches: <=1 green, 2 orange, >=3 red
function mismatchColor(mismatches: number) {
  if (mismatches <= 1) return '#00B392'; // project green
  if (mismatches === 2) return '#F59E0B';
  return '#EF4444';
}

export default function DayStackTile({
  date,
  indicators,
  onPress,
}: {
  date: Date;
  indicators: DayIndicators;
  onPress: (d: Date) => void;
}) {
  const { mismatches, demand, traffic } = indicators;
  
  // Gets the first letter of the day (e.g., 'M' from 'Mon')
  const dayLetter = fmtDayLabel(date)[0]; 
  
  // Gets the date number (e.g., 6)
  const dateNumber = date.getDate(); 
  const trafficCircleColor = trafficColor(traffic);
  const mismatchCircleColor = mismatchColor(mismatches);

  // Determine the icon source based on demand
  // Use a static map so Metro can bundle the assets. Add 'Mixed' as its own icon.
  const demandIcons: Record<string, any> = {
    Coffee: require('../assets/coffee.png'),
    Sandwich: require('../assets/sandwich.png'),
    Mixed: require('../assets/mixed.png'),
  };

  const demandIcon = demandIcons[demand] ?? demandIcons.Sandwich;

  return (
    // Tile is now narrow and vertically stacked
    <Pressable onPress={() => onPress(date)} style={s.tile}>
      
      {/* First letter of day (Mon -> M) */}
      <Text style={s.dayText}>{dayLetter}</Text>
      
      {/* Date number (e.g., 6) */}
      <Text style={s.dateText}>{dateNumber}</Text>

      {/* Mismatches (Circle badge) */}
      <View style={s.stackItem}>
        <View style={[s.mismatchCircle, { backgroundColor: 'transparent', borderColor: mismatchCircleColor, borderWidth: 2 }]}> 
          <Text style={[s.mismatchText, { color: mismatchCircleColor }]}>{mismatches}</Text>
        </View>
      </View>

      {/* Demand Icon (Coffee/Sandwich icon) */}
      <View style={s.stackItem}>
        <Image 
          source={demandIcon}
          style={s.demandIcon}
          accessibilityLabel={`Demand: ${demand}`}
        />
      </View>

      {/* Traffic Arrow (Right-facing arrow in a colored circle) */}
      <View style={s.stackItem}>
        <View style={[s.trafficCircle, { backgroundColor: 'transparent', borderColor: trafficCircleColor, borderWidth: 2 }]}> 
          <Text style={[s.trafficArrow, { color: trafficCircleColor }]}>{'>'}</Text>
        </View>
      </View>

    </Pressable>
  );
}

const s = StyleSheet.create({
  tile: {
    width: 48, 
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAFAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginRight: 6,
  },
  dayText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#64748B'
  },
  dateText: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 8, // Space before the indicators start
    color: '#0F172A' 
  },
  // Styles for consistent vertical spacing of indicator items
  stackItem: {
    height: 30, // Ensures even vertical spacing regardless of content height
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  
  // Mimsatches (Similar style to available staff's initial circle)
  mismatchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    // backgroundColor is set dynamically based on mismatches
    alignItems: 'center',
    justifyContent: 'center',
  },
  mismatchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Demand ICON
  demandIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  
  // Traffic circle
  trafficCircle: {
    width: 22,
    height: 22,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trafficArrow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
});