// api/client.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const expoConfig = Constants.expoConfig ?? ({} as any);
const extra = (expoConfig.extra ?? {}) as {
  EXPO_PUBLIC_API_BASE_URL?: string;
  EXPO_PUBLIC_USE_API?: boolean | string;
};

// Fallback to Cloud Run if extra not loaded correctly
// For web builds, always use the production API
export const API_BASE = Platform.OS === 'web'
  ? 'https://rostretto-scheduler-127031505005.australia-southeast1.run.app'
  : (extra.EXPO_PUBLIC_API_BASE_URL ?? 'https://rostretto-scheduler-127031505005.australia-southeast1.run.app');

// Compute USE_API from extra with sane defaults
// For web builds, always enable API
export const USE_API = Platform.OS === 'web'
  ? true
  : (typeof extra.EXPO_PUBLIC_USE_API === 'boolean'
      ? extra.EXPO_PUBLIC_USE_API
      : extra.EXPO_PUBLIC_USE_API === 'true' ||
        extra.EXPO_PUBLIC_USE_API === undefined);



async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  
  try {
    const res = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...(options.headers || {}) 
      },
      ...options,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[API] Error response:', text);
      throw new Error(`${res.status} ${res.statusText} – ${text}`);
    }
    
    const data = await res.json() as Promise<T>;
    return data;
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw error;
  }
}

/** ===== Types that reflect the backend ===== */
export type EmployeeLite = {
  employeeId: number;
  firstName: string;
  lastName: string;
  primaryRole: string;
  hoursWorkedThisWeek?: number;
  preferredHoursPerWeek?: number;
  // skills (now exposed)
  skillCoffee?: number;
  skillSandwich?: number;
  customerService?: number;
  speed?: number;
};

export type ShiftDTO = {
  id: number | string;
  shiftId: number;
  role: 'BARISTA' | 'SANDWICH' | 'MANAGER' | 'WAITER' | string;
  date: string;   // "YYYY-MM-DD"
  start: string;  // "HH:MM"
  end: string;    // "HH:MM"
  // Optional fields that might be provided by backend
  expectedTraffic?: 'low' | 'medium' | 'high';
  customerCount?: number;
  salesVolume?: number;
};

export type AssignmentDTO = {
  id: number | string;
  shiftId: number;
  employeeId: number;
  role: 'BARISTA' | 'SANDWICH' | 'MANAGER' | 'WAITER' | string;
  fitness?: number; // added by backend
  isManual?: boolean; // manual vs auto-generated
  startTime?: string; // For manual assignments: specific time slot start
  endTime?: string;   // For manual assignments: specific time slot end
};

export type ManualAssignmentPayload = {
  week: string;
  shiftId: number;
  employeeId: number;
  role: string;
  start_time?: string; // Specific time slot start (e.g., "7:00 am")
  end_time?: string;   // Specific time slot end (e.g., "7:30 am")
};

export type ManualAssignmentResponse = {
  week: string;
  assignment: {
    id: string;
    shiftId: number;
    employeeId: number;
    role: string;
    fitness: number;
    fitnessNorm: number;
    isManual: boolean;
  };
};

export type RunScheduleResponse = { week: string; created: number };
export type RunDayScheduleResponse = { week: string; date: string; created: number };
export type ConfigResponse = { weights: Record<string, number>; schedulerOrder: string[] };

export type DayIndicators = {
  date: string;
  demand: string;
  traffic: 'low' | 'medium' | 'high';
  mismatches: number;
};

export type IndicatorsResponse = {
  week: string;
  days: DayIndicators[];
};

/** ===== API surface ===== */
export const api = {
  health: () => http<{ ok: boolean }>('/health'),

  config: () => http<ConfigResponse>('/config'),

  employees: () => http<EmployeeLite[]>('/employees'),

  shifts: (week: string) => http<ShiftDTO[]>(`/shifts/${encodeURIComponent(week)}`),

  assignments: (week: string) => http<AssignmentDTO[]>(`/schedule/${encodeURIComponent(week)}`),

  indicators: (week: string) => http<IndicatorsResponse>(`/indicators/${encodeURIComponent(week)}`),

  runSchedule: (week: string) =>
    http<RunScheduleResponse>('/schedule/run', {
      method: 'POST',
      body: JSON.stringify({ week }),
    }),

  runDaySchedule: (week: string, date: string) =>
    http<RunDayScheduleResponse>('/schedule/run-day', {
      method: 'POST',
      body: JSON.stringify({ week, date }),
    }),

  saveManualAssignment: (payload: ManualAssignmentPayload) =>
    http<ManualAssignmentResponse>('/assignments/manual', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteManualAssignment: (week: string, docId: string) =>
    http<{ week: string; deleted: string }>(`/assignments/manual/${encodeURIComponent(week)}/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    }),

  // Delete ALL assignments for a specific day (clears the day for manual editing)
  clearDay: (week: string, date: string) =>
    http<{ week: string; date: string; deleted: number }>(`/assignments/day/${encodeURIComponent(week)}/${encodeURIComponent(date)}`, {
      method: 'DELETE',
    }),

  // Cleanup duplicate manual assignments for a week
  // Backend groups by (shift, employee) and removes duplicates, keeping only one per pair
  cleanupDuplicateAssignments: (week: string) =>
    http<{ week: string; deleted: number; kept: number; message: string }>(`/assignments/cleanup/${encodeURIComponent(week)}`, {
      method: 'POST',
    }),
};
