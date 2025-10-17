import * as React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { DayIndicators } from '../state/types';
import { fmtDayLabel } from '../utils/date';

// Imported svg icons
import TrafficIcon from '../assets/traffic.svg';
import CoffeeIcon from '../assets/coffee.svg';
import SandwichIcon from '../assets/sandwich.svg';
import MixedIcon from '../assets/mixed.svg';

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
  
  const dayLetter = fmtDayLabel(date)[0]; 
  const dateNumber = date.getDate(); 
  const trafficIconColor = trafficColor(traffic);
  const mismatchDotColor = mismatchColor(mismatches);

  const demandIcons: Record<string, React.FC<any>> = {
    Coffee: CoffeeIcon,
    Sandwich: SandwichIcon,
    Mixed: MixedIcon,
  };

  const DemandIcon = demandIcons[demand] ?? demandIcons.Mixed;

  return (
    <Pressable onPress={() => onPress(date)} style={s.tile}>
      
      <Text style={s.dayText}>{dayLetter}</Text>
      <Text style={s.dateText}>{dateNumber}</Text>

      {/* Mismatch dot */}
      <View style={s.stackItem}>
        <View style={[s.mismatchDot, { backgroundColor: mismatchDotColor }]} />
      </View>

      {/* Demand icon svg. e.g. Coffee*/}
      <View style={s.stackItem}>
        <DemandIcon width={20} height={20} color="#2b2b2b" />
      </View>

      {/* Traffic svg. Changes colour. */}
      <View style={s.stackItem}>
        <TrafficIcon width={26} height={26} color={trafficIconColor} />
      </View>

    </Pressable>
  );
}

const s = StyleSheet.create({
  tile: {
    width: 50, 
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FAFAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginRight: 0,
  },
  dayText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#64748B'
  },
  dateText: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 6,
    color: '#0F172A' 
  },
  stackItem: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  
  mismatchDot: {
    width: 14,
    height: 14,
    borderRadius: 8,
  },
});
