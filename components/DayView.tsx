import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { dayLabelLong } from '../utils/date';
import IndicatorPills from './IndicatorPills';
import PlaceholderCalendar from './PlaceholderCalendar';

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
  return (
    <View style={{ flex: 1 }}>
      <View style={s.header}>
        <Pressable onPress={onBack}><Text style={s.chev}>{'<'}</Text></Pressable>
        <Text style={s.title}>{dayLabelLong(date)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <IndicatorPills
        items={[
          { label: 'Skill', value: String(indicators.mismatches), tone: indicators.mismatches ? 'alert' : 'good' },
          { label: indicators.demand, value: indicators.demand === 'Mixed' ? 'Mix' : '1', tone: 'good' },
          { label: 'Traffic', value: indicators.traffic[0].toUpperCase() + indicators.traffic.slice(1), tone: indicators.traffic === 'high' ? 'alert' : indicators.traffic === 'medium' ? 'warn' : 'good' },
        ]}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <PlaceholderCalendar onOpenEmployees={onOpenEmployees} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  chev: { fontSize: 18, padding: 8 },
});
