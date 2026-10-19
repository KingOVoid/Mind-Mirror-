import { Router } from 'express';
import authRoutes from './authRoutes';
import onboardingRoutes from './onboardingRoutes';
import subjectRoutes from './subjectRoutes';
import topicRoutes from './topicRoutes';
import questionRoutes from './questionRoutes';
import quizRoutes from './quizRoutes';
import testRoutes from './testRoutes';
import studySessionRoutes from './studySessionRoutes';
import dashboardRoutes from './dashboardRoutes';
import mindMirrorRoutes from './mindMirrorRoutes';
import recommendationRoutes from './recommendationRoutes';
import mistakeRoutes from './mistakeRoutes';
import reviewCenterRoutes from './reviewCenterRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import aiRoutes from './aiRoutes';
import analyticsRoutes from './analyticsRoutes';
import searchRoutes from './searchRoutes';
import profileRoutes from './profileRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/subjects', subjectRoutes);
router.use('/topics', topicRoutes);
router.use('/questions', questionRoutes);
router.use('/quizzes', quizRoutes);
router.use('/tests', testRoutes);
router.use('/study-sessions', studySessionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/mind-mirror', mindMirrorRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/mistakes', mistakeRoutes);
router.use('/review-center', reviewCenterRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/search', searchRoutes);
router.use('/profile', profileRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
