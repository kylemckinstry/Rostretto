/**
 * Shared constants for staff assignment functionality
 */

/**
 * Available roles that can be assigned to staff members
 */
export const ROLE_OPTIONS = ['Coffee', 'Sandwich', 'Cashier', 'Mixed'] as const;

/**
 * Type for valid role values
 */
export type Role = typeof ROLE_OPTIONS[number];