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
  color: 'green' | 'yellow' | 'red'
): Employee => ({
  id,
  employee_id,
  first_name: first,
  last_name: last,
  name: `${first} ${last}`, // UI convenience
  primary_role: role,
  // Default skill values
  skill_coffee: 0.7,
  skill_sandwich: 0.6,
  customer_service_rating: 0.8,
  skill_speed: 0.75,
  availability: 0.9,
  teamwork: 0.85,
  score: score01,
  fairnessColor: color,
  updated_at_iso: new Date().toISOString(),
});

// Initial mock data
const INITIAL: Employee[] = [
  mkEmp('1', 1, 'Emil', 'Avanesov', 'BARISTA', 0.72, 'green'),
  mkEmp('2', 2, 'Kyle', 'McKinstry', 'MANAGER', 0.88, 'green'),
  mkEmp('3', 3, 'Mat', 'Blackwood', 'WAITER', 0.68, 'yellow'),
  mkEmp('4', 4, 'Jason', 'Yay', 'SANDWICH', 0.91, 'red'),
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
    if (i === -1) return [...prev, one];
    const copy = prev.slice();
    copy[i] = one;
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
