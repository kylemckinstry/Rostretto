import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { dayLabelLong } from '../utils/date';
import IndicatorPills from './IndicatorPills';
import TimeSlot from './TimeSlot';

// Define Tone type locally for the pillItems array and TimeSlot mock data
type Tone = 'good' | 'warn' | 'alert'; 

// Helper for generating 30-minute time slots (9:00 AM to 12:00 PM for example)
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9;
  const endHour = 12; // Ending at 12:00 PM for a sample

  for (let h = startHour; h < endHour; h++) {
    for (const m of [0, 30]) {
      const start = new Date(0, 0, 0, h, m);
      const end = new Date(0, 0, 0, h, m + 30);
      
      const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
      
      slots.push({
        id: `${h}-${m}`,
        startTime: fmt(start),
        endTime: fmt(end),
        // MOCK DATA for the 9:00 AM slot only
        assignedStaff: h === 9 && m === 0 ? [
          { name: 'Kof Ieh', role: 'Sandwich Bar', tone: 'warn' as const },
          { name: 'Sandy Wich', role: 'Sandwich Bar', tone: 'good' as const },
          { name: 'Bob Burger', role: 'Cashier', tone: 'alert' as const },
        ] : [],
        // MOCK DATA for demand in the following slots
        demand: h === 9 && m === 30 ? 'Coffee' : h === 10 && m === 0 ? 'Cashier' : h === 10 && m === 30 ? 'Sandwich Maker' : h === 11 && m === 0 ? 'Closer' : null,
        mismatches: h === 9 && m === 0 ? 0 : 1, // 0 mismatches in the first slot
      });
    }
  }
  return slots;
};


export default function DayView({
  date,
  indicators,
  onBack,
  onOpenEmployees,
}: {
  date: Date;
  indicators: { mismatches: number; demand: 'Coffee' | 'Sandwich' | 'Mixed'; traffic: 'low' | 'medium' | 'high' };
  onBack: () => void;
  onOpenEmployees: () => void;
}) {
  const timeSlots = generateTimeSlots();

  // Explicitly typing the array structure to satisfy IndicatorPills.tsx 
  const pillItems: { label: string; value: string; tone: Tone }[] = [
    { 
      label: 'Skill', 
      value: String(indicators.mismatches), 
      tone: indicators.mismatches ? 'alert' : 'good' 
    },
    { 
      label: indicators.demand as string, 
      value: '1' as string, 
      tone: 'warn' as const 
    },
    { 
      label: 'Traffic', 
      value: (indicators.traffic[0].toUpperCase() + indicators.traffic.slice(1)) as string, 
      tone: indicators.traffic === 'high' ? 'alert' : indicators.traffic === 'medium' ? 'warn' : 'good' 
    },
  ];

  return (
    <View style={s.container}>
      {/*This applies paddingHorizontal: 16 to the Header and Pills */}
      <View style={s.staticWrap}>
        {/* Date Header */}
        <View style={s.header}>
          {/* Apply s.chevronBox wrapper for tap area and center positioning */}
          <Pressable onPress={onBack} style={s.chevronBox}><Text style={s.chev}>{'<'}</Text></Pressable>
          <Text style={s.title}>{dayLabelLong(date)}</Text>
          {/* Placeholder for symmetry */}
          <View style={s.chevronBox} /> 
        </View>

        {/* Indicator Pills (3-box layout) */}
        <View style={s.pillsWrap}>
          <IndicatorPills items={pillItems} />
        </View>
      </View>

      {/* Scrollable Time Slots */}
      <ScrollView 
        style={s.scrollView} 
        contentContainerStyle={s.contentContainer}
      >
        {timeSlots.map(slot => (
          <TimeSlot 
            key={slot.id}
            slot={slot}
            onAddStaff={onOpenEmployees} // Re-use the modal opener for the '+' button
          />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingBottom: 0, 
  },
  // Applies uniform horizontal padding (16px) to the top section.
  staticWrap: {
    paddingHorizontal: 16,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
  // Wrapper for the Pressable area for the chevron
  chevronBox: {
    padding: 8, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Creates the circular button visual
  chev: { 
    fontSize: 14, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22, 
    color: '#0F172A',
  },
  pillsWrap: {
    paddingBottom: 12,
  },
  scrollView: { 
    flex: 1,
    // No padding on the component itself
  },
  contentContainer: { 
    // All horizontal padding for scrollable content is applied here
    paddingHorizontal: 16, 
    paddingTop: 8,
    paddingBottom: 16,
  },
});