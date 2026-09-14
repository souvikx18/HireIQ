import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import ResumeUpload from './pages/ResumeUpload';
import Candidates from './pages/Candidates';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import JobRole from './pages/JobRole';
import Report from './pages/Report';
import Setting from './pages/Setting';
import Signup from './pages/Signup';
import Upgrade from './pages/Upgrade';
import AIChatbot from './components/AIChatbot';

export default function App() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const hideChatbot = path.includes('signup') || path.includes('upgrade');
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/index.html" element={<Index />} />

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

        <Route path="/signup" element={<Signup />} />
        <Route path="/signup.html" element={<Signup />} />

        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/upgrade.html" element={<Upgrade />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideChatbot && <AIChatbot />}
    </>
  );
}
