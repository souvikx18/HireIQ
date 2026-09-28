import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { candidatePortalApi } from '../../api/candidatePortal';
import logo from '../../assets/img/hireiq-logo.png';
import '../../css/candidate-portal.css';

export default function ResumeChecker() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Split-View Workspace state
  const [activeViewerTab, setActiveViewerTab] = useState('preview'); // 'preview' | 'parsed_text'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'critical' | 'improvements' | 'keywords'
  const [activeSuggestedSkill, setActiveSuggestedSkill] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Managed blob URL for PDF/Document iframe preview
  const fileUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const getSkillBulletSuggestion = (skill) => {
    const s = (skill || '').toLowerCase();
    if (s.includes('docker') || s.includes('container')) {
      return 'Containerized multi-service microarchitecture using Docker and Compose, standardizing environments and accelerating onboarding time by 35%.';
    }
    if (s.includes('kuber') || s.includes('k8s')) {
      return 'Orchestrated zero-downtime rolling deployments across Kubernetes clusters, enhancing service resilience to 99.98% uptime.';
    }
    if (s.includes('aws') || s.includes('cloud')) {
      return 'Architected scalable cloud infrastructure utilizing AWS ECS, S3, and CloudFront, reducing monthly infrastructure compute expenses by 24%.';
    }
    if (s.includes('type') || s.includes('ts')) {
      return 'Refactored mission-critical legacy modules into strict TypeScript, eradicating runtime type exceptions and improving CI build reliability.';
    }
    if (s.includes('react') || s.includes('frontend')) {
      return 'Engineered responsive single-page web applications with React, leveraging memoization and virtualized lists to achieve sub-second render times.';
    }
    if (s.includes('sql') || s.includes('postgres') || s.includes('database')) {
      return 'Optimized complex PostgreSQL queries, indexed relational datasets, and reduced average P99 database query response latency from 450ms to 42ms.';
    }
    if (s.includes('redis') || s.includes('cache')) {
      return 'Implemented distributed Redis caching layers for high-throughput API endpoints, lowering backend database load by 60%.';
    }
    if (s.includes('python')) {
      return 'Engineered asynchronous data processing pipelines with Python and FastAPI, increasing throughput by 4x and reducing server memory footprint.';
    }
    return `Leveraged ${skill} to engineer resilient production features, collaborating with cross-functional teams and accelerating release velocity by 30%.`;
  };

  const handleCopyBullet = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setErrorMessage('');
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    const isDoc = file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc') || file.name.endsWith('.txt');

    if (!validTypes.includes(file.type) && !isDoc) {
      setErrorMessage('Please upload a valid PDF, DOCX, or TXT resume document.');
      return;
    }

    setSelectedFile(file);
    setIsAuditing(true);

    try {
      const res = await candidatePortalApi.auditResume(file);
      if (res?.data) {
        setAuditReport(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAuditing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  };

  // Group checks into Critical Blockers vs. Actionable Improvements
  const criticalChecks = useMemo(() => {
    if (!auditReport?.formattingChecks) return [];
    return auditReport.formattingChecks.filter(
      (c) => c.status === 'WARNING' || c.status === 'FAILED'
    );
  }, [auditReport]);

  const improvementChecks = useMemo(() => {
    if (!auditReport?.formattingChecks) return [];
    return auditReport.formattingChecks.filter(
      (c) => c.status === 'REVIEW' || c.status === 'INFO' || c.status === 'PASSED'
    );
  }, [auditReport]);

  const checkerContent = (
    <div className="audit-executive-wrapper">
      {/* 1. IDLE STATE: Centered Diagnostic Dropzone */}
      {!auditReport && !isAuditing && (
        <div className="audit-idle-container">
          <div className="audit-idle-card">
            <div className="audit-idle-header">
              <span className="audit-console-badge">
                <i className="fa-solid fa-shield-halved"></i>
                ENTERPRISE ATS DIAGNOSTIC ENGINE
              </span>
              <h2>Simulate Enterprise ATS Ingestion</h2>
              <p>
                Analyze machine text extraction, identify unparseable formatting blockers, and benchmark your engineering resume against Workday, Greenhouse, and Lever criteria.
              </p>
            </div>

            <div
              className={`audit-dropzone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInputChange}
              />

              <div className="audit-dropzone-icon">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>

              <h3>Drag & Drop your resume here</h3>
              <p>Supports standard PDF, Word (.docx), and Plain Text (.txt) up to 10MB</p>

              <button
                type="button"
                className="audit-browse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <i className="fa-solid fa-folder-open" style={{ marginRight: '6px' }}></i>
                Select Document
              </button>

              <div className="audit-security-row">
                <span><i className="fa-solid fa-lock"></i> AES-256 Encrypted</span>
                <span><i className="fa-solid fa-eye-slash"></i> PII Masked & Private</span>
                <span><i className="fa-solid fa-bolt"></i> Instant Structural Scan</span>
              </div>
            </div>

            {errorMessage && (
              <div className="audit-error-banner">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Criteria checklist */}
            <div className="audit-criteria-grid">
              <div className="audit-criteria-item">
                <i className="fa-solid fa-check"></i>
                <div>
                  <strong>Linear Single-Column</strong>
                  <span>Prevents text fragmentation across ATS parsers</span>
                </div>
              </div>
              <div className="audit-criteria-item">
                <i className="fa-solid fa-check"></i>
                <div>
                  <strong>Quantified Google XYZ Formula</strong>
                  <span>Measurable metrics demonstrate clear ROI</span>
                </div>
              </div>
              <div className="audit-criteria-item">
                <i className="fa-solid fa-check"></i>
                <div>
                  <strong>Selectable Machine Layer</strong>
                  <span>Direct text streams ensure high indexing confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {isAuditing && (
        <div className="audit-loading-card">
          <div className="audit-spinner-outer">
            <div className="audit-spinner-inner"></div>
            <i className="fa-solid fa-brain audit-pulse-icon"></i>
          </div>
          <h3>Simulating ATS Parsing & Health Check...</h3>
          <p>Extracting text layers, checking keyword alignment, and auditing bullet formulas against enterprise hiring standards.</p>
        </div>
      )}

      {/* 3. AUDITED STATE: Executive Split-View Workspace */}
      {auditReport && !isAuditing && (
        <div className="audit-workspace-container">
          {/* Executive Header Bar / Score Anchor */}
          <div className="audit-hero-anchor">
            <div className="audit-file-meta-col">
              <div className="audit-file-tag">
                <i className="fa-solid fa-file-pdf"></i>
                <span className="audit-file-name">{auditReport.fileName || selectedFile?.name || 'Resume.pdf'}</span>
                <span className="audit-file-size">
                  {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '142 KB'}
                </span>
              </div>
              <div className="audit-profile-target">
                <span>Profile: <strong>{auditReport.candidateName}</strong></span>
                <span className="audit-dot-sep">•</span>
                <span>{auditReport.wordCount} Words Ingested</span>
                <span className="audit-dot-sep">•</span>
                <span className="audit-engine-badge">ATS Engine v2.4</span>
              </div>
            </div>

            {/* Score Ring Visual Anchor */}
            <div className="audit-score-anchor">
              <div className="score-ring-wrap">
                <svg viewBox="0 0 100 100" className="score-ring-svg">
                  <circle cx="50" cy="50" r="42" className="score-ring-track" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="score-ring-fill"
                    style={{
                      stroke: getScoreColor(auditReport.atsScore),
                      strokeDashoffset: 264 - (264 * Math.min(100, Math.max(0, auditReport.atsScore))) / 100,
                    }}
                  />
                </svg>
                <div className="score-ring-label">
                  <span className="score-ring-val" style={{ color: getScoreColor(auditReport.atsScore) }}>
                    {auditReport.atsScore}%
                  </span>
                  <span className="score-ring-sub">ATS SCORE</span>
                </div>
              </div>

              <div className="audit-score-summary">
                <div className={`audit-verdict-pill ${auditReport.atsScore >= 80 ? 'pass' : auditReport.atsScore >= 65 ? 'warning' : 'critical'}`}>
                  <span className="verdict-dot"></span>
                  {auditReport.atsScore >= 80
                    ? 'Pass • Highly Compatible'
                    : auditReport.atsScore >= 65
                    ? 'Moderate Risk • Optimization Advised'
                    : 'Critical Blocker • High Rejection Risk'}
                </div>
                <p className="audit-verdict-desc">
                  {auditReport.wordCount < 15
                    ? 'Document lacks selectable machine text layer. Export as text PDF or Word DOCX.'
                    : auditReport.atsScore >= 80
                    ? 'Structured text layer verified. Strong keyword alignment and standard formatting.'
                    : `${criticalChecks.length} formatting blockers detected that risk automated rejection.`}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="audit-hero-actions">
              <button
                type="button"
                className="audit-action-btn secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-arrow-up-from-bracket"></i>
                <span>Replace Document</span>
              </button>
              <button
                type="button"
                className="audit-action-btn primary"
                onClick={() => window.print()}
              >
                <i className="fa-solid fa-print"></i>
                <span>Export Report</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInputChange}
              />
            </div>
          </div>

          {/* DUAL-PANE SPLIT-VIEW WORKSPACE */}
          <div className="audit-split-workspace">
            {/* LEFT PANE: Document & Machine Text Layer (45%) */}
            <div className="audit-canvas-pane">
              <div className="audit-pane-header">
                <div className="audit-segmented-tabs">
                  <button
                    type="button"
                    className={`audit-segment-btn ${activeViewerTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveViewerTab('preview')}
                  >
                    <i className="fa-regular fa-file-pdf"></i>
                    <span>Document View</span>
                  </button>
                  <button
                    type="button"
                    className={`audit-segment-btn ${activeViewerTab === 'parsed_text' ? 'active' : ''}`}
                    onClick={() => setActiveViewerTab('parsed_text')}
                  >
                    <i className="fa-solid fa-code"></i>
                    <span>ATS Parsed Text Layer</span>
                  </button>
                </div>

                <div className="audit-canvas-meta">
                  <span className="canvas-status-tag">
                    {auditReport.wordCount < 15 ? '⚠️ Image Layer' : '✅ 100% Machine Selectable'}
                  </span>
                </div>
              </div>

              {/* Canvas Body */}
              <div className="audit-canvas-body">
                {activeViewerTab === 'preview' ? (
                  fileUrl && selectedFile?.name?.endsWith('.pdf') ? (
                    <iframe
                      src={fileUrl}
                      className="audit-pdf-iframe"
                      title="Resume Document Preview"
                    />
                  ) : (
                    <div className="audit-text-document-view">
                      <div className="audit-doc-page-header">
                        <h4>{auditReport.fileName || selectedFile?.name}</h4>
                        <span>{auditReport.wordCount} words detected</span>
                      </div>
                      <div className="audit-doc-content-stream">
                        {auditReport.rawText ? (
                          <pre>{auditReport.rawText}</pre>
                        ) : (
                          <p style={{ color: '#94a3b8' }}>Document text preview unavailable. Switch to ATS Parsed Text Layer.</p>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="audit-raw-stream-view">
                    <div className="raw-stream-header">
                      <i className="fa-solid fa-terminal" style={{ marginRight: '6px', color: '#38bdf8' }}></i>
                      <span>Raw Text Ingestion Stream (Exact ATS Parser Output)</span>
                    </div>
                    <pre className="raw-stream-code">
                      {auditReport.rawText || 'No raw text stream available for this file format.'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Canvas Footer */}
              <div className="audit-canvas-footer">
                <span>{auditReport.fileName}</span>
                <span>{auditReport.wordCount} Words Ingested</span>
              </div>
            </div>

            {/* RIGHT PANE: Diagnostic Inspector (55%) */}
            <div className="audit-inspector-pane">
              {/* Section Filter Pills */}
              <div className="audit-filter-bar">
                <button
                  type="button"
                  className={`audit-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Diagnostics ({auditReport.formattingChecks?.length || 0})
                </button>
                <button
                  type="button"
                  className={`audit-filter-pill critical ${activeFilter === 'critical' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('critical')}
                >
                  <i className="fa-solid fa-circle-exclamation"></i>
                  What's Wrong ({criticalChecks.length})
                </button>
                <button
                  type="button"
                  className={`audit-filter-pill improve ${activeFilter === 'improvements' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('improvements')}
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Where to Improve
                </button>
                <button
                  type="button"
                  className={`audit-filter-pill keywords ${activeFilter === 'keywords' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('keywords')}
                >
                  <i className="fa-solid fa-bolt"></i>
                  Keywords ({auditReport.extractedSkills?.length || 0})
                </button>
              </div>

              <div className="audit-inspector-scroll">
                {/* SECTION 1: "WHAT'S WRONG" (CRITICAL BLOCKERS) */}
                {(activeFilter === 'all' || activeFilter === 'critical') && (
                  <div className="inspector-section-block critical-block">
                    <div className="inspector-section-header">
                      <div className="section-title-wrap">
                        <span className="section-badge red">HIGH REJECTION RISK</span>
                        <h3>Critical Parsing Blockers ("What's Wrong")</h3>
                      </div>
                      <span className="section-count-tag red">{criticalChecks.length} Immediate Issues</span>
                    </div>
                    <p className="inspector-section-desc">
                      Issues that trigger automated rejection or prevent text from indexing into enterprise databases.
                    </p>

                    {criticalChecks.length > 0 ? (
                      <div className="diagnostic-cards-stack">
                        {criticalChecks.map((item, idx) => (
                          <div key={`crit-${idx}`} className="audit-diagnostic-card error-card">
                            <div className="diagnostic-card-header">
                              <i className="fa-solid fa-circle-xmark card-status-icon red"></i>
                              <div>
                                <h4>{item.name}</h4>
                                <span className="card-severity-tag red">Blocks Machine Indexing</span>
                              </div>
                            </div>
                            <p className="diagnostic-card-detail">{item.detail}</p>
                            <div className="diagnostic-action-hint">
                              <i className="fa-solid fa-wrench"></i>
                              <strong>Remediation:</strong> Convert to linear single-column structure and verify contact fields.
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="audit-reassurance-banner">
                        <i className="fa-solid fa-circle-check reassurance-icon"></i>
                        <div>
                          <strong>Zero Critical Blockers Identified</strong>
                          <p>Your resume satisfies baseline ATS formatting rules: readable text layer, parseable headers, and contact info.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 2: "WHERE TO IMPROVE" (ACTIONABLE OPTIMIZATION) */}
                {(activeFilter === 'all' || activeFilter === 'improvements') && (
                  <div className="inspector-section-block improve-block">
                    <div className="inspector-section-header">
                      <div className="section-title-wrap">
                        <span className="section-badge amber">IMPACT & FORMULAS</span>
                        <h3>Actionable Optimization ("Where to Improve")</h3>
                      </div>
                      <span className="section-count-tag amber">Formula & Metric Boost</span>
                    </div>
                    <p className="inspector-section-desc">
                      Enhancements that lift candidate ranking and increase human recruiter callback rates.
                    </p>

                    {/* Google XYZ Formula Builder */}
                    <div className="formula-builder-card">
                      <div className="formula-banner">
                        <i className="fa-solid fa-lightbulb formula-icon"></i>
                        <div>
                          <h4>The Google XYZ Bullet Formula</h4>
                          <code>Accomplished [X], as measured by [Y], by doing [Z]</code>
                        </div>
                      </div>

                      <p className="formula-desc">
                        Replace generic duty lists with quantifiable output. Select any skill to generate an enterprise-grade bullet point:
                      </p>

                      <div className="formula-chips-row">
                        {['Docker', 'React', 'SQL', 'TypeScript', 'AWS', 'Python', 'Kubernetes'].map((sk) => (
                          <button
                            key={sk}
                            type="button"
                            className={`formula-skill-chip ${activeSuggestedSkill === sk ? 'active' : ''}`}
                            onClick={() => setActiveSuggestedSkill(sk)}
                          >
                            {sk}
                          </button>
                        ))}
                      </div>

                      {activeSuggestedSkill && (
                        <div className="formula-generated-box">
                          <div className="formula-box-top">
                            <span className="formula-tag">Suggested Optimized Bullet:</span>
                            <button
                              type="button"
                              className="formula-copy-btn"
                              onClick={() => handleCopyBullet(getSkillBulletSuggestion(activeSuggestedSkill))}
                            >
                              <i className={`fa-solid fa-${copiedSuccess ? 'check' : 'copy'}`}></i>
                              {copiedSuccess ? 'Copied to Clipboard!' : 'Copy Formula'}
                            </button>
                          </div>
                          <blockquote className="formula-quote">
                            "{getSkillBulletSuggestion(activeSuggestedSkill)}"
                          </blockquote>
                        </div>
                      )}
                    </div>

                    {/* Additional Formatting Diagnostic Checks */}
                    <div className="diagnostic-cards-stack">
                      {improvementChecks.map((item, idx) => (
                        <div key={`imp-${idx}`} className="audit-diagnostic-card info-card">
                          <div className="diagnostic-card-header">
                            <i className={`fa-solid ${item.status === 'PASSED' ? 'fa-circle-check' : 'fa-circle-info'} card-status-icon ${item.status === 'PASSED' ? 'green' : 'blue'}`}></i>
                            <div>
                              <h4>{item.name}</h4>
                              <span className={`card-severity-tag ${item.status === 'PASSED' ? 'green' : 'blue'}`}>
                                {item.status === 'PASSED' ? 'Meets Enterprise Standard' : 'Enhancement Opportunity'}
                              </span>
                            </div>
                          </div>
                          <p className="diagnostic-card-detail">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: KEYWORD ALIGNMENT MATRIX */}
                {(activeFilter === 'all' || activeFilter === 'keywords') && (
                  <div className="inspector-section-block keywords-block">
                    <div className="inspector-section-header">
                      <div className="section-title-wrap">
                        <span className="section-badge emerald">COMPETENCY INVENTORY</span>
                        <h3>Tech Stack Keyword Density</h3>
                      </div>
                      <span className="section-count-tag emerald">{auditReport.extractedSkills?.length || 0} Identified</span>
                    </div>

                    {/* Verified Present Skills */}
                    <div className="keywords-group">
                      <span className="keywords-group-label">
                        <i className="fa-solid fa-check" style={{ color: '#10b981', marginRight: '6px' }}></i>
                        Verified Skills Detected on Resume ({auditReport.extractedSkills?.length || 0})
                      </span>
                      <div className="keywords-chip-wrap">
                        {auditReport.extractedSkills?.map((skill, idx) => (
                          <span key={`sk-${idx}`} className="tech-keyword-pill found">
                            <i className="fa-solid fa-check"></i>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Target Skills */}
                    {auditReport.missingRecommendations?.length > 0 && (
                      <div className="keywords-group" style={{ marginTop: '16px' }}>
                        <span className="keywords-group-label" style={{ color: '#d97706' }}>
                          <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>
                          Recommended High-Demand Tech to Consider Adding
                        </span>
                        <div className="keywords-chip-wrap">
                          {auditReport.missingRecommendations.map((skill, idx) => (
                            <span
                              key={`miss-${idx}`}
                              className="tech-keyword-pill missing"
                              onClick={() => setActiveSuggestedSkill(skill)}
                              title="Click to generate bullet point"
                            >
                              <i className="fa-solid fa-plus"></i>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="public-checker-wrapper">
        <header className="public-checker-nav">
          <div className="public-checker-nav-inner">
            <Link to="/" className="public-checker-brand">
              <img src={logo} alt="HireIQ" style={{ height: '32px' }} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Hire<span style={{ color: '#2563eb' }}>IQ</span>
              </span>
              <span className="public-free-badge">ENTERPRISE AUDITOR</span>
            </Link>

            <div className="public-nav-right">
              <Link to="/" className="public-nav-link">
                <i className="fa-solid fa-arrow-left"></i> Home
              </Link>
              <Link to="/login" className="public-btn-secondary">
                Log In
              </Link>
              <Link to="/signup" className="public-btn-primary">
                Sign Up Free
              </Link>
            </div>
          </div>
        </header>

        <main className="public-checker-main">
          {checkerContent}
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-portal-root">
      <Sidebar activePage="resume-checker" />

      <div className="portal-main-content">
        <Header
          title="ATS Resume Audit & Health Check"
          subtitle="Real-time document inspection, critical rejection blockers, and quantified bullet enhancements"
          eyebrow="AI RESUME AUDITOR"
        />

        <div className="portal-body">
          {checkerContent}
        </div>
      </div>
    </div>
  );
}
