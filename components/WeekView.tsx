import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { DayIndicators, Employee } from '../state/types';
import { startOfWeek, addDays, weekRangeLabel } from '../utils/date';
import DayTile from './DayTile';
import AvailableStaffList from './AvailableStaffList';

export default function WeekView({
  anchorDate,
  weekIndicators,
  staff,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: {
  anchorDate: Date; // any date in the current week
  weekIndicators: Record<string, DayIndicators>; // key: ISO date (YYYY-MM-DD)
  staff: Employee[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (d: Date) => void;
}) {
  const start = startOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const label = weekRangeLabel(anchorDate);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onPrevWeek}><Text style={s.chev}>{'<'}</Text></Pressable>
        <Text style={s.title}>{label}</Text>
        <Pressable onPress={onNextWeek}><Text style={s.chev}>{'>'}</Text></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
        {days.map(d => {
          const key = d.toISOString().slice(0, 10);
          const ind = weekIndicators[key] || { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
          return <DayTile key={key} date={d} indicators={ind} onPress={onSelectDay} />;
        })}
      </ScrollView>

      <AvailableStaffList staff={staff} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  chev: { fontSize: 18, padding: 8 },
});
