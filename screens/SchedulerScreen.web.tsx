import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDays, addWeeks, startOfWeek } from '../utils/date';
import Header from '../components/Header'; // Automatically resolves to web-specific header component
import { colours } from '../theme/colours';
import { DayIndicators } from '../state/types';
import { TimeSlotData } from '../components/web/TimeSlot.web';
import { scoreToTone } from '../helpers/timeUtils';
import { generateTimeSlots, generateTimeOptions, deduplicateManualAssignments } from '../helpers/schedulerIO';
import { generateMockWeekIndicators, DEFAULT_DAY_INDICATORS } from '../data/mock/weekIndicators';
import { MOCK_DEMAND_FORECAST_METRICS, MOCK_PREVIOUS_WEEK_METRICS, type MetricCard } from '../data/mock/metrics';

// Web-optimised components with responsive breakpoints
import WeekForecastGrid, { WeekForecastDay } from '../components/web/WeekForecastGrid';
import AvailableStaffList, { StaffBubble } from '../components/web/AvailableStaffList';
import MetricsRow from '../components/web/MetricsRow';
import AvailableStaffSidebar from '../components/web/AvailableStaffSidebar';
import AvailableEmployeesModal from '../components/modals/AvailableEmployeesModal';
import RemoveStaffConfirmModal from '../components/modals/RemoveStaffConfirmModal';

// Cross-platform components compatible with web
import DateSwitch from '../components/roster/DateSwitch';
import DateNavigator from '../components/calendar/DateNavigator';
import TimeSlotWeb from '../components/web/TimeSlot.web';
import type { UIEmployee } from '../viewmodels/employees';
import { useEmployeesUI } from '../viewmodels/employees';

// Icons
import NotificationIcon from '../assets/notification.svg';

import { subscribeWeekAssignments } from '../data/assignments.repo';

import type { AssignmentDTO } from '../api/client';

import { fetchWeekBundle, type WeekBundle } from '../data/scheduler.repo';
import { buildDaySlots } from '../viewmodels/schedule';
import { buildWeekIndicators } from '../helpers/indicators';

import { api } from '../api/client';
import Constants from 'expo-constants';

const TIME_OPTIONS = generateTimeOptions();

// Runtime feature flag: prefer Expo env, but allow quick toggle via window.__USE_API__ for dev
const USE_API =
  (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_USE_API === 'true') ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_USE_API === 'true') ||
  (typeof window !== 'undefined' && (window as any).__USE_API__ === true);

