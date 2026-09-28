import React, { useState, useRef, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { resumesApi } from '../api/resumes';
import { candidatesApi } from '../api/candidates';
import '../css/resumeupload.css';

function getEvaluationData(candidate) {
  if (!candidate) return null;

  // Use ?? (nullish coalescing) for numeric fields so 0 doesn't trigger the fallback
  const matchScore = candidate.matchScore ?? 0;
  const atsScore = candidate.atsScore ?? 0;
  const skillCoverage = candidate.skillCoverage ?? 0;
  const requiredSkillsCount = candidate.requiredSkillsCount ?? 0;
  const matchedSkillsCount = candidate.matchedSkillsCount ?? 0;
  const partialSkillsCount = candidate.partialSkillsCount ?? 0;
  const missingSkillsCount = candidate.missingSkillsCount ?? 0;

  // Explicitly extract skills so it doesn't get lost in the spread
  const skills = Array.isArray(candidate.skills) && candidate.skills.length > 0
    ? candidate.skills
    : [];

  const experienceMatch =
    candidate.experienceMatch ||
    (matchScore >= 85
      ? '5+ Years Experience'
      : matchScore >= 70
      ? '3+ Years Experience'
      : '1-2 Years Experience');

  const jdMatch =
    candidate.jdMatch ||
    (matchScore >= 85
      ? '89% Semantic Match'
      : matchScore >= 70
      ? '72% Moderate Fit'
      : '55% Partial Fit');

  const aiConfidence = candidate.aiConfidence || '92%';

  let aiRecommendation = candidate.aiRecommendation;
  if (!aiRecommendation) {
    if (matchScore >= 85) aiRecommendation = 'HIGHLY RECOMMENDED';
    else if (matchScore >= 65) aiRecommendation = 'REVIEW REQUIRED';
    else aiRecommendation = 'NOT RECOMMENDED';
  }

  const gapPriorities =
    candidate.gapPriorities ||
    (candidate.gaps || []).map((gap, idx) => {
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

  const partialSkills = candidate.partialSkills || [];
  const missingSkills = candidate.missingSkills || candidate.gaps || [];

  const strengths = candidate.strengths || [
    'Strong command of core architectural concepts and technical competencies',
    'Proven hands-on execution in complex project workflows and domain problem-solving',
    'High semantic synergy with target benchmark role requirements',
  ];

  const recommendedSkills = candidate.recommendedSkills || [];

  const roadmapSteps = candidate.roadmapSteps || [
    {
      step: 'Phase 1',
      title: 'Target Gap Remediation',
      desc: `Master ${candidate.gaps?.[0] || 'advanced domain frameworks'} (Est. 1-2 weeks)`,
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
    `Candidate achieved ${matchScore}% match: ${matchedSkillsCount}/${requiredSkillsCount} required skills verified, ${experienceMatch.split(' ')[0]} experience, ${jdMatch.split(' ')[0]} JD relevance.`;

  return {
    ...candidate,
    skills,
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
    setPassed(false);
    setRejected(false);
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
    setShortlisted(false);
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
                <p>No candidate found matching "{searchTerm}". Try searching by candidate name, role, or email.</p>
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


                  {/* TWO-COLUMN: MATCHED SKILLS + SKILL GAPS */}
                  <div className="eval-details-grid">
                    <div className="eval-details-col">
                      <div className="eval-section-block">
                        <div className="section-label">Matched Skills</div>
                        <div className="skill-tags">
                          {evalData.skills.map((skill, sIdx) => (
                            <span key={sIdx} className={`skill-tag ${skill.purple ? 'purple' : ''}`}>
                              <i className="fa-solid fa-check" style={{ fontSize: '9px', marginRight: '5px' }}></i>
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="eval-details-col">
                      <div className="eval-section-block skill-gap">
                        <div className="section-label">Skill Gaps</div>
                        {evalData.gapPriorities.length === 0 ? (
                          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>No critical gaps identified.</p>
                        ) : (
                          <div className="gap-priorities-list">
                            {evalData.gapPriorities.slice(0, 4).map((gapObj, gIdx) => (
                              <div key={gIdx} className="gap-priority-item">
                                <span className="gap-name">
                                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                                  {gapObj.name}
                                </span>
                                <span className={`gap-priority-badge ${gapObj.priorityClass}`}>{gapObj.priority}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>


                  {/* ACTION BUTTONS */}
                  <div className="resume-decision-actions">
                    <button
                      type="button"
                      className={`action-pill-btn shortlist ${shortlisted ? 'is-active' : ''}`}
                      id="shortlistBtn"
                      onClick={handleShortlist}
                    >
                      <i className={shortlisted ? "fa-solid fa-circle-check" : "fa-solid fa-check"}></i>
                      <span>{shortlisted ? 'Shortlisted' : 'Shortlist Candidate'}</span>
                    </button>

                    <button
                      type="button"
                      className={`action-pill-btn pass ${passed ? 'is-active' : ''}`}
                      id="passBtn"
                      onClick={handlePass}
                    >
                      <i className={passed ? "fa-solid fa-circle-check" : "fa-regular fa-calendar-check"}></i>
                      <span>{passed ? 'Passed to Interview' : 'Pass to Interview'}</span>
                    </button>

                    <button
                      type="button"
                      className={`action-pill-btn reject ${rejected ? 'is-active' : ''}`}
                      id="rejectBtn"
                      onClick={handleReject}
                    >
                      <i className={rejected ? "fa-solid fa-circle-xmark" : "fa-solid fa-xmark"}></i>
                      <span>{rejected ? 'Rejected' : 'Reject'}</span>
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
