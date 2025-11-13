export const colours = {
  bg: {
    canvas: '#FFFFFF',
    subtle: '#F7FAFC',
    muted: '#E5E7EB',
    lightGreen: '#E4ECE8', // light Rostretto green for backgrounds
  },
  text: {
    primary: '#171A1F',
    secondary: '#2B2B2B',
    muted: '#6B7280',
  },
  border: {
    default: '#E2E8F0',
    focus: '#94A3B8',
  },
  brand: {
    primary: '#1A4331',   // project green
    accent: '#F2F6F4',    // pale green
  },
  status: {
    success: '#5CB85C',
    warning: '#F5A623',
    warningBg: '#FFF7E8',
    warningBorder: '#FAD7A0',
    warningText: '#B45309',
    danger: '#E57373',
    dangerBg: '#FDECEC',
    dangerBorder: '#F5B4B4',
    dangerText: '#B91C1C',
  },
} as const;
export type Colors = typeof colours;

// Tone type used across the app for status indicators
export type Tone = 'good' | 'warn' | 'alert';

// Maps tone to corresponding status color from theme
export function toneToColor(tone: Tone): string {
  switch (tone) {
    case 'good':
      return colours.status.success;
    case 'warn':
      return colours.status.warning;
    case 'alert':
      return colours.status.danger;
  }
}
