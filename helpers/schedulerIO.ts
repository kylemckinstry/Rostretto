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
 * Creates 30-minute blocks from 6am to 4pm
 * 
 * @returns Array of time slots with consistent formatting
 */
export function generateTimeSlots(): TimeSlotData[] {
  const slots: TimeSlotData[] = [];
  const startHour = 6; // 6am
  const endHour = 16; // 4pm
  
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
  const startHour = 6;
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
