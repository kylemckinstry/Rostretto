//Shared time utilities for scheduler functionality

/**
 * Convert time string to minutes since midnight for comparison
 * Handles both "9:00 am" and "9:00am" formats
 */
export function toMinutes(timeStr: string): number {
  // Normalize by ensuring there's a space before am/pm
  const normalized = timeStr.trim().replace(/(\d)([ap]m)/i, '$1 $2');
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toLowerCase();
  
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// Convert employee score (0-100 scale) to tone indicator
// Based on normalized fitness threshold: 70%+ = good, 50-69% = warn, <50% = alert
export function scoreToTone(score?: number): 'good' | 'warn' | 'alert' {
  const value = score ?? 0;
  if (value >= 70) return 'good';   // 70+ = green (good fit for role)
  if (value >= 50) return 'warn';   // 50-69 = orange (acceptable fit)
  return 'alert';                   // <50 = red (poor fit - mismatch)
}

// Calculate fitness for employee based on day's demand
// Returns score 0-100 based on relevant skills weighted by demand type
export function calculateFitness(
  employee: { skillCoffee?: number; skillSandwich?: number; customerService?: number; speed?: number },
  demand: 'Coffee' | 'Sandwich' | 'Mixed' | null
): number {
  if (!demand || demand === 'Mixed') {
    // Mixed demand: average all skills
    return ((employee.skillCoffee ?? 0) + (employee.skillSandwich ?? 0) + 
            (employee.customerService ?? 0) + (employee.speed ?? 0)) / 4;
  }
  
  if (demand === 'Coffee') {
    // Coffee demand: weight coffee skill more heavily
    const coffee = employee.skillCoffee ?? 0;
    const cs = employee.customerService ?? 0;
    const speed = employee.speed ?? 0;
    return (coffee * 0.6 + cs * 0.2 + speed * 0.2);
  }
  
  if (demand === 'Sandwich') {
    // Sandwich demand: weight sandwich skill more heavily
    const sandwich = employee.skillSandwich ?? 0;
    const cs = employee.customerService ?? 0;
    const speed = employee.speed ?? 0;
    return (sandwich * 0.6 + cs * 0.2 + speed * 0.2);
  }
  
  return 0;
}

// Convert internal role code to display name (capital case format)
export function roleToDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    // Uppercase API format
    'BARISTA': 'Barista',
    'SANDWICH': 'Sandwich',
    'WAITER': 'Waiter',
    'MANAGER': 'Manager',
    'MIXED': 'Mixed',
    'COFFEE': 'Coffee',
    // Capital case versions (pass through)
    'Barista': 'Barista',
    'Sandwich': 'Sandwich',
    'Waiter': 'Waiter',
    'Manager': 'Manager',
    'Mixed': 'Mixed',
    'Coffee': 'Coffee',
  };
  return roleMap[role] || role;
}
