// Unified type system for UI + Python scheduler compatibility

// Canonical scheduler roles (Python side)
export type SchedulerRole = 'MANAGER' | 'BARISTA' | 'WAITER' | 'SANDWICH';

// UI-friendly role labels
export type Role = 'Coffee' | 'Sandwich' | 'Cashier' | 'Manager' | 'Closer';

// UI role to scheduler role mapping
export const UI_TO_SCHEDULER_ROLE: Record<Exclude<Role, 'Closer'>, SchedulerRole> = {
  Coffee: 'BARISTA',
  Sandwich: 'SANDWICH',
  Cashier: 'WAITER',
  Manager: 'MANAGER',
};

// Scheduler role to UI role mapping
export const SCHEDULER_TO_UI_ROLE: Record<SchedulerRole, Exclude<Role, 'Closer'>> = {
  BARISTA: 'Coffee',
  SANDWICH: 'Sandwich',
  WAITER: 'Cashier',
  MANAGER: 'Manager',
};

// Check if string is a SchedulerRole
export function isSchedulerRole(v: string): v is SchedulerRole {
  return v === 'MANAGER' || v === 'BARISTA' || v === 'WAITER' || v === 'SANDWICH';
}

// UI role to scheduler role
export function toSchedulerRole(role: Exclude<Role, 'Closer'>): SchedulerRole {
  return UI_TO_SCHEDULER_ROLE[role];
}

// Scheduler role to UI role
export function toUIRole(s: SchedulerRole): Exclude<Role, 'Closer'> {
  return SCHEDULER_TO_UI_ROLE[s];
}

// Badge colours for fairness indicators
export type FairnessColor = 'green' | 'yellow' | 'red';

// Shift classification tags
export type ShiftTag = 'Closer' | 'Opener' | 'Peak' | 'Training';

// Rating/score fields (0-1 range for ML compatibility)
export type Rating01 = number;
export type Score01 = number;

// Employee types

// Canonical Employee record for UI + scheduler compatibility
export type Employee = {
  // Legacy UI id for React keying
  id: string;

  // Canonical numeric id for scheduler/DB
  employee_id: number;

  // Split names for ML
  first_name: string;
  last_name: string;

  // Derived full name for UI convenience
  name?: string;

  // Primary role in scheduler terms
  primary_role: SchedulerRole;

  // Skill dimensions (0-1 range)
  skill_coffee: Rating01;
  skill_sandwich: Rating01;
  customer_service_rating: Rating01;
  skill_speed: Rating01;
  availability: Rating01;
  teamwork: Rating01;

  // Aggregate score (0-1, may be AI-calculated)
  score?: Score01;

  // UI-only decoration
  fairnessColor?: FairnessColor;

  // Optional extensibility
  meta?: Record<string, unknown>;
  updated_at_iso?: string;
};

// Lightweight UI shape for employee lists
export type EmployeeListItem = Pick<Employee, 'id' | 'name' | 'employee_id' | 'primary_role' | 'score' | 'fairnessColor'>;

// Shifts and scheduling

// Shift event structure for the app
export type ShiftEvent = {
  id: string;
  employeeId: string;

  // Display role for UI
  role: Exclude<Role, 'Closer'> | 'Closer';

  // Canonical role for scheduler sync
  schedulerRole?: SchedulerRole;

  start: Date;
  end: Date;

  // Pre-serialized times for Python/Firestore
  startISO?: string;
  endISO?: string;

  // Shift tags
  tags?: ShiftTag[];
};

// Day indicators for traffic, demand, etc.
export type DayIndicators = {
  mismatches: number;
  demand: 'Coffee' | 'Sandwich' | 'Mixed';
  traffic: 'low' | 'medium' | 'high';
};

// Helper functions

// Get display name from employee record
export function displayName(e: Employee): string {
  if (e.first_name || e.last_name) return `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim();
  return e.name ?? `Employee ${e.employee_id}`;
}

// Adds ISO time fields to shift events
export function withISOTimes<T extends Pick<ShiftEvent, 'start' | 'end'>>(shift: T): T & {
  startISO: string; endISO: string;
} {
  return {
    ...shift,
    startISO: shift.start.toISOString(),
    endISO: shift.end.toISOString(),
  };
}

// Clamps number to 0-1 range
export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
