// viewmodels/schedule.ts
import { generateTimeSlots, generateTimeOptions } from '../helpers/schedulerIO';
import type { WeekBundle } from '../data/scheduler.repo';
import { scoreToTone, calculateFitness } from '../helpers/timeUtils';
import type { TimeSlotData } from '../components/web/TimeSlot.web';
import type { EmployeeLite } from '../api/client';

const TIME_OPTIONS = generateTimeOptions();
const timeIdx = new Map(TIME_OPTIONS.map((t, i) => [t, i]));

// Convert 24-hour time (HH:MM) to 12-hour format with am/pm (e.g., "7:00 am")
function to12Hour(time24: string): string {
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  
  const period = hours >= 12 ? 'pm' : 'am';
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  
  return `${hours}:${minutes} ${period}`;
}

export function buildDaySlots(
  dateISO: string, 
  bundle: WeekBundle, 
  dayDemand?: 'Coffee' | 'Sandwich' | 'Mixed' | null
): TimeSlotData[] {
  const { shifts, assignments, employees } = bundle;
  
  const empById = new Map<number, string>(employees.map(e => [e.employeeId, `${e.firstName} ${e.lastName}`.trim()]));
  const shiftById = new Map(shifts.map(s => [s.shiftId, s]));

  // Filter shifts for this specific day to determine time range
  const dayShifts = shifts.filter(s => s.date === dateISO);
  
  const slots = generateTimeSlots(dayShifts).map(s => ({ ...s, assignedStaff: [] as TimeSlotData['assignedStaff'] }));

  for (const a of assignments) {
    const sh = shiftById.get(a.shiftId);
    if (!sh || sh.date !== dateISO) continue;

    // For manual assignments with specific time ranges, use those
    // For auto assignments, use the full shift time range
    let startTime12: string;
    let endTime12: string;
    
    if (a.isManual && a.startTime && a.endTime) {
      // Manual assignment: use the specific time slot selected by user
      startTime12 = a.startTime;
      endTime12 = a.endTime;
    } else {
      // Auto assignment: use the full shift time range
      startTime12 = to12Hour(sh.start);
      endTime12 = to12Hour(sh.end);
    }

    const si = timeIdx.get(startTime12) ?? -1;
    const ei = timeIdx.get(endTime12) ?? -1;
    if (si < 0 || ei < 0) continue;

    const name = empById.get(a.employeeId) ?? `#${a.employeeId}`;
    
    // Calculate fitness based on employee skills and day's demand
    const employee = employees.find(e => e.employeeId === a.employeeId);
    const fitness = employee ? calculateFitness(employee, dayDemand ?? null) : 0;
    const tone = scoreToTone(fitness);

    for (let i = 0; i < slots.length; i++) {
      const slotStartIdx = timeIdx.get(slots[i].startTime) ?? -1;
      if (slotStartIdx >= si && slotStartIdx < ei) {
        slots[i].assignedStaff.push({ name, role: (a.role || 'MANAGER') as any, tone });
      }
    }
  }
  
  return slots;
}

export function overallScore(e: EmployeeLite, w: Record<string, number>) {
  const coffee = e.skillCoffee ?? 0;
  const sandwich = e.skillSandwich ?? 0;
  const speed = e.speed ?? 0;
  const cs = e.customerService ?? 0;
  const sum = (w.coffee ?? 0) + (w.sandwich ?? 0) + (w.speed ?? 0) + (w.customer_service ?? 0) || 1;
  return ((w.coffee ?? 0)*coffee + (w.sandwich ?? 0)*sandwich + (w.speed ?? 0)*speed + (w.customer_service ?? 0)*cs) / sum;
}