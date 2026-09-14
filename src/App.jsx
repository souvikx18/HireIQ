import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import AIChatbot from './components/AIChatbot';

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
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
        {/* When project starts/opens, first enters Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Index />} />
        <Route path="/dashboard.html" element={<Index />} />
        <Route path="/index.html" element={<Index />} />

        {/* Authenticated Internal Navigation Routes */}
        <Route path="/resumeupload" element={<ResumeUpload />} />
        <Route path="/resumeupload.html" element={<ResumeUpload />} />

        <Route path="/candidates" element={<Candidates />} />
        <Route path="/Candidates.html" element={<Candidates />} />
        <Route path="/candidates.html" element={<Candidates />} />

        <Route path="/skillgapanalysis" element={<SkillGapAnalysis />} />
        <Route path="/skillgapanalysis.html" element={<SkillGapAnalysis />} />

        <Route path="/jobrole" element={<JobRole />} />
        <Route path="/jobrole.html" element={<JobRole />} />

        <Route path="/report" element={<Report />} />
        <Route path="/report.html" element={<Report />} />

        <Route path="/setting" element={<Setting />} />
        <Route path="/setting.html" element={<Setting />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/settings.html" element={<Setting />} />

        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/upgrade.html" element={<Upgrade />} />

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
              <Navigate to="/dashboard" replace />
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

