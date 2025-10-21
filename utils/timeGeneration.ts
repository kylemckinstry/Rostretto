// Utilities for generating and managing time slot options
// This file re-exports the shared time generation functions for backwards compatibility

import { generateTimeOptions as generateTimeOptionsShared } from '../helpers/schedulerIO';

/**
 * Generate all available time options in 30-minute increments from 6am to 4pm
 * @returns Array of formatted time strings (e.g., "6:00 am", "6:30 am", etc.)
 */
export const generateTimeOptions = generateTimeOptionsShared;

// Pre-generated array of all available time options
export const TIME_OPTIONS = generateTimeOptions();