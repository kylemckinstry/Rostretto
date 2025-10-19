import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

export default function PlaceholderCalendar({ onOpenEmployees }: { onOpenEmployees: () => void }) {
  const hours = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00'];
  const roles = ['Coffee', 'Sandwich', 'Cashier', 'Closer'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={s.headerRow}>
          <View style={[s.hCell, { width: 80 }]} />
          {hours.map(h => (
            <View key={h} style={[s.hCell, s.colHeader]}>
              <Text style={s.hText}>{h}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={{ maxHeight: 420 }}>
          {roles.map(r => (
            <View key={r} style={s.row}>
              <View style={s.leftCell}><Text style={s.role}>{r}</Text></View>
              {hours.map((h, i) => (
                <Pressable key={h} onPress={onOpenEmployees} style={[s.cell, i % 2 ? s.alt : null]}>
                  <Text style={s.plus}>+</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  headerRow: { flexDirection: 'row' },
  hCell: { height: 36, justifyContent: 'center', alignItems: 'center' },
  colHeader: { width: 120, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  hText: { fontSize: 12, color: '#475569' },
  row: { flexDirection: 'row' },
  leftCell: { width: 80, borderRightWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', paddingHorizontal: 6, backgroundColor: '#F8FAFC' },
  role: { fontSize: 12, fontWeight: '600', color: '#334155' },
  cell: { width: 120, height: 72, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  alt: { backgroundColor: '#F9FAFB' },
  plus: { fontSize: 20, color: '#0284C7' },
});
