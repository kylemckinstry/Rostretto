import * as React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';

import AutoShiftBar from '../components/AutoShiftBar';
import AvailableEmployeesModal from '../components/AvailableEmployeesModal';
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

import { addWeeks, startOfWeek, addDays, isSameDay, weekRangeLabel, dayLabelLong } from '../utils/date';
import { DayIndicators, Employee } from '../state/types';
import { TimeSlotData, StaffAssignment } from '../components/TimeSlot';

const PADDED_WRAPPER = { paddingHorizontal: 16 };
const HEADER_GROUP = { backgroundColor: '#E7F0EB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginTop: 16, marginBottom: 4 };

function toMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toLowerCase();
  if (ampm === 'pm' && h !== 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return h * 60 + min;
}
function toneFromScore(score?: number): 'good' | 'warn' | 'alert' {
  const pct = Math.round((score ?? 0) * 100);
  if (pct >= 80) return 'good';
  if (pct >= 56) return 'warn';
  return 'alert';
}
function uiRoleFromSchedulerRole(sr: string): string {
  if (sr === 'BARISTA') return 'Coffee';
  if (sr === 'SANDWICH') return 'Sandwich';
  if (sr === 'WAITER') return 'Cashier';
  return 'Manager';
}

// Generate demo time slots for day view
function generateTimeSlots(): TimeSlotData[] {
  const out: TimeSlotData[] = [];
  const startHour = 9;
  const endHour = 12;
  for (let h = startHour; h < endHour; h++) {
    for (const m of [0, 30]) {
      const start = new Date(0, 0, 0, h, m);
      const end = new Date(0, 0, 0, h, m + 30);
      const fmt = (d: Date) =>
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '');
      out.push({
        id: `${h}-${m}`,
        startTime: fmt(start),
        endTime: fmt(end),
        assignedStaff: [],
        demand: null,
        mismatches: 0,
      });
    }
  }
  return out;
}

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'week' | 'day'>('week');
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // Time slot management for day view
  const [slots, setSlots] = React.useState<TimeSlotData[]>(() => generateTimeSlots());
  const [modalVisible, setModalVisible] = React.useState(false);
  const [activeSlot, setActiveSlot] = React.useState<TimeSlotData | null>(null);

  const openModalForSlot = (slot: TimeSlotData) => {
    setActiveSlot(slot);
    setModalVisible(true);
  };

  const handleAssign = ({ employee, start, end }: { employee: Employee; start: string; end: string }) => {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    const name = employee.name ?? `${employee.first_name} ${employee.last_name}`;
    const role = uiRoleFromSchedulerRole(employee.primary_role);
    const tone = toneFromScore(employee.score);

    setSlots((prev) =>
      prev.map((s) => {
        const sStart = toMinutes(s.startTime);
        const sEnd = toMinutes(s.endTime);
        const within = sStart >= startMin && sEnd <= endMin; // Slot within assignment range
        if (!within) return s;
        if (s.assignedStaff.some((a) => a.name === name)) return s;

        const next: StaffAssignment = { name, role, tone };
        return { ...s, assignedStaff: [...s.assignedStaff, next] };
      })
    );

    setModalVisible(false);
    setActiveSlot(null);
  };

  const removeFromSlot = (slotId: string, staffIndex: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, assignedStaff: s.assignedStaff.filter((_, i) => i !== staffIndex) } : s))
    );
  };

  const bottomOffset = 16;

  // Mock week data for demo
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

  const openDay = (d: Date) => { setSelectedDate(d); setMode('day'); setAnchorDate(d); };
  const today = new Date();
  const todayInThisWeek = addDays(start, [0,1,2,3,4,5,6].find(i => isSameDay(addDays(start, i), today)) ?? 0);
  const focusedDate = mode === 'day' ? (selectedDate ?? today) : ((selectedDate && isSameDay(selectedDate, today)) ? selectedDate : todayInThisWeek);
  const focusedKey = mkKey(focusedDate);
  const focusedIndicators: DayIndicators = weekIndicators[focusedKey] ?? { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
  const granularity: 'weekly' | 'daily' = mode === 'week' ? 'weekly' : 'daily';

  const onGranularityChange = (g: 'weekly' | 'daily') => { if (g === 'daily') { const d = today; setSelectedDate(d); setAnchorDate(d); setMode('day'); } else { setMode('week'); } };
  const onPrev = () => { if (mode === 'week') setAnchorDate(d => addWeeks(d, -1)); else setSelectedDate(d => { const prev = addDays(d ?? today, -1); setAnchorDate(prev); return prev; }); };
  const onNext = () => { if (mode === 'week') setAnchorDate(d => addWeeks(d, 1)); else setSelectedDate(d => { const next = addDays(d ?? today, 1); setAnchorDate(next); return next; }); };
  const dateLabel = mode === 'week' ? weekRangeLabel(anchorDate) : dayLabelLong(focusedDate);

  const demandIcons = { Coffee: CoffeeIcon, Sandwich: SandwichIcon, Mixed: MixedIcon } as const;
  const mismatchTone: IndicatorItem['tone'] = (focusedIndicators.mismatches ?? 0) > 0 ? 'alert' : 'good';
  const demandTone: IndicatorItem['tone'] = 'warn';
  const trafficTone: IndicatorItem['tone'] =
    focusedIndicators.traffic === 'high' ? 'alert' :
    focusedIndicators.traffic === 'medium' ? 'warn' : 'good';

  const pillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: mismatchTone, variant: 'value', value: String(focusedIndicators.mismatches ?? 0) },
    { label: focusedIndicators.demand ?? '—', tone: demandTone, variant: 'icon', icon: demandIcons[(focusedIndicators.demand ?? 'Mixed') as keyof typeof demandIcons], iconColor: '#2b2b2b' },
    { label: 'Traffic', tone: trafficTone, variant: 'icon', icon: TrafficIcon },
  ];
  const previousWeekPillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: 'alert', variant: 'value', value: '3' },
    { label: 'Demand', tone: 'warn', variant: 'icon', icon: CoffeeIcon, iconColor: '#2b2b2b' },
    { label: 'Traffic', tone: 'warn', variant: 'icon', icon: TrafficIcon },
  ];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={PADDED_WRAPPER}>
          <View style={HEADER_GROUP}>
            <DateNavigator label={dateLabel} onPrev={onPrev} onNext={onNext} />
            <DateSwitch key={granularity} granularity={granularity} onGranularityChange={onGranularityChange} fluid />
          </View>
        </View>

        {mode === 'week' && <View style={s.pillsWrapper}><IndicatorPills items={pillItems} /></View>}

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
            slots={slots}
            onAddStaff={openModalForSlot}
            onRemoveStaff={removeFromSlot}
          />
        )}
      </View>

      <AutoShiftBar onPress={() => { setActiveSlot(null); setModalVisible(true); }} floating bottom={bottomOffset} />

      <AvailableEmployeesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        slotStart={activeSlot?.startTime ?? '9:00 am'}
        slotEnd={activeSlot?.endTime ?? '3:00 pm'}
        onAssign={handleAssign}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pillsWrapper: { paddingHorizontal: 16, marginVertical: 12 },
});