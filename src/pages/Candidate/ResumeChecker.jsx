import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { candidatePortalApi } from '../../api/candidatePortal';
import '../../css/candidate-portal.css';

export default function ResumeChecker() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('diagnostics'); // 'diagnostics', 'skills', 'optimizer'

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
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <div className="candidate-portal-root">
      <Sidebar activePage="resume-checker" />

      <div className="portal-main-content">
        <Header
          title="ATS Resume Audit & Health Check"
          subtitle="Scan your resume structure, keyword density, and formatting against enterprise ATS standards"
          eyebrow="AI RESUME AUDITOR"
        />

        <div className="portal-body">
          <div className="checker-container">
            {/* Left Column: Upload Box & Guidelines */}
            <div>
              <div className="checker-card" style={{ marginBottom: '24px' }}>
                <div className="checker-card-header">
                  <h2>
                    <i className="fa-solid fa-file-arrow-up" style={{ color: '#2563eb' }}></i>
                    Upload Your Resume
                  </h2>
                  <p>
                    Supports PDF, DOCX, and TXT files up to 10MB. Instant AI structural audit.
                  </p>
                </div>

                <div
                  className={`checker-dropzone ${isDragging ? 'active' : ''}`}
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

                  <div className="dropzone-icon">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>

                  {selectedFile ? (
                    <div>
                      <h4>{selectedFile.name}</h4>
                      <p>{(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace</p>
                    </div>
                  ) : (
                    <div>
                      <h4>Drag & Drop your resume here</h4>
                      <p>Or click to browse from your device</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="browse-files-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isAuditing}
                    >
                      {isAuditing ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                          Auditing Structure...
                        </>
                      ) : (
                        'Browse Files'
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      marginBottom: '16px',
                    }}
                  >
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                    {errorMessage}
                  </div>
                )}

                {/* Audit Tips */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                    <i className="fa-regular fa-lightbulb" style={{ color: '#eab308', marginRight: '6px' }}></i>
                    ATS Scoring Criteria
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                    <li>Clear section headers (Experience, Education, Skills)</li>
                    <li>Quantifiable metrics and strong action verbs</li>
                    <li>Standard single-column, parseable typography</li>
                    <li>Direct contact details (verified email and phone)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Audit Results */}
            <div>
              {isAuditing ? (
                <div
                  className="checker-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    textAlign: 'center',
                  }}
                >
                  <i className="fa-solid fa-brain fa-fade" style={{ fontSize: '48px', color: '#2563eb', marginBottom: '16px' }}></i>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>Analyzing Resume Structure...</h3>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', maxWidth: '360px' }}>
                    Evaluating formatting headers, bullet point action verbs, and keyword density.
                  </p>
                </div>
              ) : auditReport ? (
                <div className="checker-card">
                  <div className="checker-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2>
                        <i className="fa-solid fa-square-poll-vertical" style={{ color: '#10b981' }}></i>
                        ATS Audit Results
                      </h2>
                      <p>Report generated for {auditReport.candidateName}</p>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onClick={() => window.print()}
                      title="Print or Save PDF"
                    >
                      <i className="fa-solid fa-print"></i>
                      Print / Save
                    </button>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="score-badge-box">
                    <div className="score-badge-circle" style={{ background: getScoreColor(auditReport.atsScore) }}>
                      <span className="num">{auditReport.atsScore}%</span>
                      <span className="sub">ATS Score</span>
                    </div>
                    <div className="score-badge-desc">
                      <h4>
                        {auditReport.atsScore >= 85
                          ? 'Excellent ATS Compatibility'
                          : auditReport.atsScore >= 70
                          ? 'Good Foundation with Optimization Areas'
                          : 'Action Needed: Formatting Gaps Detected'}
                      </h4>
                      <p>
                        Your resume contains {auditReport.wordCount} words and meets key structural ATS benchmarks.
                      </p>
                    </div>
                  </div>

                  {/* Navigation Tabs for Audit Details */}
                  <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '18px' }}>
                    <button
                      type="button"
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeReportTab === 'diagnostics' ? '#2563eb' : '#f1f5f9',
                        color: activeReportTab === 'diagnostics' ? '#ffffff' : '#475569',
                      }}
                      onClick={() => setActiveReportTab('diagnostics')}
                    >
                      <i className="fa-solid fa-list-check" style={{ marginRight: '6px' }}></i>
                      Diagnostics ({auditReport.formattingChecks?.length || 0})
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeReportTab === 'skills' ? '#2563eb' : '#f1f5f9',
                        color: activeReportTab === 'skills' ? '#ffffff' : '#475569',
                      }}
                      onClick={() => setActiveReportTab('skills')}
                    >
                      <i className="fa-solid fa-bolt" style={{ marginRight: '6px' }}></i>
                      Skills & Gaps
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeReportTab === 'optimizer' ? '#2563eb' : '#f1f5f9',
                        color: activeReportTab === 'optimizer' ? '#ffffff' : '#475569',
                      }}
                      onClick={() => setActiveReportTab('optimizer')}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '6px' }}></i>
                      Bullet Optimizer
                    </button>
                  </div>

                  {/* TAB 1: Structural Diagnostic Checks */}
                  {activeReportTab === 'diagnostics' && (
                    <div className="diagnostics-list">
                      {auditReport.formattingChecks?.map((check, idx) => (
                        <div key={idx} className="diagnostic-item">
                          <i
                            className={`diag-icon ${check.status} ${
                              check.status === 'PASSED'
                                ? 'fa-solid fa-circle-check'
                                : check.status === 'WARNING'
                                ? 'fa-solid fa-triangle-exclamation'
                                : 'fa-solid fa-circle-info'
                            }`}
                          ></i>
                          <div className="diag-content">
                            <strong>{check.name}</strong>
                            <span>{check.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: Extracted Skills & Missing High Demand Skills */}
                  {activeReportTab === 'skills' && (
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 10px 0', color: '#1e293b' }}>
                        Identified Competencies ({auditReport.extractedSkills?.length || 0})
                      </h4>
                      <div className="skills-tags-wrap">
                        {auditReport.extractedSkills?.map((skill, idx) => (
                          <span key={idx} className="skill-tag-pill found">
                            <i className="fa-solid fa-check"></i>
                            {skill}
                          </span>
                        ))}
                      </div>

                      {auditReport.missingRecommendations?.length > 0 && (
                        <div style={{ marginTop: '18px' }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 8px 0', color: '#b91c1c' }}>
                            Recommended High-Demand Tech to Add:
                          </h4>
                          <div className="skills-tags-wrap">
                            {auditReport.missingRecommendations.map((skill, idx) => (
                              <span key={idx} className="skill-tag-pill missing">
                                <i className="fa-solid fa-plus"></i>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Bullet Point Optimizer Examples */}
                  {activeReportTab === 'optimizer' && (
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 10px 0', color: '#1e293b' }}>
                        Action Verbs & Impact Formula
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                        Enterprise recruiters look for quantifiable metrics. Replace generic tasks with measurable achievements.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                          <div style={{ fontSize: '12px', color: '#ef4444', textDecoration: 'line-through', marginBottom: '4px' }}>
                            ❌ "Worked on building React frontend interfaces."
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
                            ✔ "Architected 14+ reusable React component modules, decreasing page render latency by 32%."
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                          <div style={{ fontSize: '12px', color: '#ef4444', textDecoration: 'line-through', marginBottom: '4px' }}>
                            ❌ "Responsible for writing tests."
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
                            ✔ "Implemented automated test pipeline with Vitest & Playwright, expanding test coverage to 94%."
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA to Explore Jobs */}
                  <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      className="hero-cta-btn primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => navigate('/candidate/jobs')}
                    >
                      <i className="fa-solid fa-briefcase"></i>
                      Match Against Open Jobs
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="checker-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  <i className="fa-regular fa-file-lines" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>No Resume Uploaded Yet</h3>
                  <p style={{ margin: 0, fontSize: '13.5px', maxWidth: '340px' }}>
                    Upload your resume (PDF, DOCX, or TXT) on the left to test instant AI ATS scoring and keyword analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
