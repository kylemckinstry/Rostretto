import * as React from 'react';
import { StyleSheet, StatusBar, View, Alert } from 'react-native';

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
import { UIEmployee, useEmployeesUI } from '../viewmodels/employees';
import { TimeSlotData, StaffAssignment } from '../components/roster/TimeSlot';
import { colours } from '../theme/colours';
import { toMinutes, scoreToTone, roleToDisplayName } from '../helpers/timeUtils';
import { generateTimeSlots } from '../helpers/schedulerIO';
import { TIME_OPTIONS } from '../utils/timeGeneration';
import { DEFAULT_DAY_INDICATORS } from '../data/mock/weekIndicators';
import { fetchWeekBundle, type WeekBundle } from '../data/scheduler.repo';
import { buildWeekIndicators } from '../helpers/indicators';
import { buildDaySlots } from '../viewmodels/schedule';
import { api } from '../api/client';
import Constants from 'expo-constants';

// Runtime feature flag
const USE_API =
  (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_USE_API === 'true') ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API === 'true') ||
  (typeof window !== 'undefined' && (window as any).__USE_API__ === true);

const PADDED_WRAPPER = { paddingHorizontal: 16 };
const HEADER_GROUP = { backgroundColor: colours.brand.accent, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginTop: 16, marginBottom: 4 };

