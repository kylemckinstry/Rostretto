import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function TrainingCard({
  title,
  tag,
  blurb,
  duration,
}: {
  title: string;
  tag: string;
  blurb: string;
  duration: string;
}) {
  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>{title}</Text>
        <View style={s.pill}><Text style={s.pillText}>{tag}</Text></View>
      </View>
      <Text style={s.blurb}>{blurb}</Text>
      <Text style={s.meta}>⏱ Duration: {duration}</Text>
      <Pressable style={s.btn}><Text style={s.btnText}>Currently Unavailable</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EBE8',
    padding: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontWeight: '700', fontSize: 15, color: '#171A1F' },
  pill: { backgroundColor: '#E6F4EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { color: '#0B7D5E', fontSize: 12, fontWeight: '700' },
  blurb: { color: '#384048', marginTop: 8, fontSize: 13 },
  meta: { color: '#5B636A', marginTop: 6, fontSize: 12 },
  btn: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5EBE8',
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: { color: '#171A1F', fontWeight: '600' },
});
