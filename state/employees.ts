// --- Single source of truth for Employee data ---
import * as React from 'react';
import { Employee, SchedulerRole } from './types';

// Mock employee factory
const mkEmp = (
  id: string,
  employee_id: number,
  first: string,
  last: string,
  role: SchedulerRole,
  score01: number, // 0-1 range
  color: 'green' | 'yellow' | 'red',
  skills: {
    coffee: number;
    sandwich: number;
    customerService: number;
    speed: number;
    availability: number;
    teamwork: number;
  }
): Employee => ({
  id,
  employee_id,
  first_name: first,
  last_name: last,
  name: `${first} ${last}`, // UI convenience
  primary_role: role,
  skill_coffee: skills.coffee,
  skill_sandwich: skills.sandwich,
  customer_service_rating: skills.customerService,
  skill_speed: skills.speed,
  availability: skills.availability,
  teamwork: skills.teamwork,
  score: score01,
  fairnessColor: color,
  updated_at_iso: new Date().toISOString(),
});

// Initial mock data
const INITIAL: Employee[] = [
  mkEmp('1', 1, 'Emil', 'Avanesov', 'BARISTA', 0.72, 'green', {
    coffee: 0.85,
    sandwich: 0.62,
    customerService: 0.74,
    speed: 0.81,
    availability: 0.88,
    teamwork: 0.76
  }),
  mkEmp('2', 2, 'Kyle', 'McKinstry', 'MANAGER', 0.88, 'green', {
    coffee: 0.71,
    sandwich: 0.49,
    customerService: 0.89,
    speed: 0.73,
    availability: 0.92,
    teamwork: 0.87
  }),
  mkEmp('3', 3, 'Mat', 'Blackwood', 'WAITER', 0.68, 'yellow', {
    coffee: 0.58,
    sandwich: 0.54,
    customerService: 0.82,
    speed: 0.67,
    availability: 0.79,
    teamwork: 0.71
  }),
  mkEmp('4', 4, 'Jason', 'Yay', 'SANDWICH', 0.91, 'red', {
    coffee: 0.63,
    sandwich: 0.88,
    customerService: 0.56,
    speed: 0.84,
    availability: 0.65,
    teamwork: 0.52
  }),
];

// --- Internal store + pub/sub ---
let _employees: Employee[] = INITIAL.slice();

type Listener = (next: Employee[]) => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn(_employees));
}

// --- Public API ---

// Get current employee list
export function getEmployees(): Employee[] {
  return _employees;
}

// Replace employee list and notify subscribers
export function setEmployees(
  next: Employee[] | ((prev: Employee[]) => Employee[])
): void {
  _employees = typeof next === 'function' ? (next as any)(_employees) : next;
  emit();
}

// Insert or update employee by id
export function upsertEmployee(one: Employee): void {
  setEmployees((prev) => {
    const i = prev.findIndex((p) => p.id === one.id);
    const updated: Employee = {
      ...one,
      updated_at_iso: new Date().toISOString(),
    };
    if (i === -1) return [...prev, updated];
    const copy = prev.slice();
    copy[i] = updated;
    return copy;
  });
}

// Remove employee by id
export function removeEmployee(id: string): void {
  setEmployees((prev) => prev.filter((p) => p.id !== id));
}

// Reset to initial mock data
export function resetEmployees(): void {
  _employees = INITIAL.slice();
  emit();
}

// --- React hook for live employee updates ---
export function useEmployees(): Employee[] {
  const [list, setList] = React.useState<Employee[]>(() => getEmployees());

  React.useEffect(() => {
    const listener = (next: Employee[]) => setList(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return list;
}

/* =========================================================================================
 * UI ADAPTERS
 * Map the persistent Employee model (0–1 scores, snake_case skills) into the UI-facing
 * shape expected by CapabilitiesScreen and EmployeeScreen: { id, name, imageUrl?, skills{}, score(0–100) }.
 * =======================================================================================*/

// Quick derived summary of an employee's top and bottom skills
export type SkillSummary = {
  high: string[];
  low: string[];
};

export type UIEmployee = {
  id: string;
  name: string;
  imageUrl?: string; // optional avatar URL if I add it to the backend/type later
  // Map of skill -> 0..100 (percent).
  skills: Partial<Record<'Coffee' | 'Sandwich' | 'Cashier' | 'Closer' | string, number>>;
  score?: number; // 0..100
  fairnessColor?: 'green' | 'yellow' | 'red';
  role?: string;
  skillSummary?: SkillSummary; // derived summary for high and low skill areas
};

// utility: clamp to [0, 100] after scaling 0..1 → 0..100
const pct = (x?: number) => {
  if (typeof x !== 'number' || Number.isNaN(x)) return 0;
  const v = Math.round(x * 100);
  return Math.max(0, Math.min(100, v));
};

// Derive a reasonable mapping from the canonical fields → UI skills.
function toUIEmployee(e: Employee): UIEmployee {
  // If I add e.image_url to the model later, thread it through here:
  // const imageUrl = (e as any).image_url as string | undefined;
  const imageUrl = undefined;

  // Known UI skill keys used in CapabilitiesScreen and EmployeeScreen
  const skills: UIEmployee['skills'] = {
    Coffee: pct((e as any).skill_coffee),
    Sandwich: pct((e as any).skill_sandwich),
    Cashier: pct((e as any).customer_service_rating),  // proxy
    Closer: pct((e as any).availability),              // proxy
    'Customer Service': pct((e as any).customer_service_rating),
    'Speed of Service': pct((e as any).skill_speed),
    Availability: pct((e as any).availability),
    Teamwork: pct((e as any).teamwork),
  };

  // I derive top and bottom skill names for the highlights component
  const entries = Object.entries(skills).filter(([_, v]) => typeof v === 'number');
  const sorted = entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const high = sorted.filter(([_, v]) => (v ?? 0) >= 80).slice(0, 3).map(([k]) => k);
  const low = sorted.filter(([_, v]) => (v ?? 0) <= 50).slice(0, 3).map(([k]) => k);

  return {
    id: e.id,
    name: e.name || `${(e as any).first_name ?? ''} ${(e as any).last_name ?? ''}`.trim(),
    imageUrl,
    skills,
    score: pct(e.score as number),
    fairnessColor: e.fairnessColor as any,
    role: e.primary_role,
    skillSummary: { high, low }, // attach the derived summary for UI use
  };
}

// Synchronous selectors (no React)
export function getEmployeesUI(): UIEmployee[] {
  return getEmployees().map(toUIEmployee);
}

export function getEmployeeUIById(id: string): UIEmployee | undefined {
  const raw = getEmployees().find((e) => e.id === id);
  return raw ? toUIEmployee(raw) : undefined;
}

// React hook for UI shape (mirrors useEmployees)
export function useEmployeesUI(): UIEmployee[] {
  const base = useEmployees();
  return React.useMemo(() => base.map(toUIEmployee), [base]);
}

// Convenience: update only the timestamp to reflect an external change
export function touchEmployee(id: string): void {
  setEmployees((prev) => {
    const i = prev.findIndex((p) => p.id === id);
    if (i === -1) return prev;
    const copy = prev.slice();
    copy[i] = { ...copy[i], updated_at_iso: new Date().toISOString() };
    return copy;
  });
}
