import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import IndicatorPills, { Item as IndicatorItem } from '../IndicatorPills';
import TimeSlot, { TimeSlotData } from '../roster/TimeSlot';

import CoffeeIcon from '../../assets/coffee.svg';
import SandwichIcon from '../../assets/sandwich.svg';
import MixedIcon from '../../assets/mixed.svg';
import TrafficIcon from '../../assets/traffic.svg';

export default function DayView({
  date,
  indicators,
  slots,
  onAddStaff,
  onRemoveStaff,
}: {
  date: Date;
  indicators: { mismatches: number; demand: 'Coffee' | 'Sandwich' | 'Mixed'; traffic: 'low' | 'medium' | 'high' };
  slots: TimeSlotData[];
  onAddStaff: (slot: TimeSlotData) => void;
  onRemoveStaff: (slotId: string, staffIndex: number, staffName: string) => void;
}) {
  const demandIcons = { Coffee: CoffeeIcon, Sandwich: SandwichIcon, Mixed: MixedIcon } as const;

  const mismatchTone: IndicatorItem['tone'] = (indicators.mismatches ?? 0) > 0 ? 'alert' : 'good';
  const demandTone: IndicatorItem['tone'] = 'warn';
  const trafficTone: IndicatorItem['tone'] =
    indicators.traffic === 'high' ? 'alert' : indicators.traffic === 'medium' ? 'warn' : 'good';

  const pillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: mismatchTone, variant: 'value', value: String(indicators.mismatches ?? 0) },
    { label: indicators.demand ?? '—', tone: demandTone, variant: 'icon', icon: demandIcons[(indicators.demand ?? 'Mixed') as keyof typeof demandIcons], iconColor: '#2b2b2b' },
    { label: 'Traffic', tone: trafficTone, variant: 'icon', icon: TrafficIcon },
  ];

  return (
    <View style={s.container}>
      <View style={s.pillsWrapper}><IndicatorPills items={pillItems} /></View>
      <View style={s.timeSlotListContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.contentContainer}>
          {slots.map(slot => (
            <TimeSlot
              key={slot.id}
              slot={slot}
              onAddStaff={onAddStaff}
              onRemoveStaff={onRemoveStaff}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  pillsWrapper: { paddingHorizontal: 16, marginVertical: 12 },
  timeSlotListContainer: { flex: 1, backgroundColor: '#E4ECE8', borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 12, paddingTop: 12, marginBottom: 80 },
  contentContainer: { paddingBottom: 90 },
});
