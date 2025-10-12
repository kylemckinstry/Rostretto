import * as React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../components/Header';
import AutoShiftBar from '../components/AutoShiftBar';
import EmployeeListModal from '../components/EmployeeListModal';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';

import DateSwitch from '../components/DateSwitch';
import IndicatorPills from '../components/IndicatorPills';

import {
  addWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  weekRangeLabel,
  dayLabelLong,
} from '../utils/date';
import { DayIndicators, Employee } from '../state/types';

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'week' | 'day'>('week');
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // -30 not responsive, but will look for fix later
  const bottomOffset = insets.bottom - 30;

  // Mock data
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

  // DateSwitch handlers
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
      setSelectedDate(d => {
        const next = addDays(d ?? today, -1);
        setAnchorDate(next);
        return next;
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

  const pillItems = [
    {
      label: 'Mismatches',
      value: String(focusedIndicators.mismatches ?? 0),
      tone:
        (focusedIndicators.mismatches ?? 0) > 0
          ? ('alert' as const)
          : ('good' as const),
    },
    {
      label: 'Demand',
      value: focusedIndicators.demand ?? '—',
      tone: 'warn' as const,
    },
    {
      label: 'Traffic',
      value:
        (focusedIndicators.traffic ?? '—')[0].toUpperCase() +
        (focusedIndicators.traffic ?? '—').slice(1),
      tone:
        focusedIndicators.traffic === 'high'
          ? ('alert' as const)
          : focusedIndicators.traffic === 'medium'
            ? ('warn' as const)
            : ('good' as const),
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={s.content}>
        <Header logo={require('../assets/Rostretto-logo.png')} />

        <DateSwitch
          // Forces component re-render when granularity changes to ensure
          key={granularity}
          granularity={granularity}
          onGranularityChange={onGranularityChange}
        />

        {mode === 'week' && <IndicatorPills items={pillItems} />}

        {mode === 'week' ? (
          <WeekView
            anchorDate={anchorDate}
            weekIndicators={weekIndicators}
            staff={staff}
            onPrevWeek={() => setAnchorDate(d => addWeeks(d, -1))}
            onNextWeek={() => setAnchorDate(d => addWeeks(d, 1))}
            onSelectDay={openDay}
          />
        ) : (
          <DayView
            date={focusedDate}
            indicators={focusedIndicators}
            onBack={() => setMode('week')}
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
