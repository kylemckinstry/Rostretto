import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { startOfWeek, addDays, addWeeks } from '../../utils/date';
import DayTile from './DayTile';

// Week forecast day type - matching web version
export type WeekForecastDay = {
  date: Date;
  mismatches: number;
  demand: 'Coffee' | 'Sandwich' | 'Mixed';
  traffic: 'Low' | 'Medium' | 'High';
};

// Week view with horizontal paging between weeks
export default function WeekView({
  anchorDate,
  days,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: {
  anchorDate: Date;
  days: WeekForecastDay[];
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

  // Helper to find day data by date
  const mkKey = (d: Date) => d.toISOString().slice(0, 10);
  const getDayData = (date: Date): WeekForecastDay => {
    const key = mkKey(date);
    const found = days.find(day => mkKey(day.date) === key);
    return found || { date, mismatches: 0, demand: 'Mixed', traffic: 'Medium' };
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
              const dayData = getDayData(d);
              const indicators = {
                mismatches: dayData.mismatches,
                demand: dayData.demand,
                traffic: dayData.traffic.toLowerCase() as 'low' | 'medium' | 'high'
              };
              return <DayTile key={mkKey(d)} date={d} indicators={indicators} onPress={onSelectDay} />;
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