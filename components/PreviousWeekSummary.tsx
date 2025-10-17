import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IndicatorPills, { Item as IndicatorItem } from './IndicatorPills';

// A component to display the previous week's summary.
export default function PreviousWeekSummary({ items }: { items: IndicatorItem[] }) {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Previous Week</Text>
      <IndicatorPills items={items} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0F172A',
  },
});