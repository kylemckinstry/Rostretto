// models/normalisers.ts
import { employeeSchema, type Employee } from '../models/schemas';

// Legacy employee type matching mock data structure
export type LegacyEmployee = Partial<{
  id: string;
  employee_id: number;
  first_name: string;
  last_name: string;
  name: string;
  primary_role: string;
  // skill fields stored as 0..1 (floats)
  skill_coffee: number;
  skill_sandwich: number;
  customer_service_rating: number;
  skill_speed: number;
  availability: number; // in the mock this is a skill metric, not a schedule!
  teamwork: number;
  // score stored as 0..1 in the mock
  score: number;
  fairnessColor: 'green' | 'yellow' | 'red';
  updated_at_iso: string;
}>;

/**
 * Convert a legacy/mock employee record into the unified Employee shape.
 * - Builds `name` from first/last if needed
 * - Puts `primary_role` inside `roles: string[]`
 * - Converts 0..1 scores -> 0..100 (rounded)
 * - Maps fairness flag
 * - Keeps unknown keys out (Zod strips extras by default)
 */
export function normaliseEmployee(e: LegacyEmployee): Employee {
  const roles: string[] = [];
  if (e.primary_role) roles.push(String(e.primary_role));

  const id = stringId(e.id ?? (e.employee_id != null ? String(e.employee_id) : undefined));

  const normalised = {
    id,
    name: coalesceName(e.name, e.first_name, e.last_name),
    roles,
    // Schedule availability can be added to schema when needed
    metrics: {
      score: to0to100(e.score),
    },
    flags: {
      fairness: e.fairnessColor,
    },
    // Skills mapping (commented until schema supports it):
    // skills: {
    //   coffee: to0to100(e.skill_coffee),
    //   sandwich: to0to100(e.skill_sandwich),
    //   customerService: to0to100(e.customer_service_rating),
    //   speed: to0to100(e.skill_speed),
    //   availability: to0to100(e.availability),
    //   teamwork: to0to100(e.teamwork),
    // },
    createdAt: undefined,
    updatedAt: toDate(e.updated_at_iso),
  };

  // Validate & strip unknowns to match the canonical runtime type.
  return employeeSchema.parse(normalised);
}

export function normaliseEmployees(list: LegacyEmployee[]): Employee[] {
  return list.map(normaliseEmployee);
}

// ---------------- helpers ----------------

function to0to100(v: number | undefined): number | undefined {
  if (typeof v !== 'number' || Number.isNaN(v)) return undefined;
  // Support both 0..1 and 0..100 inputs
  if (v >= 0 && v <= 1) return Math.round(v * 100);
  if (v >= 0 && v <= 100) return Math.round(v);
  return undefined;
}

function toDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(+d) ? undefined : d;
}

function coalesceName(name?: string, first?: string, last?: string): string {
  const fallback = `${first ?? ''} ${last ?? ''}`.trim();
  const val = (name ?? fallback).trim();
  return val || 'Unnamed';
}

function stringId(id?: string): string {
  if (id && id.trim()) return id;
  // Simple fallback for mock data; consider uuid() for production
  return Math.random().toString(36).slice(2, 10);
}