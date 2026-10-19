import { pool } from '../db/pool';

/**
 * A day counts as "active" only if meaningful learning happened on it:
 * a study session of at least 5 minutes, OR a submitted quiz, OR a
 * submitted test. Opening the app or browsing does not count — streaks
 * should reflect real learning, not meaningless activity.
 */
export async function getActiveDays(userId: string): Promise<string[]> {
  const { rows } = await pool.query(
    `
    SELECT DISTINCT day::date AS day FROM (
      SELECT DATE("startedAt") AS day FROM "StudySession"
        WHERE "userId" = $1 AND "isActive" = false AND "durationSec" >= 300
      UNION
      SELECT DATE("submittedAt") AS day FROM "QuizAttempt"
        WHERE "userId" = $1 AND status = 'SUBMITTED' AND "submittedAt" IS NOT NULL
      UNION
      SELECT DATE("submittedAt") AS day FROM "TestAttempt"
        WHERE "userId" = $1 AND status = 'SUBMITTED' AND "submittedAt" IS NOT NULL
    ) days
    ORDER BY day DESC
    `,
    [userId]
  );
  return rows.map((r: any) => (r.day instanceof Date ? r.day.toISOString().slice(0, 10) : r.day));
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  activeDays: string[]; // ISO date strings, descending
}

export async function computeStreak(userId: string): Promise<StreakResult> {
  const activeDays = await getActiveDays(userId);
  if (activeDays.length === 0) return { currentStreak: 0, longestStreak: 0, activeDays: [] };

  const daySet = new Set(activeDays);
  const toDate = (s: string) => new Date(s + 'T00:00:00Z');
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Current streak: walk backwards from today (or yesterday, if today has no activity yet)
  // so a student who hasn't studied *yet today* doesn't see their streak zeroed prematurely.
  let currentStreak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let cursor = new Date(today);
  if (!daySet.has(cursor.toISOString().slice(0, 10))) {
    cursor = new Date(cursor.getTime() - oneDayMs);
  }
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    currentStreak++;
    cursor = new Date(cursor.getTime() - oneDayMs);
  }

  // Longest streak: scan all active days sorted ascending for the longest consecutive run.
  const sortedAsc = [...activeDays].sort();
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = toDate(sortedAsc[i - 1]);
    const curr = toDate(sortedAsc[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / oneDayMs);
    if (diffDays === 1) {
      run++;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak, activeDays };
}
