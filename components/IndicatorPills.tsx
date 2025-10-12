import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Tone = 'good' | 'warn' | 'alert';
type Item = { label: string; value: string; tone: Tone };

const tone = {
  good: { fg: '#059669' },
  warn: { fg: '#D97706' },
  alert: { fg: '#DC2626' },
};

export default function IndicatorPills({ items }: { items: Item[] }) {
  return (
    <View style={s.row}>
      {items.map(it => (
        <View 
          key={it.label} 
          style={[
            s.pill, 
            { 
              backgroundColor: '#fff', 
              borderWidth: 1.5, 
              borderColor: tone[it.tone].fg 
            }
          ]}
        >
          <Text style={[s.value, { color: tone[it.tone].fg }]}>{it.value}</Text>
          <Text style={[s.label, { color: tone[it.tone].fg }]}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  label: { fontSize: 12, fontWeight: '600' },
});
