import './styles/globals.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import NotebookPage from './pages/notebook/NotebookPage';
import SubjectsPage from './pages/subjects/SubjectsPage';
import SubjectDetailPage from './pages/subjects/SubjectDetailPage';
import QuizPage from './pages/quiz/QuizPage';
import QuizReviewPage from './pages/quiz/QuizReviewPage';
import TestPage from './pages/test/TestPage';
import TestReviewPage from './pages/test/TestReviewPage';
import MindMirrorPage from './pages/mindmirror/MindMirrorPage';
import ReviewCenterPage from './pages/review/ReviewCenterPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import MistakesPage from './pages/review/MistakesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/profile/SettingsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminStudentDetailPage from './pages/admin/AdminStudentDetailPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminTestsPage from './pages/admin/AdminTestsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Strict Root Routing: Root route (/) renders LoginPage directly with no auto-redirects */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/notebook" element={<NotebookPage />} />
              <Route path="/dashboard" element={<Navigate to="/notebook" replace />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/subjects/:id" element={<SubjectDetailPage />} />
              <Route path="/mind-mirror" element={<MindMirrorPage />} />
              <Route path="/review-center" element={<ReviewCenterPage />} />
              <Route path="/mistakes" element={<MistakesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
            </Route>
            {/* Quiz/test flows render full-screen, without the sidebar chrome. */}
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/quiz/attempts/:attemptId/review" element={<QuizReviewPage />} />
            <Route path="/test/:testId" element={<TestPage />} />
            <Route path="/test/attempts/:attemptId/review" element={<TestReviewPage />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="students/:id" element={<AdminStudentDetailPage />} />
              <Route path="questions" element={<AdminQuestionsPage />} />
              <Route path="tests" element={<AdminTestsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
