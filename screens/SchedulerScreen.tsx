import * as React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';

import AutoShiftBar from '../components/AutoShiftBar';
import EmployeeListModal from '../components/EmployeeListModal';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import PreviousWeekSummary from '../components/PreviousWeekSummary';

import DateSwitch from '../components/DateSwitch';
import IndicatorPills, { Item as IndicatorItem } from '../components/IndicatorPills';
import DateNavigator from '../components/DateNavigator';

import CoffeeIcon from '../assets/coffee.svg';
import SandwichIcon from '../assets/sandwich.svg';
import MixedIcon from '../assets/mixed.svg';
import TrafficIcon from '../assets/traffic.svg';

import {
  addWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  weekRangeLabel,
  dayLabelLong,
} from '../utils/date';
import { DayIndicators, Employee } from '../state/types';

const PADDED_WRAPPER = { paddingHorizontal: 16 };

const HEADER_GROUP = {
  backgroundColor: '#E7F0EB',
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginTop: 16,
  marginBottom: 4,
};

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'week' | 'day'>('week');
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  const bottomOffset = 16;

  const start = startOfWeek(anchorDate);
  const mkKey = (d: Date) => d.toISOString().slice(0, 10);
  const weekIndicators: Record<string, DayIndicators> = {
    [mkKey(addDays(start, 0))]: { mismatches: 3, demand: 'Coffee', traffic: 'medium' },
    [mkKey(addDays(start, 1))]: { mismatches: 0, demand: 'Mixed', traffic: 'low' },
    [mkKey(addDays(start, 2))]: { mismatches: 1, demand: 'Sandwich', traffic: 'medium' },
    [mkKey(addDays(start, 3))]: { mismatches: 2, demand: 'Coffee', traffic: 'high' },
    [mkKey(addDays(start, 4))]: { mismatches: 0, demand: 'Mixed', traffic: 'medium' },
    [mkKey(addDays(start, 5))]: { mismatches: 1, demand: 'Coffee', traffic: 'high' },
    [mkKey(addDays(start, 6))]: { mismatches: 0, demand: 'Mixed', traffic: 'low' },
  };

  const staff: Employee[] = [
    { id: '1', name: 'Emil Avanesov', fairnessColor: 'green', score: 72 },
    { id: '2', name: 'Kyle McKinstry', fairnessColor: 'green', score: 88 },
    { id: '3', name: 'Mat Blackwood', fairnessColor: 'yellow', score: 68 },
    { id: '4', name: 'Jason Yay', fairnessColor: 'red', score: 91 },
  ];

  const openDay = (d: Date) => {
    setSelectedDate(d);
    setMode('day');
    setAnchorDate(d);
  };

  const today = new Date();
  const todayInThisWeek = addDays(
    start,
    [0, 1, 2, 3, 4, 5, 6].find(i => isSameDay(addDays(start, i), today)) ?? 0
  );

  const focusedDate =
    mode === 'day'
      ? selectedDate ?? today
      : (selectedDate && isSameDay(selectedDate, today))
        ? selectedDate
        : todayInThisWeek;

  const focusedKey = mkKey(focusedDate);
  const focusedIndicators: DayIndicators =
    weekIndicators[focusedKey] ?? { mismatches: 0, demand: 'Mixed', traffic: 'medium' };

  const granularity: 'weekly' | 'daily' = mode === 'week' ? 'weekly' : 'daily';

  const onGranularityChange = (g: 'weekly' | 'daily') => {
    if (g === 'daily') {
      const d = today;
      setSelectedDate(d);
      setAnchorDate(d);
      setMode('day');
    } else {
      setMode('week');
    }
  };

  const onPrev = () => {
    if (mode === 'week') {
      setAnchorDate(d => addWeeks(d, -1));
    } else {
      // In day mode, go to the previous day.
      setSelectedDate(d => {
        const prev = addDays(d ?? today, -1);
        setAnchorDate(prev);
        return prev;
      });
    }
  };

  const onNext = () => {
    if (mode === 'week') {
      setAnchorDate(d => addWeeks(d, 1));
    } else {
      setSelectedDate(d => {
        const next = addDays(d ?? today, 1);
        setAnchorDate(next);
        return next;
      });
    }
  };

  const dateLabel =
    mode === 'week' ? weekRangeLabel(anchorDate) : dayLabelLong(focusedDate);

  const demandIcons = {
    Coffee: CoffeeIcon,
    Sandwich: SandwichIcon,
    Mixed: MixedIcon,
  } as const;

  const mismatchTone: IndicatorItem['tone'] = (focusedIndicators.mismatches ?? 0) > 0 ? 'alert' : 'good';
  const demandTone: IndicatorItem['tone'] = 'warn';
  const trafficTone: IndicatorItem['tone'] =
    focusedIndicators.traffic === 'high'
      ? 'alert'
      : focusedIndicators.traffic === 'medium'
        ? 'warn'
        : 'good';

  const pillItems: IndicatorItem[] = [
    {
      label: 'Mismatches',
      tone: mismatchTone,
      variant: 'value' as const,
      value: String(focusedIndicators.mismatches ?? 0),
    },
    {
      label: focusedIndicators.demand ?? '—',
      tone: demandTone,
      variant: 'icon' as const,
      icon: demandIcons[(focusedIndicators.demand ?? 'Mixed') as keyof typeof demandIcons],
      iconColor: '#2b2b2b',
    },
    {
      label: 'Traffic',
      tone: trafficTone,
      variant: 'icon' as const,
      icon: TrafficIcon,
    },
  ];

  const previousWeekPillItems: IndicatorItem[] = [
    {
      label: 'Mismatches',
      tone: 'alert',
      variant: 'value',
      value: '3',
    },
    {
      label: 'Demand',
      tone: 'warn',
      variant: 'icon',
      icon: CoffeeIcon,
      iconColor: '#2b2b2b',
    },
    {
      label: 'Traffic',
      tone: 'warn',
      variant: 'icon',
      icon: TrafficIcon,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={PADDED_WRAPPER}>
          <View style={HEADER_GROUP}>
            <DateNavigator label={dateLabel} onPrev={onPrev} onNext={onNext} />
            <DateSwitch
              key={granularity}
              granularity={granularity}
              onGranularityChange={onGranularityChange}
              fluid
            />
          </View>
        </View>

        {mode === 'week' && (
          <View style={s.pillsWrapper}>
            <IndicatorPills items={pillItems} />
          </View>
        )}

        {mode === 'week' ? (
          <>
            <WeekView
              anchorDate={anchorDate}
              weekIndicators={weekIndicators}
              onPrevWeek={() => setAnchorDate(d => addWeeks(d, -1))}
              onNextWeek={() => setAnchorDate(d => addWeeks(d, 1))}
              onSelectDay={openDay}
            />
            <PreviousWeekSummary items={previousWeekPillItems} />
          </>
        ) : (
          <DayView
            date={focusedDate}
            indicators={focusedIndicators}
            // onBack is removed as it's not used by DayView.
            onOpenEmployees={() => setShowModal(true)}
          />
        )}
      </View>

      <AutoShiftBar
        onPress={() => setShowModal(true)}
        floating
        bottom={bottomOffset}
      />

      <EmployeeListModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pillsWrapper: {
    paddingHorizontal: 16,
    marginVertical: 12,
  }
});


