export const colours = {
  bg: {
    canvas: '#FFFFFF',
    subtle: '#F7FAFC',
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
    danger: '#E57373',
  },
} as const;
export type Colors = typeof colours;
