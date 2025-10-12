// -----------------------------------------------------------------------------
// state/types.ts
// Unified type system for UI + Python scheduler compatibility
// -----------------------------------------------------------------------------

// Canonical roles used by the research-project scheduler
export type SchedulerRole = 'MANAGER' | 'BARISTA' | 'WAITER' | 'SANDWICH';

// UI-facing roles (keep your user-friendly names)
export type Role = 'Coffee' | 'Sandwich' | 'Cashier' | 'Closer' | 'Manager';

// Mapping between UI role labels and scheduler roles
export const UI_TO_SCHEDULER_ROLE: Record<Exclude<Role, 'Closer'>, SchedulerRole> = {
  Coffee: 'BARISTA',
  Sandwich: 'SANDWICH',
  Cashier: 'WAITER',
  Manager: 'MANAGER',
};

export const SCHEDULER_TO_UI_ROLE: Record<SchedulerRole, Exclude<Role, 'Closer'>> = {
  BARISTA: 'Coffee',
  SANDWICH: 'Sandwich',
  WAITER: 'Cashier',
  MANAGER: 'Manager',
};

// Employee records (works with modal and available staff list)
export type Employee = {
  id: string;
  name: string;
  score?: number;
  fairnessColor?: 'green' | 'yellow' | 'red';
};

// Extra metadata tags for shift classification
export type ShiftTag = 'Closer' | 'Opener' | 'Peak' | 'Training';

// Shift event structure used throughout the app
export type ShiftEvent = {
  id: string;
  employeeId: string;
  role: Role;
  start: Date;
  end: Date;
  tags?: ShiftTag[];
  startISO?: string;
  endISO?: string;
};

// Day indicators for traffic, demand, etc.
export type DayIndicators = {
  mismatches: number;
  demand: 'Coffee' | 'Sandwich' | 'Mixed';
  traffic: 'low' | 'medium' | 'high';
};
