import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { aiService } from '../services/aiService';
import { questionRepo } from '../db/repositories/questionRepo';
import { dashboardRepo } from '../db/repositories/dashboardRepo';
import { studentProfileRepo } from '../db/repositories/studentProfileRepo';
import { userRepo } from '../db/repositories/userRepo';
import { withLiveRetention } from '../services/topicProgressService';

export const aiController = {
  status: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ enabled: aiService.isEnabled });
  }),

  engineeringPresets: asyncHandler(async (_req: Request, res: Response) => {
    const presets = aiService.getEngineeringPresets();
    res.json({ presets });
  }),

  engineeringStudyPlan: asyncHandler(async (req: Request, res: Response) => {
    const { courseworkTitle, studentLevel, hoursPerWeek, presetId } = req.body;
    if (!courseworkTitle && !presetId) {
      throw AppError.badRequest('courseworkTitle or presetId is required');
    }

    const result = await aiService.generateEngineeringStudyPlan({
      courseworkTitle: courseworkTitle || 'Applied Engineering Coursework',
      studentLevel,
      hoursPerWeek: Number(hoursPerWeek) || 8,
      presetId,
    });

    res.json(result);
  }),

  copilotChat: asyncHandler(async (req: Request, res: Response) => {
    const message = req.body.message || req.body.query;
    if (!message) {
      throw AppError.badRequest('Message or query is required');
    }
    const result = await aiService.copilotChat({
      message,
      history: req.body.history,
    });
    res.json(result);
  }),

  explainAnswer: asyncHandler(async (req: Request, res: Response) => {
    let questionText = req.body.questionText || req.body.query;
    let correctAnswer = req.body.correctAnswer || 'Core principles';
    let storedExplanation = req.body.storedExplanation;

    if (req.body.questionId) {
      const question = await questionRepo.findById(req.body.questionId).catch(() => null);
      if (question) {
        questionText = question.text;
        correctAnswer = question.correctAnswer;
        storedExplanation = question.explanation;
      }
    }

    if (!questionText) {
      questionText = req.body.selectedAnswer || 'Engineering topic breakdown';
    }

    const result = await aiService.explainAnswer({
      questionText,
      correctAnswer,
      selectedAnswer: req.body.selectedAnswer || questionText,
      storedExplanation,
    });
    res.json(result);
  }),

  studyPlan: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepo.findById(req.user!.id);
    const profile = await studentProfileRepo.findByUserId(req.user!.id);
    const rawTopics = await dashboardRepo.topicProgressWithNames(req.user!.id);
    const liveTopics = rawTopics.map((t: any) => withLiveRetention(t)).filter((t: any) => t.attempts > 0);

    const weakTopics = liveTopics
      .filter((t: any) => t.masteryStatus === 'WEAK')
      .map((t: any) => ({ topicName: t.topicName, subjectName: t.subjectName, accuracy: t.accuracy }));
    const atRiskTopics = liveTopics
      .filter((t: any) => t.masteryStatus === 'AT_RISK' || t.retentionStatus === 'LIKELY_FORGOTTEN')
      .map((t: any) => ({ topicName: t.topicName, subjectName: t.subjectName }));

    const result = await aiService.generateStudyPlan({
      fullName: user?.fullName ?? 'there',
      weakTopics,
      atRiskTopics,
      dailyStudyTargetMinutes: profile?.dailyStudyTargetMinutes ?? 30,
    });
    res.json(result);
  }),

  summarizeWeakTopics: asyncHandler(async (req: Request, res: Response) => {
    const rawTopics = await dashboardRepo.topicProgressWithNames(req.user!.id);
    const liveTopics = rawTopics.map((t: any) => withLiveRetention(t));
    const weakTopics = liveTopics
      .filter((t: any) => t.masteryStatus === 'WEAK')
      .map((t: any) => ({ topicName: t.topicName, subjectName: t.subjectName }));
    const result = await aiService.summarizeWeakTopics({ weakTopics });
    res.json(result);
  }),

  analyzeDocument: asyncHandler(async (req: Request, res: Response) => {
    const { documentText, fileName, topic } = req.body;
    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      throw AppError.badRequest('Document text is required');
    }
    const result = await aiService.analyzeDocument({
      documentText,
      fileName: fileName || 'Uploaded Document',
      topic,
    });
    res.json(result);
  }),

  generateQuiz: asyncHandler(async (req: Request, res: Response) => {
    const { topic, studyMaterialText } = req.body;
    const result = await aiService.generateQuiz({
      topic: topic || 'Core Engineering Principles',
      studyMaterialText: studyMaterialText || '',
    });
    res.json(result);
  }),
};

