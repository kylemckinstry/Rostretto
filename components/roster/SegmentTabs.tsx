import * as React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

type Tab = { key: string; label: string };

export default function SegmentTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <View style={s.row}>
      {tabs.map(t => {
        const active = t.key === value;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={[s.item, active && s.itemActive]}>
            <Text style={[s.text, active && s.textActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingBottom: 6 },
  item: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F1F5F9' },
  itemActive: { backgroundColor: '#E0F2FE' },
  text: { color: '#475569', fontWeight: '500' },
  textActive: { color: '#0284C7' },
});
