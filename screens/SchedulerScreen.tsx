import * as React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';

import AutoShiftBar from '../components/roster/AutoShiftBar';
import AvailableEmployeesModal from '../components/modals/AvailableEmployeesModal';
import RemoveStaffConfirmModal from '../components/modals/RemoveStaffConfirmModal';
import WeekView from '../components/roster/WeekView';
import DayView from '../components/roster/DayView';
import PreviousWeekSummary from '../components/calendar/PreviousWeekSummary';

import DateSwitch from '../components/roster/DateSwitch';
import IndicatorPills, { Item as IndicatorItem } from '../components/IndicatorPills';
import DateNavigator from '../components/calendar/DateNavigator';

import CoffeeIcon from '../assets/coffee.svg';
import SandwichIcon from '../assets/sandwich.svg';
import MixedIcon from '../assets/mixed.svg';
import TrafficIcon from '../assets/traffic.svg';

import { addWeeks, startOfWeek, addDays, isSameDay, weekRangeLabel, dayLabelLong } from '../utils/date';
import { DayIndicators, Employee } from '../state/types';
import { UIEmployee } from '../viewmodels/employees';
import { TimeSlotData, StaffAssignment } from '../components/roster/TimeSlot';
import { colours } from '../theme/colours';
import { toMinutes, scoreToTone, roleToDisplayName } from '../helpers/timeUtils';
import { generateTimeSlots } from '../helpers/schedulerIO';

const PADDED_WRAPPER = { paddingHorizontal: 16 };
const HEADER_GROUP = { backgroundColor: colours.brand.accent, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginTop: 16, marginBottom: 4 };

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'week' | 'day'>('day');
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // Time slot management for day view
  const [slots, setSlots] = React.useState<TimeSlotData[]>(() => generateTimeSlots());
  const [modalVisible, setModalVisible] = React.useState(false);
  const [activeSlot, setActiveSlot] = React.useState<TimeSlotData | null>(null);
  
  // Remove staff confirmation modal state
  const [removeConfirm, setRemoveConfirm] = React.useState<{
    slotId: string;
    staffIndex: number;
    staffName: string;
  } | null>(null);

  const openModalForSlot = (slot: TimeSlotData) => {
    setActiveSlot(slot);
    setModalVisible(true);
  };

  const handleAssign = ({ employee, start, end, role }: { employee: UIEmployee; start: string; end: string; role?: string }) => {
    const name = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown';
    const assignedRole = role || roleToDisplayName(employee.primary_role);
    const tone = scoreToTone(employee.score);

    // Convert to minutes for range checking
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);

    setSlots((prev) =>
      prev.map((s) => {
        const slotStartMin = toMinutes(s.startTime);
        
        // Assign to all slots that start within the time range
        if (slotStartMin >= startMin && slotStartMin < endMin) {
          // Don't add duplicate assignments
          if (s.assignedStaff.some((a) => a.name === name)) return s;
          
          const next: StaffAssignment = { name, role: assignedRole, tone };
          return { ...s, assignedStaff: [...s.assignedStaff, next] };
        }
        return s;
      })
    );

    setModalVisible(false);
    setActiveSlot(null);
  };

  const removeFromSlot = (slotId: string, staffIndex: number, staffName: string) => {
    // Show confirmation modal
    setRemoveConfirm({ slotId, staffIndex, staffName });
  };

  const handleRemoveAll = () => {
    if (!removeConfirm) return;
    
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        assignedStaff: s.assignedStaff.filter((staff) => staff.name !== removeConfirm.staffName),
      }))
    );
    
    setRemoveConfirm(null);
  };

  const handleRemoveOne = () => {
    if (!removeConfirm) return;
    
    setSlots((prev) =>
      prev.map((s) => (s.id === removeConfirm.slotId ? { ...s, assignedStaff: s.assignedStaff.filter((_, i) => i !== removeConfirm.staffIndex) } : s))
    );
    
    setRemoveConfirm(null);
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
    { label: focusedIndicators.demand ?? '—', tone: demandTone, variant: 'icon', icon: demandIcons[(focusedIndicators.demand ?? 'Mixed') as keyof typeof demandIcons], iconColor: colours.text.secondary },
    { label: 'Traffic', tone: trafficTone, variant: 'icon', icon: TrafficIcon },
  ];
  const previousWeekPillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: 'alert', variant: 'value', value: '3' },
    { label: 'Demand', tone: 'warn', variant: 'icon', icon: CoffeeIcon, iconColor: colours.text.secondary },
    { label: 'Traffic', tone: 'warn', variant: 'icon', icon: TrafficIcon },
  ];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, backgroundColor: colours.bg.canvas }}>
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
        slotStart={activeSlot?.startTime ?? '6:00 am'}
        slotEnd={activeSlot?.endTime ?? '4:00 pm'}
        onAssign={handleAssign}
      />

      <RemoveStaffConfirmModal
        visible={!!removeConfirm}
        staffName={removeConfirm?.staffName ?? ''}
        onRemoveAll={handleRemoveAll}
        onRemoveOne={handleRemoveOne}
        onCancel={() => setRemoveConfirm(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pillsWrapper: { paddingHorizontal: 16, marginVertical: 12 },
});