import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import IndicatorPills, { Item as IndicatorItem } from './IndicatorPills';
import TimeSlot from './TimeSlot';

// Imports the necessary icons for the indicator pills.
import CoffeeIcon from '../assets/coffee.svg';
import SandwichIcon from '../assets/sandwich.svg';
import MixedIcon from '../assets/mixed.svg';
import TrafficIcon from '../assets/traffic.svg';

// Helper for generating mock 30-minute time slots.
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9;
  const endHour = 12;

  for (let h = startHour; h < endHour; h++) {
    for (const m of [0, 30]) {
      const start = new Date(0, 0, 0, h, m);
      const end = new Date(0, 0, 0, h, m + 30);
      
      const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '');
      
      slots.push({
        id: `${h}-${m}`,
        startTime: fmt(start),
        endTime: fmt(end),
        assignedStaff: h === 9 && m === 0 ? [
          { name: 'Mat Blackwood', role: 'Barista', tone: 'warn' as const },
          { name: 'Sandra Wich', role: 'Sandwich Bar', tone: 'good' as const },
          { name: 'Bob Burger', role: 'Cashier', tone: 'good' as const },
        ] : [],
        demand: h === 9 && m === 30 ? 'Coffee' : h === 10 && m === 0 ? 'Cashier' : h === 10 && m === 30 ? 'Sandwich Maker' : h === 11 && m === 0 ? 'Closer' : null,
        mismatches: h === 9 && m === 0 ? 0 : 1,
      });
    }
  }
  return slots;
};


export default function DayView({
  date,
  indicators,
  onOpenEmployees,
}: {
  date: Date;
  indicators: { mismatches: number; demand: 'Coffee' | 'Sandwich' | 'Mixed'; traffic: 'low' | 'medium' | 'high' };
  onOpenEmployees: () => void;
}) {
  const timeSlots = generateTimeSlots();

  const demandIcons = {
    Coffee: CoffeeIcon,
    Sandwich: SandwichIcon,
    Mixed: MixedIcon,
  } as const;

  const mismatchTone: IndicatorItem['tone'] = (indicators.mismatches ?? 0) > 0 ? 'alert' : 'good';
  const demandTone: IndicatorItem['tone'] = 'warn';
  const trafficTone: IndicatorItem['tone'] =
    indicators.traffic === 'high'
      ? 'alert'
      : indicators.traffic === 'medium'
        ? 'warn'
        : 'good';

  const pillItems: IndicatorItem[] = [
    {
      label: 'Mismatches',
      tone: mismatchTone,
      variant: 'value' as const,
      value: String(indicators.mismatches ?? 0),
    },
    {
      label: indicators.demand ?? '—',
      tone: demandTone,
      variant: 'icon' as const,
      icon: demandIcons[(indicators.demand ?? 'Mixed') as keyof typeof demandIcons],
      iconColor: '#2b2b2b',
    },
    {
      label: 'Traffic',
      tone: trafficTone,
      variant: 'icon' as const,
      icon: TrafficIcon,
    },
  ];

  return (
    <View style={s.container}>
      <View style={s.pillsWrapper}>
        <IndicatorPills items={pillItems} />
      </View>

      {/* This new container gives the time slots a background and rounded corners. */}
      <View style={s.timeSlotListContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.contentContainer}
        >
          {timeSlots.map(slot => (
            <TimeSlot 
              key={slot.id}
              slot={slot}
              onAddStaff={onOpenEmployees}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  pillsWrapper: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  // New style for the main scrollable area.
  timeSlotListContainer: {
    flex: 1,
    backgroundColor: '#E4ECE8',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 80,
  },
  contentContainer: { 
    paddingBottom: 90,
  },
});
