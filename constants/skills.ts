import { colours } from '../theme/colours';

/**
 * Role types used in the Capabilities system
 * Note: Different from models/types.ts Role which is for roster assignment
 */
export type CapabilityRole = 'Coffee' | 'Sandwich' | 'Customer Service' | 'Speed';

/**
 * Employee type for Capabilities screens
 */
export type CapabilityEmployee = {
  id: string;
  name: string;
  imageUrl?: string;
  skills?: Partial<Record<CapabilityRole | string, number>>;
  score?: number;
  fairnessColor?: 'green' | 'yellow' | 'red';
};

/**
 * Known skills in priority order
 */
export const KNOWN_SKILLS: Array<CapabilityRole | string> = [
  'Coffee',
  'Sandwich', 
  'Customer Service',
  'Speed'
];

/**
 * Skill proficiency thresholds
 */
export const SKILL_THRESHOLD = {
  HIGH: 80, // Skills at or above this are considered high proficiency
  GAP: 50,  // Skills at or below this are considered gaps requiring training
} as const;

/**
 * Consistent color mapping for each skill
 */
export const SKILL_COLOURS: Record<string, string> = {
  Coffee: colours.brand.primary,
  Sandwich: colours.status.success,
  'Customer Service': colours.status.warning,
  Speed: colours.text.primary,
};

/**
 * Search comparator types
 */
export type SkillComparator = '>' | '>=' | '<' | '<=' | '=';

/**
 * Parsed search query result
 */
export type ParsedQuery =
  | { kind: 'name'; needle: string }
  | { kind: 'skill'; skill: string; cmp: SkillComparator; value: number }
  | null;

/**
 * Parses a search query string into a structured format
 * Supports:
 * - Name search: "john" or "smith"
 * - Skill search: "Coffee > 50" or "skill: Sandwich >= 70"
 */
export function parseQuery(q: string): ParsedQuery {
  const trimmed = q.trim();
  if (!trimmed) return null;
  
  const skillRegex = /^(?:skill\s*:\s*)?([a-zA-Z][\w\s-]+)\s*(<=|>=|=|<|>)\s*(\d{1,3})$/i;
  const m = trimmed.match(skillRegex);
  
  if (m) {
    const skill = m[1].trim();
    const cmp = m[2] as SkillComparator;
    const value = Math.max(0, Math.min(100, parseInt(m[3], 10)));
    return { kind: 'skill', skill, cmp, value };
  }
  
  return { kind: 'name', needle: trimmed.toLowerCase() };
}

/**
 * Checks if a value passes a comparison
 */
export function passesSkillCmp(
  v: number, 
  cmp: SkillComparator, 
  target: number
): boolean {
  switch (cmp) {
    case '>': return v > target;
    case '>=': return v >= target;
    case '<': return v < target;
    case '<=': return v <= target;
    case '=': return v === target;
  }
}
