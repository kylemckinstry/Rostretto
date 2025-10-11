import * as React from 'react';
import { StyleSheet, StatusBar } from 'react-native'; // Added StatusBar import for best practice
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../components/Header';
import AutoShiftBar from '../components/AutoShiftBar';
import EmployeeListModal from '../components/EmployeeListModal';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';

import { addWeeks, startOfWeek, addDays } from '../utils/date';
import { DayIndicators, Employee } from '../state/types';

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'week' | 'day'>('week');
  const [anchorDate, setAnchorDate] = React.useState(new Date()); // any date within current week
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // Dock the button just above the tab bar.
  // BUTTON_HEIGHT ~= padding(14*2) + text line height + rounding -> 52 works well with current styles.
  const BUTTON_HEIGHT = 52;
  const GAP = 8;
  // This calculates the correct offset from the bottom of the screen to dock the floating button above the tab bar
  const bottomOffset = Math.max(insets.bottom + GAP, tabBarHeight - BUTTON_HEIGHT + GAP);

  // Mock data for indicators & staff (replace with real state later)
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
  };

  const dayIndicators: DayIndicators = selectedDate
    ? (weekIndicators[selectedDate.toISOString().slice(0, 10)] as DayIndicators) ||
      { mismatches: 0, demand: 'Mixed', traffic: 'medium' }
    : { mismatches: 0, demand: 'Mixed', traffic: 'medium' };

  return (
    // Removed the explicit edges prop. This allows the SafeAreaView to correctly apply 
    // the top inset to push content below the camera notch/status bar.
    <SafeAreaView style={s.safe}>
      {/* Set the status bar content color to be visible against the white background */}
      <StatusBar barStyle="dark-content" /> 

  <Header logo={require('../assets/Rostretto-logo.png')} />

      {mode === 'week' ? (
        <WeekView
          anchorDate={anchorDate}
          weekIndicators={weekIndicators}
          staff={staff}
          onPrevWeek={() => setAnchorDate((d) => addWeeks(d, -1))}
          onNextWeek={() => setAnchorDate((d) => addWeeks(d, 1))}
          onSelectDay={openDay}
        />
      ) : (
        <DayView
          date={selectedDate || new Date()}
          indicators={dayIndicators}
          onBack={() => setMode('week')}
          onOpenEmployees={() => setShowModal(true)}
        />
      )}

      {/* Floating Auto Shift button, docked above the tab bar */}
      <AutoShiftBar onPress={() => setShowModal(true)} floating bottom={bottomOffset} />

      <EmployeeListModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // This makes the screen take up all available space and sets the positioning context for the AutoShiftBar
  safe: { flex: 1, backgroundColor: '#fff', position: 'relative' }, 
});