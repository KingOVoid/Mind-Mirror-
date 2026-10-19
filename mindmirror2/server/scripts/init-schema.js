const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local'), override: true });

async function initSchema() {
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED is not defined');
  }

  console.log('Connecting to Neon PostgreSQL for schema setup...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected successfully. Creating schema...');

  const sql = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "MasteryStatus" AS ENUM ('NOT_STARTED', 'LEARNING', 'WEAK', 'IMPROVING', 'STRONG', 'MASTERED', 'AT_RISK');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "RetentionStatus" AS ENUM ('FRESH', 'STABLE', 'NEEDS_REVISION', 'AT_RISK', 'LIKELY_FORGOTTEN');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_SELECT', 'FILL_IN_BLANK');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('REVISION_DUE', 'TEST_RESULT', 'QUIZ_RECOMMENDATION', 'STREAK_REMINDER', 'WEAK_TOPIC', 'NEW_TEST', 'SYSTEM');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "StudyPreferenceStyle" AS ENUM ('VISUAL', 'READING', 'PRACTICE', 'MIXED');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    role "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);

  CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "usedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "StudentProfile" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    college VARCHAR(255),
    course VARCHAR(255),
    semester VARCHAR(100),
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "learningGoals" TEXT,
    "preferredStudyTime" VARCHAR(100),
    "targetExamDate" TIMESTAMPTZ,
    "preferredLearningStyle" "StudyPreferenceStyle" DEFAULT 'MIXED',
    "dailyStudyTargetMinutes" INT DEFAULT 30,
    "strongSubjectTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weakSubjectTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "LearningProfile" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "overallKnowledgeScore" FLOAT NOT NULL DEFAULT 0,
    "avgAccuracy" FLOAT NOT NULL DEFAULT 0,
    "avgConfidence" FLOAT NOT NULL DEFAULT 0,
    "confidenceAccuracyGap" FLOAT NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INT NOT NULL DEFAULT 0,
    "learningConsistency" FLOAT NOT NULL DEFAULT 0,
    "currentStreak" INT NOT NULL DEFAULT 0,
    "longestStreak" INT NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMPTZ,
    "totalStudyTimeMin" INT NOT NULL DEFAULT 0,
    "totalQuizzes" INT NOT NULL DEFAULT 0,
    "totalTests" INT NOT NULL DEFAULT 0,
    "strongTopicsCount" INT NOT NULL DEFAULT 0,
    "weakTopicsCount" INT NOT NULL DEFAULT 0,
    "atRiskTopicsCount" INT NOT NULL DEFAULT 0,
    "forgottenTopicsCount" INT NOT NULL DEFAULT 0,
    "lastComputedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE "LearningProfile" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

  CREATE TABLE IF NOT EXISTS "Subject" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'BookOpen',
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "Topic" (
    id VARCHAR(255) PRIMARY KEY,
    "subjectId" VARCHAR(255) NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
    "parentId" VARCHAR(255) REFERENCES "Topic"(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "orderIndex" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "Question" (
    id VARCHAR(255) PRIMARY KEY,
    "subjectId" VARCHAR(255) NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
    "topicId" VARCHAR(255) NOT NULL REFERENCES "Topic"(id) ON DELETE CASCADE,
    type "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    text TEXT NOT NULL,
    options JSONB,
    "correctAnswer" JSONB NOT NULL,
    explanation TEXT,
    difficulty "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    concept VARCHAR(255),
    "authorId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "Quiz" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
    "subjectId" VARCHAR(255) NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    difficulty "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "isPersonalized" BOOLEAN NOT NULL DEFAULT false,
    "isAdaptive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "QuizQuestion" (
    id VARCHAR(255) PRIMARY KEY,
    "quizId" VARCHAR(255) NOT NULL REFERENCES "Quiz"(id) ON DELETE CASCADE,
    "questionId" VARCHAR(255) NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
    "topicId" VARCHAR(255) NOT NULL REFERENCES "Topic"(id) ON DELETE CASCADE,
    "orderIndex" INT NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS "QuizAttempt" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "quizId" VARCHAR(255) NOT NULL REFERENCES "Quiz"(id) ON DELETE CASCADE,
    status "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "submittedAt" TIMESTAMPTZ,
    "totalQuestions" INT NOT NULL DEFAULT 0,
    "correctCount" INT NOT NULL DEFAULT 0,
    "incorrectCount" INT NOT NULL DEFAULT 0,
    "scorePercent" FLOAT NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INT NOT NULL DEFAULT 0,
    "avgConfidence" FLOAT
  );

  CREATE TABLE IF NOT EXISTS "QuizAnswer" (
    id VARCHAR(255) PRIMARY KEY,
    "attemptId" VARCHAR(255) NOT NULL REFERENCES "QuizAttempt"(id) ON DELETE CASCADE,
    "quizQuestionId" VARCHAR(255) NOT NULL REFERENCES "QuizQuestion"(id) ON DELETE CASCADE,
    "questionId" VARCHAR(255) NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
    "selectedAnswer" JSONB,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentMs" INT NOT NULL DEFAULT 0,
    "confidenceRating" INT,
    "attemptNumber" INT NOT NULL DEFAULT 1,
    "answeredAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "Test" (
    id VARCHAR(255) PRIMARY KEY,
    "createdById" UUID REFERENCES "User"(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    "subjectId" VARCHAR(255) NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
    instructions TEXT,
    difficulty "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "timeLimitMin" INT NOT NULL DEFAULT 30,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "TestQuestion" (
    id VARCHAR(255) PRIMARY KEY,
    "testId" VARCHAR(255) NOT NULL REFERENCES "Test"(id) ON DELETE CASCADE,
    "questionId" VARCHAR(255) NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
    "topicId" VARCHAR(255) NOT NULL REFERENCES "Topic"(id) ON DELETE CASCADE,
    "orderIndex" INT NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS "TestAttempt" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "testId" VARCHAR(255) NOT NULL REFERENCES "Test"(id) ON DELETE CASCADE,
    status "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "submittedAt" TIMESTAMPTZ,
    "timeUsedSec" INT NOT NULL DEFAULT 0,
    "totalQuestions" INT NOT NULL DEFAULT 0,
    "correctCount" INT NOT NULL DEFAULT 0,
    "incorrectCount" INT NOT NULL DEFAULT 0,
    "unansweredCount" INT NOT NULL DEFAULT 0,
    "scorePercent" FLOAT NOT NULL DEFAULT 0,
    "topicBreakdown" JSONB,
    "difficultyBreakdown" JSONB
  );

  CREATE TABLE IF NOT EXISTS "TestAnswer" (
    id VARCHAR(255) PRIMARY KEY,
    "attemptId" VARCHAR(255) NOT NULL REFERENCES "TestAttempt"(id) ON DELETE CASCADE,
    "testQuestionId" VARCHAR(255) NOT NULL REFERENCES "TestQuestion"(id) ON DELETE CASCADE,
    "questionId" VARCHAR(255) NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
    "selectedAnswer" JSONB,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "markedForReview" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentMs" INT NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMPTZ,
    CONSTRAINT "TestAnswer_attempt_question_unique" UNIQUE ("attemptId", "testQuestionId")
  );

  CREATE TABLE IF NOT EXISTS "TopicProgress" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "subjectId" VARCHAR(255) NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
    "topicId" VARCHAR(255) NOT NULL REFERENCES "Topic"(id) ON DELETE CASCADE,
    attempts INT NOT NULL DEFAULT 0,
    "correctAnswers" INT NOT NULL DEFAULT 0,
    "incorrectAnswers" INT NOT NULL DEFAULT 0,
    accuracy FLOAT NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INT NOT NULL DEFAULT 0,
    "avgConfidence" FLOAT,
    "confidenceCalibration" FLOAT,
    "knowledgeScore" FLOAT NOT NULL DEFAULT 0,
    "avgDifficultyWeight" FLOAT NOT NULL DEFAULT 0.7,
    "difficultyLevel" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "masteryStatus" "MasteryStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "retentionStatus" "RetentionStatus" NOT NULL DEFAULT 'FRESH',
    "retentionScore" FLOAT NOT NULL DEFAULT 100,
    "revisionCount" INT NOT NULL DEFAULT 0,
    "successfulRecalls" INT NOT NULL DEFAULT 0,
    "lastStudiedAt" TIMESTAMPTZ,
    "lastAssessedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "TopicProgress_user_topic_unique" UNIQUE ("userId", "topicId")
  );

  CREATE TABLE IF NOT EXISTS "StudySession" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "subjectId" VARCHAR(255),
    "topicId" VARCHAR(255),
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "endedAt" TIMESTAMPTZ,
    "pausedMs" INT NOT NULL DEFAULT 0,
    "durationSec" INT NOT NULL DEFAULT 0,
    notes TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "Recommendation" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "subjectId" VARCHAR(255),
    "topicId" VARCHAR(255),
    priority INT NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS "Notification" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "Mistake" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "questionId" VARCHAR(255) NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
    "topicId" VARCHAR(255) NOT NULL REFERENCES "Topic"(id) ON DELETE CASCADE,
    "lastSelectedAnswer" JSONB,
    "timesWrong" INT NOT NULL DEFAULT 1,
    "timesCorrectedSince" INT NOT NULL DEFAULT 0,
    "lastConfidence" INT,
    "lastAttemptedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Mistake_user_question_unique" UNIQUE ("userId", "questionId")
  );

  CREATE TABLE IF NOT EXISTS "Achievement" (
    id VARCHAR(255) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) DEFAULT 'Award'
  );

  CREATE TABLE IF NOT EXISTS "UserAchievement" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "achievementId" VARCHAR(255) NOT NULL REFERENCES "Achievement"(id) ON DELETE CASCADE,
    "earnedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "UserAchievement_user_achievement_unique" UNIQUE ("userId", "achievementId")
  );
  `;

  await client.query(sql);
  console.log('✅ Neon PostgreSQL schema created successfully!');
  await client.end();
}

initSchema().catch((err) => {
  console.error('Schema initialization failed:', err);
  process.exit(1);
});
