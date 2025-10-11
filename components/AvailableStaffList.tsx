import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Employee } from '../state/types';

export default function AvailableStaffList({ staff }: { staff: Employee[] }) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>Available Staff</Text>
      {staff.map(p => (
        <View key={p.id} style={s.row}>
           <View style={[s.initial, { backgroundColor: 'transparent', borderColor: scoreColor(p.score), borderWidth: 2 }]}>
             <Text style={{ fontWeight: '700', color: p.score != null ? scoreColor(p.score) : '#000' }}>{p.name[0]}</Text>
           </View>

          <Text style={s.name}>{p.name}</Text>
        </View>
      ))}
    </View>
  );
}

function colorFor(f?: 'green' | 'yellow' | 'red') {
  return f === 'red' ? '#EF4444' : f === 'yellow' ? '#F59E0B' : '#00B392';
}

function scoreColor(score?: number) {
  if (score == null) return '#D1D5DB'; // gray for unknown
  if (score > 75) return '#00B392'; // green
  if (score >= 56) return '#F59E0B'; // orange
  return '#EF4444'; // red
}

const s = StyleSheet.create({
  wrap: { marginTop: 12 },
  title: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  initial: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  name: { fontWeight: '600', color: '#0F172A' },
  
});
