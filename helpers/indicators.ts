// helpers/indicators.ts
import type { ShiftDTO, AssignmentDTO, EmployeeLite } from '../api/client';
import type { DayIndicators } from '../state/types';
import { scoreToTone, calculateFitness } from './timeUtils';

// --- Utility to ensure local YYYY-MM-DD key (avoid UTC offset mismatch) ---
function localKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function minutes(s: ShiftDTO) {
  const [sh, sm] = s.start.split(':').map(Number);
  const [eh, em] = s.end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function buildWeekIndicators(
  shifts: ShiftDTO[],
  assignments: AssignmentDTO[],
  employees: EmployeeLite[],
): Record<string, DayIndicators> {
  const empById = new Map<number, EmployeeLite>(employees.map(e => [e.employeeId, e]));
  
  const byDay = new Map<string, {
    minutes: number;
    roleMinutes: Record<string, number>;
    mismatches: number;
    trafficFromShifts?: 'low' | 'medium' | 'high';
    demand?: 'Coffee' | 'Sandwich' | 'Mixed';
    countedShifts?: Set<string>;
  }>();

  const up = (obj: Record<string, number>, k: string, v: number) => (obj[k] = (obj[k] ?? 0) + v);

  // accumulate shift minutes per day & role
  for (const s of shifts) {
    const m = minutes(s);
    const key = localKey(s.date);
    if (!byDay.has(key)) byDay.set(key, { 
      minutes: 0, 
      roleMinutes: {}, 
      mismatches: 0, 
      trafficFromShifts: s.expectedTraffic,
      demand: undefined,
    });
    const agg = byDay.get(key)!;
    agg.minutes += m;
    up(agg.roleMinutes, (s.role || 'MIXED').toUpperCase(), m);

    // If shift has traffic data and it's not set yet, use it
    if (s.expectedTraffic && !agg.trafficFromShifts) {
      agg.trafficFromShifts = s.expectedTraffic;
    }
  }

  // Determine demand for each day based on top role
  for (const [date, v] of byDay.entries()) {
    const topRole = Object.entries(v.roleMinutes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'MIXED';
    v.demand = topRole === 'BARISTA' ? 'Coffee' :
                topRole === 'SANDWICH' ? 'Sandwich' : 'Mixed';
  }

  // Calculate mismatches based on employee fitness for the day's demand
  // Track which shifts have at least one mismatch (count unique slots, not individual employees)
  const shiftsWithMismatches = new Set<number>();
  
  for (const a of assignments) {
    const sh = shifts.find(x => x.shiftId === a.shiftId);
    if (!sh) continue;
    const key = localKey(sh.date);
    const agg = byDay.get(key);
    if (!agg) continue;

    // Calculate fitness based on employee skills and day's demand
    const employee = empById.get(a.employeeId);
    if (employee && agg.demand) {
      const fitness = calculateFitness(employee, agg.demand);
      const tone = scoreToTone(fitness);
      
      // Mark this shift as having a mismatch if employee has poor fit (red/alert tone)
      if (tone === 'alert') {
        shiftsWithMismatches.add(a.shiftId);
      }
    }
  }

  // Count unique shifts with mismatches per day
  for (const a of assignments) {
    const sh = shifts.find(x => x.shiftId === a.shiftId);
    if (!sh || !shiftsWithMismatches.has(a.shiftId)) continue;
    const key = localKey(sh.date);
    const agg = byDay.get(key);
    if (!agg) continue;
    
    // Only count each shift once per day
    const shiftKey = `${key}-${a.shiftId}`;
    if (!agg.countedShifts) {
      agg.countedShifts = new Set();
    }
    if (!agg.countedShifts.has(shiftKey)) {
      agg.countedShifts.add(shiftKey);
      agg.mismatches += 1;
    }
  }

  // bucket minutes → traffic
  const entries = [...byDay.entries()];
  const mins = entries.map(([, v]) => v.minutes);
  const minM = Math.min(...mins, 0), maxM = Math.max(...mins, 0);
  const bucket = (m: number): 'low' | 'medium' | 'high' => {
    if (maxM === minM) return 'low';
    const q1 = minM + (maxM - minM) / 3;
    const q2 = minM + 2 * (maxM - minM) / 3;
    return m < q1 ? 'low' : m < q2 ? 'medium' : 'high';
  };

  // map to DayIndicators
  const out: Record<string, DayIndicators> = {};
  for (const [date, v] of entries) {
    // Mismatches = only count red (alert tone) employees, not unfilled positions
    const totalMismatches = v.mismatches;

    // Use demand already calculated above
    const demand = v.demand ?? 'Mixed';

    const k = localKey(date);
    const finalTraffic = v.trafficFromShifts ?? bucket(v.minutes);
    
    out[k] = {
      mismatches: totalMismatches,
      demand,
      traffic: finalTraffic,
    };
  }
  return out;
}
