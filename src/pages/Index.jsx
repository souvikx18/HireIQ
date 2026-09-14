import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../css/style.css';

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [allSkillsModalOpen, setAllSkillsModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('Choose Resume');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const periodPickerRef = useRef(null);
  const periodDateRef = useRef(null);
  const modalFileRef = useRef(null);
  const headerResumeInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAllSkillsModalOpen(false);
        setUploadModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        periodPickerRef.current &&
        !periodPickerRef.current.contains(e.target)
      ) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setPeriodOpen(false);
  };

  const handleCustomDateChange = (e) => {
    if (!e.target.value) return;
    const selectedDate = new Date(`${e.target.value}T00:00:00`);
    setSelectedPeriod(
      selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
    setPeriodOpen(false);
  };

  const handleModalFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleAnalyzeResume = () => {
    if (!modalFileRef.current || !modalFileRef.current.files.length) {
      window.alert('Please select a resume first.');
      return;
    }

    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisComplete(true);

      setTimeout(() => {
        window.alert(
          'Resume analyzed successfully!\n\n' +
            'Match Score: 92%\n' +
            'Skill Gaps Found: 8\n' +
            'Recommendation: Shortlist Candidate'
        );
        setUploadModalOpen(false);
        setAnalysisComplete(false);
        setSelectedFileName('Choose Resume');
      }, 700);
    }, 1800);
  };

  const handleHeaderResumeChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      window.alert(
        'Resume selected successfully:\n\n' +
          fileName +
          '\n\nReady for AI screening.'
      );
    }
  };

  const handleCandidateView = (name) => {
    window.alert(
      `Candidate Profile\n\n${name}\n\nDetailed resume analysis will appear here.`
    );
  };

  const handleAIRecommendation = () => {
    window.alert(
      'AI Recommendations\n\n' +
        '• Improve AWS skills\n' +
        '• Learn Docker & Kubernetes\n' +
        '• Practice System Design\n' +
        '• Improve Communication Skills\n' +
        '• Gain domain-specific knowledge'
    );
  };

  const handleNotificationClick = () => {
    window.alert('Notifications\n\nYou are all caught up.');
  };

  const handleViewAllSkills = () => {
    setAllSkillsModalOpen(true);
  };

  return (
    <div className="app">
      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <Header
          title="AI Resume Screening & Skill Gap Analysis"
          subtitle="Screen resumes instantly. Analyze skills deeply. Hire the best."
          showUploadBtn={true}
          onUploadClick={() => navigate('/resumeupload')}
        />

        <input
          type="file"
          id="resumeInput"
          ref={headerResumeInputRef}
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleHeaderResumeChange}
        />

        <section className="dashboard-overview">
          <div className="overview-chart panel">
            <div className="overview-title">
              <div className="overview-heading">
                <div className="overview-icon blue-icon">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <h2>
                  Candidates Overview{' '}
                  <i className="fa-regular fa-circle-question"></i>
                </h2>
              </div>
              <div
                className={`period-picker ${periodOpen ? 'open' : ''}`}
                ref={periodPickerRef}
              >
                <button
                  className="period-button"
                  id="periodButton"
                  type="button"
                  aria-expanded={periodOpen}
                  aria-haspopup="true"
                  onClick={() => setPeriodOpen(!periodOpen)}
                >
                  <span>{selectedPeriod}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
                <div className="period-menu" id="periodMenu" role="menu">
                  {['This Week', 'This Month', 'Last Month', 'Last 3 Months', 'This Year'].map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        data-period={p}
                        className={selectedPeriod === p ? 'selected' : ''}
                        onClick={() => handlePeriodSelect(p)}
                      >
                        {p}{' '}
                        {selectedPeriod === p && (
                          <i className="fa-solid fa-check"></i>
                        )}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="custom-period"
                    id="customPeriod"
                    onClick={() => {
                      if (
                        periodDateRef.current &&
                        typeof periodDateRef.current.showPicker === 'function'
                      ) {
                        periodDateRef.current.showPicker();
                      } else if (periodDateRef.current) {
                        periodDateRef.current.click();
                      }
                    }}
                  >
                    <i className="fa-regular fa-calendar"></i> Custom Range...
                  </button>
                  <input
                    className="period-date"
                    id="periodDate"
                    ref={periodDateRef}
                    type="date"
                    aria-label="Choose custom date"
                    onChange={handleCustomDateChange}
                  />
                </div>
              </div>
            </div>

            <div className="chart-area">
              <div className="chart-y-axis">
                <span>300</span>
                <span>250</span>
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="chart-main">
                <div className="chart-grid">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <svg
                  className="candidate-chart"
                  viewBox="0 0 700 330"
                  role="img"
                  aria-label="Applications and shortlisted candidates from May to September"
                >
                  <path
                    className="applications-fill"
                    d="M42 238 L190 191 L338 143 L486 96 L634 48 L634 285 L42 285 Z"
                  ></path>
                  <path
                    className="shortlisted-fill"
                    d="M42 253 L190 222 L338 206 L486 174 L634 143 L634 285 L42 285 Z"
                  ></path>
                  <polyline
                    className="applications-line"
                    points="42,238 190,191 338,143 486,96 634,48"
                  ></polyline>
                  <polyline
                    className="shortlisted-line"
                    points="42,253 190,222 338,206 486,174 634,143"
                  ></polyline>
                  <g className="chart-points applications-points">
                    <circle cx="42" cy="238" r="9"></circle>
                    <circle cx="190" cy="191" r="9"></circle>
                    <circle cx="338" cy="143" r="9"></circle>
                    <circle cx="486" cy="96" r="9"></circle>
                    <circle cx="634" cy="48" r="9"></circle>
                  </g>
                  <g className="chart-points shortlisted-points">
                    <circle cx="42" cy="253" r="9"></circle>
                    <circle cx="190" cy="222" r="9"></circle>
                    <circle cx="338" cy="206" r="9"></circle>
                    <circle cx="486" cy="174" r="9"></circle>
                    <circle cx="634" cy="143" r="9"></circle>
                  </g>
                  <g className="chart-value application-values">
                    <text x="42" y="218">
                      120
                    </text>
                    <text x="190" y="171">
                      150
                    </text>
                    <text x="338" y="123">
                      180
                    </text>
                    <text x="486" y="76">
                      210
                    </text>
                    <text x="634" y="28">
                      250
                    </text>
                  </g>
                  <g className="chart-value shortlisted-values">
                    <text x="42" y="277">
                      40
                    </text>
                    <text x="190" y="246">
                      60
                    </text>
                    <text x="338" y="230">
                      75
                    </text>
                    <text x="486" y="198">
                      90
                    </text>
                    <text x="634" y="167">
                      110
                    </text>
                  </g>
                </svg>
                <div className="chart-months">
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-blue"></i>Applications
              </span>
              <span>
                <i className="legend-green"></i>Shortlisted
              </span>
            </div>
            <div className="overview-metrics">
              <div className="metric-card metric-blue">
                <div className="metric-icon">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <span>Avg. Applications / Day</span>
                  <strong>8.5</strong>
                </div>
              </div>
              <div className="metric-card metric-green">
                <div className="metric-icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <span>Shortlist Rate</span>
                  <strong>30.5%</strong>
                </div>
              </div>
              <div className="metric-card metric-purple">
                <div className="metric-icon">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                  <span>Interview Rate</span>
                  <strong>18.2%</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="skills-demand panel">
            <div className="overview-heading">
              <div className="overview-icon blue-icon">
                <i className="fa-solid fa-star"></i>
              </div>
              <h2>
                Top Skills in Demand{' '}
                <i className="fa-regular fa-circle-question"></i>
              </h2>
            </div>
            <div className="skill-demand-list">
              <div className="demand-row">
                <div className="skill-logo javascript-logo">JS</div>
                <strong>JavaScript</strong>
                <div className="demand-bar">
                  <i style={{ width: '80%' }}></i>
                </div>
                <b>80%</b>
              </div>
              <div className="demand-row">
                <div className="skill-logo python-logo">
                  <i className="fa-brands fa-python"></i>
                </div>
                <strong>Python</strong>
                <div className="demand-bar">
                  <i style={{ width: '70%' }}></i>
                </div>
                <b>70%</b>
              </div>
              <div className="demand-row">
                <div className="skill-logo sql-logo">SQL</div>
                <strong>SQL</strong>
                <div className="demand-bar">
                  <i style={{ width: '65%' }}></i>
                </div>
                <b>65%</b>
              </div>
              <div className="demand-row">
                <div className="skill-logo react-logo">
                  <i className="fa-brands fa-react"></i>
                </div>
                <strong>React</strong>
                <div className="demand-bar">
                  <i style={{ width: '60%' }}></i>
                </div>
                <b>60%</b>
              </div>
              <div className="demand-row">
                <div className="skill-logo java-logo">
                  <i className="fa-brands fa-java"></i>
                </div>
                <strong>Java</strong>
                <div className="demand-bar">
                  <i style={{ width: '50%' }}></i>
                </div>
                <b>50%</b>
              </div>
            </div>
            <button
              className="view-skills-button"
              type="button"
              onClick={handleViewAllSkills}
            >
              View All Skills <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <p>Total Candidates</p>
              <h2>0</h2>
              <span className="positive">
                ↑ 12% <small>this month</small>
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div>
              <p>Resumes Uploaded</p>
              <h2>0</h2>
              <span className="positive">
                ↑ 8% <small>this month</small>
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <div>
              <p>Shortlisted</p>
              <h2>0</h2>
              <span className="positive">
                ↑ 15% <small>this month</small>
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <i className="fa-solid fa-chart-simple"></i>
            </div>
            <div>
              <p>Skill Gaps Found</p>
              <h2>0</h2>
              <span className="negative">
                ↑ 10% <small>this month</small>
              </span>
            </div>
          </div>
        </section>

        {/* Main Analytics */}
        <section className="analytics">
          {/* Top Candidate */}
          <div className="panel candidate-panel">
            <div className="panel-title">
              <h2>Top Candidate Match</h2>
              <Link to="/candidates">View All</Link>
            </div>

            <div className="candidate-content">
              <div className="score-circle">
                <div>
                  <strong>92%</strong>
                  <span>Match Score</span>
                </div>
              </div>

              <div className="candidate-info">
                <h2>Arjun Mehta</h2>
                <p>Full Stack Developer</p>
                <span className="location">
                  <i className="fa-solid fa-location-dot"></i>
                  Bangalore, India
                </span>

                <div className="badges">
                  <span>5 Years Exp.</span>
                  <span className="available">Available</span>
                </div>

                <h4>Top Skills</h4>
                <div className="skills">
                  <span>React</span>
                  <span>Node.js</span>
                  <span>JavaScript</span>
                  <span>MongoDB</span>
                  <span>AWS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Gap */}
          <div className="panel">
            <div className="panel-title">
              <h2>Skill Gap Overview</h2>
              <Link to="/skillgapanalysis">View Report</Link>
            </div>

            <div className="gap-content">
              <div className="donut">
                <div>
                  <strong>215</strong>
                  <span>Total Gaps</span>
                </div>
              </div>

              <div className="gap-list">
                <div>
                  <span className="dot blue-dot"></span>
                  <p>Technical Skills</p>
                  <strong>42%</strong>
                </div>
                <div>
                  <span className="dot green-dot"></span>
                  <p>Tools &amp; Frameworks</p>
                  <strong>28%</strong>
                </div>
                <div>
                  <span className="dot orange-dot"></span>
                  <p>Soft Skills</p>
                  <strong>18%</strong>
                </div>
                <div>
                  <span className="dot red-dot"></span>
                  <p>Domain Knowledge</p>
                  <strong>12%</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tables */}
        <section className="tables">
          {/* Recent Candidates */}
          <div className="panel table-panel">
            <div className="panel-title">
              <h2>Recent Candidates</h2>
              <Link to="/candidates">View All</Link>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Role</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <div className="candidate-name">
                        <div className="small-avatar">AM</div>
                        Arjun Mehta
                      </div>
                    </td>
                    <td>Full Stack Developer</td>
                    <td>
                      <div className="match">
                        <span>92%</span>
                        <div className="progress">
                          <div style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status shortlisted">Shortlisted</span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        type="button"
                        onClick={() => handleCandidateView('Arjun Mehta')}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="candidate-name">
                        <div className="small-avatar pink">SK</div>
                        Sneha Kapoor
                      </div>
                    </td>
                    <td>Frontend Developer</td>
                    <td>
                      <div className="match">
                        <span>78%</span>
                        <div className="progress">
                          <div style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status review">Under Review</span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        type="button"
                        onClick={() => handleCandidateView('Sneha Kapoor')}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="candidate-name">
                        <div className="small-avatar orange-bg">RD</div>
                        Rohan Das
                      </div>
                    </td>
                    <td>Backend Developer</td>
                    <td>
                      <div className="match">
                        <span>65%</span>
                        <div className="progress">
                          <div style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status maybe">Maybe</span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        type="button"
                        onClick={() => handleCandidateView('Rohan Das')}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="candidate-name">
                        <div className="small-avatar purple-bg">AI</div>
                        Ananya Iyer
                      </div>
                    </td>
                    <td>UI/UX Designer</td>
                    <td>
                      <div className="match">
                        <span>88%</span>
                        <div className="progress">
                          <div style={{ width: '88%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status shortlisted">Shortlisted</span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        type="button"
                        onClick={() => handleCandidateView('Ananya Iyer')}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Skill Gaps */}
          <div className="panel table-panel">
            <div className="panel-title">
              <h2>Top Skill Gaps</h2>
              <Link to="/skillgapanalysis">View All</Link>
            </div>

            <div className="skill-gap-table">
              <div className="gap-row heading">
                <span>Skill</span>
                <span>Required</span>
                <span>Candidate Avg.</span>
                <span>Gap</span>
              </div>

              <div className="gap-row">
                <span>AWS</span>
                <span>80%</span>
                <span>35%</span>
                <div className="gap-progress">
                  <b>45%</b>
                  <div>
                    <span style={{ width: '90%' }}></span>
                  </div>
                </div>
              </div>

              <div className="gap-row">
                <span>Docker</span>
                <span>70%</span>
                <span>30%</span>
                <div className="gap-progress">
                  <b>40%</b>
                  <div>
                    <span style={{ width: '80%' }}></span>
                  </div>
                </div>
              </div>

              <div className="gap-row">
                <span>Kubernetes</span>
                <span>70%</span>
                <span>25%</span>
                <div className="gap-progress">
                  <b>45%</b>
                  <div>
                    <span style={{ width: '90%' }}></span>
                  </div>
                </div>
              </div>

              <div className="gap-row">
                <span>System Design</span>
                <span>60%</span>
                <span>20%</span>
                <div className="gap-progress">
                  <b>40%</b>
                  <div>
                    <span style={{ width: '80%' }}></span>
                  </div>
                </div>
              </div>

              <div className="gap-row">
                <span>CI/CD</span>
                <span>60%</span>
                <span>25%</span>
                <div className="gap-progress">
                  <b>35%</b>
                  <div>
                    <span style={{ width: '70%' }}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendation */}
        <section className="recommendation">
          <div className="recommendation-icon">
            <i className="fa-solid fa-brain"></i>
          </div>

          <div className="recommendation-text">
            <h2>AI Recommendation</h2>
            <p>
              Based on resume screening and skill gap analysis, we recommend
              focused training in Cloud, DevOps and System Design to improve
              candidate fit.
            </p>
            <button type="button" onClick={handleAIRecommendation}>
              View Recommendations
            </button>
          </div>

          <div className="improve">
            <h3>Improve Candidate Fit</h3>
            <div className="improve-items">
              <div>
                <i className="fa-solid fa-cloud"></i>
                <span>Add AWS Experience</span>
              </div>
              <div>
                <i className="fa-brands fa-docker"></i>
                <span>Learn Docker</span>
              </div>
              <div>
                <i className="fa-solid fa-diagram-project"></i>
                <span>Practice System Design</span>
              </div>
              <div>
                <i className="fa-solid fa-users"></i>
                <span>Improve Soft Skills</span>
              </div>
              <div>
                <i className="fa-solid fa-book"></i>
                <span>Domain Knowledge</span>
              </div>
            </div>
          </div>
        </section>
      </main>



      {/* Upload Modal */}
      <div
        className={`modal ${uploadModalOpen ? 'show' : ''}`}
        id="uploadModal"
        onClick={(e) => {
          if (e.target.id === 'uploadModal') setUploadModalOpen(false);
        }}
      >
        <div className="modal-box">
          <button
            type="button"
            className="close"
            id="closeModal"
            onClick={() => setUploadModalOpen(false)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="modal-icon">
            <i className="fa-solid fa-file-arrow-up"></i>
          </div>

          <h2>Upload Resume</h2>
          <p>Select a candidate resume to start screening.</p>

          <label className="drop-area">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <strong>{selectedFileName}</strong>
            <span>PDF, DOC or DOCX</span>
            <input
              type="file"
              id="modalFile"
              ref={modalFileRef}
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleModalFileChange}
            />
          </label>

          <button
            type="button"
            className="analyze-btn"
            id="analyzeBtn"
            disabled={analyzing}
            onClick={handleAnalyzeResume}
          >
            {analyzing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Analyzing...
              </>
            ) : analysisComplete ? (
              <>
                <i className="fa-solid fa-check"></i> Analysis Complete
              </>
            ) : (
              <>
                <i className="fa-solid fa-magnifying-glass-chart"></i> Analyze
                Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skills Details Modal */}
      <div
        className={`modal skills-modal ${allSkillsModalOpen ? 'show' : ''}`}
        id="skillsModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skillsModalTitle"
        onClick={(e) => {
          if (e.target.id === 'skillsModal') setAllSkillsModalOpen(false);
        }}
      >
        <div className="skills-modal-box">
          <div className="skills-modal-header">
            <div className="skills-modal-heading">
              <div className="overview-icon blue-icon">
                <i className="fa-solid fa-star"></i>
              </div>
              <div>
                <h2 id="skillsModalTitle">Top Skills in Demand</h2>
                <p>Comprehensive market demand and competency insights</p>
              </div>
            </div>
            <button
              type="button"
              className="close"
              id="closeSkillsModal"
              aria-label="Close skills modal"
              onClick={() => setAllSkillsModalOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="skills-modal-body">
            {/* JavaScript */}
            <div className="skill-detail-card">
              <div className="skill-detail-top">
                <div className="skill-detail-title-wrap">
                  <div className="skill-logo javascript-logo">JS</div>
                  <div>
                    <h3>JavaScript</h3>
                    <span className="demand-badge high">High Demand</span>
                  </div>
                </div>
                <div className="skill-detail-percentage">
                  <strong>80%</strong>
                  <span>Market Match</span>
                </div>
              </div>
              <div className="demand-bar">
                <i style={{ width: '80%' }}></i>
              </div>
              <p className="skill-detail-desc">
                Core language for modern web development, powers interactive user interfaces, client-side logic, and scalable server runtime architectures.
              </p>
              <div className="skill-detail-topics">
                <strong>Key Technologies / Topics:</strong>
                <div className="topic-tags">
                  <span className="topic-tag">ES6+</span>
                  <span className="topic-tag">Async/Await</span>
                  <span className="topic-tag">TypeScript</span>
                  <span className="topic-tag">DOM Manipulation</span>
                  <span className="topic-tag">Event Loop</span>
                  <span className="topic-tag">REST APIs</span>
                </div>
              </div>
            </div>

            {/* Python */}
            <div className="skill-detail-card">
              <div className="skill-detail-top">
                <div className="skill-detail-title-wrap">
                  <div className="skill-logo python-logo">
                    <i className="fa-brands fa-python"></i>
                  </div>
                  <div>
                    <h3>Python</h3>
                    <span className="demand-badge high">High Demand</span>
                  </div>
                </div>
                <div className="skill-detail-percentage">
                  <strong>70%</strong>
                  <span>Market Match</span>
                </div>
              </div>
              <div className="demand-bar">
                <i style={{ width: '70%', background: '#16bfd1' }}></i>
              </div>
              <p className="skill-detail-desc">
                Dominant backend, data science, and AI/ML scripting language favored for data pipelines, automation, web backends, and machine learning models.
              </p>
              <div className="skill-detail-topics">
                <strong>Key Technologies / Topics:</strong>
                <div className="topic-tags">
                  <span className="topic-tag">FastAPI</span>
                  <span className="topic-tag">Django</span>
                  <span className="topic-tag">Pandas & NumPy</span>
                  <span className="topic-tag">PyTorch / TensorFlow</span>
                  <span className="topic-tag">Data Pipelines</span>
                  <span className="topic-tag">Automation</span>
                </div>
              </div>
            </div>

            {/* SQL */}
            <div className="skill-detail-card">
              <div className="skill-detail-top">
                <div className="skill-detail-title-wrap">
                  <div className="skill-logo sql-logo">SQL</div>
                  <div>
                    <h3>SQL</h3>
                    <span className="demand-badge high">High Demand</span>
                  </div>
                </div>
                <div className="skill-detail-percentage">
                  <strong>65%</strong>
                  <span>Market Match</span>
                </div>
              </div>
              <div className="demand-bar">
                <i style={{ width: '65%', background: '#42c647' }}></i>
              </div>
              <p className="skill-detail-desc">
                Standard query language essential for relational database management, schema design, complex joins, data warehousing, and business analytics.
              </p>
              <div className="skill-detail-topics">
                <strong>Key Technologies / Topics:</strong>
                <div className="topic-tags">
                  <span className="topic-tag">PostgreSQL</span>
                  <span className="topic-tag">MySQL</span>
                  <span className="topic-tag">Complex Joins</span>
                  <span className="topic-tag">Indexing & Query Optimization</span>
                  <span className="topic-tag">Stored Procedures</span>
                  <span className="topic-tag">Database Modeling</span>
                </div>
              </div>
            </div>

            {/* React */}
            <div className="skill-detail-card">
              <div className="skill-detail-top">
                <div className="skill-detail-title-wrap">
                  <div className="skill-logo react-logo">
                    <i className="fa-brands fa-react"></i>
                  </div>
                  <div>
                    <h3>React</h3>
                    <span className="demand-badge high">High Demand</span>
                  </div>
                </div>
                <div className="skill-detail-percentage">
                  <strong>60%</strong>
                  <span>Market Match</span>
                </div>
              </div>
              <div className="demand-bar">
                <i style={{ width: '60%', background: '#ff9718' }}></i>
              </div>
              <p className="skill-detail-desc">
                Industry-leading component-based frontend library for building fast, responsive single-page web applications and mobile apps.
              </p>
              <div className="skill-detail-topics">
                <strong>Key Technologies / Topics:</strong>
                <div className="topic-tags">
                  <span className="topic-tag">React Hooks</span>
                  <span className="topic-tag">State Management</span>
                  <span className="topic-tag">Next.js</span>
                  <span className="topic-tag">Virtual DOM</span>
                  <span className="topic-tag">Component Lifecycle</span>
                  <span className="topic-tag">Performance Optimization</span>
                </div>
              </div>
            </div>

            {/* Java */}
            <div className="skill-detail-card">
              <div className="skill-detail-top">
                <div className="skill-detail-title-wrap">
                  <div className="skill-logo java-logo">
                    <i className="fa-brands fa-java"></i>
                  </div>
                  <div>
                    <h3>Java</h3>
                    <span className="demand-badge medium">Medium Demand</span>
                  </div>
                </div>
                <div className="skill-detail-percentage">
                  <strong>50%</strong>
                  <span>Market Match</span>
                </div>
              </div>
              <div className="demand-bar">
                <i style={{ width: '50%', background: '#7a42ed' }}></i>
              </div>
              <p className="skill-detail-desc">
                Robust, object-oriented enterprise backbone language widely utilized for large-scale microservices, backend architectures, and secure distributed systems.
              </p>
              <div className="skill-detail-topics">
                <strong>Key Technologies / Topics:</strong>
                <div className="topic-tags">
                  <span className="topic-tag">Spring Boot</span>
                  <span className="topic-tag">Microservices</span>
                  <span className="topic-tag">Multithreading</span>
                  <span className="topic-tag">JVM Tuning</span>
                  <span className="topic-tag">RESTful Web Services</span>
                  <span className="topic-tag">Hibernate / JPA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="skills-modal-footer">
            <button
              type="button"
              className="skills-modal-close-btn"
              onClick={() => setAllSkillsModalOpen(false)}
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
