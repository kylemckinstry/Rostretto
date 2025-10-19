import * as React from 'react';
import Constants from 'expo-constants';
import type { Employee } from '../models/schemas';
import { MOCK_EMPLOYEES } from '../data/mock/employees';   // note: 'mock' (singular)
import { subscribeEmployees } from '../data/employees.repo';
import { normaliseEmployee } from '../models/normalisers';

type Unsub = () => void;

function useMockEmployees(set: (e: Employee[]) => void): Unsub {
  const norm = MOCK_EMPLOYEES.map(normaliseEmployee);
  const t = setTimeout(() => set(norm), 0);
  return () => clearTimeout(t);
}

function useDbEmployees(set: (e: Employee[]) => void): Unsub {
  return subscribeEmployees(set);
}

/** Returns employees from mock or Firestore based on app.json -> expo.extra.useMockData */
export function useEmployees(): Employee[] {
  const [list, setList] = React.useState<Employee[]>([]);
  React.useEffect(() => {
    const extra = (Constants.expoConfig?.extra || {}) as { useMockData?: boolean };
    const unsub = extra.useMockData ? useMockEmployees(setList) : useDbEmployees(setList);
    return () => unsub?.();
  }, []);
  return list;
}
