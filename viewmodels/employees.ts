// viewmodels/employees.ts
import * as React from 'react';
import Constants from 'expo-constants';
import type { Employee } from '../models/schemas';
import type { Employee as StateEmployee } from '../state/types';
import { useEmployees } from '../state/employees';
import { MOCK_EMPLOYEES } from '../data/mock/employees';

// UI Types
export type SkillSummary = { high: string[]; low: string[] };

export interface UIEmployee extends StateEmployee {
  name: string;
  imageUrl?: string;
  skills: Partial<Record<'Coffee' | 'Sandwich' | 'Cashier' | 'Closer' | string, number>>;
  skillSummary?: SkillSummary;
  role?: string; // UI-friendly role display
}

// Helpers
const pct = (x?: number) => {
  if (typeof x !== 'number' || Number.isNaN(x)) return 0;
  const v = Math.round(x * 100);
  return Math.max(0, Math.min(100, v));
};

// Converts legacy mock employee data to UI format
function toUIEmployeeFromLegacy(e: any): UIEmployee {
  const skills: UIEmployee['skills'] = {
    Coffee: pct(e.skill_coffee),
    Sandwich: pct(e.skill_sandwich),
    Cashier: pct(e.customer_service_rating), // proxy
    Closer: pct(e.availability),             // proxy
    'Customer Service': pct(e.customer_service_rating),
    'Speed of Service': pct(e.skill_speed),
    Availability: pct(e.availability),
    Teamwork: pct(e.teamwork),
  };
  const entries = Object.entries(skills).filter(([, v]) => typeof v === 'number');
  const sorted = entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const high = sorted.filter(([, v]) => (v ?? 0) >= 80).slice(0, 3).map(([k]) => k);
  const low = sorted.filter(([, v]) => (v ?? 0) <= 50).slice(0, 3).map(([k]) => k);

  const name =
    (e.name ?? `${e.first_name ?? ''} ${e.last_name ?? ''}`)?.trim() || 'Unnamed';

  return {
    id: e.id,
    employee_id: e.employee_id || parseInt(e.id) || 0,
    first_name: e.first_name || '',
    last_name: e.last_name || '',
    name: e.name || `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim(),
    primary_role: e.primary_role,
    role: e.primary_role, // UI-friendly role display
    skill_coffee: e.skill_coffee || 0,
    skill_sandwich: e.skill_sandwich || 0,
    customer_service_rating: e.customer_service_rating || 0,
    skill_speed: e.skill_speed || 0,
    availability: e.availability || 0,
    teamwork: e.teamwork || 0,
    score: e.score,
    fairnessColor: e.fairnessColor,
    updated_at_iso: e.updated_at_iso,
    imageUrl: undefined,
    skills,
    skillSummary: { high, low },
  };
}

// Converts normalised employee data to UI format
function toUIEmployeeFromUnified(e: Employee): UIEmployee {
  const score = e.metrics?.score; // already 0..100 in the unified model
  const name = e.name?.trim() || 'Unnamed';
  return {
    id: e.id,
    employee_id: 0, // Default value, update when schema includes it
    first_name: '', // Default value, update when schema includes it
    last_name: '', // Default value, update when schema includes it
    name,
    primary_role: 'BARISTA', // Default value, update when schema includes it
    role: 'BARISTA', // UI-friendly role display
    skill_coffee: 0,
    skill_sandwich: 0,
    customer_service_rating: 0,
    skill_speed: 0,
    availability: 0,
    teamwork: 0,
    score,
    fairnessColor: e.flags?.fairness,
    imageUrl: undefined,
    skills: {}, // Skills can be added when schema supports them
    skillSummary: undefined,
  };
}

// Public Hooks

// Returns UI-formatted employees from active data source
export function useEmployeesUI(): UIEmployee[] {
  const extra = (Constants.expoConfig?.extra || {}) as { useMockData?: boolean };
  const usingMock = !!extra.useMockData;

  if (usingMock) {
    // Mock data with detailed skills
    return React.useMemo(
      () => MOCK_EMPLOYEES.map(toUIEmployeeFromLegacy),
      []
    );
  }

  // Database data via normalised hook
  const raw = useEmployees();
  return React.useMemo(
    () => raw.map(toUIEmployeeFromUnified),
    [raw]
  );
}

// Synchronous helpers for mock data access
export function getEmployeesUI(): UIEmployee[] {
  const extra = (Constants.expoConfig?.extra || {}) as { useMockData?: boolean };
  if (extra.useMockData) {
    return MOCK_EMPLOYEES.map(toUIEmployeeFromLegacy);
  }
  // In DB mode, prefer the hook since this doesn't have fresh data
  return [];
}

export function getEmployeeUIById(id: string): UIEmployee | undefined {
  const extra = (Constants.expoConfig?.extra || {}) as { useMockData?: boolean };
  if (extra.useMockData) {
    const row = MOCK_EMPLOYEES.find(e => e.id === id);
    return row ? toUIEmployeeFromLegacy(row) : undefined;
  }
  // In DB mode, prefer the hook since this sync function is only for mock convenience
  return undefined;
}

