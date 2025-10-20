import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { startOfWeek, addDays } from '../../utils/date';
import { DayIndicators } from '../../state/types';

type Props = {
  anchorDate: Date;
  weekIndicators: Record<string, DayIndicators>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (d: Date) => void;
};

function keyFor(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function WeekViewWeb({
  anchorDate,
  weekIndicators,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: Props) {
  const weekStart = startOfWeek(anchorDate);

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Pressable onPress={onPrevWeek} hitSlop={8}><Text style={s.chev}>{'‹'}</Text></Pressable>
        <Text style={s.headerTitle}>Week of {weekStart.toLocaleDateString()}</Text>
        <Pressable onPress={onNextWeek} hitSlop={8}><Text style={s.chev}>{'›'}</Text></Pressable>
      </View>

      <View style={s.grid}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const ind = weekIndicators[keyFor(d)] ?? { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
          const mismatch = ind.mismatches ?? 0;

          return (
            <Pressable key={i} style={s.cell} onPress={() => onSelectDay(d)}>
              <Text style={s.dayLabel}>
                {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              <View style={s.badges}>
                <View style={[s.badge, mismatch > 0 ? s.badgeAlert : s.badgeGood]}>
                  <Text style={s.badgeText}>{mismatch}</Text>
                </View>
                <Text style={s.badgeLite}>{ind.demand}</Text>
                <Text style={s.badgeLite}>
                  {ind.traffic === 'high' ? '🔴' : ind.traffic === 'medium' ? '🟠' : '🟢'}
                </Text>
              </View>

              <View style={s.previewBox}>
                <Text style={s.previewText}>Click to plan</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: '#E4ECE8', borderRadius: 16, padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  chev: { fontSize: 22, lineHeight: 22 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 12,
  } as unknown as any,
  cell: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    cursor: 'pointer',
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '120ms',
  } as unknown as any,
  dayLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeGood: { backgroundColor: '#E6F6EF' },
  badgeAlert: { backgroundColor: '#FDE8EA' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeLite: { fontSize: 12, opacity: 0.7 },
  previewBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, alignItems: 'center' },
  previewText: { fontSize: 12, opacity: 0.6 },
});
