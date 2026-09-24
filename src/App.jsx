import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import ResumeUpload from './pages/ResumeUpload';
import Candidates from './pages/Candidates';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import JobRole from './pages/JobRole';
import Report from './pages/Report';
import Setting from './pages/Setting';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Upgrade from './pages/Upgrade';
import CandidateDashboard from './pages/Candidate/CandidateDashboard';
import ResumeChecker from './pages/Candidate/ResumeChecker';
import CandidateJobs from './pages/Candidate/CandidateJobs';
import MyApplications from './pages/Candidate/MyApplications';
import AIChatbot from './components/AIChatbot';

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const path = location.pathname.toLowerCase();

  const hideChatbot =
    path === '/' ||
    path === '' ||
    path.includes('signup') ||
    path.includes('upgrade') ||
    path.includes('login');

  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard.html"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/index.html"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />

        {/* Authenticated Internal Navigation Routes */}
        <Route
          path="/resumeupload"
          element={
            <ProtectedRoute>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumeupload.html"
          element={
            <ProtectedRoute>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Candidates.html"
          element={
            <ProtectedRoute>
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates.html"
          element={
            <ProtectedRoute>
              <Candidates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skillgapanalysis"
          element={
            <ProtectedRoute>
              <SkillGapAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skillgapanalysis.html"
          element={
            <ProtectedRoute>
              <SkillGapAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobrole"
          element={
            <ProtectedRoute>
              <JobRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobrole.html"
          element={
            <ProtectedRoute>
              <JobRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report.html"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting.html"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings.html"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade.html"
          element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          }
        />

        {/* Candidate Portal Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/resume-checker"
          element={<ResumeChecker />}
        />
        <Route
          path="/candidate/jobs"
          element={
            <ProtectedRoute>
              <CandidateJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        {/* Public shortcut for ATS Resume Checker */}
        <Route path="/resume-checker" element={<ResumeChecker />} />

        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup.html" element={<Signup />} />

        <Route path="/login" element={<Login />} />
        <Route path="/login.html" element={<Login />} />

        {/* Fallback */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              user?.role === 'CANDIDATE' ? (
                <Navigate to="/candidate/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      {!hideChatbot && <AIChatbot />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
