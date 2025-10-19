import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SkillHighlights({
  high,
  low,
}: {
  high?: string[];
  low?: string[];
}) {
  const hasHigh = (high?.length ?? 0) > 0;
  const hasLow = (low?.length ?? 0) > 0;

  return (
    <View style={s.wrap}>
      <View style={s.block}>
        <Text style={[s.label, { color: '#5CB85C' }]}>
          {hasHigh ? 'High Skills' : 'No High Skills'}
        </Text>
        <View style={s.row}>
          {hasHigh
            ? high!.map((k) => (
                <View key={k} style={[s.pill, s.good]}>
                  <Text style={[s.pillText, { color: '#5CB85C' }]}>{k}</Text>
                </View>
              ))
            : null}
        </View>
      </View>

      <View style={s.block}>
        <Text style={[s.label, { color: '#E57373' }]}>
          {hasLow ? 'Skill Gaps' : 'No Skill Gaps'}
        </Text>
        <View style={s.row}>
          {hasLow
            ? low!.map((k) => (
                <View key={k} style={[s.pill, s.bad]}>
                  <Text style={[s.pillText, { color: '#2b2b2b' }]}>{k}</Text>
                </View>
              ))
            : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  block: { flex: 1 },
  label: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  good: { borderColor: '#5CB85C' },
  bad: { borderColor: '#E57373' },
});
