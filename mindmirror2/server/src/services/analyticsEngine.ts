/**
 * Mind Mirror — Learning Analytics Engine
 * ----------------------------------------
 * Pure, side-effect-free functions that turn raw activity data into the
 * signals that power the Cognitive Twin: knowledge score, mastery status,
 * retention/forgetting estimate, and confidence-accuracy analysis.
 *
 * Kept deliberately modular (small, composable, independently testable
 * functions) so each piece — especially the retention model — can be
 * swapped for a more sophisticated algorithm later (e.g. real spaced
 * repetition / SM-2) without touching the rest of the system.
 *
 * IMPORTANT: this is a pedagogical analytics heuristic, not a validated
 * psychometric or medical/psychological assessment instrument.
 */

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type MasteryStatus = 'NOT_STARTED' | 'LEARNING' | 'WEAK' | 'IMPROVING' | 'STRONG' | 'MASTERED' | 'AT_RISK';
export type RetentionStatus = 'FRESH' | 'STABLE' | 'NEEDS_REVISION' | 'AT_RISK' | 'LIKELY_FORGOTTEN';

const DIFFICULTY_WEIGHT: Record<DifficultyLevel, number> = { EASY: 0.6, MEDIUM: 0.8, HARD: 1.0 };
const BASE_STABILITY_DAYS: Record<DifficultyLevel, number> = { EASY: 12, MEDIUM: 8, HARD: 5 };

