export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT' | 'FILL_IN_BLANK';
export type MasteryStatus =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'WEAK'
  | 'IMPROVING'
  | 'STRONG'
  | 'MASTERED'
  | 'AT_RISK';
export type RetentionStatus = 'FRESH' | 'STABLE' | 'NEEDS_REVISION' | 'AT_RISK' | 'LIKELY_FORGOTTEN';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
export type NotificationType =
  | 'REVISION_DUE'
  | 'TEST_RESULT'
  | 'QUIZ_RECOMMENDATION'
  | 'STREAK_REMINDER'
  | 'WEAK_TOPIC'
  | 'NEW_TEST'
  | 'SYSTEM';

declare global {
  namespace Express {
    interface Request {
      user?: import('./index').AuthUser;
    }
  }
}
