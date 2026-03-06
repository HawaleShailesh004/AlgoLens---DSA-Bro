/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Simplified SM-2 implementation for Grindset.
 * Based on SuperMemo 2 algorithm with adjustments for confidence-based grading.
 * 
 * @param confidence - User's confidence rating (1 = Struggled, 2 = Okay, 3 = Crushed it)
 * @param currentEaseFactor - Current ease factor (default 2.5 for first review)
 * @param lastInterval - Last review interval in days (null for first review)
 * @returns Object with nextReviewAt date, new easeFactor, and new interval
 */

export interface SRSResult {
  nextReviewAt: Date;
  easeFactor: number;
  interval: number; // in days
}

export function calculateSM2(
  confidence: number, // 1-3
  currentEaseFactor: number = 2.5,
  lastInterval: number | null = null
): SRSResult {
  // Convert confidence (1-3) to SM-2 grade (0-5)
  // 1 (Struggled) = 0-1, 2 (Okay) = 2-3, 3 (Crushed it) = 4-5
  const grade = confidence === 1 ? 1 : confidence === 2 ? 3 : 5;

  // Calculate new ease factor
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Adjusted for our 1-3 scale mapped to 0-5
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  
  // Ensure minimum ease factor of 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);

  // Calculate interval
  let interval: number;
  
  if (lastInterval === null) {
    // First review - use fixed intervals based on confidence
    interval = confidence === 1 ? 1 : confidence === 2 ? 3 : 7;
  } else {
    // Subsequent reviews - use SM-2 formula
    interval = Math.round(lastInterval * newEaseFactor);
    
    // Ensure minimum interval of 1 day
    interval = Math.max(1, interval);
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    nextReviewAt,
    easeFactor: newEaseFactor,
    interval,
  };
}

/**
 * Get initial SRS values for a new log entry
 */
export function getInitialSRS(): { easeFactor: number; lastInterval: number | null } {
  return {
    easeFactor: 2.5,
    lastInterval: null,
  };
}
