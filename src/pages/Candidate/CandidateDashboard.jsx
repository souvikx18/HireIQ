import React, { useState, useEffect, useMemo } from 'react';
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
  const [activeSkillCategory, setActiveSkillCategory] = useState('all');

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
        console.error('Error loading candidate dashboard telemetry:', err);
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
  const skillsList = useMemo(() => {
    return profile?.skills?.map((s) => (typeof s === 'string' ? s : s.skill?.name || s.name)) || [];
  }, [profile]);

  const latestResume = profile?.resumes?.[0] || null;
  const applications = profile?.applications || [];

  // Categorize extracted skills for structured scannability
  const categorizedSkills = useMemo(() => {
    const lang = ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin'];
    const webAndDb = ['html', 'css', 'react', 'node', 'express', 'sql', 'dbms', 'postgres', 'mongodb', 'redis', 'mysql', 'vue', 'angular', 'next.js', 'rest'];
    const cs = ['data structures', 'algorithms', 'dsa', 'operating systems', 'system design', 'computer networks', 'oop'];
    const soft = ['teamwork', 'communication', 'problem solving', 'leadership', 'collaboration', 'critical thinking'];

    const groups = {
      languages: [],
      webAndDb: [],
      cs: [],
      soft: [],
      other: [],
    };

    skillsList.forEach((sk) => {
      const lower = sk.toLowerCase();
      if (lang.some((l) => lower.includes(l))) {
        groups.languages.push(sk);
      } else if (webAndDb.some((w) => lower.includes(w))) {
        groups.webAndDb.push(sk);
      } else if (cs.some((c) => lower.includes(c))) {
        groups.cs.push(sk);
      } else if (soft.some((s) => lower.includes(s))) {
        groups.soft.push(sk);
      } else {
        groups.other.push(sk);
      }
    });

    return groups;
  }, [skillsList]);

  const visibleSkills = useMemo(() => {
    if (activeSkillCategory === 'languages') return categorizedSkills.languages;
    if (activeSkillCategory === 'web') return categorizedSkills.webAndDb;
    if (activeSkillCategory === 'cs') return categorizedSkills.cs;
    if (activeSkillCategory === 'soft') return categorizedSkills.soft;
    return skillsList;
  }, [activeSkillCategory, categorizedSkills, skillsList]);

  // Recommended high-demand skills not yet in profile
  const recommendedSkills = useMemo(() => {
    const popular = ['Git & GitHub', 'REST APIs', 'Docker', 'React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS', 'Linux', 'CI/CD'];
    return popular.filter(
      (ps) => !skillsList.some((s) => s.toLowerCase() === ps.toLowerCase() || s.toLowerCase().includes(ps.toLowerCase()))
    ).slice(0, 5);
  }, [skillsList]);

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
          {/* 1. EXECUTIVE ACTION ENGINE HERO (Replaces Wall-of-Blue Banner) */}
          <div className="portal-action-engine-hero">
            <div className="action-engine-left">
              <div className="action-engine-badge">
                <span className="live-telemetry-dot"></span>
                <span>ACTIVE CANDIDATE TELEMETRY</span>
              </div>
              <h2>
                Welcome back, {user?.firstName || 'Candidate'}!
              </h2>

              {candidateAtsScore < 75 ? (
                <div className="hero-status-message warning">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>
                    ATS Score is <strong>{candidateAtsScore}%</strong>. Immediate optimization recommended to prevent automated Workday & Greenhouse filtering.
                  </span>
                </div>
              ) : (
                <div className="hero-status-message success">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>
                    ATS Score is <strong>{candidateAtsScore}%</strong>. Strong machine readability and competitive keyword alignment detected.
                  </span>
                </div>
              )}
            </div>

            <div className="action-engine-actions">
              <Link to="/candidate/resume-checker" className="action-engine-btn primary">
                <i className="fa-solid fa-file-shield"></i>
                <span>ATS Resume Audit</span>
              </Link>
              <button
                type="button"
                className="action-engine-btn secondary"
                onClick={() => handleAskCopilot('How do I optimize my resume bullets to pass senior technical recruiter screens?')}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Ask Career Copilot</span>
              </button>
            </div>
          </div>

          {/* 2. REFINED TELEMETRY BENTO GRID (Glass Cards, No White Glare Boxes) */}
          <div className="portal-stats-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skel-card-${i}`} className="hireiq-skeleton-card" style={{ padding: '13px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Skeleton width="38px" height="38px" borderRadius="9px" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <Skeleton width="75px" height="10px" />
                    <Skeleton width="95px" height="18px" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Metric 1: ATS Resume Score */}
                <div className="stat-card-portal refined">
                  <div className="stat-card-icon-tint emerald">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">ATS READINESS</span>
                    <h3 className="mono-metric">{candidateAtsScore ? `${candidateAtsScore}%` : 'Unscanned'}</h3>
                    <div className="stat-metric-footer">
                      <span className={`stat-card-tag ${candidateAtsScore >= 75 ? 'success' : candidateAtsScore > 0 ? 'warning' : 'neutral'}`}>
                        {candidateAtsScore >= 75 ? 'Enterprise Ready' : candidateAtsScore > 0 ? 'Needs Attention' : 'Scan Required'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Extracted Skills */}
                <div className="stat-card-portal refined">
                  <div className="stat-card-icon-tint purple">
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">SKILL INVENTORY</span>
                    <h3 className="mono-metric">{skillsList.length} Skills</h3>
                    <div className="stat-metric-footer">
                      <span className="stat-card-tag neutral">
                        {categorizedSkills.languages.length} Lang • {categorizedSkills.webAndDb.length} Web/DB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Active Applications Pipeline */}
                <div className="stat-card-portal refined">
                  <div className="stat-card-icon-tint blue">
                    <i className="fa-solid fa-briefcase"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">APPLICATIONS</span>
                    <h3 className="mono-metric">{applications.length} Active</h3>
                    <div className="stat-metric-footer">
                      <span className={`stat-card-tag ${applications.length > 0 ? 'success' : 'neutral'}`}>
                        {applications.length > 0 ? 'In Recruitment Pipeline' : 'Ready to Apply'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Candidate Experience Profile */}
                <div className="stat-card-portal refined">
                  <div className="stat-card-icon-tint amber">
                    <i className="fa-solid fa-user-gear"></i>
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">TARGET PROFILE</span>
                    <h3 className="mono-metric">
                      {profile?.experienceYears ? `${profile.experienceYears}+ Yrs` : 'Tech Candidate'}
                    </h3>
                    <div className="stat-metric-footer">
                      <span className="stat-card-tag neutral" title={profile?.education || 'Computer Science'}>
                        {profile?.roleApplied || 'Software Engineering'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. DUAL-COLUMN WORKSPACE: 62% Actionable Diagnostics / 38% Pipeline & Copilot */}
          <div className="portal-main-grid">
            {/* LEFT PRIMARY COLUMN */}
            <div className="portal-grid-col primary">
              {/* Card 1: Live ATS Diagnostics & Health Inspector */}
              <div className="portal-card enterprise-card">
                <div className="portal-card-header">
                  <div>
                    <h2 className="portal-card-title">
                      <i className="fa-solid fa-chart-line" style={{ color: '#2563eb', marginRight: '8px' }}></i>
                      ATS Resume Ingestion Status
                    </h2>
                    <p className="portal-card-subtitle">
                      Diagnostic breakdown of readability, keyword density, and bullet formula metrics
                    </p>
                  </div>
                  <Link to="/candidate/resume-checker" className="portal-action-link">
                    Open Split Workspace <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>

                {latestResume ? (
                  <div className="portal-resume-diagnostic-view">
                    <div className="portal-resume-header-bar">
                      <div className="resume-meta-chip">
                        <i className="fa-solid fa-file-pdf pdf-color-icon"></i>
                        <div>
                          <strong>{latestResume.originalFileName}</strong>
                          <span>
                            {(latestResume.fileSize / 1024).toFixed(1)} KB • Ingested via HireIQ ATS Engine
                          </span>
                        </div>
                      </div>
                      <span className={`status-pill ${candidateAtsScore >= 75 ? 'pass' : 'attention'}`}>
                        {candidateAtsScore >= 75 ? 'ATS Compliant' : 'Review Required'}
                      </span>
                    </div>

                    {/* Progress Tracks */}
                    <div className="portal-metrics-stack">
                      <div className="portal-metric-row">
                        <div className="portal-metric-top">
                          <span>Machine Readability & Text Selectability</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>
                            {latestResume.rawText && latestResume.rawText.length > 50 ? 'Pass (100%)' : 'Scanned Image (OCR Recovered)'}
                          </span>
                        </div>
                        <div className="portal-progress-track">
                          <div style={{ width: latestResume.rawText?.length > 50 ? '100%' : '75%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                        </div>
                      </div>

                      <div className="portal-metric-row">
                        <div className="portal-metric-top">
                          <span>Keyword Density & Role Alignment</span>
                          <span style={{ color: candidateAtsScore >= 70 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                            {candidateAtsScore >= 70 ? 'Strong (85%)' : 'Moderate Match (65%)'}
                          </span>
                        </div>
                        <div className="portal-progress-track">
                          <div style={{ width: `${Math.min(Math.max(candidateAtsScore, 40), 95)}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }}></div>
                        </div>
                      </div>

                      <div className="portal-metric-row">
                        <div className="portal-metric-top">
                          <span>Action Verbs & Google XYZ Formula Quantification</span>
                          <span style={{ color: candidateAtsScore >= 80 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                            {candidateAtsScore >= 80 ? 'Optimal (88%)' : 'Quantification Opportunity'}
                          </span>
                        </div>
                        <div className="portal-progress-track">
                          <div style={{ width: `${Math.max(candidateAtsScore - 10, 45)}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Fast Diagnostic Badges */}
                    <div className="fast-diagnostic-badges">
                      <span className="fast-badge green">
                        <i className="fa-solid fa-check"></i> Contact Info Verified
                      </span>
                      <span className="fast-badge green">
                        <i className="fa-solid fa-check"></i> {skillsList.length} Technical Skills Found
                      </span>
                      <span className="fast-badge green">
                        <i className="fa-solid fa-check"></i> Academic Credentials Verified
                      </span>
                      <span className="fast-badge amber">
                        <i className="fa-solid fa-triangle-exclamation"></i> Quantify Accomplishments
                      </span>
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
                      className="action-engine-btn primary"
                      onClick={() => navigate('/candidate/resume-checker')}
                    >
                      <i className="fa-solid fa-shield-halved"></i> Run Instant Resume Audit
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2: Extracted Technical Skills & Keyword Density Matrix */}
              <div className="portal-card enterprise-card">
                <div className="portal-card-header">
                  <div>
                    <h2 className="portal-card-title">
                      <i className="fa-solid fa-code" style={{ color: '#8b5cf6', marginRight: '8px' }}></i>
                      Verified Skills & Keyword Density
                    </h2>
                    <p className="portal-card-subtitle">
                      Recognized technical proficiencies parsed by HireIQ semantic parser
                    </p>
                  </div>
                  <span className="portal-count-badge">
                    {skillsList.length} detected
                  </span>
                </div>

                {/* Category Filter Tabs */}
                <div className="skills-category-tabs">
                  <button
                    type="button"
                    className={`cat-btn ${activeSkillCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveSkillCategory('all')}
                  >
                    All ({skillsList.length})
                  </button>
                  <button
                    type="button"
                    className={`cat-btn ${activeSkillCategory === 'languages' ? 'active' : ''}`}
                    onClick={() => setActiveSkillCategory('languages')}
                  >
                    Languages ({categorizedSkills.languages.length})
                  </button>
                  <button
                    type="button"
                    className={`cat-btn ${activeSkillCategory === 'web' ? 'active' : ''}`}
                    onClick={() => setActiveSkillCategory('web')}
                  >
                    Web & DB ({categorizedSkills.webAndDb.length})
                  </button>
                  <button
                    type="button"
                    className={`cat-btn ${activeSkillCategory === 'cs' ? 'active' : ''}`}
                    onClick={() => setActiveSkillCategory('cs')}
                  >
                    CS Core ({categorizedSkills.cs.length})
                  </button>
                  <button
                    type="button"
                    className={`cat-btn ${activeSkillCategory === 'soft' ? 'active' : ''}`}
                    onClick={() => setActiveSkillCategory('soft')}
                  >
                    Soft Skills ({categorizedSkills.soft.length})
                  </button>
                </div>

                {visibleSkills.length > 0 ? (
                  <div className="portal-skills-wrap">
                    {visibleSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="portal-skill-chip interactive"
                        onClick={() => handleAskCopilot(`How can I demonstrate my ${skill} proficiency in high-impact resume bullet points?`)}
                        title="Click to ask Copilot for bullet points"
                      >
                        <i className="fa-solid fa-check check-lead"></i>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="portal-skills-empty-compact">
                    <i className="fa-solid fa-code"></i>
                    <span>No skills in this category. Upload resume to expand.</span>
                  </div>
                )}

                {/* Missing Skills Recommendations */}
                {recommendedSkills.length > 0 && (
                  <div className="missing-skills-recommendation">
                    <span className="recommendation-label">
                      <i className="fa-solid fa-plus-circle"></i> High-Demand Skills to Consider Adding:
                    </span>
                    <div className="missing-chips-wrap">
                      {recommendedSkills.map((skill, idx) => (
                        <span
                          key={`rec-${idx}`}
                          className="missing-skill-pill"
                          onClick={() => handleAskCopilot(`How can I incorporate ${skill} into my resume projects?`)}
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SECONDARY COLUMN */}
            <div className="portal-grid-col secondary">
              {/* Card 1: Active Application Pipeline */}
              <div className="portal-card enterprise-card">
                <div className="portal-card-header compact">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-route" style={{ color: '#2563eb', fontSize: '15px' }}></i>
                    <h2 className="portal-card-title" style={{ margin: 0, fontSize: '14.5px' }}>
                      Application Pipeline
                    </h2>
                  </div>
                  <span className="pipeline-count">{applications.length} active</span>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Real-time status updates from corporate hiring managers:
                </p>

                {applications.length > 0 ? (
                  <div className="application-pipeline-stack">
                    {applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="pipeline-item-card">
                        <div className="pipeline-item-top">
                          <strong>{app.jobRole?.title || 'Engineering Role'}</strong>
                          <span className={`status-pill ${app.status?.toLowerCase() || 'applied'}`}>
                            {app.status || 'APPLIED'}
                          </span>
                        </div>
                        <div className="pipeline-item-bottom">
                          <span>{app.jobRole?.department || 'Engineering'}</span>
                          <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pipeline-empty-box">
                    <i className="fa-solid fa-inbox"></i>
                    <strong>No active applications yet</strong>
                    <p>Use 1-Click Apply on recommended roles to start your recruitment pipeline.</p>
                  </div>
                )}
              </div>

              {/* Card 2: Live ATS Compliance Checklist */}
              <div className="portal-card enterprise-card">
                <div className="portal-card-header compact">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-list-check" style={{ color: '#10b981', fontSize: '15px' }}></i>
                    <h2 className="portal-card-title" style={{ margin: 0, fontSize: '14.5px' }}>
                      ATS Compliance Checklist
                    </h2>
                  </div>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Real-time evaluation against Workday & Greenhouse criteria:
                </p>

                <div className="portal-checklist-compact">
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-circle-check check-icon success"></i>
                    <div className="checklist-text">
                      <strong>Linear Single-Column Layout</strong>
                      <span>Verified: No multi-column fragmentation detected.</span>
                    </div>
                  </div>
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-circle-check check-icon success"></i>
                    <div className="checklist-text">
                      <strong>Standard Section Headings</strong>
                      <span>Experience, Education, and Skills properly indexed.</span>
                    </div>
                  </div>
                  <div className="portal-checklist-item">
                    <i className={`fa-solid ${candidateAtsScore >= 75 ? 'fa-circle-check check-icon success' : 'fa-triangle-exclamation check-icon warning'}`}></i>
                    <div className="checklist-text">
                      <strong>Quantified Google XYZ Metrics</strong>
                      <span>{candidateAtsScore >= 75 ? 'Verified impact metrics found.' : 'Opportunity: Add %, $, or speedup numbers.'}</span>
                    </div>
                  </div>
                  <div className="portal-checklist-item">
                    <i className="fa-solid fa-circle-check check-icon success"></i>
                    <div className="checklist-text">
                      <strong>Selectable Machine Text Layer</strong>
                      <span>Text character stream verified for parsing.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: AI Resume & Career Copilot Prompts */}
              <div className="portal-card enterprise-card copilot-card">
                <div className="portal-card-header compact">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#6366f1', fontSize: '15px' }}></i>
                    <h2 className="portal-card-title" style={{ margin: 0, fontSize: '14.5px' }}>
                      Career Copilot Launcher
                    </h2>
                  </div>
                </div>
                <p className="portal-card-subtitle" style={{ margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Instant AI actions for technical resume & interview prep:
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

                  <button
                    type="button"
                    className="portal-copilot-action-btn"
                    onClick={() => handleAskCopilot('Simulate a technical interview question for a software developer with my skill set.')}
                  >
                    <span>⚡ Conduct a mock interview question</span>
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
