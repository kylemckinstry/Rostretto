import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { DayIndicators } from '../state/types';
import { startOfWeek, addDays, addWeeks } from '../utils/date';
import DayTile from './DayTile';

// Component responsible for the week pager
export default function WeekView({
  anchorDate,
  weekIndicators,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: {
  anchorDate: Date;
  weekIndicators: Record<string, DayIndicators>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (d: Date) => void;
}) {
  const pagerRef = React.useRef<PagerView>(null);

  const weeks = React.useMemo(() => {
    const currentWeekStart = startOfWeek(anchorDate);
    return [-1, 0, 1].map(offset => addWeeks(currentWeekStart, offset));
  }, [anchorDate]);

  React.useEffect(() => {
    pagerRef.current?.setPage(1);
  }, [weeks]);

  const handlePageSelected = (event: { nativeEvent: { position: number } }) => {
    const { position } = event.nativeEvent;
    if (position === 0) {
      onPrevWeek();
    } else if (position === 2) {
      onNextWeek();
    }
  };

  return (
    <View style={s.dayTileContainer}>
      <PagerView
        ref={pagerRef}
        style={s.pager}
        initialPage={1}
        onPageSelected={handlePageSelected}
        offscreenPageLimit={2}
      >
        {weeks.map((weekStart, pageIndex) => (
          <View key={pageIndex} style={s.pageStyle}>
            {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(d => {
              const key = d.toISOString().slice(0, 10);
              const ind = weekIndicators[key] || { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
              return <DayTile key={key} date={d} indicators={ind} onPress={onSelectDay} />;
            })}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const s = StyleSheet.create({
  dayTileContainer: {
    backgroundColor: '#E4ECE8',
    paddingVertical: 16,
  },
  pager: {
    height: 200
  },
  pageStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
});