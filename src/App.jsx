import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AIChatbot from './components/AIChatbot';
import CommandPalette from './components/CommandPalette';

// Lazy-loaded routes for production performance and optimal bundle chunking
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Index = lazy(() => import('./pages/Index'));
const ResumeUpload = lazy(() => import('./pages/ResumeUpload'));
const Candidates = lazy(() => import('./pages/Candidates'));
const SkillGapAnalysis = lazy(() => import('./pages/SkillGapAnalysis'));
const JobRole = lazy(() => import('./pages/JobRole'));
const Report = lazy(() => import('./pages/Report'));
const Setting = lazy(() => import('./pages/Setting'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const CandidateDashboard = lazy(() => import('./pages/Candidate/CandidateDashboard'));
const ResumeChecker = lazy(() => import('./pages/Candidate/ResumeChecker'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        color: '#4361ee',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.95rem',
        fontWeight: 500,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(67, 97, 238, 0.15)',
            borderTopColor: '#4361ee',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Loading HireIQ...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const hideChatbot =
    path === '/' ||
    path === '' ||
    path.includes('signup') ||
    path.includes('login');

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
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
          element={
            <ProtectedRoute>
              <ResumeChecker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/jobs"
          element={<Navigate to="/candidate/dashboard" replace />}
        />
        <Route
          path="/candidate/applications"
          element={<Navigate to="/candidate/dashboard" replace />}
        />
        {/* ATS Resume Checker Route */}
        <Route
          path="/resume-checker"
          element={
            <ProtectedRoute>
              <ResumeChecker />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup.html" element={<Signup />} />

        <Route path="/login" element={<Login />} />
        <Route path="/login.html" element={<Login />} />

        {/* 404 Custom Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
  <CommandPalette />
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
