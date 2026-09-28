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
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'critical' | 'improvements' | 'keywords' | 'passed'
  const [activeSuggestedSkill, setActiveSuggestedSkill] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedTextSuccess, setCopiedTextSuccess] = useState(false);

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

  // Set default formula skill when auditReport loads
  useEffect(() => {
    if (auditReport?.extractedSkills && auditReport.extractedSkills.length > 0) {
      setActiveSuggestedSkill(auditReport.extractedSkills[0]);
    }
  }, [auditReport]);

  const getSkillBulletSuggestion = (skill) => {
    const s = (skill || '').toLowerCase();
    if (s.includes('python')) {
      return 'Engineered automated data processing pipelines and backend APIs with Python, increasing processing throughput by 3.5x and cutting manual reconciliation time by 40%.';
    }
    if (s.includes('java')) {
      return 'Developed modular object-oriented backend microservices using Java, implementing robust error-handling protocols and supporting 10,000+ daily transactions.';
    }
    if (s.includes('html') || s.includes('css')) {
      return 'Constructed responsive, accessible front-end interfaces using HTML5 and CSS3, achieving sub-second load times and 100% cross-device compatibility.';
    }
    if (s.includes('javascript') || s.includes('js')) {
      return 'Engineered interactive client-side web features with modern JavaScript, optimizing DOM tree re-renders and accelerating page interactivity by 35%.';
    }
    if (s.includes('sql') || s.includes('dbms') || s.includes('database') || s.includes('postgres')) {
      return 'Architected normalized relational database schemas and indexed SQL queries in DBMS, reducing average query execution latency from 380ms to 32ms.';
    }
    if (s.includes('data structure') || s.includes('algorithm') || s.includes('dsa')) {
      return 'Implemented high-efficiency data structures and algorithmic workflows, optimizing memory footprint by 28% and decreasing algorithmic execution time from O(N²) to O(N log N).';
    }
    if (s.includes('operating system') || s.includes('os') || s.includes('linux')) {
      return 'Leveraged core operating system concurrency and multithreading primitives to build non-blocking services, achieving zero deadlocks and 99.9% uptime.';
    }
    if (s.includes('react')) {
      return 'Engineered scalable single-page application modules with React and Hooks, reducing state re-render bottlenecks and delivering a 98+ Google Lighthouse performance score.';
    }
    if (s.includes('type') || s.includes('ts')) {
      return 'Migrated legacy codebases to strict TypeScript, eliminating 90%+ runtime type exceptions and strengthening CI build pipeline integrity.';
    }
    if (s.includes('docker') || s.includes('container')) {
      return 'Containerized application environments using Docker and Compose, standardizing local-to-production workflows and reducing developer onboarding time by 45%.';
    }
    if (s.includes('git') || s.includes('github')) {
      return 'Managed collaborative version control workflows via Git and GitHub PR reviews, ensuring clean commit trees and reducing merge conflict incidents by 60%.';
    }
    if (s.includes('team') || s.includes('communication') || s.includes('problem')) {
      return 'Collaborated in fast-paced cross-functional agile sprints, translating ambiguous technical requirements into production-ready software features delivered ahead of deadline.';
    }
    return `Leveraged ${skill} to engineer resilient production features, collaborating with cross-functional teams and accelerating release velocity by 30%.`;
  };

  const handleCopyBullet = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleCopyRawText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTextSuccess(true);
    setTimeout(() => setCopiedTextSuccess(false), 2000);
  };

  const handleWheelScroll = (e) => {
    const el = e.currentTarget;
    if (el) {
      el.scrollTop += e.deltaY;
      e.stopPropagation();
    }
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

  // Group checks cleanly
  const criticalChecks = useMemo(() => {
    if (!auditReport?.formattingChecks) return [];
    return auditReport.formattingChecks.filter(
      (c) => c.status === 'WARNING' || c.status === 'FAILED'
    );
  }, [auditReport]);

  const improvementChecks = useMemo(() => {
    if (!auditReport?.formattingChecks) return [];
    return auditReport.formattingChecks.filter(
      (c) => c.status === 'REVIEW' || c.status === 'INFO'
    );
  }, [auditReport]);

  const passedChecks = useMemo(() => {
    if (!auditReport?.formattingChecks) return [];
    return auditReport.formattingChecks.filter((c) => c.status === 'PASSED');
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
          <h3>Simulating ATS Parsing & Ingestion...</h3>
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
                <span>Candidate: <strong>{auditReport.candidateName}</strong></span>
                <span className="audit-dot-sep">•</span>
                <span>{auditReport.wordCount} Words Ingested</span>
                <span className="audit-dot-sep">•</span>
                <span>{auditReport.extractedSkills?.length || 0} Skills Detected</span>
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
                    ? 'Pass • Enterprise Ready'
                    : auditReport.atsScore >= 65
                    ? 'Moderate • Optimization Advised'
                    : 'Critical Blocker • High Rejection Risk'}
                </div>
                <p className="audit-verdict-desc">
                  {criticalChecks.length > 0
                    ? `${criticalChecks.length} parsing blockers detected that prevent standard ATS indexing.`
                    : auditReport.atsScore >= 80
                    ? 'Structured text layer verified. Strong keyword alignment and standard formatting.'
                    : `${improvementChecks.length} actionable optimization opportunities identified.`}
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
                  {auditReport.isScannedOrImage ? (
                    <span className="canvas-status-tag warning" title="Scanned or flattened image without native selectable text">
                      <i className="fa-solid fa-triangle-exclamation"></i> Scanned Image (AI OCR Recovered)
                    </span>
                  ) : (
                    <span className="canvas-status-tag success">
                      <i className="fa-solid fa-circle-check"></i> 100% Machine Selectable
                    </span>
                  )}
                </div>
              </div>

              {/* Canvas Body */}
              <div className="audit-canvas-body" onWheel={handleWheelScroll}>
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
                    {auditReport.isScannedOrImage && (
                      <div className="audit-ocr-explainer-banner">
                        <div className="explainer-tag">
                          <i className="fa-solid fa-circle-info"></i>
                          <span>ATS INGESTION EXPLANATION</span>
                        </div>
                        <p>
                          <strong>Why is this here?</strong> Applicant Tracking Systems (Workday, Greenhouse, Taleo) read the document's native character stream. Scanned or image-only PDFs have <em>0 selectable characters</em> and get auto-rejected.
                        </p>
                        <p>
                          HireIQ utilized deep AI OCR to reconstruct your text layer below. To pass real-world ATS filters, re-export your resume directly as a text-based PDF or DOCX.
                        </p>
                      </div>
                    )}

                    <div className="raw-stream-header">
                      <div className="raw-stream-title">
                        <i className="fa-solid fa-terminal" style={{ color: '#38bdf8' }}></i>
                        <span>RAW TEXT STREAM INGESTED BY ATS PARSER</span>
                      </div>
                      <button
                        type="button"
                        className="raw-copy-btn"
                        onClick={() => handleCopyRawText(auditReport.rawText || '')}
                      >
                        <i className={`fa-solid fa-${copiedTextSuccess ? 'check' : 'copy'}`}></i>
                        {copiedTextSuccess ? 'Copied' : 'Copy Raw Stream'}
                      </button>
                    </div>

                    <pre className="raw-stream-code">
                      {auditReport.rawText || 'No text stream available. Document appears to be empty or unparseable.'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Canvas Footer */}
              <div className="audit-canvas-footer">
                <span>{auditReport.fileName}</span>
                <span>{auditReport.wordCount} Words Ingested • {auditReport.extractedSkills?.length || 0} Skills</span>
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
                  <i className="fa-solid fa-list-check"></i>
                  All Overview
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
                  Where to Improve ({improvementChecks.length})
                </button>
                <button
                  type="button"
                  className={`audit-filter-pill keywords ${activeFilter === 'keywords' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('keywords')}
                >
                  <i className="fa-solid fa-bolt"></i>
                  Keywords ({auditReport.extractedSkills?.length || 0})
                </button>
                <button
                  type="button"
                  className={`audit-filter-pill passed ${activeFilter === 'passed' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('passed')}
                >
                  <i className="fa-solid fa-circle-check"></i>
                  Passed Standards ({passedChecks.length})
                </button>
              </div>

              {/* Independent Smooth-Scrollable Diagnostic Column */}
              <div className="audit-inspector-scroll" onWheel={handleWheelScroll}>
                {/* OVERVIEW SUMMARY STRIP (Shown when "All" is active) */}
                {activeFilter === 'all' && (
                  <div className="audit-quick-stats-strip">
                    <div className="quick-stat-box red">
                      <span className="stat-num">{criticalChecks.length}</span>
                      <span className="stat-lbl">Critical Blockers</span>
                    </div>
                    <div className="quick-stat-box amber">
                      <span className="stat-num">{improvementChecks.length}</span>
                      <span className="stat-lbl">Improvements</span>
                    </div>
                    <div className="quick-stat-box emerald">
                      <span className="stat-num">{auditReport.extractedSkills?.length || 0}</span>
                      <span className="stat-lbl">Verified Skills</span>
                    </div>
                    <div className="quick-stat-box blue">
                      <span className="stat-num">{passedChecks.length}</span>
                      <span className="stat-lbl">Standards Passed</span>
                    </div>
                  </div>
                )}

                {/* SECTION 1: "WHAT'S WRONG" (CRITICAL BLOCKERS) */}
                {(activeFilter === 'all' || activeFilter === 'critical') && (
                  <div className="inspector-section-block critical-block">
                    <div className="inspector-section-header">
                      <div className="section-title-wrap">
                        <span className="section-badge red">HIGH REJECTION RISK</span>
                        <h3>Critical Parsing Blockers ("What's Wrong")</h3>
                      </div>
                      <span className="section-count-tag red">{criticalChecks.length} Issues</span>
                    </div>
                    <p className="inspector-section-desc">
                      Critical errors that trigger automated applicant rejection or prevent machine indexing in enterprise databases.
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
                              <strong>Remediation:</strong> {item.name.includes('Text Layer') ? 'Export as native text PDF from Google Docs or Word.' : 'Update this section to follow standard single-column ATS conventions.'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="audit-reassurance-banner">
                        <i className="fa-solid fa-circle-check reassurance-icon"></i>
                        <div>
                          <strong>Zero Critical Blockers Identified</strong>
                          <p>Your resume satisfies all primary ATS baseline rules: machine readable layer, standard headers, and contact info.</p>
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
                      <span className="section-count-tag amber">{improvementChecks.length} Recommendations</span>
                    </div>
                    <p className="inspector-section-desc">
                      Targeted enhancements that lift candidate ranking and increase human recruiter callback rates.
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
                        Replace passive duty descriptions with quantified business impact. Select any verified skill from your resume to generate an enterprise-grade bullet point:
                      </p>

                      <div className="formula-chips-row">
                        {(auditReport.extractedSkills && auditReport.extractedSkills.length > 0
                          ? auditReport.extractedSkills.slice(0, 8)
                          : ['Python', 'Java', 'SQL', 'HTML', 'JavaScript', 'Data Structures']
                        ).map((sk) => (
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

                    {/* Actionable Improvement Checks */}
                    {improvementChecks.length > 0 ? (
                      <div className="diagnostic-cards-stack">
                        {improvementChecks.map((item, idx) => (
                          <div key={`imp-${idx}`} className="audit-diagnostic-card info-card">
                            <div className="diagnostic-card-header">
                              <i className="fa-solid fa-triangle-exclamation card-status-icon amber"></i>
                              <div>
                                <h4>{item.name}</h4>
                                <span className="card-severity-tag amber">Optimization Opportunity</span>
                              </div>
                            </div>
                            <p className="diagnostic-card-detail">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="audit-reassurance-banner">
                        <i className="fa-solid fa-check reassurance-icon"></i>
                        <div>
                          <strong>Content Structure Optimized</strong>
                          <p>No immediate structural weaknesses detected in your work history or impact verbs.</p>
                        </div>
                      </div>
                    )}
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
                    <p className="inspector-section-desc">
                      Applicant Tracking Systems scan for exact keyword tokens to match candidate profiles with job requisitions.
                    </p>

                    {/* Verified Present Skills */}
                    <div className="keywords-group">
                      <span className="keywords-group-label">
                        <i className="fa-solid fa-check" style={{ color: '#10b981', marginRight: '6px' }}></i>
                        Verified Skills Detected on Resume ({auditReport.extractedSkills?.length || 0})
                      </span>
                      {auditReport.extractedSkills && auditReport.extractedSkills.length > 0 ? (
                        <div className="keywords-chip-wrap">
                          {auditReport.extractedSkills.map((skill, idx) => (
                            <span
                              key={`sk-${idx}`}
                              className={`tech-keyword-pill found ${activeSuggestedSkill === skill ? 'active' : ''}`}
                              onClick={() => {
                                setActiveSuggestedSkill(skill);
                                setActiveFilter('improvements');
                              }}
                              title="Click to generate Google XYZ bullet"
                            >
                              <i className="fa-solid fa-check"></i>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>
                          No technical skills detected. Please add a dedicated Skills section.
                        </p>
                      )}
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
                              onClick={() => {
                                setActiveSuggestedSkill(skill);
                                setActiveFilter('improvements');
                              }}
                              title="Click to generate bullet point with this skill"
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

                {/* SECTION 4: PASSED STANDARDS */}
                {(activeFilter === 'all' || activeFilter === 'passed') && (
                  <div className="inspector-section-block passed-block">
                    <div className="inspector-section-header">
                      <div className="section-title-wrap">
                        <span className="section-badge blue">VERIFIED STANDARDS</span>
                        <h3>Passed ATS Criteria</h3>
                      </div>
                      <span className="section-count-tag blue">{passedChecks.length} Verified</span>
                    </div>
                    <p className="inspector-section-desc">
                      Sections and formatting conventions that meet or exceed enterprise ATS recruitment standards.
                    </p>

                    <div className="diagnostic-cards-stack">
                      {passedChecks.map((item, idx) => (
                        <div key={`pass-${idx}`} className="audit-diagnostic-card passed-card">
                          <div className="diagnostic-card-header">
                            <i className="fa-solid fa-circle-check card-status-icon green"></i>
                            <div>
                              <h4>{item.name}</h4>
                              <span className="card-severity-tag green">Meets Enterprise Standard</span>
                            </div>
                          </div>
                          <p className="diagnostic-card-detail">{item.detail}</p>
                        </div>
                      ))}
                    </div>
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
