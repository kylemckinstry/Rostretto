import * as React from 'react';
import Constants from 'expo-constants';
import type { Employee } from '../models/schemas';
import { employeeDtoSchema, type EmployeeDTO } from '../models/schemas';
import type { EmployeeLite } from '../api/client';
import { API_BASE, USE_API } from '../api/client';
import { MOCK_EMPLOYEES } from '../data/mock/employees';   // note: 'mock' (singular)
import { subscribeEmployees } from '../data/employees.repo';
import { normaliseEmployee } from '../models/normalisers';

type Unsub = () => void;

// Use the API_BASE from client.ts instead of recomputing it
function apiBase(): string {
  return API_BASE;
}

function useMockEmployees(set: (e: Employee[]) => void): Unsub {
  const norm = MOCK_EMPLOYEES.map(normaliseEmployee);
  const t = setTimeout(() => set(norm), 0);
  return () => clearTimeout(t);
}

function useDbEmployees(set: (e: Employee[]) => void): Unsub {
  return subscribeEmployees(set);
}

async function fetchApiEmployees(): Promise<Employee[]> {
  const res = await fetch(`${apiBase()}/employees`);
  if (!res.ok) throw new Error(`Employees API ${res.status} ${res.statusText}`);
  const raw = await res.json();
  const arr = Array.isArray(raw) ? raw : [];
  
  // Map EmployeeLite directly to Employee format (bypassing normalizer to preserve data)
  const mapped = (arr as EmployeeLite[]).map((d) => {
    // Calculate average skill (already in 0-100 range from API)
    const avgSkill = ((d.skillCoffee ?? 0) + (d.skillSandwich ?? 0) + (d.customerService ?? 0) + (d.speed ?? 0)) / 4;
    // Round to whole number
    const score = Math.round(avgSkill);
    
    // Store raw data in a way the schema accepts
    const employee: Employee & { _raw?: any } = {
      id: String(d.employeeId),
      name: `${d.firstName} ${d.lastName}`.trim(),
      roles: [d.primaryRole || 'BARISTA'],
      metrics: {
        score: score,
      },
      flags: {
        fairness: calculateFairness(d.hoursWorkedThisWeek, d.preferredHoursPerWeek),
      },
      // Store raw API data so we can access it in viewmodel
      _raw: d,
    };
    
    return employee;
  });
  
  return mapped;
}

function calculateFairness(
  hoursWorked?: number,
  preferredHours?: number
): 'green' | 'yellow' | 'red' {
  if (!hoursWorked || !preferredHours) return 'green';
  const ratio = hoursWorked / preferredHours;
  if (ratio >= 0.8 && ratio <= 1.2) return 'green';
  if (ratio >= 0.6 && ratio <= 1.4) return 'yellow';
  return 'red';
}

function useApiEmployees(set: (e: Employee[]) => void): Unsub {
  let cancelled = false;
  (async () => {
    try {
      const list = await fetchApiEmployees();
      if (!cancelled) set(list);
    } catch (e) {
      console.warn('Failed to load API employees', e);
    }
  })();
  return () => {
    cancelled = true;
  };
}

/** Returns employees from mock, API, or Firestore based on flags:
 *  1) expo.extra.useMockData === true  -> mock
 *  2) USE_API === true                 -> API
 *  3) else                             -> Firestore
 */
export function useEmployees(): Employee[] {
  const [list, setList] = React.useState<Employee[]>([]);

  React.useEffect(() => {

    
    const extra = (Constants.expoConfig?.extra || {}) as { useMockData?: boolean };

    const unsub: Unsub =
      extra.useMockData ? useMockEmployees(setList)
      : USE_API         ? useApiEmployees(setList)
                        : useDbEmployees(setList);

    return () => unsub?.();
  }, []);

  return list;
}

