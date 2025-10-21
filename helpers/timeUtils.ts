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

// Convert employee score (0-100) to tone indicator
export function scoreToTone(score?: number): 'good' | 'warn' | 'alert' {
  const value = score ?? 0;
  if (value >= 80) return 'good';
  if (value >= 56) return 'warn';
  return 'alert';
}

// Convert internal role code to display name
export function roleToDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    'BARISTA': 'Coffee',
    'SANDWICH': 'Sandwich',
    'WAITER': 'Cashier',
    'MANAGER': 'Manager',
  };
  return roleMap[role] || 'Mixed';
}