// Helper to convert date to ISO week ID (e.g., "2025-W45")
function toIsoWeekId(date: Date): string {
  const start = startOfWeek(date);
  const oneJan = new Date(start.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((start.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${start.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'week' | 'day'>('day');
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // Load employees from API
  const employeesUI = useEmployeesUI();

  // Backend data state
  const [weekBundle, setWeekBundle] = React.useState<WeekBundle | null>(null);
  const [weekDaysLive, setWeekDaysLive] = React.useState<Array<{ date: Date; mismatches: number; demand: 'Coffee' | 'Sandwich' | 'Mixed'; traffic: 'Low' | 'Medium' | 'High' }> | null>(null);
  const [prevWeekDays, setPrevWeekDays] = React.useState<Array<{ date: Date; mismatches: number; demand: 'Coffee' | 'Sandwich' | 'Mixed'; traffic: 'Low' | 'Medium' | 'High' }> | null>(null);
  
  // Cache initial demand/traffic indicators (these should never change after initial load)
  const [initialIndicators, setInitialIndicators] = React.useState<Map<string, { demand: 'Coffee' | 'Sandwich' | 'Mixed'; traffic: 'Low' | 'Medium' | 'High' }>>(new Map());

  // Time slot management for day view
  const [slots, setSlots] = React.useState<TimeSlotData[]>(() => generateTimeSlots());
  const [modalVisible, setModalVisible] = React.useState(false);
  const [activeSlot, setActiveSlot] = React.useState<TimeSlotData | null>(null);
  
  // Scheduling state
  const [isScheduling, setIsScheduling] = React.useState(false);
  
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

  const isEmployeeAssigned = (employeeName: string, start: string, end: string): boolean => {
    const startIndex = TIME_OPTIONS.findIndex(time => time === start);
    const endIndex = TIME_OPTIONS.findIndex(time => time === end);
    return slots.some(slot => {
      const slotStartIndex = TIME_OPTIONS.findIndex(time => time === slot.startTime);
      if (slotStartIndex >= startIndex && slotStartIndex < endIndex) {
        return slot.assignedStaff.some(staff => staff.name === employeeName);
      }
      return false;
    });
  };

  const bottomOffset = 16;

  // Memoize week calculations to prevent infinite re-renders
  const start = React.useMemo(() => startOfWeek(anchorDate), [anchorDate]);
  const weekId = React.useMemo(() => toIsoWeekId(start), [start]);
  const mkKey = React.useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }, []);

  // Fetch current week bundle when week changes
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!USE_API) {
          setWeekBundle(null);
          setWeekDaysLive(null);
          return;
        }
        const bundle = await fetchWeekBundle(weekId);
        if (cancelled) return;
        setWeekBundle(bundle);

        // Build weekly tiles from backend indicators
        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        
        // Calculate mismatches locally, but use backend's demand and traffic
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        
        // Create a map of backend indicators by date for easy lookup
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const weekStart = startOfWeek(anchorDate);
        const tiles = Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const key = mkKey(d);
          
          const localInd = localIndicators[key];
          const backendInd = backendIndicatorsByDate.get(key);
          
          // Cache initial demand/traffic on first load (these are deterministic forecasts)
          if (!initialIndicators.has(key) && backendInd) {
            const demand = (demandMapping[backendInd.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed';
            const traffic = (trafficMapping[backendInd.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High';
            setInitialIndicators(prev => new Map(prev).set(key, { demand, traffic }));
          }
          
          // Always use cached initial indicators for demand/traffic (never let them change)
          const cached = initialIndicators.get(key);
          const demand = cached?.demand ?? (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed';
          const traffic = cached?.traffic ?? (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High';
          
          return {
            date: d,
            mismatches: localInd?.mismatches ?? 0,
            demand,
            traffic,
          };
        });
        setWeekDaysLive(tiles);
      } catch (e) {
        console.warn('fetchWeekBundle failed', e);
        setWeekBundle(null);
        setWeekDaysLive(null);
      }
    })();
    return () => { cancelled = true; };
  }, [weekId]);

  // Fetch previous week's data
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!USE_API) {
          setPrevWeekDays(null);
          return;
        }
        
        const weekStart = startOfWeek(anchorDate);
        const prevWeekStart = addWeeks(weekStart, -1);
        const prevWeekId = toIsoWeekId(prevWeekStart);
        
        const bundle = await fetchWeekBundle(prevWeekId);
        if (cancelled) return;

        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const tiles = Array.from({ length: 7 }, (_, i) => {
          const d = addDays(prevWeekStart, i);
          const key = mkKey(d);
          
          const localInd = localIndicators[key];
          const backendInd = backendIndicatorsByDate.get(key);
          
          return {
            date: d,
            mismatches: localInd?.mismatches ?? 0,
            demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed',
            traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High',
          };
        });
        
        setPrevWeekDays(tiles);
      } catch (e) {
        console.warn('fetchPreviousWeekBundle failed', e);
        setPrevWeekDays(null);
      }
    })();
    return () => { cancelled = true; };
  }, [weekId]);

  // Update time slots when anchorDate changes (for day view)
  React.useEffect(() => {
    if (!weekBundle || !USE_API) return;
    
    const dayKey = mkKey(anchorDate);
    
    // Check if this day has assignments in the bundle
    const dayHasAssignments = weekBundle.assignments.some(a => {
      const shift = weekBundle.shifts.find(s => s.shiftId === a.shiftId);
      return shift?.date === dayKey;
    });
    
    if (dayHasAssignments) {
      // Day has assignments, populate slots with employee data
      const dayTile = weekDaysLive?.find(t => mkKey(t.date) === dayKey);
      const demand = dayTile?.demand;
      setSlots(buildDaySlots(dayKey, weekBundle, demand));
    } else {
      // No assignments yet, show empty slots
      const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
      setSlots(generateTimeSlots(dayShifts));
    }
  }, [anchorDate, weekBundle, weekDaysLive]);

  // Reactively recalculate weekDaysLive when weekBundle changes
  React.useEffect(() => {
    if (!weekBundle || !USE_API) return;

    const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
    const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
    
    // Calculate mismatches locally, but use backend's demand and traffic
    const localIndicators = buildWeekIndicators(weekBundle.shifts, weekBundle.assignments, weekBundle.employees);
    
    // Create a map of backend indicators by date for easy lookup
    const backendIndicatorsByDate = new Map(
      weekBundle.indicators.days.map(day => [day.date, day])
    );
    
    const weekStart = startOfWeek(anchorDate);
    const tiles = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const key = mkKey(d);
      
      const localInd = localIndicators[key];
      const backendInd = backendIndicatorsByDate.get(key);
      
      // Always use cached initial indicators for demand/traffic (never let them change)
      const cached = initialIndicators.get(key);
      const demand = cached?.demand ?? (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed';
      const traffic = cached?.traffic ?? (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High';
      
      return {
        date: d,
        mismatches: localInd?.mismatches ?? 0,
        demand,
        traffic,
      };
    });
    setWeekDaysLive(tiles);
  }, [weekBundle, anchorDate, initialIndicators]);

  // Auto Shift for entire week (called from week view button)
  async function runAutoScheduleWeek() {
    if (!USE_API) return;
    
    setIsScheduling(true);
    try {
      console.log('[runAutoScheduleWeek] Scheduling week:', weekId);
      await api.runSchedule(weekId);
      console.log('[runAutoScheduleWeek] Week scheduled successfully');

      // Fetch updated bundle to get the new assignments
      const bundle = await fetchWeekBundle(weekId);

      // Build weekly tiles from backend indicators
      const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
      const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
      
      // Calculate mismatches locally, but use backend's demand and traffic
      const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
      
      // Create a map of backend indicators by date for easy lookup
      const backendIndicatorsByDate = new Map(
        bundle.indicators.days.map(day => [day.date, day])
      );
      
      const weekStart = startOfWeek(anchorDate);
      const tiles = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        const key = mkKey(d);
        
        const localInd = localIndicators[key];
        const backendInd = backendIndicatorsByDate.get(key);
        
        return {
          date: d,
          mismatches: localInd?.mismatches ?? 0,
          demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed',
          traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High',
        };
      });
      
      setWeekBundle(bundle);
      setWeekDaysLive(tiles);

      Alert.alert('Success', `Schedule created for ${weekId}: ${bundle.assignments.length} assignments`);
    } catch (e: any) {
      console.warn(e);
      const errorMsg = e?.message ?? String(e);
      if (errorMsg.includes('No shifts found')) {
        Alert.alert('Error', `Cannot schedule ${weekId}: No shifts exist for this week. Please create shifts in the database first.`);
      } else {
        Alert.alert('Error', `Scheduling error: ${errorMsg}`);
      }
    } finally {
      setIsScheduling(false);
    }
  }

  // Auto Shift for current day only (called from day view button)
  async function runAutoScheduleDay() {
    if (!USE_API) return;
    
    setIsScheduling(true);
    try {
      const dayKey = mkKey(anchorDate);
      
      console.log('[runAutoScheduleDay] Scheduling day:', dayKey, 'for week:', weekId);
      
      // Call the day-specific scheduling endpoint
      await api.runDaySchedule(weekId, dayKey);
      console.log('[runAutoScheduleDay] Day scheduled successfully');

      // Fetch updated bundle to get the new assignments
      const bundle = await fetchWeekBundle(weekId);

      // Calculate mismatches locally, but use backend's demand and traffic
      const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
      
      // Create a map of backend indicators by date for easy lookup
      const backendIndicatorsByDate = new Map(
        bundle.indicators.days.map(day => [day.date, day])
      );
      
      const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
      const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
      
      const weekStart = startOfWeek(anchorDate);
      const tiles = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        const key = mkKey(d);
        const localInd = localIndicators[key];
        const backendInd = backendIndicatorsByDate.get(key);
        
        return {
          date: d,
          mismatches: localInd?.mismatches ?? 0,
          demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed',
          traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High',
        };
      });
      
      setWeekBundle(bundle);
      setWeekDaysLive(tiles);

      Alert.alert('Success', `Day ${dayKey} scheduled successfully`);
    } catch (e: any) {
      console.warn(e);
      const errorMsg = e?.message ?? String(e);
      Alert.alert('Error', `Scheduling error: ${errorMsg}`);
    } finally {
      setIsScheduling(false);
    }
  }

  const handleAssign = ({ employee, start, end, role }: { employee: UIEmployee; start: string; end: string; role?: string }) => {
    if (!USE_API) return;
    
    const name = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown';
    const assignedRole = role || roleToDisplayName(employee.primary_role);
    const tone = scoreToTone(employee.score);

    // Convert to minutes for range checking
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);

    // Add to local state for immediate UI feedback
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

    // Save to backend immediately
    (async () => {
      try {
        if (!weekBundle) return;
        const dayKey = mkKey(anchorDate);
        const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
        if (dayShifts.length === 0) return;

        const shift = dayShifts[0];

        await api.saveManualAssignment({
          week: weekId,
          shiftId: shift.shiftId,
          employeeId: employee.employee_id,
          role: (assignedRole || 'Manager').toUpperCase(),
          start_time: start,
          end_time: end,
        });

        console.log(`[handleAssign] Saved manual assignment: ${name} to ${start}-${end} as ${assignedRole}`);
        
        // Refresh bundle to get updated state
        const bundle = await fetchWeekBundle(weekId);
        setWeekBundle(bundle);
        
        // Recalculate indicators with new assignments
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        
        const weekStart = startOfWeek(anchorDate);
        const tiles = Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const key = mkKey(d);
          const localInd = localIndicators[key];
          const backendInd = backendIndicatorsByDate.get(key);
          
          return {
            date: d,
            mismatches: localInd?.mismatches ?? 0,
            demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed',
            traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High',
          };
        });
        
        setWeekDaysLive(tiles);
      } catch (e) {
        console.error('[handleAssign] Failed to save to backend:', e);
        Alert.alert('Error', 'Failed to save assignment. Please try again.');
      }
    })();

    setModalVisible(false);
    setActiveSlot(null);
  };

  const removeFromSlot = (slotId: string, staffIndex: number, staffName: string) => {
    // Show confirmation modal
    setRemoveConfirm({ slotId, staffIndex, staffName });
  };

  const handleRemoveAll = () => {
    if (!removeConfirm) return;
    
    // Remove from all slots in local state for immediate UI feedback
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        assignedStaff: s.assignedStaff.filter((staff) => staff.name !== removeConfirm.staffName),
      }))
    );
    
    // Save to backend: delete all assignments for this employee on this day
    (async () => {
      try {
        if (!USE_API || !weekBundle) return;
        
        const dayKey = mkKey(anchorDate);
        const emp = employeesUI.find(e => e.name === removeConfirm.staffName);
        if (!emp) return;

        const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
        if (dayShifts.length === 0) return;

        // Check if any assignments for this employee are auto-generated
        const employeeAssignments = weekBundle.assignments.filter(a => {
          const shift = weekBundle.shifts.find(s => s.shiftId === a.shiftId);
          return shift?.date === dayKey && a.employeeId === emp.employee_id;
        });

        const hasAutoAssignments = employeeAssignments.some(a => !a.isManual);

        if (hasAutoAssignments) {
          // Has auto assignments - need to clear day and rebuild without this employee
          console.log(`[handleRemoveAll] Converting auto assignment day to manual (removing employee)`);
          
          // Get ALL current time slots from UI
          const currentDaySlots = slots.filter(ts => ts.assignedStaff.length > 0);

          // Clear the entire day
          await api.clearDay(weekId, dayKey);
          console.log(`[handleRemoveAll] Cleared day ${dayKey}`);

          // Save back all slots EXCEPT those for the removed employee
          let savedCount = 0;
          const shift = dayShifts[0];
          
          for (const ts of currentDaySlots) {
            for (const staff of ts.assignedStaff) {
              // Skip slots for the employee being removed
              if (staff.name === removeConfirm.staffName) {
                console.log(`[handleRemoveAll] Skipping slot for removed employee: ${ts.startTime}-${ts.endTime}`);
                continue;
              }

              // Find employee by name
              const empObj = employeesUI.find(e => e.name === staff.name);
              if (!empObj) continue;

              // Save as manual assignment
              await api.saveManualAssignment({
                week: weekId,
                shiftId: shift.shiftId,
                employeeId: empObj.employee_id,
                role: staff.role.toUpperCase(),
                start_time: ts.startTime,
                end_time: ts.endTime,
              });
              savedCount++;
            }
          }

          console.log(`[handleRemoveAll] ✓ Converted day to manual: saved ${savedCount} slots, removed employee ${removeConfirm.staffName}`);
        } else {
          // All manual assignments - just delete them
          const manualAssignments = employeeAssignments.filter(a => a.isManual === true);
          
          console.log(`[handleRemoveAll] Found ${manualAssignments.length} manual assignments to delete`);

          for (const assignment of manualAssignments) {
            await api.deleteManualAssignment(weekId, String(assignment.id));
          }

          if (manualAssignments.length > 0) {
            console.log(`[handleRemoveAll] ✓ Deleted ${manualAssignments.length} manual assignments`);
          }
        }
        
        // Refresh bundle to get updated state
        const bundle = await fetchWeekBundle(weekId);
        setWeekBundle(bundle);
        
        // Recalculate indicators with new assignments
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        
        const weekStart = startOfWeek(anchorDate);
        const tiles = Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const key = mkKey(d);
          const localInd = localIndicators[key];
          const backendInd = backendIndicatorsByDate.get(key);
          
          return {
            date: d,
            mismatches: localInd?.mismatches ?? 0,
            demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed',
            traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High',
          };
        });
        
        setWeekDaysLive(tiles);
      } catch (e) {
        console.error('[handleRemoveAll] Failed to delete from backend:', e);
        Alert.alert('Error', 'Failed to remove assignments. Please try again.');
      }
    })();
    
    setRemoveConfirm(null);
  };

  const handleRemoveOne = () => {
    if (!removeConfirm) return;
    
    // Find the slot being modified
    const slot = slots.find(s => s.id === removeConfirm.slotId);
    if (!slot) return;
    
    // Remove from just this slot in local state for immediate UI feedback
    setSlots((prev) =>
      prev.map((s) => (s.id === removeConfirm.slotId ? { ...s, assignedStaff: s.assignedStaff.filter((_, i) => i !== removeConfirm.staffIndex) } : s))
    );
    
    // Save to backend: delete assignment for this specific time slot
    (async () => {
      try {
        if (!USE_API || !weekBundle) return;
        
        const dayKey = mkKey(anchorDate);
        const emp = employeesUI.find(e => e.name === removeConfirm.staffName);
        if (!emp) {
          console.log(`[handleRemoveOne] Missing emp`);
          return;
        }

        const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
        if (dayShifts.length === 0) {
          console.log(`[handleRemoveOne] No shifts found for ${dayKey}`);
          return;
        }

        const shift = dayShifts[0];

        // Find the specific assignment to delete
        const assignmentToDelete = weekBundle.assignments.find(a => {
          const sh = weekBundle.shifts.find(s => s.shiftId === a.shiftId);
          return (
            sh?.date === dayKey &&
            a.employeeId === emp.employee_id &&
            a.shiftId === shift.shiftId &&
            a.startTime === slot.startTime &&
            a.endTime === slot.endTime
          );
        });

        if (!assignmentToDelete) {
          console.warn(`[handleRemoveOne] ✗ Assignment not found`);
          return;
        }

        if (assignmentToDelete.isManual) {
          // Manual assignment - just delete it
          console.log(`[handleRemoveOne] Deleting manual assignment ${assignmentToDelete.id}`);
          await api.deleteManualAssignment(weekId, String(assignmentToDelete.id));
          console.log(`[handleRemoveOne] ✓ Deleted manual assignment`);
        } else {
          // Auto-generated assignment - need to clear day and rebuild without this slot
          console.log(`[handleRemoveOne] Converting auto assignment day to manual`);
          
          // Get ALL current time slots from UI
          const currentDaySlots = slots.filter(ts => ts.assignedStaff.length > 0);

          console.log(`[handleRemoveOne] Found ${currentDaySlots.length} active time slots in UI`);

          // Clear the entire day
          await api.clearDay(weekId, dayKey);
          console.log(`[handleRemoveOne] Cleared day ${dayKey}`);

          // Save back all current UI slots as manual assignments EXCEPT the one being removed
          let savedCount = 0;
          
          for (const ts of currentDaySlots) {
            for (const staff of ts.assignedStaff) {
              // Skip the slot being removed
              if (
                ts.id === removeConfirm.slotId &&
                staff.name === removeConfirm.staffName
              ) {
                console.log(`[handleRemoveOne] Skipping removed slot: ${ts.startTime}-${ts.endTime} for ${staff.name}`);
                continue;
              }

              // Find employee by name
              const empObj = employeesUI.find(e => e.name === staff.name);
              if (!empObj) {
                console.warn(`[handleRemoveOne] Employee not found: ${staff.name}`);
                continue;
              }

              // Save as manual assignment
              await api.saveManualAssignment({
                week: weekId,
                shiftId: shift.shiftId,
                employeeId: empObj.employee_id,
                role: staff.role.toUpperCase(),
                start_time: ts.startTime,
                end_time: ts.endTime,
              });
              savedCount++;
            }
          }

          console.log(`[handleRemoveOne] ✓ Converted day to manual: saved ${savedCount} slots, removed 1 slot`);
        }
        
        // Refresh bundle to get updated state
        const bundle = await fetchWeekBundle(weekId);
        setWeekBundle(bundle);
        
        // Recalculate indicators with new assignments
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        
        const weekStart = startOfWeek(anchorDate);
        const tiles = Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const key = mkKey(d);
          const localInd = localIndicators[key];
          const backendInd = backendIndicatorsByDate.get(key);
          
          return {
            date: d,
            mismatches: localInd?.mismatches ?? 0,
            demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed',
            traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High',
          };
        });
        
        setWeekDaysLive(tiles);
      } catch (e) {
        console.error('[handleRemoveOne] Failed to delete from backend:', e);
        Alert.alert('Error', 'Failed to remove assignment. Please try again.');
      }
    })();
    
    setRemoveConfirm(null);
  };

  // Week navigation helpers
  const today = new Date();
  const openDay = (d: Date) => { setSelectedDate(d); setMode('day'); setAnchorDate(d); };
  const todayInThisWeek = addDays(start, [0,1,2,3,4,5,6].find(i => isSameDay(addDays(start, i), today)) ?? 0);
  const focusedDate = mode === 'day' ? (selectedDate ?? today) : ((selectedDate && isSameDay(selectedDate, today)) ? selectedDate : todayInThisWeek);
  const focusedKey = mkKey(focusedDate);
  const granularity: 'weekly' | 'daily' = mode === 'week' ? 'weekly' : 'daily';

  const onGranularityChange = (g: 'weekly' | 'daily') => { if (g === 'daily') { const d = today; setSelectedDate(d); setAnchorDate(d); setMode('day'); } else { setMode('week'); } };
  const onPrev = () => { if (mode === 'week') setAnchorDate(d => addWeeks(d, -1)); else setSelectedDate(d => { const prev = addDays(d ?? today, -1); setAnchorDate(prev); return prev; }); };
  const onNext = () => { if (mode === 'week') setAnchorDate(d => addWeeks(d, 1)); else setSelectedDate(d => { const next = addDays(d ?? today, 1); setAnchorDate(next); return next; }); };
  const dateLabel = mode === 'week' ? weekRangeLabel(anchorDate) : dayLabelLong(focusedDate);

  const demandIcons = { Coffee: CoffeeIcon, Sandwich: SandwichIcon, Mixed: MixedIcon } as const;
  
  // Get focused day indicators (for daily view)
  const focusedTile = weekDaysLive?.find(t => mkKey(t.date) === focusedKey);
  const focusedIndicators: DayIndicators = focusedTile ? {
    mismatches: focusedTile.mismatches,
    demand: focusedTile.demand,
    traffic: focusedTile.traffic.toLowerCase() as 'low' | 'medium' | 'high'
  } : DEFAULT_DAY_INDICATORS;
  
  // Daily metrics - current day only
  const dailyMismatchTone: IndicatorItem['tone'] = (focusedIndicators.mismatches ?? 0) === 0 ? 'good' : (focusedIndicators.mismatches ?? 0) <= 2 ? 'warn' : 'alert';
  const dailyTrafficTone: IndicatorItem['tone'] =
    focusedIndicators.traffic === 'low' ? 'good' :
    focusedIndicators.traffic === 'high' ? 'alert' : 'warn';

  const dailyPillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: dailyMismatchTone, variant: 'value', value: String(focusedIndicators.mismatches ?? 0) },
    { label: focusedIndicators.demand ?? '—', tone: 'neutral', variant: 'icon', icon: demandIcons[(focusedIndicators.demand ?? 'Mixed') as keyof typeof demandIcons], iconColor: colours.text.secondary },
    { label: 'Traffic', tone: dailyTrafficTone, variant: 'icon', icon: TrafficIcon },
  ];

  // Weekly metrics - totals and averages across the week
  const totalWeekMismatches = weekDaysLive ? weekDaysLive.reduce((sum, day) => sum + (day.mismatches ?? 0), 0) : 0;
  const weekMismatchTone: IndicatorItem['tone'] = totalWeekMismatches === 0 ? 'good' : totalWeekMismatches <= 2 ? 'warn' : 'alert';
  
  // Most common demand type
  const demandCounts = weekDaysLive ? weekDaysLive.reduce((acc, day) => {
    const demand = day.demand ?? 'Mixed';
    acc[demand] = (acc[demand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};
  const highestDemand = (Object.entries(demandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed';
  
  // Average traffic level
  const trafficValues = { Low: 1, Medium: 2, High: 3 };
  const trafficLabels = { 1: 'Low', 2: 'Medium', 3: 'High' } as const;
  const avgTrafficValue = weekDaysLive ? Math.round(
    weekDaysLive.reduce((sum, day) => sum + trafficValues[day.traffic ?? 'Medium'], 0) / weekDaysLive.length
  ) : 2;
  const avgTraffic = trafficLabels[avgTrafficValue as keyof typeof trafficLabels] || 'Medium';
  const weekTrafficTone: IndicatorItem['tone'] = avgTraffic === 'Low' ? 'good' : avgTraffic === 'High' ? 'alert' : 'warn';

  const weeklyPillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: weekMismatchTone, variant: 'value', value: String(totalWeekMismatches) },
    { label: highestDemand, tone: 'neutral', variant: 'icon', icon: demandIcons[highestDemand], iconColor: colours.text.secondary },
    { label: 'Traffic', tone: weekTrafficTone, variant: 'icon', icon: TrafficIcon },
  ];

  // Previous week metrics
  const totalPrevMismatches = prevWeekDays ? prevWeekDays.reduce((sum, day) => sum + (day.mismatches ?? 0), 0) : 0;
  const prevMismatchTone: IndicatorItem['tone'] = totalPrevMismatches === 0 ? 'good' : totalPrevMismatches <= 2 ? 'warn' : 'alert';
  
  const prevDemandCounts = prevWeekDays ? prevWeekDays.reduce((acc, day) => {
    const demand = day.demand ?? 'Mixed';
    acc[demand] = (acc[demand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};
  const prevHighestDemand = (Object.entries(prevDemandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed';
  
  const prevAvgTrafficValue = prevWeekDays ? Math.round(
    prevWeekDays.reduce((sum, day) => sum + trafficValues[day.traffic ?? 'Medium'], 0) / prevWeekDays.length
  ) : 2;
  const prevAvgTraffic = trafficLabels[prevAvgTrafficValue as keyof typeof trafficLabels] || 'Medium';
  const prevTrafficTone: IndicatorItem['tone'] = prevAvgTraffic === 'Low' ? 'good' : prevAvgTraffic === 'High' ? 'alert' : 'warn';

  const previousWeekPillItems: IndicatorItem[] = [
    { label: 'Mismatches', tone: prevMismatchTone, variant: 'value', value: String(totalPrevMismatches) },
    { label: prevHighestDemand, tone: 'neutral', variant: 'icon', icon: demandIcons[prevHighestDemand], iconColor: colours.text.secondary },
    { label: 'Traffic', tone: prevTrafficTone, variant: 'icon', icon: TrafficIcon },
  ];

  // Use weekDaysLive directly (same format as web)
  const weekDays = weekDaysLive ?? [];

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

        {mode === 'day' && <View style={s.pillsWrapper}><IndicatorPills items={dailyPillItems} /></View>}
        {mode === 'week' && <View style={s.pillsWrapper}><IndicatorPills items={weeklyPillItems} /></View>}

        {mode === 'week' ? (
          <>
            <WeekView
              anchorDate={anchorDate}
              days={weekDays}
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

      <AutoShiftBar 
        onPress={mode === 'week' ? runAutoScheduleWeek : runAutoScheduleDay} 
        floating 
        bottom={bottomOffset} 
      />

      <AvailableEmployeesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        slotStart={activeSlot?.startTime ?? '7:00 am'}
        slotEnd={activeSlot?.endTime ?? '4:00 pm'}
        onAssign={handleAssign}
        isEmployeeAssigned={isEmployeeAssigned}
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