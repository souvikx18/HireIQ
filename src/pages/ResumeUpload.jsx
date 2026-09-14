import React, { useState, useRef, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../css/resumeupload.css';

const CANDIDATE_PRESETS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    matchRole: 'Lead Frontend Engineer',
    avatar: 'SJ',
    matchScore: 92,
    matchTitle: 'Strong Technical Match',
    matchDesc: 'Sarah matches 11 out of 12 required core skills.',
    atsScore: 95,
    skillCoverage: 92,
    requiredSkillsCount: 12,
    matchedSkillsCount: 11,
    partialSkillsCount: 1,
    missingSkillsCount: 0,
    experienceMatch: '96% (Senior 6+ Yrs)',
    jdMatch: '94% Semantic Fit',
    aiConfidence: '98%',
    aiRecommendation: 'HIGHLY RECOMMENDED',
    skills: [
      { name: 'React / Next.js', purple: false },
      { name: 'TypeScript', purple: false },
      { name: 'Tailwind CSS', purple: true },
      { name: 'Web-Vitals Optimization', purple: true },
      { name: 'GraphQL', purple: true },
      { name: 'Redux Toolkit', purple: true },
      { name: 'Jest & Cypress', purple: true },
    ],
    partialSkills: ['WebAssembly Performance Profiling'],
    missingSkills: ['Rust (WASM Bindings)'],
    gaps: ['Rust (WASM Bindings)'],
    gapPriorities: [
      { name: 'Rust (WASM Bindings)', priority: 'Medium Priority', priorityClass: 'medium' },
    ],
    strengths: [
      'Exceptional React/Next.js and modern state management architecture',
      'Proven track record with Web-Vitals optimization & high-performance UI',
      'Strong automated test coverage and type-safe development practices',
    ],
    recommendedSkills: ['Rust (WASM)', 'Micro-Frontend Architecture', 'Server Actions'],
    roadmapSteps: [
      { step: 'Phase 1', title: 'Rust & WASM Fundamentals', desc: 'Core Rust syntax and WebAssembly compilation (1-2 weeks)' },
      { step: 'Phase 2', title: 'Next.js WASM Integration', desc: 'Embed high-performance WASM modules in frontend pipeline' },
      { step: 'Phase 3', title: 'Production Ready Benchmarking', desc: 'Full architecture verification against role deliverables' },
    ],
    whyScoreExplanation: 'Sarah demonstrates an exceptional 92% overall match with 11/12 core competencies verified, 96% experience alignment for Lead Frontend responsibilities, and a 95 ATS parsability score. The single development area is Rust/WASM bindings, which has a fast ramp-up pathway.',
    courseTitle: 'Actionable Course Pathway',
    courseDesc:
      'Rust-to-WebAssembly Integration on Coursera (24h estimate to fill gap).',
    fileName: 'sarah_jenkins_resume.pdf',
  },
  {
    id: 2,
    name: 'Rohan Mehta',
    matchRole: 'Full Stack Developer',
    avatar: 'RM',
    matchScore: 85,
    matchTitle: 'High Alignment Match',
    matchDesc: 'Rohan matches 9 out of 11 required core skills.',
    atsScore: 88,
    skillCoverage: 82,
    requiredSkillsCount: 11,
    matchedSkillsCount: 9,
    partialSkillsCount: 1,
    missingSkillsCount: 1,
    experienceMatch: '88% (Mid-Senior 4+ Yrs)',
    jdMatch: '86% Semantic Fit',
    aiConfidence: '94%',
    aiRecommendation: 'HIGHLY RECOMMENDED',
    skills: [
      { name: 'Node.js', purple: false },
      { name: 'Express', purple: false },
      { name: 'MongoDB', purple: true },
      { name: 'React.js', purple: true },
      { name: 'Docker', purple: true },
      { name: 'REST APIs', purple: true },
    ],
    partialSkills: ['CI/CD Container Orchestration'],
    missingSkills: ['Kubernetes & Cloud Architecture'],
    gaps: ['Kubernetes & Cloud Architecture'],
    gapPriorities: [
      { name: 'Kubernetes & Cloud Architecture', priority: 'High Priority', priorityClass: 'high' },
    ],
    strengths: [
      'Strong end-to-end Node.js and RESTful microservices implementation',
      'Solid containerization practices with Docker and container workflows',
      'Effective full-stack state synchronization across React and MongoDB',
    ],
    recommendedSkills: ['Kubernetes (K8s)', 'Helm Charts', 'AWS ECS/EKS'],
    roadmapSteps: [
      { step: 'Phase 1', title: 'Kubernetes Foundations', desc: 'Pods, Deployments, Services, and Ingress controllers' },
      { step: 'Phase 2', title: 'Cluster Deployments', desc: 'Deploy full-stack Node/Mongo apps onto managed K8s cluster' },
      { step: 'Phase 3', title: 'Cloud Observability', desc: 'Configure Prometheus metrics and Grafana dashboards' },
    ],
    whyScoreExplanation: 'Rohan achieved an 85% match score with solid Node.js/React fundamentals and 88 ATS score. Bridging container orchestration to Kubernetes will solidify full-stack cloud readiness.',
    courseTitle: 'Actionable Course Pathway',
    courseDesc:
      'Docker & Kubernetes Mastery on Udemy (18h estimate to fill gap).',
    fileName: 'rohan_mehta_resume.pdf',
  },
  {
    id: 3,
    name: 'Ananya Patel',
    matchRole: 'Backend Developer',
    avatar: 'AP',
    matchScore: 88,
    matchTitle: 'Strong Backend Match',
    matchDesc: 'Ananya matches 10 out of 12 required core skills.',
    atsScore: 91,
    skillCoverage: 83,
    requiredSkillsCount: 12,
    matchedSkillsCount: 10,
    partialSkillsCount: 1,
    missingSkillsCount: 1,
    experienceMatch: '90% (Backend 5 Yrs)',
    jdMatch: '89% Semantic Fit',
    aiConfidence: '95%',
    aiRecommendation: 'HIGHLY RECOMMENDED',
    skills: [
      { name: 'Python', purple: false },
      { name: 'Django / FastAPI', purple: false },
      { name: 'PostgreSQL', purple: true },
      { name: 'Redis', purple: true },
      { name: 'Celery', purple: true },
      { name: 'AWS', purple: true },
    ],
    partialSkills: ['Distributed Event Streaming (Kafka)'],
    missingSkills: ['Microservices Architecture'],
    gaps: ['Microservices Architecture'],
    gapPriorities: [
      { name: 'Microservices Architecture', priority: 'High Priority', priorityClass: 'high' },
    ],
    strengths: [
      'High-throughput Python API development with FastAPI and Django',
      'Robust asynchronous task processing via Celery and Redis broker',
      'Advanced PostgreSQL indexing and relational query optimization',
    ],
    recommendedSkills: ['gRPC & Protobuf', 'Apache Kafka', 'Service Mesh (Istio)'],
    roadmapSteps: [
      { step: 'Phase 1', title: 'Microservices Decomposition', desc: 'Deconstruct monolithic services into domain bounded contexts' },
      { step: 'Phase 2', title: 'Event-Driven Messaging', desc: 'Implement Kafka topics and resilient event consumers' },
      { step: 'Phase 3', title: 'Distributed Tracing', desc: 'Integrate OpenTelemetry for end-to-end backend observability' },
    ],
    whyScoreExplanation: 'Ananya shows an 88% alignment with exemplary database, caching, and Python API architecture. Adding dedicated microservices patterns provides full enterprise backend readiness.',
    courseTitle: 'Actionable Course Pathway',
    courseDesc:
      'Microservices with Python on Coursera (20h estimate to fill gap).',
    fileName: 'ananya_patel_cv.docx',
  },
  {
    id: 4,
    name: 'Vikram Kumar',
    matchRole: 'Frontend Engineer',
    avatar: 'VK',
    matchScore: 74,
    matchTitle: 'Moderate Match',
    matchDesc: 'Vikram matches 7 out of 10 required core skills.',
    atsScore: 79,
    skillCoverage: 70,
    requiredSkillsCount: 10,
    matchedSkillsCount: 7,
    partialSkillsCount: 1,
    missingSkillsCount: 2,
    experienceMatch: '75% (Mid-Level 3 Yrs)',
    jdMatch: '73% Semantic Fit',
    aiConfidence: '89%',
    aiRecommendation: 'REVIEW REQUIRED',
    skills: [
      { name: 'HTML5 & CSS3', purple: false },
      { name: 'JavaScript (ES6+)', purple: false },
      { name: 'Vue.js', purple: true },
      { name: 'Git & GitHub', purple: true },
    ],
    partialSkills: ['Modern Build Tooling (Vite/Webpack)'],
    missingSkills: ['TypeScript', 'Advanced State Management (Pinia/Redux)'],
    gaps: ['TypeScript & Advanced State Management'],
    gapPriorities: [
      { name: 'TypeScript', priority: 'Critical', priorityClass: 'critical' },
      { name: 'Advanced State Management', priority: 'High Priority', priorityClass: 'high' },
    ],
    strengths: [
      'Clean semantic HTML5 markup and responsive CSS3 design',
      'Solid core JavaScript DOM manipulation and Vue component patterns',
      'Consistent Git version control and collaborative branching practices',
    ],
    recommendedSkills: ['TypeScript Generics', 'Pinia / Redux', 'Unit Testing (Vitest)'],
    roadmapSteps: [
      { step: 'Phase 1', title: 'TypeScript Migration', desc: 'Convert JavaScript codebase to strict static typing' },
      { step: 'Phase 2', title: 'Complex State Patterns', desc: 'Implement modular stores with hydration & middleware' },
      { step: 'Phase 3', title: 'Component Testing', desc: 'Add test suites with Vitest and Vue Test Utils' },
    ],
    whyScoreExplanation: 'Vikram presents a 74% score with good UI foundations. However, missing strict TypeScript and enterprise state management requires structured review and short-term upskilling.',
    courseTitle: 'Actionable Course Pathway',
    courseDesc: 'Complete TypeScript & State Management (16h estimate).',
    fileName: 'vikram_kumar_resume.pdf',
  },
  {
    id: 5,
    name: 'Neha Tiwari',
    matchRole: 'UI/UX Designer',
    avatar: 'NT',
    matchScore: 89,
    matchTitle: 'Exceptional Design Match',
    matchDesc: 'Neha matches 8 out of 9 required design skills.',
    atsScore: 92,
    skillCoverage: 89,
    requiredSkillsCount: 9,
    matchedSkillsCount: 8,
    partialSkillsCount: 1,
    missingSkillsCount: 0,
    experienceMatch: '93% (Design 4.5 Yrs)',
    jdMatch: '91% Semantic Fit',
    aiConfidence: '96%',
    aiRecommendation: 'HIGHLY RECOMMENDED',
    skills: [
      { name: 'Figma & FigJam', purple: false },
      { name: 'Design Systems', purple: false },
      { name: 'Wireframing', purple: true },
      { name: 'User Research', purple: true },
      { name: 'Prototyping', purple: true },
    ],
    partialSkills: ['HTML/CSS Tokens Handoff'],
    missingSkills: ['Design-to-Code Implementation'],
    gaps: ['Design-to-Code Implementation'],
    gapPriorities: [
      { name: 'Design-to-Code Implementation', priority: 'Low Priority', priorityClass: 'low' },
    ],
    strengths: [
      'Comprehensive design system creation with atomic component hierarchies',
      'Deep user research methodologies and interactive wireframing workflows',
      'High-fidelity prototyping with micro-interaction state transitions',
    ],
    recommendedSkills: ['Design Tokens Studio', 'Figma Variables & Auto-Layout', 'Frontend CSS Basics'],
    roadmapSteps: [
      { step: 'Phase 1', title: 'Design Token Standardization', desc: 'Sync Figma variable tokens with JSON code definitions' },
      { step: 'Phase 2', title: 'Interactive Code Handoff', desc: 'Setup Storybook integration with Figma design widgets' },
      { step: 'Phase 3', title: 'Accessibility (a11y) QA', desc: 'Audit color contrast and WCAG 2.1 compliance specs' },
    ],
    whyScoreExplanation: 'Neha demonstrates an 89% top-tier design match with 8/9 competencies and 92 ATS score. Her design-to-code gap is easily bridged with standard token workflows.',
    courseTitle: 'Actionable Course Pathway',
    courseDesc: 'Design to Code Masterclass on Interaction Design Foundation.',
    fileName: 'neha_tiwari_portfolio.pdf',
  },
];

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

