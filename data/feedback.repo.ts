import { FeedbackEntry, FeedbackRating } from '../components/modals/feedbackModal';

// In-memory storage for feedback entries
// In production, this would be stored in Firestore or similar
let feedbackStorage: FeedbackEntry[] = [];

/**
 * Store a new feedback entry
 */
export function storeFeedback(
  managerId: string,
  managerName: string,
  employeeId: string,
  employeeName: string,
  skill: string,
  rating: FeedbackRating
): FeedbackEntry {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const entry: FeedbackEntry = {
    managerId,
    managerName,
    employeeId,
    employeeName,
    skill,
    rating,
    date: dateString,
    timestamp: now.getTime(),
  };
  
  feedbackStorage.push(entry);
  console.log('Feedback stored:', entry);
  
  return entry;
}

/**
 * Get all feedback entries for a specific employee
 */
export function getFeedbackByEmployee(employeeId: string): FeedbackEntry[] {
  return feedbackStorage.filter(entry => entry.employeeId === employeeId);
}

/**
 * Get all feedback entries for a specific employee and skill
 */
export function getFeedbackByEmployeeAndSkill(
  employeeId: string,
  skill: string
): FeedbackEntry[] {
  return feedbackStorage.filter(
    entry => entry.employeeId === employeeId && entry.skill === skill
  );
}

/**
 * Get all feedback entries for a specific date
 */
export function getFeedbackByDate(date: string): FeedbackEntry[] {
  return feedbackStorage.filter(entry => entry.date === date);
}

/**
 * Get all feedback entries within a date range
 */
export function getFeedbackByDateRange(startDate: string, endDate: string): FeedbackEntry[] {
  return feedbackStorage.filter(
    entry => entry.date >= startDate && entry.date <= endDate
  );
}

/**
 * Calculate average rating for an employee on a specific skill
 */
export function getAverageRating(employeeId: string, skill: string): number | null {
  const entries = getFeedbackByEmployeeAndSkill(employeeId, skill);
  if (entries.length === 0) return null;
  
  const sum = entries.reduce((acc, entry) => acc + entry.rating, 0);
  return sum / entries.length;
}

/**
 * Get all feedback entries (for debugging or export)
 */
export function getAllFeedback(): FeedbackEntry[] {
  return [...feedbackStorage];
}

/**
 * Clear all feedback entries (for testing)
 */
export function clearAllFeedback(): void {
  feedbackStorage = [];
}

/**
 * Get recent feedback entries (last N entries)
 */
export function getRecentFeedback(limit: number = 10): FeedbackEntry[] {
  return feedbackStorage
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Get feedback statistics for an employee
 */
export function getFeedbackStats(employeeId: string) {
  const entries = getFeedbackByEmployee(employeeId);
  
  if (entries.length === 0) {
    return null;
  }
  
  const skillStats: Record<string, { count: number; average: number; ratings: number[] }> = {};
  
  entries.forEach(entry => {
    if (!skillStats[entry.skill]) {
      skillStats[entry.skill] = { count: 0, average: 0, ratings: [] };
    }
    skillStats[entry.skill].count++;
    skillStats[entry.skill].ratings.push(entry.rating);
  });
  
  // Calculate averages
  Object.keys(skillStats).forEach(skill => {
    const ratings = skillStats[skill].ratings;
    const sum = ratings.reduce((acc, r) => acc + r, 0);
    skillStats[skill].average = sum / ratings.length;
  });
  
  const allRatings = entries.map(e => e.rating);
  const overallAverage = allRatings.reduce((acc, r) => acc + r, 0) / allRatings.length;
  
  return {
    totalFeedback: entries.length,
    overallAverage,
    skillStats,
  };
}
