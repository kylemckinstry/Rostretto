import { getEmployeesUI } from '../viewmodels/employees';
import { toSchedulerAssignment } from './roleMappers';
import { SchedulerRole } from '../state/types';
import { TimeSlotData } from '../components/roster/TimeSlot';

// Scheduler Data Serialisation

// Convert employee data to scheduler format
export function serializeSchedule() {
  const employees = getEmployeesUI().map((e) => ({
    id: e.id,
    name: e.name,
  }));

  // Assignment serialisation pending scheduling logic implementation
  const assignments: any[] = [];

  return { employees, assignments };
}

// Convert demand indicators to scheduler coverage requirements
export function roleCoverageFromIndicators(
  indicators: Record<
    string,
    {
      demand: 'Coffee' | 'Sandwich' | 'Mixed';
    }
  >
) {
  const out: Record<string, Record<SchedulerRole, number>> = {};

  for (const [dateISO, { demand }] of Object.entries(indicators)) {
    const coverage: Record<SchedulerRole, number> = {
      MANAGER: 1,
      BARISTA: 0,
      WAITER: 0,
      SANDWICH: 0,
    };

    if (demand === 'Coffee') coverage.BARISTA = 2;
    else if (demand === 'Sandwich') coverage.SANDWICH = 2;
    else {
      coverage.BARISTA = 1;
      coverage.SANDWICH = 1;
      coverage.WAITER = 1;
    }

    out[dateISO] = coverage;
  }

  return out;
}

// Time Slot Generation (shared between web and mobile)

/**
 * Generate standardized time slots for the scheduler
 * Creates 30-minute blocks within the specified time range
 * If no shifts provided, defaults to 6am-4pm
 * 
 * @param shifts - Optional array of shifts to determine time range
 * @returns Array of time slots with consistent formatting
 */
export function generateTimeSlots(shifts?: Array<{ start: string; end: string }>): TimeSlotData[] {
  let startHour = 7; // Default 7am
  let endHour = 15; // Default 3pm
  
  // If shifts provided, calculate range from actual shift times
  if (shifts && shifts.length > 0) {
    const times = shifts.flatMap(s => [parseTime(s.start), parseTime(s.end)]);
    const minMinutes = Math.min(...times);
    const maxMinutes = Math.max(...times);
    
    // Round down to nearest hour for start, up for end
    startHour = Math.floor(minMinutes / 60);
    endHour = Math.ceil(maxMinutes / 60);
  }
  
  const slots: TimeSlotData[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    // First 30-minute slot (:00)
    const slot1Start = formatTime(hour, 0);
    const slot1End = formatTime(hour, 30);
    
    slots.push({
      id: `slot-${hour}-00`,
      startTime: slot1Start,
      endTime: slot1End,
      assignedStaff: [],
      demand: null,
      mismatches: 0,
    });
    
    // Second 30-minute slot (:30)
    const slot2Start = slot1End;
    const slot2End = formatTime(hour + 1, 0);
    
    slots.push({
      id: `slot-${hour}-30`,
      startTime: slot2Start,
      endTime: slot2End,
      assignedStaff: [],
      demand: null,
      mismatches: 0,
    });
  }
  
  return slots;
}

/**
 * Parse time string to minutes since midnight
 * Handles "HH:MM" 24-hour format
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Format hour and minute into consistent time string
 * Always uses lowercase am/pm with space (e.g., "9:00 am", "2:30 pm")
 * 
 * @param hour - Hour in 24-hour format (0-23)
 * @param minute - Minute (0-59)
 * @returns Formatted time string
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Generate array of all possible time options for time pickers
 * Includes the final end time (4:00 pm) that slots don't include
 * 
 * @returns Array of formatted time strings
 */
export function generateTimeOptions(): string[] {
  const times: string[] = [];
  const startHour = 7;
  const endHour = 16;
  
  for (let hour = startHour; hour <= endHour; hour++) {
    // Add :00 time
    times.push(formatTime(hour, 0));
    
    // Add :30 time (except for final hour to avoid going past 4pm)
    if (hour < endHour) {
      times.push(formatTime(hour, 30));
    }
  }
  
  return times;
}

// Assignment Deduplication

export interface ManualAssignment {
  employeeId: number;
  shiftId: number;
  role: string;
  startTime: string;
  endTime: string;
}

/**
 * Deduplicate manual assignments by merging consecutive/overlapping time slots
 * for the same (employee, shift, role) combination.
 * 
 * Matches backend logic: keeps the widest time range for each unique
 * (employeeId, shiftId, role) combination.
 * 
 * @param assignments - Array of manual assignments (may have duplicates)
 * @returns Deduplicated array with merged time ranges
 */
export function deduplicateManualAssignments(assignments: ManualAssignment[]): ManualAssignment[] {
  if (assignments.length === 0) return [];
  
  // Group by (employeeId, shiftId, role)
  const groups = new Map<string, ManualAssignment[]>();
  
  for (const assignment of assignments) {
    const key = `${assignment.employeeId}-${assignment.shiftId}-${assignment.role}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(assignment);
  }
  
  // For each group, merge consecutive/overlapping time ranges
  const deduplicated: ManualAssignment[] = [];
  
  for (const groupAssignments of groups.values()) {
    if (groupAssignments.length === 1) {
      // Only one assignment, keep it as-is
      deduplicated.push(groupAssignments[0]);
      continue;
    }
    
    // Sort by start time
    const sorted = groupAssignments.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    // Merge consecutive/overlapping ranges
    const merged: ManualAssignment[] = [];
    let current = { ...sorted[0] };
    
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      const currentEnd = timeToMinutes(current.endTime);
      const nextStart = timeToMinutes(next.startTime);
      
      // If overlapping or consecutive (within 30 minutes or touching)
      if (nextStart <= currentEnd) {
        // Extend current range to include next
        const nextEnd = timeToMinutes(next.endTime);
        if (nextEnd > currentEnd) {
          current.endTime = next.endTime;
        }
      } else {
        // Gap detected, save current and start new range
        merged.push(current);
        current = { ...next };
      }
    }
    
    // Don't forget the last range
    merged.push(current);
    deduplicated.push(...merged);
  }
  
  return deduplicated;
}

/**
 * Convert time string (e.g., "9:00 am", "2:30 pm") to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) {
    console.warn(`Invalid time format: ${timeStr}`);
    return 0;
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toLowerCase();
  
  // Convert to 24-hour format
  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}
