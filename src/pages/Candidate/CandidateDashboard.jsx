import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { candidatePortalApi } from '../../api/candidatePortal';
import { Skeleton } from '../../components/common/Skeleton';
import '../../css/candidate-portal.css';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'CANDIDATE') {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

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
          {/* Executive Hero Banner */}
          <div className="portal-hero">
            <div className="portal-hero-text">
              <div className="portal-hero-badge">
                <span className="pulse-dot"></span>
                <span>Job Seeker ATS Readiness Console</span>
              </div>
              <h1>Welcome back, {user?.firstName || 'Candidate'}!</h1>
              <p>
                Track live diagnostics on your resume's machine readability, keyword indexing, and role alignment.
              </p>
            </div>

            <div className="portal-hero-actions">
              <Link to="/candidate/resume-checker" className="hero-cta-btn primary">
                <i className="fa-solid fa-file-shield"></i>
                <span>ATS Resume Audit</span>
              </Link>
              <button
                type="button"
                className="hero-cta-btn secondary"
                onClick={() => handleAskCopilot('Give me a quick checklist to make my resume 100% ATS compliant.')}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Ask Copilot</span>
              </button>
            </div>
          </div>

          {/* Overview Stats Bento Cards */}
          <div className="portal-stats-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skel-card-${i}`} className="hireiq-skeleton-card" style={{ padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <Skeleton width="48px" height="48px" borderRadius="12px" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <Skeleton width="90px" height="12px" />
                    <Skeleton width="110px" height="22px" />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="stat-card-portal hireiq-glass-card gpu-card">
                  <div className="stat-card-icon emerald">
                    <i className="fa-solid fa-shield-heart"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">ATS Resume Score</span>
                    <h3 className="mono-metric">{candidateAtsScore ? `${candidateAtsScore}%` : 'Not Scanned'}</h3>
                    <span className={`stat-card-tag ${candidateAtsScore >= 75 ? 'success' : candidateAtsScore > 0 ? 'warning' : 'neutral'}`}>
                      {candidateAtsScore >= 75 ? 'Optimized' : candidateAtsScore > 0 ? 'Needs Attention' : 'Scan Required'}
                    </span>
                  </div>
                </div>

                <div className="stat-card-portal hireiq-glass-card gpu-card">
                  <div className="stat-card-icon purple">
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">Identified Skills</span>
                    <h3 className="mono-metric">{skillsList.length} Skills</h3>
                    <span className="stat-card-tag neutral">
                      Verified Proficiencies
                    </span>
                  </div>
                </div>

                <div className="stat-card-portal hireiq-glass-card gpu-card">
                  <div className="stat-card-icon blue">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">ATS Structure Health</span>
                    <h3 className="mono-metric">{candidateAtsScore >= 75 ? 'Optimized' : candidateAtsScore > 0 ? 'Fix Suggested' : 'Audit Ready'}</h3>
                    <span className={`stat-card-tag ${candidateAtsScore >= 75 ? 'success' : 'warning'}`}>
                      Machine Layer
                    </span>
                  </div>
                </div>

                <div className="stat-card-portal hireiq-glass-card gpu-card">
                  <div className="stat-card-icon amber">
                    <i className="fa-solid fa-layer-group"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">Experience Profile</span>
                    <h3 className="mono-metric">{profile?.experienceYears ? `${profile.experienceYears}+ Yrs` : 'Tech Professional'}</h3>
                    <span className="stat-card-tag neutral">
                      {profile?.roleApplied || 'Software Engineering'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Dashboard Two-Column Grid */}
          <div className="portal-main-grid">
            {/* Left Column (Primary Diagnostics & Skills) */}
            <div className="portal-grid-col primary">
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
                    className="portal-action-link"
                  >
                    Run Full Audit <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>

                {candidateAtsScore ? (
                  <div>
                    <div className="portal-resume-highlight">
                      <div className="portal-resume-meta">
                        <i className="fa-solid fa-file-pdf resume-type-icon"></i>
                        <div>
                          <div className="portal-resume-filename">
                            {latestResume?.originalFileName || 'Uploaded Resume'}
                          </div>
                          <div className="portal-card-subtitle">
                            Scanned and indexed by HireIQ ATS Engine
                          </div>
                        </div>
                      </div>
                      <div className={`portal-score-pill ${candidateAtsScore >= 75 ? 'high' : 'medium'}`}>
                        {candidateAtsScore}% Score
                      </div>
                    </div>

                    <div className="portal-metrics-stack">
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
                  <div className="portal-empty-audit-card">
                    <i className="fa-solid fa-file-arrow-up empty-audit-icon"></i>
                    <h3>No ATS Resume Scanned Yet</h3>
                    <p>
                      Upload your PDF or Word resume to receive an instantaneous ATS compatibility breakdown and keyword gap report.
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
                  <span className="portal-count-badge">
                    {skillsList.length} detected
                  </span>
                </div>

                {skillsList.length > 0 ? (
                  <div className="portal-skills-wrap">
                    {skillsList.map((skill, idx) => (
                      <span key={idx} className="portal-skill-chip">
                        <i className="fa-solid fa-check" style={{ fontSize: '9px', color: '#10b981', marginRight: '4px' }}></i>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="portal-skills-empty-compact">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fa-solid fa-code" style={{ color: '#94a3b8', fontSize: '14px' }}></i>
                      <span>No technical skills parsed yet. Upload your resume to extract skills.</span>
                    </div>
                    <Link to="/candidate/resume-checker" className="portal-mini-cta">
                      Scan Resume <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Checklist & Copilot) */}
            <div className="portal-grid-col secondary">
              {/* ATS Compliance Checklist */}
              <div className="portal-card">
                <div className="portal-card-header compact">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-list-check" style={{ color: '#2563eb', fontSize: '15px' }}></i>
                    <h2 className="portal-card-title" style={{ margin: 0, fontSize: '14.5px' }}>
                      ATS Compliance Checklist
                    </h2>
                  </div>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Key formatting criteria for modern ATS parsing systems:
                </p>

                <div className="portal-checklist-compact">
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-circle-check check-icon success"></i>
                    <div className="checklist-text">
                      <strong>Single-Column Layout</strong>
                      <span>Linear structure prevents parse errors.</span>
                    </div>
                  </div>
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-circle-check check-icon success"></i>
                    <div className="checklist-text">
                      <strong>Standard Section Headings</strong>
                      <span>Uses conventional labels (Experience, Education).</span>
                    </div>
                  </div>
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-triangle-exclamation check-icon warning"></i>
                    <div className="checklist-text">
                      <strong>Quantified Business Impact</strong>
                      <span>Include %, $, or measurable metrics in bullets.</span>
                    </div>
                  </div>
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-circle-check check-icon success"></i>
                    <div className="checklist-text">
                      <strong>Searchable Machine Text</strong>
                      <span>Ensure selectable text layer (avoid image PDFs).</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Resume & Career Copilot Card */}
              <div className="portal-card copilot-card">
                <div className="portal-card-header compact">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-robot" style={{ color: '#4f46e5', fontSize: '15px' }}></i>
                    <h2 className="portal-card-title" style={{ margin: 0, fontSize: '14.5px' }}>
                      AI Resume Copilot
                    </h2>
                  </div>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Instant AI optimizations for your resume & tech interviews:
                </p>

                <div className="portal-copilot-actions">
                  <button
                    type="button"
                    className="portal-copilot-action-btn"
                    onClick={() => handleAskCopilot('How do I apply the Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]) to my resume?')}
                  >
                    <span>💡 Learn the Google XYZ bullet formula</span>
                    <i className="fa-solid fa-chevron-right arrow-icon"></i>
                  </button>

                  <button
                    type="button"
                    className="portal-copilot-action-btn"
                    onClick={() => handleAskCopilot('What are the top 10 keywords required for Full Stack and Backend engineering roles?')}
                  >
                    <span>🎯 Top keywords for tech roles</span>
                    <i className="fa-solid fa-chevron-right arrow-icon"></i>
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
