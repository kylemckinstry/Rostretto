import { colours, toneToColor } from '../theme/colours';
import { scoreToTone } from './timeUtils';

/**
 * Generates initials from a person's name (first two initials)
 * @param name - Full name string
 * @returns Two-letter initials in uppercase
 */
export const initials = (name: string): string =>
  name
    ?.split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || '';

/**
 * Clamps a number between 0 and 1
 */
export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/**
 * Normalises a percentage value (0-100) to a decimal (0-1)
 * @param n - Percentage value (0-100)
 * @returns Normalised value (0-1)
 */
export const normalizePercent = (n?: number): number => 
  (typeof n === 'number' ? clamp01(n / 100) : 0);

/**
 * Returns color scheme for score pills based on score value
 * @param v - Score value (0-100)
 * @returns Object with background, border, and text colors
 */
export function scorePillColors(v?: number): {
  bg: string;
  border: string;
  text: string;
} {
  if (typeof v !== 'number') {
    return { 
      bg: colours.bg.subtle, 
      border: colours.border.default, 
      text: colours.text.primary 
    };
  }
  
  const tone = scoreToTone(v);
  const borderColor = toneToColor(tone);
  
  if (tone === 'good') {
    return { 
      bg: colours.brand.accent, 
      border: borderColor, 
      text: colours.brand.primary 
    };
  }
  if (tone === 'warn') {
    return { 
      bg: colours.status.warningBg, 
      border: colours.status.warningBorder, 
      text: colours.status.warningText 
    };
  }
  // Alert tone
  return { 
    bg: colours.status.dangerBg, 
    border: colours.status.dangerBorder, 
    text: colours.status.dangerText 
  };
}
