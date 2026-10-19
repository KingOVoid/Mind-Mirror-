export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: string;
}

export interface StudentProfile {
  id?: string;
  userId?: string;
  college?: string;
  course?: string;
  semester?: string;
  onboardingComplete: boolean;
  learningGoals?: string;
  preferredStudyTime?: string;
  dailyStudyTargetMinutes?: number;
  strongSubjectTags?: string[];
  weakSubjectTags?: string[];
}

export interface LearningProfile {
  overallKnowledgeScore: number;
  avgAccuracy: number;
  avgConfidence: number;
  confidenceAccuracyGap: number;
  avgResponseTimeMs: number;
  learningConsistency: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTimeMin: number;
  totalQuizzes: number;
  totalTests: number;
  strongTopicsCount?: number;
  weakTopicsCount?: number;
  atRiskTopicsCount?: number;
}

export interface TopicProgressItem {
  id?: string;
  topicId?: string;
  topicName: string;
  subjectName: string;
  knowledgeScore: number;
  retentionScore: number;
  accuracy: number;
  masteryStatus: 'NOT_STARTED' | 'LEARNING' | 'WEAK' | 'IMPROVING' | 'STRONG' | 'MASTERED' | 'AT_RISK';
  retentionStatus: 'FRESH' | 'STABLE' | 'NEEDS_REVISION' | 'AT_RISK' | 'LIKELY_FORGOTTEN';
  attempts: number;
}

export interface DashboardData {
  welcomeMessage: string;
  learningScore: number;
  knowledgeCoverage: number;
  strongTopics: TopicProgressItem[];
  weakTopics: TopicProgressItem[];
  topicsAtRisk: TopicProgressItem[];
  recentQuizzes: any[];
  recentTests: any[];
  studyStreak: { current: number; longest: number };
  totalLearningTimeMin: number;
  accuracy: number;
  avgResponseTimeMs: number;
  confidenceScore: number;
  confidenceAccuracyGap: number;
  recommendedNextTopic?: TopicProgressItem | null;
  totalQuizzes: number;
  totalTests: number;
}

export interface EngineeringPlanItem {
  phase: string;
  duration: string;
  title: string;
  coreConcepts: string[];
  governingFormulas: string[];
  appliedProblems: string[];
  activeRecallPrompt: string;
}

export interface EngineeringStudyPlanResult {
  courseworkTitle: string;
  studentLevel: string;
  hoursPerWeek: number;
  totalWeeks: number;
  overview: string;
  modules: EngineeringPlanItem[];
  highYieldCheckpoints: string[];
  source: 'ollama' | 'anthropic' | 'curriculum-engine';
}
