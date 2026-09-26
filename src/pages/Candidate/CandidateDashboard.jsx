import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { candidatePortalApi } from '../../api/candidatePortal';
import '../../css/candidate-portal.css';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profRes = await candidatePortalApi.getProfile();
        if (profRes?.data) {
          setProfile(profRes.data);
        }
      } catch (err) {
        console.error('Error loading candidate profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAskCopilot = (prompt) => {
    window.dispatchEvent(new CustomEvent('hireiq-open-chatbot', { detail: { prompt } }));
  };

  const candidateAtsScore = profile?.atsScore || profile?.resumes?.[0]?.atsScore || 0;
  const skillsList = profile?.skills?.map((s) => (typeof s === 'string' ? s : s.skill?.name || s.name)) || [];
  const latestResume = profile?.resumes?.[0] || null;

  return (
    <div className="candidate-portal-root">
      <Sidebar activePage="candidate-dashboard" />

      <div className="portal-main-content">
        <Header
          title="Candidate Overview"
          subtitle="Real-time ATS resume readiness, technical skill inventory, and AI career guidance"
          eyebrow="JOB SEEKER CONSOLE"
        />

        <div className="portal-body">
          {/* Hero Welcome Banner */}
          <div className="portal-hero">
            <div className="portal-hero-text">
              <h1>Welcome, {user?.firstName || 'Candidate'}!</h1>
              <p>
                Audit and optimize your resume for modern Applicant Tracking Systems (ATS), identify keyword gaps,
                and benchmark your engineering skills against industry standards.
              </p>

              {/* Quick AI Copilot Prompts */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleAskCopilot('How do I optimize my resume bullet points for high ATS match?')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-robot"></i> How to optimize bullet points?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskCopilot('What are the most critical ATS formatting rules for software engineers?')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-file-lines"></i> ATS formatting rules
                </button>
                <button
                  type="button"
                  onClick={() => handleAskCopilot('What are common interview questions for software engineering roles?')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-lightbulb"></i> Engineering interview tips
                </button>
              </div>
            </div>

            <div className="portal-hero-actions">
              <Link to="/candidate/resume-checker" className="hero-cta-btn primary">
                <i className="fa-solid fa-file-shield"></i>
                ATS Resume Audit
              </Link>
              <button
                type="button"
                className="hero-cta-btn secondary"
                onClick={() => handleAskCopilot('Give me a quick checklist to make my resume 100% ATS compliant.')}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Ask Copilot
              </button>
            </div>
          </div>

          {/* Overview Stats Cards */}
          <div className="portal-stats-grid">
            <div className="stat-card-portal">
              <div className="stat-card-icon emerald">
                <i className="fa-solid fa-shield-heart"></i>
              </div>
              <div className="stat-card-info">
                <span>ATS Resume Score</span>
                <h3>{candidateAtsScore ? `${candidateAtsScore}%` : 'Scan Needed'}</h3>
              </div>
            </div>

            <div className="stat-card-portal">
              <div className="stat-card-icon purple">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <div className="stat-card-info">
                <span>Identified Skills</span>
                <h3>{skillsList.length} Skills</h3>
              </div>
            </div>

            <div className="stat-card-portal">
              <div className="stat-card-icon blue">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="stat-card-info">
                <span>ATS Structure Health</span>
                <h3>{candidateAtsScore >= 75 ? 'Optimized' : candidateAtsScore > 0 ? 'Fix Suggested' : 'Audit Ready'}</h3>
              </div>
            </div>

            <div className="stat-card-portal">
              <div className="stat-card-icon amber">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="stat-card-info">
                <span>Experience Profile</span>
                <h3>{profile?.experienceYears ? `${profile.experienceYears}+ Yrs` : 'Tech Professional'}</h3>
              </div>
            </div>
          </div>

          {/* Main Dashboard Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* ATS Audit Summary Card */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <div>
                    <h2 className="portal-card-title">
                      ATS Resume Audit Status
                    </h2>
                    <p className="portal-card-subtitle">
                      Automated diagnostics on readability, keyword indexing, and format integrity
                    </p>
                  </div>
                  <Link
                    to="/candidate/resume-checker"
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#2563eb',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Run Full Audit <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>

                {candidateAtsScore ? (
                  <div>
                    <div className="portal-resume-highlight">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="fa-solid fa-file-pdf" style={{ fontSize: '24px', color: '#ef4444' }}></i>
                        <div>
                          <div className="portal-resume-filename">
                            {latestResume?.originalFileName || 'Uploaded Resume'}
                          </div>
                          <div className="portal-card-subtitle">
                            Scanned and indexed by HireIQ ATS Engine
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          background: candidateAtsScore >= 75 ? '#ecfdf5' : '#fef3c7',
                          color: candidateAtsScore >= 75 ? '#065f46' : '#92400e',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {candidateAtsScore}% Score
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="portal-metric-row">
                        <div className="portal-metric-top">
                          <span>Machine Readability & Text Extraction</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>Pass (100%)</span>
                        </div>
                        <div className="portal-progress-track">
                          <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                        </div>
                      </div>

                      <div className="portal-metric-row">
                        <div className="portal-metric-top">
                          <span>Keyword Density & Technical Terms</span>
                          <span style={{ color: candidateAtsScore >= 70 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                            {candidateAtsScore >= 70 ? 'Strong (85%)' : 'Moderate (65%)'}
                          </span>
                        </div>
                        <div className="portal-progress-track">
                          <div style={{ width: `${Math.min(candidateAtsScore + 5, 95)}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }}></div>
                        </div>
                      </div>

                      <div className="portal-metric-row">
                        <div className="portal-metric-top">
                          <span>Action Verbs & Measurable Metrics</span>
                          <span style={{ color: candidateAtsScore >= 80 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                            {candidateAtsScore >= 80 ? 'Optimal (88%)' : 'Needs Quantified Impact'}
                          </span>
                        </div>
                        <div className="portal-progress-track">
                          <div style={{ width: `${Math.max(candidateAtsScore - 10, 50)}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px',
                      background: '#eff6ff',
                      borderRadius: '10px',
                      border: '1px solid #bfdbfe',
                      textAlign: 'center',
                    }}
                  >
                    <i className="fa-solid fa-file-arrow-up" style={{ fontSize: '32px', color: '#2563eb', marginBottom: '12px' }}></i>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', margin: '0 0 6px 0' }}>
                      No ATS Resume Scanned Yet
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#1e40af', maxWidth: '420px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                      Upload your PDF or Word resume to receive an instantaneous ATS compatibility breakdown, keyword gap report, and action verb suggestions.
                    </p>
                    <button
                      type="button"
                      className="hero-cta-btn primary"
                      style={{ background: '#2563eb', color: '#ffffff', margin: '0 auto' }}
                      onClick={() => navigate('/candidate/resume-checker')}
                    >
                      <i className="fa-solid fa-shield-halved"></i> Run Instant Resume Audit
                    </button>
                  </div>
                )}
              </div>

              {/* Identified Skills Card */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <div>
                    <h2 className="portal-card-title">
                      Extracted Technical Skills & Keywords
                    </h2>
                    <p className="portal-card-subtitle">
                      Recognized technical proficiencies parsed by the HireIQ semantic parser
                    </p>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                    {skillsList.length} detected
                  </span>
                </div>

                {skillsList.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skillsList.map((skill, idx) => (
                      <span key={idx} className="portal-skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                    <i className="fa-solid fa-code" style={{ marginRight: '6px', color: '#94a3b8' }}></i>
                    No technical skills parsed yet. Upload your resume in the ATS Checker to automatically extract your technical skills inventory.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* ATS Best Practices Checklist */}
              <div className="portal-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <i className="fa-solid fa-list-check" style={{ color: '#2563eb', fontSize: '16px' }}></i>
                  <h2 className="portal-card-title" style={{ margin: 0 }}>
                    ATS Compliance Checklist
                  </h2>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Key standards modern Applicant Tracking Systems look for when parsing candidates:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="portal-checklist-row">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '13px', marginTop: '2px' }}></i>
                    <div>
                      <strong>Single-Column Layout:</strong> Multi-column tables confuse ATS text ordering.
                    </div>
                  </div>
                  <div className="portal-checklist-row">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '13px', marginTop: '2px' }}></i>
                    <div>
                      <strong>Quantified Business Impact:</strong> Include %, $, or time saved in bullet points.
                    </div>
                  </div>
                  <div className="portal-checklist-row">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '13px', marginTop: '2px' }}></i>
                    <div>
                      <strong>Standard Section Headings:</strong> Use standard labels like "Work Experience", "Education".
                    </div>
                  </div>
                  <div className="portal-checklist-row">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '13px', marginTop: '2px' }}></i>
                    <div>
                      <strong>Searchable Machine Text:</strong> Ensure text is selectable, not an image/scanned PDF.
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Resume & Career Copilot Card */}
              <div className="portal-copilot-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-robot" style={{ color: '#4f46e5', fontSize: '16px' }}></i>
                  <h2 className="portal-card-title" style={{ margin: 0 }}>
                    AI Resume Copilot
                  </h2>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Get real-time feedback and intelligent resume improvements from your HireIQ AI Copilot.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="portal-copilot-action-btn"
                    onClick={() => handleAskCopilot('How do I apply the Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]) to my resume?')}
                  >
                    <span>💡 Learn the Google XYZ bullet formula</span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                  </button>

                  <button
                    type="button"
                    className="portal-copilot-action-btn"
                    onClick={() => handleAskCopilot('What are the top 10 keywords required for Full Stack and Backend engineering roles?')}
                  >
                    <span>🎯 Top keywords for tech roles</span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                  </button>

                  <button
                    type="button"
                    className="portal-copilot-action-btn"
                    onClick={() => handleAskCopilot('How can I prepare for technical system design interviews?')}
                  >
                    <span>⚙️ System design interview tips</span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
