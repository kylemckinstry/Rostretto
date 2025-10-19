import * as React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { DayIndicators } from '../../state/types';
import { fmtDayLabel } from '../../utils/date';

// SVG icons for demand indicators
import TrafficIcon from '../../assets/traffic.svg';
import CoffeeIcon from '../../assets/coffee.svg';
import SandwichIcon from '../../assets/sandwich.svg';
import MixedIcon from '../../assets/mixed.svg';

// Traffic level colours (green=low, red=high)
function trafficColor(traffic: DayIndicators['traffic']) {
  if (traffic === 'high') return '#E57373'; // Red
  if (traffic === 'medium') return '#F5A623'; // Yellow
  return '#00B392'; // Green (low traffic)
}

// Mismatch colours: 1 or less green, 2 orange, 3 or more red
function mismatchColor(mismatches: number) {
  if (mismatches <= 1) return '#5CB85C'; 
  if (mismatches === 2) return '#F5A623';
  return '#E57373';
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

      {/* Shows mismatch severity as coloured dot */}
      <View style={s.stackItem}>
        <View style={[s.mismatchDot, { backgroundColor: mismatchDotColor }]} />
      </View>

      {/* Displays demand type icon (Coffee/Sandwich/Mixed) */}
      <View style={s.stackItem}>
        <DemandIcon width={20} height={20} color="#2b2b2b" />
      </View>

      {/* Shows traffic level with colour-coded icon */}
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