export function clamp(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

// ─────────────────────────────────────────────────────────────────────────
// 1. KNOWLEDGE SCORE
// ─────────────────────────────────────────────────────────────────────────

export interface KnowledgeScoreInput {
  accuracy: number; // 0-100, over all attempts on this topic
  attempts: number;
  avgDifficultyWeight: number; // 0-1, average difficulty weight of questions attempted
  retentionScore: number; // 0-100, from calculateRetention()
  confidenceAccuracyGap: number; // -1..1, from calculateConfidenceCalibration()
  recentAccuracyTrend: number; // -100..100, (recent accuracy - older accuracy); 0 if not enough data
}

/**
 * Knowledge Score = weighted blend of:
 *  - accuracy (how often they get it right)
 *  - difficulty-adjusted performance (correct answers on hard questions count more)
 *  - retention (does the knowledge persist over time, or has it decayed)
 *  - consistency / trend (improving vs declining recently)
 *  - confidence calibration (penalize overconfidence, which masks real gaps)
 *
 * Weights are intentionally named constants so the formula can be re-tuned
 * without hunting through the function body.
 */
const WEIGHTS = {
  accuracy: 0.35,
  difficulty: 0.2,
  retention: 0.2,
  consistency: 0.15,
  calibration: 0.1,
};

export function calculateKnowledgeScore(input: KnowledgeScoreInput): number {
  if (input.attempts === 0) return 0;

  const accuracyComponent = clamp(input.accuracy);

  const difficultyComponent = clamp(input.accuracy * (0.5 + input.avgDifficultyWeight * 0.5));

  const retentionComponent = clamp(input.retentionScore);

  // Consistency: reward a positive recent trend, penalize a negative one, neutral (50) if flat/unknown.
  const consistencyComponent = clamp(50 + input.recentAccuracyTrend / 2);

  // Calibration: a gap of 0 (perfectly calibrated) scores 100; a gap of ±1 (maximally
  // over/under-confident) scores 0.
  const calibrationComponent = clamp(100 - Math.abs(input.confidenceAccuracyGap) * 100);

  const score =
    accuracyComponent * WEIGHTS.accuracy +
    difficultyComponent * WEIGHTS.difficulty +
    retentionComponent * WEIGHTS.retention +
    consistencyComponent * WEIGHTS.consistency +
    calibrationComponent * WEIGHTS.calibration;

  return Math.round(clamp(score) * 10) / 10;
}

export function difficultyWeight(difficulty: DifficultyLevel): number {
  return DIFFICULTY_WEIGHT[difficulty];
}

// ─────────────────────────────────────────────────────────────────────────
// 2. MASTERY CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────

export interface MasteryInput {
  attempts: number;
  knowledgeScore: number;
  retentionScore: number;
  recentAccuracyTrend: number; // -100..100
}

export function classifyMastery(input: MasteryInput): MasteryStatus {
  if (input.attempts === 0) return 'NOT_STARTED';

  // A topic that was once learned but is decaying badly is "at risk" regardless
  // of its historical knowledge score — this is what should show up for revision.
  if (input.retentionScore < 35 && input.knowledgeScore >= 40) return 'AT_RISK';

  if (input.attempts < 3) return 'LEARNING';

  if (input.knowledgeScore >= 85) return 'MASTERED';
  if (input.knowledgeScore >= 70) return 'STRONG';
  if (input.knowledgeScore >= 50) {
    return input.recentAccuracyTrend >= 0 ? 'IMPROVING' : 'WEAK';
  }
  return 'WEAK';
}

// ─────────────────────────────────────────────────────────────────────────
// 3. RETENTION / FORGETTING MODEL
// ─────────────────────────────────────────────────────────────────────────
//
// A simplified exponential-decay forgetting curve. Modular by design: swap
// this function out for a real spaced-repetition algorithm (e.g. SM-2/FSRS)
// later without touching any caller — the input/output contract stays the
// same (days since last study + a few signals -> a 0-100 retention score).

export interface RetentionInput {
  daysSinceLastStudied: number;
  successfulRecalls: number; // number of times correctly recalled since first learned
  difficulty: DifficultyLevel; // predominant difficulty of the topic's questions
  revisionCount: number; // number of distinct study/quiz sessions touching this topic
}

export function calculateRetention(input: RetentionInput): { score: number; status: RetentionStatus } {
  const base = BASE_STABILITY_DAYS[input.difficulty];
  // Each successful recall and each revision extends how long the memory stays stable
  // (a very loose approximation of spacing effects).
  const stability = base * (1 + input.successfulRecalls * 0.4 + input.revisionCount * 0.15);

  const score = clamp(100 * Math.exp(-input.daysSinceLastStudied / Math.max(stability, 1)));
  const rounded = Math.round(score * 10) / 10;

  let status: RetentionStatus;
  if (rounded >= 80) status = 'FRESH';
  else if (rounded >= 60) status = 'STABLE';
  else if (rounded >= 40) status = 'NEEDS_REVISION';
  else if (rounded >= 20) status = 'AT_RISK';
  else status = 'LIKELY_FORGOTTEN';

  return { score: rounded, status };
}

// ─────────────────────────────────────────────────────────────────────────
// 4. CONFIDENCE ANALYSIS
// ─────────────────────────────────────────────────────────────────────────

export type ConfidencePattern =
  | 'STRONG_UNDERSTANDING'
  | 'POSSIBLE_MISCONCEPTION'
  | 'KNOWLEDGE_EXISTS_LOW_CONFIDENCE'
  | 'WEAK_CONCEPT'
  | 'NEUTRAL';

/** Classifies a single answer's confidence/correctness pair into one of the four quadrants. */
export function classifyConfidencePattern(confidenceRating: number | null | undefined, isCorrect: boolean): ConfidencePattern {
  if (confidenceRating == null) return 'NEUTRAL';
  const high = confidenceRating >= 4;
  const low = confidenceRating <= 2;
  if (high && isCorrect) return 'STRONG_UNDERSTANDING';
  if (high && !isCorrect) return 'POSSIBLE_MISCONCEPTION';
  if (low && isCorrect) return 'KNOWLEDGE_EXISTS_LOW_CONFIDENCE';
  if (low && !isCorrect) return 'WEAK_CONCEPT';
  return 'NEUTRAL';
}

/**
 * Confidence-accuracy gap across a set of answers.
 * Positive => overconfident (confident more often than correct).
 * Negative => underconfident (correct more often than confident).
 * Range: -1..1.
 */
export function calculateConfidenceCalibration(
  answers: Array<{ confidenceRating: number | null | undefined; isCorrect: boolean }>
): number {
  const rated = answers.filter((a) => a.confidenceRating != null);
  if (rated.length === 0) return 0;

  const avgConfidenceNorm =
    rated.reduce((sum, a) => sum + ((a.confidenceRating as number) - 1) / 4, 0) / rated.length;
  const avgAccuracy = rated.reduce((sum, a) => sum + (a.isCorrect ? 1 : 0), 0) / rated.length;

  return Math.round((avgConfidenceNorm - avgAccuracy) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────
// 5. CONSISTENCY / LEARNING REGULARITY
// ─────────────────────────────────────────────────────────────────────────

/**
 * A 0-100 score describing how regularly the student engages in meaningful
 * learning activity, based on the distinct days they were active in the
 * last `windowDays` days. This feeds the Cognitive Twin's "behavior" view,
 * not the per-topic knowledge score.
 */
export function calculateLearningConsistency(activeDayCount: number, windowDays: number): number {
  if (windowDays <= 0) return 0;
  return Math.round(clamp((activeDayCount / windowDays) * 100));
}

// ─────────────────────────────────────────────────────────────────────────
// 6. RECENT ACCURACY TREND
// ─────────────────────────────────────────────────────────────────────────

/** Simple recency trend: recent-window accuracy minus older-window accuracy, in percentage points. */
export function calculateRecentTrend(recentAccuracy: number | null, olderAccuracy: number | null): number {
  if (recentAccuracy == null || olderAccuracy == null) return 0;
  return clamp(recentAccuracy - olderAccuracy, -100, 100);
}
