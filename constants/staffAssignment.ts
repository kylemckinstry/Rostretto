/**
 * Shared constants for staff assignment functionality
 */

/**
 * Available roles that can be assigned to staff members
 * These match the API role values (MANAGER, WAITER, BARISTA, SANDWICH, TRAINING)
 */
export const ROLE_OPTIONS = ['Manager', 'Waiter', 'Barista', 'Sandwich', 'Training'] as const;

/**
 * Type for valid role values
 */
export type Role = typeof ROLE_OPTIONS[number];