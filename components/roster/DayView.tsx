import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import TimeSlot, { TimeSlotData } from '../roster/TimeSlot';

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
  return (
    <View style={s.container}>
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
  timeSlotListContainer: { flex: 1, backgroundColor: '#E4ECE8', borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 12, paddingTop: 12, marginBottom: 80 },
  contentContainer: { paddingBottom: 90 },
});
