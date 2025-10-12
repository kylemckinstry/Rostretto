// -----------------------------------------------------------------------------
// state/employees.tsx
// Context store for employees and shift assignments
// -----------------------------------------------------------------------------

import * as React from 'react';
import { Employee, ShiftEvent } from './types';

function uuid() {
  return Math.random().toString(36).slice(2);
}

export type EmployeesState = {
  employees: Record<string, Employee>;
  assignments: Record<string, ShiftEvent[]>; // keyed by date ISO string
};

// Demo data
const seedEmployees: Record<string, Employee> = {
  '1': { id: '1', name: 'Emil Avanesov', score: 72, fairnessColor: 'green' },
  '2': { id: '2', name: 'Kyle McKinstry', score: 88, fairnessColor: 'green' },
  '3': { id: '3', name: 'Mat Blackwood', score: 68, fairnessColor: 'yellow' },
  '4': { id: '4', name: 'Jason Yay', score: 91, fairnessColor: 'red' },
};

const initialState: EmployeesState = {
  employees: seedEmployees,
  assignments: {},
};

// Reducer actions
type Action =
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; id: string; patch: Partial<Employee> }
  | { type: 'REMOVE_EMPLOYEE'; id: string }
  | { type: 'ASSIGN'; payload: Omit<ShiftEvent, 'id'> }
  | { type: 'UNASSIGN'; id: string; dateISO: string };

function reducer(state: EmployeesState, action: Action): EmployeesState {
  switch (action.type) {
    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: { ...state.employees, [action.payload.id]: action.payload },
      };

    case 'UPDATE_EMPLOYEE':
      if (!state.employees[action.id]) return state;
      return {
        ...state,
        employees: {
          ...state.employees,
          [action.id]: { ...state.employees[action.id], ...action.patch },
        },
      };

    case 'REMOVE_EMPLOYEE': {
      const { [action.id]: _, ...rest } = state.employees;
      return { ...state, employees: rest };
    }

    case 'ASSIGN': {
      const newShift: ShiftEvent = { id: uuid(), ...action.payload };
      const dateKey = newShift.start.toISOString().slice(0, 10);
      const existing = state.assignments[dateKey] ?? [];
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [dateKey]: [...existing, newShift],
        },
      };
    }

    case 'UNASSIGN': {
      const existing = state.assignments[action.dateISO] ?? [];
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [action.dateISO]: existing.filter((s) => s.id !== action.id),
        },
      };
    }

    default:
      return state;
  }
}

// Context + hook
const Ctx = React.createContext<{
  state: EmployeesState;
  addEmployee(e: Employee): void;
  updateEmployee(id: string, patch: Partial<Employee>): void;
  removeEmployee(id: string): void;
  assign(p: Omit<ShiftEvent, 'id'>): void;
  unassign(id: string, dateISO: string): void;
} | null>(null);

export function EmployeesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const api = React.useMemo(
    () => ({
      state,
      addEmployee: (e: Employee) => dispatch({ type: 'ADD_EMPLOYEE', payload: e }),
      updateEmployee: (id: string, patch: Partial<Employee>) =>
        dispatch({ type: 'UPDATE_EMPLOYEE', id, patch }),
      removeEmployee: (id: string) => dispatch({ type: 'REMOVE_EMPLOYEE', id }),
      assign: (p: Omit<ShiftEvent, 'id'>) => dispatch({ type: 'ASSIGN', payload: p }),
      unassign: (id: string, dateISO: string) =>
        dispatch({ type: 'UNASSIGN', id, dateISO }),
    }),
    [state]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEmployees() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useEmployees must be used within EmployeesProvider');
  return ctx;
}
