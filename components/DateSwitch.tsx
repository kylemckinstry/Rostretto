import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function DateSwitch({
  dateLabel,
  granularity,
  onGranularityChange,
  onPrev,
  onNext,
}: {
  dateLabel: string;
  granularity: 'weekly' | 'daily';
  onGranularityChange: (g: 'weekly' | 'daily') => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.wrap}>
      <View style={s.left}>
        <Pressable onPress={onPrev} hitSlop={8}><Text style={s.chev}>{'<'}</Text></Pressable>
        <Text style={s.date}>{dateLabel}</Text>
        <Pressable onPress={onNext} hitSlop={8}><Text style={s.chev}>{'>'}</Text></Pressable>
      </View>
      <View style={s.right}>
        <Pressable onPress={() => onGranularityChange('weekly')} style={[s.toggle, granularity === 'weekly' && s.toggleActive]}>
          <Text style={[s.toggleText, granularity === 'weekly' && s.toggleTextActive]}>Weekly</Text>
        </Pressable>
        <Pressable onPress={() => onGranularityChange('daily')} style={[s.toggle, granularity === 'daily' && s.toggleActive]}>
          <Text style={[s.toggleText, granularity === 'daily' && s.toggleTextActive]}>Daily</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chev: { fontSize: 18 },
  date: { fontSize: 16, fontWeight: '600' },
  right: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, overflow: 'hidden' },
  toggle: { paddingVertical: 6, paddingHorizontal: 10 },
  toggleActive: { backgroundColor: '#E0F2FE' },
  toggleText: { color: '#475569', fontWeight: '500' },
  toggleTextActive: { color: '#0284C7' },
});