const INITIAL_HISTORY = [
  {
    id: 1,
    fileName: 'sarah_jenkins_resume.pdf',
    meta: '240 KB • Uploaded Just now',
    status: 'Ready',
    statusClass: 'ready-badge',
  },
  {
    id: 2,
    fileName: 'david_miller_cv.docx',
    meta: '1.2 MB • Uploaded 10 mins ago',
    status: 'Analyzed',
    statusClass: 'analyzed',
  },
  {
    id: 3,
    fileName: 'invalid_file_format.txt',
    meta: '45 KB • Uploaded 1 hour ago',
    status: 'Error',
    statusClass: 'error',
  },
];

export default function ResumeUpload() {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Workflow states: 'idle' | 'uploaded' | 'analyzing' | 'analyzed'
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [historyItems, setHistoryItems] = useState(INITIAL_HISTORY);

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

  const handleStartAnalysis = (e) => {
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

    // Simulate AI parsing and evaluation delay
    setTimeout(() => {
      // Find matching preset candidate or generate parsed profile from file name
      const lowerName = uploadedFile.name.toLowerCase();
      let matchedCandidate = CANDIDATE_PRESETS.find(
        (c) =>
          lowerName.includes(c.name.toLowerCase().split(' ')[0]) ||
          lowerName.includes(c.name.toLowerCase().split(' ')[1]) ||
          lowerName === c.fileName.toLowerCase()
      );

      if (!matchedCandidate) {
        // Generate parsed candidate data dynamically from custom file name
        const cleanName = uploadedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        matchedCandidate = {
          id: Date.now(),
          name: cleanName || 'Uploaded Candidate',
          matchRole: 'Candidate Match: Evaluated Profile',
          avatar: cleanName.slice(0, 2).toUpperCase() || 'CV',
          matchScore: 91,
          matchTitle: 'Strong Technical Match',
          matchDesc: `${cleanName} matches 10 out of 12 required core skills.`,
          skills: [
            { name: 'Core Skillset Identified', purple: false },
            { name: 'Domain Experience', purple: false },
            { name: 'Technical Competencies', purple: true },
            { name: 'Problem Solving', purple: true },
            { name: 'Communication', purple: true },
          ],
          gaps: ['Advanced Domain Frameworks'],
          courseTitle: 'Actionable Course Pathway',
          courseDesc:
            'Recommended Industry Specialization Pathway on Coursera (20h estimate).',
          fileName: uploadedFile.name,
        };
      }

      setSelectedCandidate(matchedCandidate);
      setAnalysisStatus('analyzed');

      // Update history status to Analyzed
      setHistoryItems((prev) =>
        prev.map((item, idx) =>
          idx === 0 || item.fileName === uploadedFile.name
            ? { ...item, status: 'Analyzed', statusClass: 'analyzed' }
            : item
        )
      );

      triggerToast(`Analysis complete: ${matchedCandidate.name}`);
    }, 1300);
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

  const handleShortlist = () => {
    setShortlisted(true);
    triggerToast('Candidate shortlisted successfully.');
  };

  const handlePass = () => {
    setPassed(true);
    triggerToast('Candidate marked as passed.');
  };

  // Search candidate matching
  const searchMatchedCandidate = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase().trim();
    return (
      CANDIDATE_PRESETS.find(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.matchRole.toLowerCase().includes(term) ||
          c.skills.some((s) => s.name.toLowerCase().includes(term))
      ) || null
    );
  }, [searchTerm]);

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
                  <div className="actions">
                    <button
                      type="button"
                      className="shortlist-btn"
                      id="shortlistBtn"
                      onClick={handleShortlist}
                      style={shortlisted ? { background: '#0c8275' } : {}}
                    >
                      {shortlisted ? '✓ Shortlisted' : 'Shortlist Candidate'}
                    </button>

                    <button
                      type="button"
                      className="pass-btn"
                      id="passBtn"
                      onClick={handlePass}
                    >
                      {passed ? 'Passed' : 'Pass'}
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