export default function SchedulerScreenWeb() {
  const navigation = useNavigation();
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [isStaffExpanded, setIsStaffExpanded] = React.useState(false);
  const [granularity, setGranularity] = React.useState<'weekly' | 'daily'>('daily');
  const { width } = useWindowDimensions();

  // Load employees from API or mock based on config
  const employeesUI = useEmployeesUI();

  // Daily scheduling state management
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlotData | null>(null);
  const [timeSlots, setTimeSlots] = React.useState<TimeSlotData[]>(generateTimeSlots());

  // Remove staff confirmation modal state
  const [removeConfirm, setRemoveConfirm] = React.useState<{
    slotId: string;
    staffIndex: number;
    staffName: string;
  } | null>(null);

  // Responsive breakpoints for adaptive layout behaviour
  const isCompact = width < 900;
  const isSmall = width < 640;

  // Sample weekly data for the forecast
  const weekStart = startOfWeek(anchorDate);
  const weekId = toIsoWeekId(weekStart);

  React.useEffect(() => {
    if (!USE_API) return;
    const unsub = subscribeWeekAssignments(weekId, (rows) => {
      // TODO: map rows -> setTimeSlots(...)
    });
    return () => unsub?.();
  }, [weekId]);

  // LOCAL date key to avoid UTC rollover issues (e.g., Fri showing Thu)
  const mkKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  // Transform week data for forecast grid component
  // This will be replaced by weekDaysLive when bundle loads
  const weekDays: WeekForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: d,
      mismatches: -1, // Placeholder while loading
      demand: 'Mixed' as const,
      traffic: 'Medium' as const,
    };
  });

  // Create placeholder tiles while loading (shows dates but no data)
  const placeholderDays: WeekForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: d,
      mismatches: -1, // Special value to indicate loading
      demand: 'Mixed' as const,
      traffic: 'Medium' as const,
    };
  });

  // --- Scheduler API wiring (uses weekStart above) ---
  const [isScheduling, setIsScheduling] = React.useState(false);

  // NEW: live bundle + live weekly tiles
  const [weekBundle, setWeekBundle] = React.useState<null | Awaited<ReturnType<typeof fetchWeekBundle>>>(null);
  const [weekDaysLive, setWeekDaysLive] = React.useState<WeekForecastDay[] | null>(null);
  
  // Previous week data for comparison
  const [prevWeekDays, setPrevWeekDays] = React.useState<WeekForecastDay[] | null>(null);

  // Load scheduled days from localStorage for current week
  const getScheduledDays = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    const stored = window.localStorage.getItem(`scheduledDays_${weekId}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  };

  const [scheduledDays, setScheduledDays] = React.useState<Set<string>>(getScheduledDays());

  // Save scheduled days to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`scheduledDays_${weekId}`, JSON.stringify(Array.from(scheduledDays)));
    }
  }, [scheduledDays, weekId]);

  // Reload scheduled days when week changes
  React.useEffect(() => {
    setScheduledDays(getScheduledDays());
  }, [weekId]);

  // Fetch week bundle when week changes (if API enabled)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!USE_API) {
          setWeekBundle(null);
          setWeekDaysLive(null);
          setTimeSlots(generateTimeSlots());
          return;
        }
        const bundle = await fetchWeekBundle(weekId);
        if (cancelled) return;
        setWeekBundle(bundle);

        // Initialize scheduledDays from backend: mark days that have assignments
        const daysWithAssignments = new Set<string>();
        bundle.assignments.forEach(a => {
          const shift = bundle.shifts.find(s => s.shiftId === a.shiftId);
          if (shift?.date) {
            daysWithAssignments.add(shift.date);
          }
        });
        
        // Merge with localStorage (in case of local state)
        const localScheduledDays = getScheduledDays();
        const mergedDays = new Set([...daysWithAssignments, ...localScheduledDays]);
        setScheduledDays(mergedDays);

        // Build weekly tiles from backend indicators
        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        
        // Calculate mismatches locally (our custom logic), but use backend's demand and traffic
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        
        // Create a map of backend indicators by date for easy lookup
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const tiles: WeekForecastDay[] = Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const key = mkKey(d);
          
          // Use locally calculated mismatches (fitness-based logic)
          const localInd = localIndicators[key];
          
          // Use backend's demand and traffic (they know the business rules better)
          const backendInd = backendIndicatorsByDate.get(key);
          
          return {
            date: d,
            mismatches: localInd?.mismatches ?? 0, // Local calculation
            demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed', // Backend demand
            traffic: (trafficMapping[backendInd?.traffic ?? 'medium']) as 'Low' | 'Medium' | 'High', // Backend traffic
          };
        });
        setWeekDaysLive(tiles);

        // Initialize time slots for the current day based on whether it has assignments
        const dayKey = mkKey(anchorDate);
        const dayHasAssignments = bundle.assignments.some(a => {
          const shift = bundle.shifts.find(s => s.shiftId === a.shiftId);
          return shift?.date === dayKey;
        });
        
        if (dayHasAssignments) {
          // Day has assignments in backend, show them
          const dayTile = tiles.find(t => mkKey(t.date) === dayKey);
          // UI now uses "Sandwich" consistently
          const demand = dayTile?.demand;
          setTimeSlots(buildDaySlots(dayKey, bundle, demand));
        } else {
          // No assignments yet, show empty slots
          const dayShifts = bundle.shifts.filter(s => s.date === dayKey);
          setTimeSlots(generateTimeSlots(dayShifts));
        }
      } catch (e) {
        console.warn('fetchWeekBundle failed', e);
        setWeekBundle(null);
        setWeekDaysLive(null);
      }
    })();
    return () => { cancelled = true; };
  }, [weekId]);

  // Fetch previous week's data for comparison metrics
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!USE_API) {
          setPrevWeekDays(null);
          return;
        }
        
        // Calculate previous week ID
        const prevWeekStart = addWeeks(weekStart, -1);
        const prevWeekId = toIsoWeekId(prevWeekStart);
        
        const bundle = await fetchWeekBundle(prevWeekId);
        if (cancelled) return;

        // Build weekly tiles from backend indicators for previous week
        const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
        const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
        
        // Calculate mismatches locally, use backend's demand and traffic
        const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
        
        const backendIndicatorsByDate = new Map(
          bundle.indicators.days.map(day => [day.date, day])
        );
        
        const tiles: WeekForecastDay[] = Array.from({ length: 7 }, (_, i) => {
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
  }, [weekId, weekStart]);

  // Recompute day slots when the selected day changes (from existing bundle)
  React.useEffect(() => {
    if (!weekBundle) return;
    const dayKey = mkKey(anchorDate);
    
    // If this day has been auto-scheduled, show backend assignments
    if (scheduledDays.has(dayKey)) {
      const dayTile = weekDaysLive?.find(t => mkKey(t.date) === dayKey);
      const demand = dayTile?.demand; // Already normalized to "Sandwich"
      setTimeSlots(buildDaySlots(dayKey, weekBundle, demand));
    } else {
      // Not auto-scheduled: show empty slots (manual assignments in local state will remain)
      const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
      setTimeSlots(generateTimeSlots(dayShifts));
    }
  }, [anchorDate, scheduledDays, weekBundle, weekDaysLive]); // Depend on anchorDate, scheduledDays, weekBundle, and weekDaysLive

  // Helper: Save local manual assignments to backend before Auto Shift
  async function saveLocalManualAssignments(dayKey: string) {
    if (!weekBundle) return;
    
    // Get manually assigned staff from current timeSlots
    const rawAssignments: Array<{ employee: string; slot: TimeSlotData }> = [];
    timeSlots.forEach(slot => {
      slot.assignedStaff.forEach(staff => {
        rawAssignments.push({ employee: staff.name, slot });
      });
    });
    
    if (rawAssignments.length === 0) return; // No manual assignments to save
    
    // Find shifts for this day
    const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
    if (dayShifts.length === 0) return;
    
    const shift = dayShifts[0]; // Use first shift for the day
    
    // Convert to ManualAssignment format
    const assignments = rawAssignments.map(({ employee, slot }) => {
      const emp = employeesUI.find(e => e.name === employee);
      const staffMember = slot.assignedStaff.find(s => s.name === employee);
      
      return {
        employeeId: emp?.employee_id || 0,
        shiftId: shift.shiftId,
        role: staffMember?.role?.toUpperCase() || 'MANAGER',
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    }).filter(a => a.employeeId !== 0);
    
    // Deduplicate: merge consecutive slots for same employee/shift/role
    const deduplicated = deduplicateManualAssignments(assignments);
    
    // Save each deduplicated assignment
    for (const assignment of deduplicated) {
      try {
        await api.saveManualAssignment({
          week: weekId,
          shiftId: assignment.shiftId,
          employeeId: assignment.employeeId,
          role: assignment.role,
          start_time: assignment.startTime,
          end_time: assignment.endTime,
        });
      } catch (e) {
        console.error('[saveLocalManualAssignments] Failed to save:', e);
      }
    }
  }

  // Auto Shift for entire week (called from week view button)
  async function runAutoScheduleWeek() {
    setIsScheduling(true);
    try {
      // Clean up any existing duplicate manual assignments before scheduling
      try {
        await api.cleanupDuplicateAssignments(weekId);
      } catch (cleanupError) {
        console.warn('[runAutoScheduleWeek] Cleanup failed (non-fatal):', cleanupError);
      }
      
      await api.runSchedule(weekId);

      // Fetch updated bundle to get the new assignments
      const bundle = await fetchWeekBundle(weekId);

      // Day view: fill slots for the current anchorDate
      const dayKey = mkKey(anchorDate);
      
      // Calculate mismatches locally, but use backend's demand and traffic (preserve original shift data)
      const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
      
      // Create a map of backend indicators by date for easy lookup
      const backendIndicatorsByDate = new Map(
        bundle.indicators.days.map(day => [day.date, day])
      );
      
      const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
      const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
      
      const weekDaysLiveNext = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        const key = mkKey(d);
        const localInd = localIndicators[key];
        const backendInd = backendIndicatorsByDate.get(key);
        
        return {
          date: d,
          mismatches: localInd?.mismatches ?? 0, // Local calculation
          demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed', // Backend demand
          traffic: trafficMapping[backendInd?.traffic ?? 'medium'] as 'Low' | 'Medium' | 'High', // Backend traffic
        };
      });
      
      // Get demand for current day and build slots
      const dayTile = weekDaysLiveNext.find(t => mkKey(t.date) === dayKey);
      const demand = dayTile?.demand; // Already normalized to "Sandwich"
      const slots = buildDaySlots(dayKey, bundle, demand);
      setTimeSlots(slots);
      
      setWeekBundle(bundle);
      setWeekDaysLive(weekDaysLiveNext);
      
      // Mark all days with assignments as scheduled
      const daysWithAssignments = new Set<string>();
      bundle.assignments.forEach(a => {
        const shift = bundle.shifts.find(s => s.shiftId === a.shiftId);
        if (shift?.date) {
          daysWithAssignments.add(shift.date);
        }
      });
      setScheduledDays(daysWithAssignments);

      alert(`Schedule created for ${weekId}: ${bundle.assignments.length} assignments`);
    } catch (e: any) {
      console.warn(e);
      const errorMsg = e?.message ?? String(e);
      if (errorMsg.includes('No shifts found')) {
        alert(`Cannot schedule ${weekId}: No shifts exist for this week. Please create shifts in the database first.`);
      } else {
        alert(`Scheduling error: ${errorMsg}`);
      }
    } finally {
      setIsScheduling(false);
    }
  }

  // Auto Shift for current day only (called from day view button)
  async function runAutoScheduleDay() {
    setIsScheduling(true);
    try {
      const dayKey = mkKey(anchorDate);
      
      // Save any remaining local manual assignments (safety net - most should already be saved)
      await saveLocalManualAssignments(dayKey);
      
      // Clear local state before running Auto Shift
      if (!weekBundle) return;
      const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
      setTimeSlots(generateTimeSlots(dayShifts));
      
      // Check if this day is already scheduled
      if (scheduledDays.has(dayKey)) {
        const confirm = window.confirm(`${dayKey} is already scheduled. Re-schedule this day?`);
        if (!confirm) {
          setIsScheduling(false);
          return;
        }
      }
      
      // Call the day-specific scheduling endpoint
      await api.runDaySchedule(weekId, dayKey);

      // Fetch updated bundle to get the new assignments
      const bundle = await fetchWeekBundle(weekId);

      // Calculate mismatches locally, but use backend's demand and traffic (preserve original shift data)
      const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
      
      // Create a map of backend indicators by date for easy lookup
      const backendIndicatorsByDate = new Map(
        bundle.indicators.days.map(day => [day.date, day])
      );
      
      const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
      const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
      
      const weekDaysLiveNext = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        const key = mkKey(d);
        const localInd = localIndicators[key];
        const backendInd = backendIndicatorsByDate.get(key);
        
        return {
          date: d,
          mismatches: localInd?.mismatches ?? 0, // Local calculation
          demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed', // Backend demand
          traffic: trafficMapping[backendInd?.traffic ?? 'medium'] as 'Low' | 'Medium' | 'High', // Backend traffic
        };
      });
      
      // Get demand for current day and build slots
      const dayTile = weekDaysLiveNext.find(t => mkKey(t.date) === dayKey);
      const demand = dayTile?.demand; // Already normalized to "Sandwich"
      const slots = buildDaySlots(dayKey, bundle, demand);
      setTimeSlots(slots);
      
      setWeekBundle(bundle);
      setWeekDaysLive(weekDaysLiveNext);
      
      // Mark this day as scheduled
      setScheduledDays(prev => new Set(prev).add(dayKey));

      const dayAssignments = bundle.assignments.filter(a => {
        const shift = bundle.shifts.find(s => s.shiftId === a.shiftId);
        return shift?.date === dayKey;
      });
      alert(`Schedule created for ${dayKey}: ${dayAssignments.length} assignments`);
    } catch (e: any) {
      console.warn(e);
      const dayKey = mkKey(anchorDate);
      const errorMsg = e?.message ?? String(e);
      if (errorMsg.includes('No shifts found')) {
        alert(`Cannot schedule ${dayKey}: No shifts exist for this day. Please create shifts in the database first.`);
      } else {
        alert(`Scheduling error: ${errorMsg}`);
      }
    } finally {
      setIsScheduling(false);
    }
  }

  // Process employee data for staff availability display
  const staff: StaffBubble[] = employeesUI.map(emp => {
    // Get first letters of first and last name (or first two letters if no spaces)
    const nameParts = emp.name.split(' ');
    const initials = nameParts.length >= 2
      ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
      : emp.name.substring(0, 2).toUpperCase();

    // Use centralized scoreToTone function for consistency
    const score = emp.score ?? 0;
    const tone = scoreToTone(score) as 'good' | 'warn' | 'bad';

    return {
      initials,
      name: emp.name,
      tone,
      score,
    };
  });

  // Functions for daily view interactions
  const handleAddStaff = (slot: TimeSlotData) => {
    // Click same slot to deselect it
    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleCancelAssignment = () => {
    setSelectedSlot(null);
  };

  const handleClearRoster = async () => {
    if (!USE_API || !weekBundle) return;
    
    const dayKey = mkKey(anchorDate);
    
    try {
      // Clear all assignments for the current day
      await api.clearDay(weekId, dayKey);
      
      // Refresh bundle to get updated state
      const bundle = await fetchWeekBundle(weekId);
      setWeekBundle(bundle);
      recalculateIndicators(bundle);
      
      // Clear local time slots
      setTimeSlots(generateTimeSlots(bundle.shifts.filter(s => s.date === dayKey)));
      
      alert('All staff removed from today\'s roster');
    } catch (e) {
      console.error('[handleClearRoster] Failed to clear roster:', e);
      alert('Failed to clear roster. Please try again.');
    }
  };

  // Check if an employee is already assigned in the given time range
  const isEmployeeAssigned = (employeeName: string, start: string, end: string): boolean => {
    const startIndex = TIME_OPTIONS.findIndex(time => time === start);
    const endIndex = TIME_OPTIONS.findIndex(time => time === end);

    return timeSlots.some(slot => {
      const slotStartIndex = TIME_OPTIONS.findIndex(time => time === slot.startTime);
      // Check if this slot is in the requested range
      if (slotStartIndex >= startIndex && slotStartIndex < endIndex) {
        // Check if employee is already assigned to this slot
        return slot.assignedStaff.some(staff => staff.name === employeeName);
      }
      return false;
    });
  };

  // Helper to recalculate indicators after assignment changes
  const recalculateIndicators = (bundle: WeekBundle) => {
    // Calculate mismatches locally, but use backend's demand and traffic (preserve original shift data)
    const localIndicators = buildWeekIndicators(bundle.shifts, bundle.assignments, bundle.employees);
    
    // Create a map of backend indicators by date for easy lookup
    const backendIndicatorsByDate = new Map(
      bundle.indicators.days.map(day => [day.date, day])
    );
    
    const demandMapping = { Coffee: 'Coffee', Sandwiches: 'Sandwich', Sandwich: 'Sandwich', Mixed: 'Mixed' } as const;
    const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
    
    const updatedTiles = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const key = mkKey(d);
      const localInd = localIndicators[key];
      const backendInd = backendIndicatorsByDate.get(key);
      
      return {
        date: d,
        mismatches: localInd?.mismatches ?? 0, // Local calculation
        demand: (demandMapping[backendInd?.demand as keyof typeof demandMapping] || 'Mixed') as 'Coffee' | 'Sandwich' | 'Mixed', // Backend demand
        traffic: trafficMapping[backendInd?.traffic ?? 'medium'] as 'Low' | 'Medium' | 'High', // Backend traffic
      };
    });
    setWeekDaysLive(updatedTiles);
  };

  const handleRemoveStaff = (slotId: string, staffIndex: number, staffName: string) => {
    // Show confirmation modal
    setRemoveConfirm({ slotId, staffIndex, staffName });
  };

  const handleRemoveAll = () => {
    if (!removeConfirm) return;

    // Remove from all slots in local state
    setTimeSlots(slots =>
      slots.map(slot => ({
        ...slot,
        assignedStaff: slot.assignedStaff.filter(staff => staff.name !== removeConfirm.staffName),
      }))
    );

    // Save to backend: delete all assignments for this employee on this day
    // Clear day and rebuild without this employee
    (async () => {
      try {
        const dayKey = mkKey(anchorDate);
        const emp = employeesUI.find(e => e.name === removeConfirm.staffName);
        if (!emp || !weekBundle) return;

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
          
          // Get ALL current time slots from UI
          const currentDaySlots = timeSlots.filter(ts => ts.assignedStaff.length > 0);

          // Clear the entire day
          await api.clearDay(weekId, dayKey);

          // Save back all slots EXCEPT those for the removed employee
          let savedCount = 0;
          const shift = dayShifts[0];
          
          for (const ts of currentDaySlots) {
            for (const staff of ts.assignedStaff) {
              // Skip slots for the employee being removed
              if (staff.name === removeConfirm.staffName) {
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

        } else {
          // All manual assignments - just delete them
          const manualAssignments = employeeAssignments.filter(a => a.isManual === true);
          
          for (const assignment of manualAssignments) {
            await api.deleteManualAssignment(weekId, String(assignment.id));
          }
        }
        
        // Refresh bundle to get updated state
        const bundle = await fetchWeekBundle(weekId);
        setWeekBundle(bundle);
        
        // Recalculate indicators with new assignments
        recalculateIndicators(bundle);
      } catch (e) {
        console.error('[handleRemoveAll] Failed to delete from backend:', e);
      }
    })();

    setRemoveConfirm(null);
  };

  const handleRemoveOne = () => {
    if (!removeConfirm) return;

    // Find the slot being modified
    const slot = timeSlots.find(s => s.id === removeConfirm.slotId);
    if (!slot) return;

    // Remove from just this slot in local state
    setTimeSlots(slots =>
      slots.map(s => {
        if (s.id === removeConfirm.slotId) {
          const newStaff = [...s.assignedStaff];
          newStaff.splice(removeConfirm.staffIndex, 1);
          return { ...s, assignedStaff: newStaff };
        }
        return s;
      })
    );

    // Save to backend: delete assignment for this specific time slot
    // If it's an auto-generated assignment, we need to convert the entire day to manual
    (async () => {
      try {
        const dayKey = mkKey(anchorDate);
        const emp = employeesUI.find(e => e.name === removeConfirm.staffName);
        if (!emp || !weekBundle) {
          return;
        }

        const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
        if (dayShifts.length === 0) {
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
          return;
        }

        if (assignmentToDelete.isManual) {
          // Manual assignment - just delete it
          await api.deleteManualAssignment(weekId, String(assignmentToDelete.id));
        } else {
          // Auto-generated assignment - need to clear day and rebuild without this slot          
          // Get ALL current time slots from UI (this has the actual rendered state)
          const currentDaySlots = timeSlots.filter(ts => {
            // Only include slots that have assigned staff
            return ts.assignedStaff.length > 0;
          });

          // Clear the entire day
          await api.clearDay(weekId, dayKey);

          // Save back all current UI slots as manual assignments EXCEPT the one being removed
          let savedCount = 0;
          const dayShifts = weekBundle.shifts.filter(s => s.date === dayKey);
          const shift = dayShifts[0];
          
          if (!shift) {
            return;
          }

          for (const ts of currentDaySlots) {
            for (const staff of ts.assignedStaff) {
              // Skip the slot being removed
              if (
                ts.id === removeConfirm.slotId &&
                staff.name === removeConfirm.staffName
              ) {
                continue;
              }

              // Find employee by name
              const emp = employeesUI.find(e => e.name === staff.name);
              if (!emp) {
                continue;
              }

              // Save as manual assignment
              await api.saveManualAssignment({
                week: weekId,
                shiftId: shift.shiftId,
                employeeId: emp.employee_id,
                role: staff.role.toUpperCase(),
                start_time: ts.startTime,
                end_time: ts.endTime,
              });
              savedCount++;
            }
          }
        }
        
        // Refresh bundle to get updated state
        const bundle = await fetchWeekBundle(weekId);
        setWeekBundle(bundle);
        
        // Recalculate indicators with new assignments
        recalculateIndicators(bundle);
      } catch (e) {
        console.error('[handleRemoveOne] Failed to delete from backend:', e);
        alert('Failed to remove assignment. Please try again.');
      }
    })();

    setRemoveConfirm(null);
  };

  const handleAssignStaff = ({ employee, start, end, role }: { employee: UIEmployee; start: string; end: string; role?: string }) => {
    // Check if employee is already assigned to any overlapping time slot
    const startIndex = TIME_OPTIONS.findIndex(time => time === start);
    const endIndex = TIME_OPTIONS.findIndex(time => time === end);

    const hasOverlap = timeSlots.some(slot => {
      const slotStartIndex = TIME_OPTIONS.findIndex(time => time === slot.startTime);
      // Check if this slot is in the requested range
      if (slotStartIndex >= startIndex && slotStartIndex < endIndex) {
        // Check if employee is already assigned to this slot
        return slot.assignedStaff.some(staff => staff.name === employee.name);
      }
      return false;
    });

    if (hasOverlap) {
      // This shouldn't happen since the UI should disable the employee, but just in case
      console.warn(`[handleAssignStaff] Employee ${employee.name} is already assigned to overlapping slot`);
      return;
    }

    // Add to local state for immediate UI feedback
    const newStaffMember = {
      name: employee.name,
      role: role || 'Manager',
      tone: scoreToTone(employee.score),
    };

    setTimeSlots(slots =>
      slots.map(slot => {
        const slotStartIndex = TIME_OPTIONS.findIndex(time => time === slot.startTime);
        if (slotStartIndex >= startIndex && slotStartIndex < endIndex) {
          return {
            ...slot,
            assignedStaff: [...slot.assignedStaff, newStaffMember],
          };
        }
        return slot;
      })
    );

    // Save to backend immediately

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
          role: (role || 'Manager').toUpperCase(),
          start_time: start,
          end_time: end,
        });

        // Refresh bundle to get updated state
        const bundle = await fetchWeekBundle(weekId);
        setWeekBundle(bundle);
        
        // Recalculate indicators with new assignments
        recalculateIndicators(bundle);
        
        // Update scheduledDays to mark this day as having assignments
        setScheduledDays(prev => new Set(prev).add(dayKey));
      } catch (e) {
        console.error('[handleAssignStaff] Failed to save to backend:', e);
        alert('Failed to save assignment. Please try again.');
      }
    })();

    setSelectedSlot(null);
  };

  // Daily metrics based on current day data
  const dailyMetrics: MetricCard[] = React.useMemo(() => {
    // Get the tile for today to access the day's mismatch count from indicators
    const tile = (weekDaysLive ?? []).find(d => d.date.toDateString() === anchorDate.toDateString());
    const mismatchesTotal = tile?.mismatches ?? 0;
    const primaryDemand = tile?.demand ?? 'Mixed';
    const expectedTraffic = tile?.traffic ?? 'Medium';

    // Map traffic level to color kind
    const trafficKind = expectedTraffic === 'Low' 
      ? 'success' 
      : expectedTraffic === 'High' 
        ? 'alert' 
        : 'warning'; // Medium

    // Map mismatch count to color kind (0: green, 1-2: orange, 3+: red)
    const mismatchKind = mismatchesTotal === 0 
      ? 'success' 
      : mismatchesTotal <= 2 
        ? 'warning' 
        : 'alert';

    // Placeholder for now; wire to availability once ready
    const availability = '—';
    const weather = '—';
    const localEvent = '—';

    return [
      { kind: mismatchKind, title: 'Skill Mismatches', value: String(mismatchesTotal) },
      { kind: 'neutral', title: 'Primary Demand', value: primaryDemand },
      { kind: trafficKind, title: 'Expected Traffic', value: expectedTraffic },
      { kind: 'chart', title: 'Availability', value: availability },
      { kind: 'neutral', title: 'Weather', value: weather },
      { kind: 'neutral', title: 'Local Event', value: localEvent },
    ];
  }, [weekDaysLive, anchorDate]);

  // Format current day date for navigation
  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate weekly demand forecast metrics from weekDaysLive
  const demandMetrics: MetricCard[] = React.useMemo(() => {
    if (!weekDaysLive || weekDaysLive.length === 0) {
      return [
        { kind: 'neutral', title: 'Skill Mismatches', value: '—' },
        { kind: 'neutral', title: 'Highest Average Demand', value: '—' },
        { kind: 'neutral', title: 'Expected Average Traffic', value: '—' },
        { kind: 'neutral', title: 'Average Availability', value: '—' },
      ];
    }

    // Total skill mismatches across the week
    const totalMismatches = weekDaysLive.reduce((sum, day) => sum + day.mismatches, 0);
    const mismatchKind = totalMismatches === 0 ? 'success' : totalMismatches <= 2 ? 'warning' : 'alert';

    // Most common demand type
    const demandCounts = weekDaysLive.reduce((acc, day) => {
      acc[day.demand] = (acc[day.demand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const highestDemand = Object.entries(demandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';

    // Average traffic level (convert to numeric, average, convert back)
    const trafficValues = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const trafficLabels = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const avgTrafficValue = Math.round(
      weekDaysLive.reduce((sum, day) => sum + trafficValues[day.traffic], 0) / weekDaysLive.length
    );
    const avgTraffic = trafficLabels[avgTrafficValue as keyof typeof trafficLabels] || 'Medium';
    const trafficKind = avgTraffic === 'High' ? 'alert' : avgTraffic === 'Medium' ? 'warning' : 'success';

    // Calculate availability from employee data
    const availability = weekBundle && employeesUI.length > 0
      ? employeesUI.length >= 10 ? 'High' : employeesUI.length >= 5 ? 'Medium' : 'Low'
      : 'Medium';

    return [
      { kind: mismatchKind, title: 'Skill Mismatches', value: String(totalMismatches) },
      { kind: 'neutral', title: 'Highest Average Demand', value: highestDemand },
      { kind: trafficKind, title: 'Expected Average Traffic', value: avgTraffic },
      { kind: 'chart', title: 'Average Availability', value: availability },
    ];
  }, [weekDaysLive, weekBundle, employeesUI]);

  // Calculate previous week metrics
  const prevWeekMetrics: MetricCard[] = React.useMemo(() => {
    if (!prevWeekDays || prevWeekDays.length === 0) {
      return [
        { kind: 'neutral', title: 'Skill Mismatches', value: '—' },
        { kind: 'neutral', title: 'Highest Demand', value: '—' },
        { kind: 'neutral', title: 'Average Traffic', value: '—' },
        { kind: 'neutral', title: 'Overstaffed Shifts', value: '—' },
      ];
    }

    // Total skill mismatches across previous week
    const totalMismatches = prevWeekDays.reduce((sum, day) => sum + day.mismatches, 0);
    const mismatchKind = totalMismatches === 0 ? 'success' : totalMismatches <= 2 ? 'warning' : 'alert';

    // Most common demand type in previous week
    const demandCounts = prevWeekDays.reduce((acc, day) => {
      acc[day.demand] = (acc[day.demand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const highestDemand = Object.entries(demandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';

    // Average traffic level from previous week
    const trafficValues = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const trafficLabels = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const avgTrafficValue = Math.round(
      prevWeekDays.reduce((sum, day) => sum + trafficValues[day.traffic], 0) / prevWeekDays.length
    );
    const avgTraffic = trafficLabels[avgTrafficValue as keyof typeof trafficLabels] || 'Medium';
    const trafficKind = avgTraffic === 'High' ? 'alert' : avgTraffic === 'Medium' ? 'warning' : 'success';

    return [
      { kind: mismatchKind, title: 'Skill Mismatches', value: String(totalMismatches) },
      { kind: 'neutral', title: 'Highest Demand', value: highestDemand },
      { kind: trafficKind, title: 'Average Traffic', value: avgTraffic },
      { kind: 'alert', title: 'Overstaffed Shifts', value: '—' },
    ];
  }, [prevWeekDays]);

  return (
    <View style={{ flex: 1, backgroundColor: colours.bg.muted }}>
      <Header />
      <ScrollView style={styles.page}>
        <View style={styles.pageContent}>
          {/* Navigation bar with toggle and date controls */}
          <View style={[styles.topBar, isCompact && styles.topBarCompact]}>
            {isCompact ? (
              <View style={styles.compactNavLayout}>
                <View style={styles.compactDateNav}>
                  <DateNavigator
                    label={granularity === 'weekly' ? formatWeekRange(weekStart) : formatDayDate(anchorDate)}
                    onPrev={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, -1) : addDays(d, -1))}
                    onNext={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, 1) : addDays(d, 1))}
                  />
                </View>
                <View style={styles.compactToggle}>
                  <DateSwitch granularity={granularity} onGranularityChange={setGranularity} />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.leftSection}>
                  <DateSwitch granularity={granularity} onGranularityChange={setGranularity} fluid />
                </View>
                <View style={styles.centerSection}>
                  <DateNavigator
                    label={granularity === 'weekly' ? formatWeekRange(weekStart) : formatDayDate(anchorDate)}
                    onPrev={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, -1) : addDays(d, -1))}
                    onNext={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, 1) : addDays(d, 1))}
                  />
                </View>
                <View style={styles.rightSection}>
                  <Pressable 
                    style={styles.notificationButton}
                    onPress={() => (navigation as any).navigate('Root', {
                      screen: 'Team',
                      params: { screen: 'Feedback' }
                    })}
                    accessibilityLabel="View pending feedback"
                    accessibilityRole="button"
                  >
                    <NotificationIcon width={20} height={20} color={colours.brand.primary} />
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {/* Main content area - conditional based on granularity */}
          {granularity === 'weekly' ? (
            <>
              {/* Weekly forecast display */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Forecast</Text>
                <WeekForecastGrid
                  days={USE_API ? (weekDaysLive ?? placeholderDays) : weekDays}
                  onDayPress={(date) => {
                    setAnchorDate(date);
                    setGranularity('daily');
                  }}
                />
              </View>

              {/* Quick action button for automatic shift generation */}
              <Pressable
                style={[styles.autoShiftBtn, isScheduling && { opacity: 0.6 }]}
                disabled={isScheduling}
                onPress={runAutoScheduleWeek}

              >
                <Text style={styles.autoShiftText}>{isScheduling ? 'Scheduling…' : '+  Auto Shift'}</Text>
              </Pressable>

              {/* Current week analytics */}
              <View style={styles.section}>
                <MetricsRow title="Demand Forecast" cards={demandMetrics} />
              </View>

              {/* Historical performance data */}
              <View style={styles.section}>
                <MetricsRow title="Previous Week Overview" cards={prevWeekMetrics} />
              </View>

              {/* Staff availability overview - only show in weekly view */}
              <View style={styles.section}>
                <Pressable
                  style={styles.sectionHeaderRow}
                  onPress={() => setIsStaffExpanded(!isStaffExpanded)}
                >
                  <Text style={styles.sectionTitle}>Available Staff</Text>
                  <View style={styles.chevronBox}>
                    <Text style={styles.chevron}>{isStaffExpanded ? '▲' : '▼'}</Text>
                  </View>
                </Pressable>
                {isStaffExpanded && (
                  <View style={styles.staffListContainer}>
                    <AvailableStaffList staff={staff} />
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Daily view metrics */}
              <View style={styles.section}>
                <MetricsRow title="Today's Forecast" cards={dailyMetrics} />
              </View>

              {/* Daily schedule view with split layout */}
              <View style={styles.section}>
                <View style={[styles.splitContainer, isCompact && styles.splitContainerCompact]}>
                  {/* Left side: Time slots */}
                  <View style={[styles.timeSlotsColumn, isCompact && styles.timeSlotsColumnCompact, selectedSlot && styles.timeSlotsColumnWithOverlay]}>
                    <View style={styles.dailyScheduleHeader}>
                      <Text style={styles.timeSlotColumnTitle}>Daily Schedule</Text>
                      <Pressable onPress={handleClearRoster} hitSlop={8}>
                        <Text style={styles.clearRosterLink}>Clear roster</Text>
                      </Pressable>
                    </View>
                    <View style={[styles.timeSlotListContainer, selectedSlot && styles.contentAboveOverlay]}>
                      {/* Dark overlay when a time slot is selected - clickable to deselect */}
                      {selectedSlot && (
                        <Pressable
                          style={styles.timeSlotsOverlay}
                          onPress={handleCancelAssignment}
                          accessible={false}
                        />
                      )}
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                        style={selectedSlot && styles.contentAboveOverlay}
                      >
                        {timeSlots.map(slot => (
                          <TimeSlotWeb
                            key={slot.id}
                            slot={slot}
                            onAddStaff={handleAddStaff}
                            onRemoveStaff={handleRemoveStaff}
                            isSelected={selectedSlot?.id === slot.id}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  {/* Right side: Available staff sidebar with Auto Shift button - only on desktop */}
                  {!isCompact && (
                    <View style={[styles.staffColumn, isCompact && styles.staffColumnCompact]}>
                      <View style={styles.stickyStaffContainer}>
                        {/* Quick action button for automatic shift generation */}
                        <Pressable 
                          style={[styles.autoShiftBtnStaff, isScheduling && { opacity: 0.6 }]}
                          onPress={runAutoScheduleDay}
                          disabled={isScheduling}
                        >
                          <Text style={styles.autoShiftText}>{isScheduling ? 'Scheduling…' : '+  Auto Shift'}</Text>
                        </Pressable>
                        <AvailableStaffSidebar
                          selectedSlot={selectedSlot}
                          onAssign={handleAssignStaff}
                          onCancel={handleCancelAssignment}
                          isEmployeeAssigned={isEmployeeAssigned}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Available Staff Modal - only on mobile/compact screens */}
              {isCompact && selectedSlot && (
                <AvailableEmployeesModal
                  visible={true}
                  onClose={handleCancelAssignment}
                  slotStart={selectedSlot.startTime}
                  slotEnd={selectedSlot.endTime}
                  onAssign={handleAssignStaff}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Remove Staff Confirmation Modal */}
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

// Helper for week range label
function formatWeekRange(weekStart: Date) {
  const end = addDays(weekStart, 6);
  return `${weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colours.bg.muted,
  },
  pageContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colours.bg.subtle,
    borderRadius: Platform.OS === 'web' ? 0 : 16,
    width: '100%',
  } as any,
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    position: 'relative',
    minHeight: 40,
  },
  topBarCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 4,
    minHeight: 80,
  },
  compactNavLayout: {
    width: '100%',
    alignItems: 'center',
  },
  compactDateNav: {
    width: '100%',
    marginBottom: 8,
  },
  compactToggle: {
    alignItems: 'center',
  },
  leftSection: {
    zIndex: 5,
  },
  centerSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 5,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButtonCompact: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
  },
  section: {
    backgroundColor: colours.brand.accent,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  sectionBottom: { marginBottom: 48 },
  metricsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricsContainerCompact: {
    flexDirection: 'column',
    gap: 0,
  },
  metricsSection: {
    flex: 1,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: colours.text.primary
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronBox: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colours.border.default,
    textAlign: 'center',
    lineHeight: 18,
    color: colours.text.secondary,
    backgroundColor: colours.bg.canvas,
  },
  staffListContainer: {
    marginTop: 16,
  },
  dropdownHint: {
    fontSize: 16,
    opacity: 0.7,
    color: colours.text.muted
  },
  autoShiftBtn: {
    alignSelf: 'center',
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 16,
    width: '70%',
    maxWidth: '50%',
    alignItems: 'center',
  } as any,
  autoShiftText: {
    color: colours.bg.canvas,
    fontWeight: '600',
    fontSize: 14,
  },
  autoShiftBtnDaily: {
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
    width: '80%',
    maxWidth: '50%',
    alignSelf: 'center',
    alignItems: 'center',
  } as any,
  autoShiftBtnStaff: {
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  } as any,
  dayViewContainer: {
    backgroundColor: colours.bg.subtle,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  splitContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    minHeight: 600,
  },
  splitContainerCompact: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
  timeSlotsColumn: {
    flex: 2,
  },
  timeSlotsColumnCompact: {
    flex: 1,
  },
  staffColumn: {
    flex: 1,
    minWidth: 280,
    maxWidth: 320,
  },
  staffColumnCompact: {
    minWidth: 'auto',
    maxWidth: '100%',
    flex: 1,
  },
  stickyStaffContainer: {
    position: 'sticky',
    top: 12,
  } as any,
  timeSlotListContainer: {
    flex: 1,
    backgroundColor: colours.bg.muted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 16,
    position: 'relative',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  timeSlotsColumnWithOverlay: {
    position: 'relative',
  } as any,
  timeSlotsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    zIndex: 100,
  } as any,
  contentAboveOverlay: {
    position: 'relative',
    zIndex: 20,
  } as any,
  dailyScheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'nowrap',
  },
  timeSlotColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.text.primary,
    flex: 0,
    whiteSpace: 'nowrap',
  } as any,
  clearRosterLink: {
    color: colours.text.muted,
    fontSize: 14,
    cursor: 'pointer',
    flex: 0,
    whiteSpace: 'nowrap',
  } as any,
});

if (Platform.OS !== 'web') {
  console.warn('SchedulerScreen.web.tsx loaded on non-web platform');
}

// Produce 'YYYY-Www' (ISO-like) for the backend week key
function toIsoWeekId(d: Date): string {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  dt.setUTCDate(dt.getUTCDate() + 4 - ((dt.getUTCDay() || 7))); // Thursday trick
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((dt.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const y = dt.getUTCFullYear();
  const ww = String(weekNo).padStart(2, '0');
  return `${y}-W${ww}`;
}
