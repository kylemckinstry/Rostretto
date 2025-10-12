import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { DayIndicators, Employee } from '../state/types';
import { startOfWeek, addDays, weekRangeLabel, addWeeks } from '../utils/date';
import DayTile from './DayTile';
import AvailableStaffList from './AvailableStaffList';

export default function WeekView({
  anchorDate,
  weekIndicators,
  staff,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: {
  anchorDate: Date;
  weekIndicators: Record<string, DayIndicators>;
  staff: Employee[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (d: Date) => void;
}) {
  const pagerRef = React.useRef<PagerView>(null);

  // Memo the weeks array to prevent unnecessary recalculations
  const weeks = React.useMemo(() => {
    const currentWeekStart = startOfWeek(anchorDate);
    return [-1, 0, 1].map(offset => addWeeks(currentWeekStart, offset));
  }, [anchorDate]);

  // When the week changes, silently snap the pager back to the middle page
  React.useEffect(() => {
    // Using setPage is more reliable than scrollTo
    pagerRef.current?.setPage(1);
  }, [weeks]);

  // Function is called when a swipe is completed
  const handlePageSelected = (event: { nativeEvent: { position: number } }) => {
    const { position } = event.nativeEvent;
    if (position === 0) { // Swiped left
      onPrevWeek();
    } else if (position === 2) { // Swiped right
      onNextWeek();
    }
  };

  const label = weekRangeLabel(anchorDate);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onPrevWeek} style={s.chevronBox}><Text style={s.chev}>{'<'}</Text></Pressable>
        <Text style={s.title}>{label}</Text>
        <Pressable onPress={onNextWeek} style={s.chevronBox}><Text style={s.chev}>{'>'}</Text></Pressable>
      </View>

      <View style={{ height: 210 }}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={1}
          onPageSelected={handlePageSelected}
          offscreenPageLimit={2} // Add this line
        >
          {weeks.map((weekStart, pageIndex) => (
            <View key={pageIndex} style={s.pageStyle}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(d => {
                  const key = d.toISOString().slice(0, 10);
                  const ind = weekIndicators[key] || { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
                  return <DayTile key={key} date={d} indicators={ind} onPress={onSelectDay} />;
                })}
              </ScrollView>
            </View>
          ))}
        </PagerView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text style={s.subHeader}>Available staff</Text>
        <ScrollView>
          <AvailableStaffList staff={staff} />
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingBottom: 90 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pageStyle: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700' },
  chevronBox: { padding: 8 },
  chev: {
    fontSize: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    color: '#0F172A',
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
});