import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import BulkImportPage from './pages/admin/BulkImportPage';
import HousesPage from './pages/admin/HousesPage';
import ActivitiesPage from './pages/admin/ActivitiesPage';
import MarksPage from './pages/admin/MarksPage';
import RankingsPage from './pages/admin/RankingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentResetPasswordPage from './pages/student/StudentResetPasswordPage';
import StudentMarksPage from './pages/student/StudentMarksPage';
import StudentActivitiesPage from './pages/student/StudentActivitiesPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/import" element={<BulkImportPage />} />
                <Route path="houses" element={<HousesPage />} />
                <Route path="activities" element={<ActivitiesPage />} />
                <Route path="marks" element={<MarksPage />} />
                <Route path="rankings" element={<RankingsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>

              {/* Student Protected Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="reset-password" element={<StudentResetPasswordPage />} />
                <Route path="marks" element={<StudentMarksPage />} />
                <Route path="activities" element={<StudentActivitiesPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
