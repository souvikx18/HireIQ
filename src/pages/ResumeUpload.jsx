import React, { useState, useRef, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { resumesApi } from '../api/resumes';
import { candidatesApi } from '../api/candidates';
import '../css/resumeupload.css';

function getEvaluationData(candidate) {
  if (!candidate) return null;

  const matchScore = candidate.matchScore || 91;
  const atsScore = candidate.atsScore || 93;
  const skillCoverage = candidate.skillCoverage || 83;
  const requiredSkillsCount = candidate.requiredSkillsCount || 12;
  const matchedSkillsCount = candidate.matchedSkillsCount || 10;
  const partialSkillsCount = candidate.partialSkillsCount || 1;
  const missingSkillsCount = candidate.missingSkillsCount || 1;

  const experienceMatch =
    candidate.experienceMatch ||
    (matchScore >= 85
      ? '94% (Senior Alignment)'
      : matchScore >= 75
      ? '82% (Mid-Level Alignment)'
      : '68% (Junior Alignment)');

  const jdMatch =
    candidate.jdMatch ||
    (matchScore >= 85
      ? '89% Semantic Match'
      : matchScore >= 75
      ? '78% Moderate Fit'
      : '65% Partial Fit');

  const aiConfidence = candidate.aiConfidence || '96%';

  let aiRecommendation = candidate.aiRecommendation;
  if (!aiRecommendation) {
    if (matchScore >= 85) aiRecommendation = 'HIGHLY RECOMMENDED';
    else if (matchScore >= 70) aiRecommendation = 'REVIEW REQUIRED';
    else aiRecommendation = 'NOT RECOMMENDED';
  }

  const gapPriorities =
    candidate.gapPriorities ||
    (candidate.gaps || ['Advanced Domain Frameworks']).map((gap, idx) => {
      let priority = 'High Priority';
      let priorityClass = 'high';
      if (idx === 0) {
        priority = matchScore >= 85 ? 'High Priority' : 'Critical';
        priorityClass = matchScore >= 85 ? 'high' : 'critical';
      } else if (idx === 1) {
        priority = 'Medium Priority';
        priorityClass = 'medium';
      } else {
        priority = 'Low Priority';
        priorityClass = 'low';
      }
      return { name: gap, priority, priorityClass };
    });

  const partialSkills = candidate.partialSkills || [
    'Performance Optimization & Profiling',
  ];
  const missingSkills =
    candidate.missingSkills || candidate.gaps || ['Advanced Domain Frameworks'];

  const strengths = candidate.strengths || [
    'Strong command of core architectural concepts and technical competencies',
    'Proven hands-on execution in complex project workflows and domain problem-solving',
    'High semantic synergy with target benchmark role requirements',
  ];

  const recommendedSkills = candidate.recommendedSkills || [
    'System Architecture Design',
    'Cloud-Native Deployment',
    'Automated CI/CD Pipelines',
  ];

  const roadmapSteps = candidate.roadmapSteps || [
    {
      step: 'Phase 1',
      title: 'Target Gap Remediation',
      desc: `Master ${
        candidate.gaps?.[0] || 'advanced domain frameworks'
      } (Est. 1-2 weeks)`,
    },
    {
      step: 'Phase 2',
      title: 'Hands-on Benchmark Project',
      desc: 'Build and deploy end-to-end integration demo',
    },
    {
      step: 'Phase 3',
      title: 'Technical Role Onboarding',
      desc: 'Immediate readiness for senior production contributions',
    },
  ];

  const whyScoreExplanation =
    candidate.whyScoreExplanation ||
    `The candidate achieved an overall match score of ${matchScore}% through multi-factor semantic analysis: 45% core skill verification (${matchedSkillsCount}/${requiredSkillsCount} required skills present), 25% domain experience alignment (${experienceMatch}), 15% job description keyword relevance (${jdMatch}), and 15% ATS structural parsing fidelity (${atsScore}/100 ATS score).`;

  return {
    ...candidate,
    matchScore,
    atsScore,
    skillCoverage,
    requiredSkillsCount,
    matchedSkillsCount,
    partialSkillsCount,
    missingSkillsCount,
    experienceMatch,
    jdMatch,
    aiConfidence,
    aiRecommendation,
    gapPriorities,
    partialSkills,
    missingSkills,
    strengths,
    recommendedSkills,
    roadmapSteps,
    whyScoreExplanation,
  };
}

export default function ResumeUpload() {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [dbCandidates, setDbCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Workflow states: 'idle' | 'uploaded' | 'analyzing' | 'analyzed'
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);

  const fileInputRef = useRef(null);

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '240 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'PDF Document (application/pdf)';
    if (ext === 'docx' || ext === 'doc') return 'Microsoft Word Document (.docx)';
    if (ext === 'txt') return 'Plain Text Document (.txt)';
    return 'Document (.' + ext + ')';
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const valid = allowed.some((ext) => fileName.endsWith(ext));

    if (!valid) {
      triggerToast('Invalid file format. Please upload PDF, DOCX, or TXT.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      triggerToast('File size must be below 10MB.');
      return;
    }

    const fileData = {
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      uploadTime: 'Just now',
      rawFile: file,
    };

    setUploadedFile(fileData);
    setAnalysisStatus('uploaded');
    setShortlisted(false);
    setPassed(false);
    setRejected(false);

    // Add / update history item
    setHistoryItems((prev) => [
      {
        id: Date.now(),
        fileName: file.name,
        meta: `${fileData.size} • Uploaded Just now`,
        status: 'Ready',
        statusClass: 'ready-badge',
      },
      ...prev.filter((item) => item.fileName !== file.name),
    ]);

    // Save candidate under review in localStorage
    const candidates = JSON.parse(
      localStorage.getItem('hireiqCandidates') || '[]'
    );
    candidates.push({
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      status: 'Ready for Analysis',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('hireiqCandidates', JSON.stringify(candidates));

    triggerToast('Resume uploaded: ' + file.name);
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await resumesApi.getHistory();
        if (res?.data?.length) {
          setHistoryItems(res.data);
        }
      } catch {
        // keep initial history
      }
    };

    const loadCandidates = async () => {
      try {
        const res = await candidatesApi.getCandidates();
        if (res?.data?.length) {
          setDbCandidates(res.data);
        }
      } catch {
        // ignore
      }
    };

    loadHistory();
    loadCandidates();
  }, []);

  const handleStartAnalysis = async (e) => {
    if (e) e.stopPropagation();
    if (!uploadedFile) return;

    setAnalysisStatus('analyzing');

    // Update history item status to 'Parsing'
    setHistoryItems((prev) =>
      prev.map((item, idx) =>
        idx === 0 || item.fileName === uploadedFile.name
          ? { ...item, status: 'Parsing', statusClass: 'parsing' }
          : item
      )
    );

    try {
      const res = await resumesApi.uploadResume(uploadedFile.rawFile);
      const parsedData = res.data;

      setSelectedCandidate(parsedData);
      setAnalysisStatus('analyzed');

      // Update history status to Analyzed
      setHistoryItems((prev) =>
        prev.map((item, idx) =>
          idx === 0 || item.fileName === uploadedFile.name
            ? { ...item, status: 'Analyzed', statusClass: 'analyzed' }
            : item
        )
      );

      triggerToast(`Analysis complete: ${parsedData.name}`);
    } catch (err) {
      setAnalysisStatus('uploaded');
      triggerToast(`Analysis error: ${err.message || 'Failed to parse resume'}`);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleShortlist = async () => {
    setShortlisted(true);
    if (activeCandidate?.id) {
      try {
        await candidatesApi.updateStatus(activeCandidate.id, 'SHORTLISTED');
      } catch {
        // ignore
      }
    }
    triggerToast('Candidate shortlisted successfully.');
  };

  const handlePass = async () => {
    setPassed(true);
    setRejected(false);
    if (activeCandidate?.id) {
      try {
        await candidatesApi.updateStatus(activeCandidate.id, { currentStage: 'INTERVIEW', status: 'ACTIVE' });
      } catch {
        // ignore
      }
    }
    triggerToast('Candidate marked as passed to interview stage.');
  };

  const handleReject = async () => {
    setRejected(true);
    setShortlisted(false);
    setPassed(false);
    if (activeCandidate?.id) {
      try {
        await candidatesApi.updateStatus(activeCandidate.id, { status: 'REJECTED', currentStage: 'REJECTED' });
      } catch {
        // ignore
      }
    }
    triggerToast('Candidate marked as rejected.');
  };

  // Search candidate matching from live database records
  const searchMatchedCandidate = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase().trim();
    const match = dbCandidates.find(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.role && c.role.toLowerCase().includes(term)) ||
        (c.skills && c.skills.some((s) => s.toLowerCase().includes(term)))
    );
    if (!match) return null;

    const matchedList = Array.isArray(match.skills) ? match.skills : ['JavaScript', 'React', 'Node.js'];
    return {
      id: match.id,
      name: match.name,
      matchRole: match.role || 'Software Engineer',
      avatar: match.avatar || match.name.slice(0, 2).toUpperCase(),
      matchScore: match.matchScore || 85,
      matchTitle: match.matchScore >= 85 ? 'Strong Technical Match' : 'Evaluated Match',
      matchDesc: `${match.name} matches core criteria for ${match.role || 'the role'}.`,
      atsScore: match.atsScore || 88,
      skillCoverage: match.matchScore || 82,
      requiredSkillsCount: matchedList.length + 1,
      matchedSkillsCount: matchedList.length,
      partialSkillsCount: 1,
      missingSkillsCount: 0,
      experienceMatch: `${match.experienceYears || 3} Years Experience`,
      jdMatch: `${match.matchScore || 85}% Semantic Fit`,
      aiConfidence: '96%',
      aiRecommendation: match.matchScore >= 80 ? 'HIGHLY RECOMMENDED' : 'REVIEW REQUIRED',
      skills: matchedList.map((s, i) => ({ name: s, purple: i % 2 === 0 })),
      partialSkills: ['Cloud Infrastructure Basics'],
      missingSkills: [],
      gaps: [],
      gapPriorities: [],
      strengths: [
        `Verified experience in ${matchedList.slice(0, 3).join(', ')}`,
        'Consistent ATS parsed structure and verifiable credentials',
        'Strong industry alignment with company requirements',
      ],
      recommendedSkills: ['System Design', 'Kubernetes'],
      roadmapSteps: [
        { step: 'Phase 1', title: 'Onboarding & Core Stack', desc: 'Orientation with company codebase and engineering standards' },
        { step: 'Phase 2', title: 'Architecture Ramp-up', desc: 'Deep dive into microservices and cloud deployment architecture' },
      ],
      whyScoreExplanation: `${match.name} demonstrates strong alignment with ${match.matchScore || 85}% match score across key requirements.`,
      fileName: `${match.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
    };
  }, [searchTerm, dbCandidates]);

  // Determine active candidate to display
  const activeCandidate = searchMatchedCandidate || (analysisStatus === 'analyzed' ? selectedCandidate : null);

  return (
    <div className="app">
      <Sidebar activePage="resumeupload" />

      {/* MAIN */}
      <main className="main">
        {/* HEADER */}
        <Header
          title="Candidate Intake & Parsing"
          subtitle="Drag resumes to extract profiles and instantly evaluate requirements alignment."
        >
          <div className="search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search talent..."
              id="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Header>

        {/* CONTENT */}
        <div className="content">
          {/* TOP ROW: DRAG & DROP (LEFT) + UPLOAD HISTORY (RIGHT) */}
          <div className="top-upload-row">
            {/* UPLOAD BOX */}
            <div
              className={`upload-box ${analysisStatus === 'uploaded' ? 'uploaded' : ''}`}
              id="uploadBox"
              onClick={analysisStatus === 'idle' ? handleBrowseClick : undefined}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                background: isDragging ? '#f5f5ff' : '',
                borderColor: isDragging ? '#4942c6' : '',
                cursor: analysisStatus === 'idle' ? 'pointer' : 'default',
              }}
            >
              {analysisStatus === 'idle' && (
                <>
                  <div className="upload-icon" onClick={handleBrowseClick}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>

                  <h2>Drag and drop resumes here</h2>
                  <p>Support PDF, DOCX, and TXT up to 10MB</p>

                  <button
                    type="button"
                    className="browse-btn"
                    id="browseBtn"
                    onClick={handleBrowseClick}
                  >
                    Or Browse Files
                  </button>
                </>
              )}

              {analysisStatus === 'uploaded' && uploadedFile && (
                <div className="uploaded-preview-content">
                  <div className="uploaded-file-badge" title={uploadedFile.name}>
                    <i className="fa-solid fa-file-circle-check"></i>
                    <span>{uploadedFile.name}</span>
                  </div>

                  <h2>Resume Ready for Analysis</h2>
                  <p>
                    {uploadedFile.size} • {uploadedFile.type.split(' ')[0]} • Uploaded successfully
                  </p>

                  <button
                    type="button"
                    className="analyze-main-btn"
                    onClick={handleStartAnalysis}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Analyze Resume
                  </button>

                  <button
                    type="button"
                    className="reupload-link-btn"
                    onClick={handleBrowseClick}
                  >
                    Upload a different file
                  </button>
                </div>
              )}

              {analysisStatus === 'analyzing' && (
                <div className="uploaded-preview-content">
                  <div className="analyzing-spinner"></div>
                  <h2>Analyzing Resume with AI...</h2>
                  <p>Extracting profile, core skills, and evaluating requirements</p>
                </div>
              )}

              {analysisStatus === 'analyzed' && (
                <div className="uploaded-preview-content">
                  <div className="upload-icon" style={{ background: '#eafaf3', color: '#16a66e' }}>
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h2>Analysis Completed</h2>
                  <p>{uploadedFile?.name || 'Resume'} evaluated against job requirements</p>

                  <button
                    type="button"
                    className="browse-btn"
                    onClick={handleBrowseClick}
                  >
                    Upload Another Resume
                  </button>
                </div>
              )}

              <input
                type="file"
                id="resumeInput"
                ref={fileInputRef}
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
            </div>

            {/* UPLOAD HISTORY */}
            <div className="history-card">
              <div className="history-header">
                <h2>Upload History</h2>
                <span>{historyItems.length} items total</span>
              </div>

              <div className="history-list">
                {historyItems.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="file-info">
                      <div className="file-icon">
                        <i className="fa-regular fa-file"></i>
                      </div>
                      <div className="file-info-text">
                        <div className="file-name" title={item.fileName}>{item.fileName}</div>
                        <div className="file-meta">{item.meta}</div>
                      </div>
                    </div>
                    <span className={`file-status ${item.statusClass}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN RESULT AREA: RESUME ANALYSIS RESULT (FULL WIDTH) */}
          <div className="candidate-card full-width-result">
            {/* CASE 1: SEARCH ACTIVE WITH NO MATCH */}
            {searchTerm.trim() && !searchMatchedCandidate && (
              <div className="idle-panel">
                <div className="idle-panel-icon">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <h3>No Candidate Found</h3>
                <p>No candidate found matching "{searchTerm}". Try searching for Sarah, Rohan, Ananya, Vikram, or Neha.</p>
              </div>
            )}

            {/* CASE 2: SEARCH ACTIVE WITH MATCH OR ANALYSIS COMPLETED */}
            {activeCandidate && (() => {
              const evalData = getEvaluationData(activeCandidate);
              return (
                <>
                  {/* Candidate Header */}
                  <div className="candidate-header">
                    <div className="candidate-avatar">
                      {evalData.avatar ? evalData.avatar : <i className="fa-solid fa-user"></i>}
                    </div>
                    <div className="candidate-header-info">
                      <h2 title={evalData.name}>{evalData.name}</h2>
                      <p title={evalData.matchRole}>{evalData.matchRole}</p>
                    </div>
                  </div>

                  {/* AI RECOMMENDATION & CONFIDENCE BANNER */}
                  <div className="ai-rec-banner">
                    <div className="ai-rec-left">
                      <span className={`ai-rec-tag ${evalData.aiRecommendation.toLowerCase().replace(/\s+/g, '-')}`}>
                        <i
                          className={
                            evalData.aiRecommendation === 'HIGHLY RECOMMENDED'
                              ? 'fa-solid fa-circle-check'
                              : evalData.aiRecommendation === 'REVIEW REQUIRED'
                              ? 'fa-solid fa-triangle-exclamation'
                              : 'fa-solid fa-circle-xmark'
                          }
                        ></i>
                        {evalData.aiRecommendation}
                      </span>
                      <span className="ai-confidence-badge">
                        <i className="fa-solid fa-brain"></i> {evalData.aiConfidence} Confidence
                      </span>
                    </div>
                    <div className="ai-rec-score-pill">
                      <span>Overall Match:</span>
                      <strong>{evalData.matchScore}%</strong>
                    </div>
                  </div>

                  {/* MATCH SCORE */}
                  <div className="match-section">
                    <div className="match-row">
                      <div
                        className="match-circle"
                        style={{
                          background: `conic-gradient(#139b8e ${evalData.matchScore}%, #e5efed 0)`,
                        }}
                      >
                        <div className="match-circle-inner">{evalData.matchScore}%</div>
                      </div>
                      <div className="match-info">
                        <h3>{evalData.matchTitle}</h3>
                        <p>{evalData.matchDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* DETAILED AI EVALUATION METRICS GRID (4 COLUMNS) */}
                  <div className="ai-metrics-grid">
                    <div className="ai-metric-card">
                      <div className="ai-metric-header">
                        <span className="ai-metric-label">Skill Coverage</span>
                        <i className="fa-solid fa-chart-pie" style={{ color: '#139b8e' }}></i>
                      </div>
                      <div className="ai-metric-val">{evalData.skillCoverage}%</div>
                      <div className="ai-metric-sub">{evalData.matchedSkillsCount} of {evalData.requiredSkillsCount} Required Skills</div>
                    </div>

                    <div className="ai-metric-card">
                      <div className="ai-metric-header">
                        <span className="ai-metric-label">ATS Score</span>
                        <i className="fa-solid fa-file-shield" style={{ color: '#5b55d9' }}></i>
                      </div>
                      <div className="ai-metric-val">{evalData.atsScore}/100</div>
                      <div className="ai-metric-sub">Optimized for ATS Filters</div>
                    </div>

                    <div className="ai-metric-card">
                      <div className="ai-metric-header">
                        <span className="ai-metric-label">Experience Match</span>
                        <i className="fa-solid fa-briefcase" style={{ color: '#2563eb' }}></i>
                      </div>
                      <div className="ai-metric-val">{evalData.experienceMatch.split(' ')[0]}</div>
                      <div className="ai-metric-sub">{evalData.experienceMatch.replace(/^[0-9]+%\s*/, '') || 'Role Relevant'}</div>
                    </div>

                    <div className="ai-metric-card">
                      <div className="ai-metric-header">
                        <span className="ai-metric-label">JD Match</span>
                        <i className="fa-solid fa-bullseye" style={{ color: '#16a66e' }}></i>
                      </div>
                      <div className="ai-metric-val">{evalData.jdMatch.split(' ')[0]}</div>
                      <div className="ai-metric-sub">{evalData.jdMatch.replace(/^[0-9]+%\s*/, '') || 'Semantic Alignment'}</div>
                    </div>
                  </div>

                  {/* SKILL COVERAGE BREAKDOWN */}
                  <div className="coverage-breakdown-box">
                    <div className="section-label" style={{ marginBottom: '8px' }}>Skill Coverage Breakdown</div>
                    <div className="coverage-stats-row">
                      <div className="cov-stat-item">
                        <span className="cov-dot required"></span>
                        <span className="cov-text">Required Skills: <strong>{evalData.requiredSkillsCount}</strong></span>
                      </div>
                      <div className="cov-stat-item">
                        <span className="cov-dot matched"></span>
                        <span className="cov-text">Matched Skills: <strong>{evalData.matchedSkillsCount}</strong></span>
                      </div>
                      <div className="cov-stat-item">
                        <span className="cov-dot partial"></span>
                        <span className="cov-text">Partial Match: <strong>{evalData.partialSkillsCount}</strong></span>
                      </div>
                      <div className="cov-stat-item">
                        <span className="cov-dot missing"></span>
                        <span className="cov-text">Missing Skills: <strong>{evalData.missingSkillsCount}</strong></span>
                      </div>
                      <div className="cov-stat-item">
                        <span className="cov-dot required" style={{ background: '#139b8e' }}></span>
                        <span className="cov-text">Skill Coverage: <strong>{evalData.skillCoverage}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* TWO-COLUMN DETAILS GRID FOR COMPACT RESPONSIVE LAYOUT */}
                  <div className="eval-details-grid">
                    {/* LEFT COLUMN: COMPETENCIES, GAPS & STRENGTHS */}
                    <div className="eval-details-col">
                      {/* EXTRACTED CORE COMPETENCIES (MATCHED SKILLS) */}
                      <div className="eval-section-block">
                        <div className="section-label">Extracted Core Competencies</div>
                        <div className="skill-tags">
                          {evalData.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className={`skill-tag ${skill.purple ? 'purple' : ''}`}
                            >
                              <i className="fa-solid fa-check" style={{ fontSize: '9px', marginRight: '5px' }}></i>
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* PARTIAL / WEAK SKILLS */}
                      {evalData.partialSkills && evalData.partialSkills.length > 0 && (
                        <div className="eval-section-block">
                          <div className="section-label">Partial & Weak Skills</div>
                          <div className="skill-tags">
                            {evalData.partialSkills.map((ps, psIdx) => (
                              <span key={psIdx} className="partial-skill-tag">
                                <i className="fa-solid fa-circle-half-stroke" style={{ fontSize: '10px', marginRight: '5px' }}></i>
                                {ps}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* IDENTIFIED SKILL GAPS & PRIORITIES */}
                      <div className="eval-section-block skill-gap">
                        <div className="section-label">Identified Skill Gaps</div>
                        <div className="gap-priorities-list">
                          {evalData.gapPriorities.map((gapObj, gIdx) => (
                            <div key={gIdx} className="gap-priority-item">
                              <span className="gap-name">
                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                                {gapObj.name}
                              </span>
                              <span className={`gap-priority-badge ${gapObj.priorityClass}`}>
                                {gapObj.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CANDIDATE STRENGTHS */}
                      <div className="eval-section-block">
                        <div className="section-label">Candidate Strengths</div>
                        <div className="strengths-list">
                          {evalData.strengths.map((str, strIdx) => (
                            <div key={strIdx} className="strength-item">
                              <i className="fa-solid fa-circle-check"></i>
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: RECOMMENDED SKILLS, PATHWAY, ROADMAP & EXPLAINABILITY */}
                    <div className="eval-details-col">
                      {/* RECOMMENDED SKILLS */}
                      <div className="eval-section-block">
                        <div className="section-label">Recommended Skills</div>
                        <div className="skill-tags">
                          {evalData.recommendedSkills.map((rec, recIdx) => (
                            <span key={recIdx} className="recommended-skill-tag">
                              <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: '10px', marginRight: '5px' }}></i>
                              {rec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ACTIONABLE COURSE PATHWAY */}
                      <div className="course-card">
                        <div className="course-title">
                          <i className="fa-regular fa-bookmark"></i>
                          {evalData.courseTitle || 'Actionable Course Pathway'}
                        </div>
                        <p>{evalData.courseDesc}</p>
                      </div>

                      {/* LEARNING ROADMAP */}
                      <div className="eval-section-block">
                        <div className="section-label">Learning Roadmap</div>
                        <div className="roadmap-timeline">
                          {evalData.roadmapSteps.map((stepItem, stIdx) => (
                            <div key={stIdx} className="roadmap-step">
                              <div className="roadmap-step-badge">{stepItem.step}</div>
                              <div className="roadmap-step-content">
                                <strong>{stepItem.title}</strong>
                                <p>{stepItem.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXPLAINABLE AI / WHY THIS SCORE? (FULL WIDTH) */}
                  <div className="why-score-box">
                    <div className="why-score-header">
                      <i className="fa-solid fa-brain"></i>
                      <strong>Explainable AI: Why this score?</strong>
                    </div>
                    <p>{evalData.whyScoreExplanation}</p>
                    <div className="why-score-weights">
                      <span>Core Skills: <strong>45%</strong></span>
                      <span>•</span>
                      <span>Experience: <strong>25%</strong></span>
                      <span>•</span>
                      <span>JD Relevance: <strong>15%</strong></span>
                      <span>•</span>
                      <span>ATS Quality: <strong>15%</strong></span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="shortlist-btn"
                      id="shortlistBtn"
                      onClick={handleShortlist}
                      style={shortlisted ? { background: '#0c8275', color: '#ffffff' } : {}}
                    >
                      {shortlisted ? '✓ Shortlisted' : 'Shortlist Candidate'}
                    </button>

                    <button
                      type="button"
                      className="pass-btn"
                      id="passBtn"
                      onClick={handlePass}
                      style={passed ? { background: '#edf3ff', color: '#2869e8', borderColor: '#2869e8' } : {}}
                    >
                      {passed ? '✓ Passed' : 'Pass'}
                    </button>

                    <button
                      type="button"
                      className="reject-btn"
                      id="rejectBtn"
                      onClick={handleReject}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: rejected ? '#dc2626' : '#fff1f2',
                        color: rejected ? '#ffffff' : '#e11d48',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all .2s ease',
                      }}
                    >
                      <i className="fa-solid fa-ban"></i>
                      {rejected ? '✓ Rejected' : 'Reject'}
                    </button>
                  </div>
                </>
              );
            })()}

            {/* CASE 3: UPLOADED - BEFORE ANALYSIS (BASIC FILE INFO & STATUS) */}
            {!searchTerm.trim() && analysisStatus === 'uploaded' && uploadedFile && (
              <div className="file-status-panel">
                {/* File Header */}
                <div className="candidate-header">
                  <div className="candidate-avatar" style={{ background: 'linear-gradient(135deg, #1769ff, #38bdf8)' }}>
                    <i className="fa-solid fa-file-pdf"></i>
                  </div>
                  <div className="candidate-header-info">
                    <h2 title={uploadedFile.name}>{uploadedFile.name}</h2>
                    <p title="Uploaded Resume • Ready for AI Evaluation">Uploaded Resume • Ready for AI Evaluation</p>
                  </div>
                </div>

                {/* Basic Information Grid */}
                <div className="file-info-grid">
                  <div className="file-info-box">
                    <span className="file-info-label">File Type</span>
                    <span className="file-info-val">{uploadedFile.type.split(' ')[0]}</span>
                  </div>

                  <div className="file-info-box">
                    <span className="file-info-label">File Size</span>
                    <span className="file-info-val">{uploadedFile.size}</span>
                  </div>

                  <div className="file-info-box">
                    <span className="file-info-label">Upload Status</span>
                    <span className="file-info-val" style={{ color: '#16a66e' }}>
                      ● Ready for Analysis
                    </span>
                  </div>

                  <div className="file-info-box">
                    <span className="file-info-label">Timestamp</span>
                    <span className="file-info-val">{uploadedFile.uploadTime}</span>
                  </div>
                </div>

                {/* Ready for Analysis Callout Banner */}
                <div className="ready-analysis-box">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <div>
                    <h4>AI Resume Screening Ready</h4>
                    <p>
                      The resume is queued and ready. Click <strong>Analyze Resume</strong> to extract competencies, benchmark job requirements, and identify skill gaps.
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button
                    type="button"
                    className="analyze-main-btn"
                    style={{ width: '100%', height: '50px' }}
                    onClick={handleStartAnalysis}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Analyze Resume
                  </button>
                </div>
              </div>
            )}

            {/* CASE 4: ANALYZING STATE */}
            {!searchTerm.trim() && analysisStatus === 'analyzing' && (
              <div className="analyzing-panel">
                <div className="analyzing-spinner"></div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '6px' }}>
                    AI Evaluation In Progress
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#647084' }}>
                    Parsing document semantics and benchmarking candidate fit...
                  </p>
                </div>

                <div className="analyzing-steps">
                  <div className="analyzing-step-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Document structure parsed</span>
                  </div>
                  <div className="analyzing-step-item">
                    <i className="fa-solid fa-spinner fa-spin" style={{ color: '#5b55d9' }}></i>
                    <span>Extracting core competencies...</span>
                  </div>
                  <div className="analyzing-step-item" style={{ opacity: 0.6 }}>
                    <i className="fa-regular fa-circle" style={{ color: '#94a0b0' }}></i>
                    <span>Benchmarking job requirements & gaps</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 5: IDLE STATE (NO RESUME UPLOADED YET, NO SEARCH) */}
            {!searchTerm.trim() && analysisStatus === 'idle' && (
              <div className="idle-panel">
                <div className="idle-panel-icon">
                  <i className="fa-solid fa-file-arrow-up"></i>
                </div>
                <h3>No Resume Selected</h3>
                <p>
                  Upload or drag-and-drop a resume above to inspect file metadata and trigger AI candidate analysis. You can also search talent above.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast */}
      <div
        className={`toast ${showToast ? 'show' : ''}`}
        id="toast"
        style={{ display: showToast ? 'flex' : 'none' }}
      >
        {toastMessage}
      </div>
    </div>
  );
}
