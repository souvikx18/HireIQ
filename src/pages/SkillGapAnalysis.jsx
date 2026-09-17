import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { analyticsApi } from '../api/analytics';
import '../css/skillgapanalysis.css';

export default function SkillGapAnalysis() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [gapsList, setGapsList] = useState([]);
  const [readinessScore, setReadinessScore] = useState(72);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const loadGaps = async () => {
    try {
      const res = await analyticsApi.getSkillGaps({ search: searchTerm, category: categoryFilter });
      if (res?.data) {
        if (res.data.gaps) setGapsList(res.data.gaps);
        if (res.data.readinessScore) setReadinessScore(res.data.readinessScore);
      }
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    loadGaps();
  }, [categoryFilter]);

  const filteredGaps = gapsList.filter((item) => {
    const matchesSearch =
      item.skill.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      item.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const content = [
      'HIREIQ SKILL GAP ANALYSIS',
      '=========================',
      'Overall readiness: 72%',
      'Priority focus: Cloud & DevOps, System Design, Communication',
      '',
      ...filteredGaps.map(
        (g) =>
          `${g.skill} | ${g.categoryLabel} | Required: ${g.required} | Avg: ${g.candidateAvg} | Gap: ${g.severityPercent}`
      ),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hireiq-skill-gap-analysis.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    triggerToast('Skill gap analysis exported successfully.');
  };

  const [selectedPlanModal, setSelectedPlanModal] = useState(null);

  const handleRowAction = (item) => {
    setSelectedPlanModal(item);
  };

  return (
    <>
      <Sidebar activePage="skillgapanalysis" />

      <main className="main-content">
        <Header
          title="Skill Gap Analysis"
          subtitle="See where your talent pool is strongest and where focused growth can unlock better matches."
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate('/setting')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#2869e8',
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-sliders"></i> Edit Benchmarks
            </button>
            <button
              className="primary-button"
              id="exportAnalysis"
              type="button"
              onClick={handleExport}
            >
              <i className="fa-solid fa-download"></i> Export Analysis
            </button>
          </div>
        </Header>

        <section className="hero-grid">
          <div className="readiness-panel panel">
            <div className="section-label">Overall workforce readiness</div>
            <div className="readiness-main">
              <div className="score-ring">
                <strong>{readinessScore}</strong>
                <span>/100</span>
              </div>
              <div>
                <h2>Good foundation</h2>
                <p>
                  Most candidates meet core requirements. Closing the priority
                  gaps could improve hiring fit by <b>18%</b>.
                </p>
                <span className="trend">
                  <i className="fa-solid fa-arrow-trend-up"></i> 6.4% from last
                  month
                </span>
              </div>
            </div>
            <div className="readiness-track">
              <span></span>
            </div>
            <div className="track-labels">
              <span>Needs focus</span>
              <b>72% ready</b>
              <span>Strong</span>
            </div>
          </div>
          <div className="focus-panel panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">Priority focus</span>
                <h2>Where to invest next</h2>
              </div>
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <div className="focus-item">
              <span className="focus-icon cloud">
                <i className="fa-solid fa-cloud"></i>
              </span>
              <div>
                <strong>Cloud & DevOps</strong>
                <small>Most frequent gap across roles</small>
              </div>
              <b>45%</b>
            </div>
            <div className="focus-item">
              <span className="focus-icon design">
                <i className="fa-solid fa-diagram-project"></i>
              </span>
              <div>
                <strong>System Design</strong>
                <small>High impact on senior matches</small>
              </div>
              <b>40%</b>
            </div>
            <div className="focus-item">
              <span className="focus-icon soft">
                <i className="fa-solid fa-comments"></i>
              </span>
              <div>
                <strong>Communication</strong>
                <small>Growing interview signal</small>
              </div>
              <b>28%</b>
            </div>
          </div>
        </section>

        <section className="category-grid">
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon blue">
                <i className="fa-solid fa-code"></i>
              </span>
              <span className="category-change up">+8.2%</span>
            </div>
            <h3>Technical Skills</h3>
            <strong>58%</strong>
            <div className="mini-track">
              <span style={{ width: '58%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon green">
                <i className="fa-solid fa-screwdriver-wrench"></i>
              </span>
              <span className="category-change up">+4.1%</span>
            </div>
            <h3>Tools & Frameworks</h3>
            <strong>64%</strong>
            <div className="mini-track green-track">
              <span style={{ width: '64%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon orange">
                <i className="fa-solid fa-people-group"></i>
              </span>
              <span className="category-change down">-2.6%</span>
            </div>
            <h3>Soft Skills</h3>
            <strong>76%</strong>
            <div className="mini-track orange-track">
              <span style={{ width: '76%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon violet">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <span className="category-change up">+3.8%</span>
            </div>
            <h3>Domain Knowledge</h3>
            <strong>49%</strong>
            <div className="mini-track violet-track">
              <span style={{ width: '49%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
        </section>

        <section className="panel gaps-panel">
          <div className="table-heading">
            <div>
              <span className="section-label">Candidate intelligence</span>
              <h2>Most common skill gaps</h2>
            </div>
            <div className="table-tools">
              <label className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  id="gapSearch"
                  type="search"
                  placeholder="Search skills"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
              <select
                id="gapFilter"
                aria-label="Filter skill gaps"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                <option value="technical">Technical Skills</option>
                <option value="tools">Tools & Frameworks</option>
                <option value="soft">Soft Skills</option>
                <option value="domain">Domain Knowledge</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Required</th>
                  <th>Candidate average</th>
                  <th>Gap severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="gapTable">
                {filteredGaps.map((item) => (
                  <tr key={item.id} data-category={item.category}>
                    <td>
                      <div className="skill-name">
                        <span className={item.iconClass}>
                          <i className={item.iconFa}></i>
                        </span>
                        <strong>{item.skill}</strong>
                      </div>
                    </td>
                    <td>{item.categoryLabel}</td>
                    <td>{item.required}</td>
                    <td>{item.candidateAvg}</td>
                    <td>
                      <span className={`severity ${item.severityClass}`}>
                        {item.severityLabel} <b>{item.severityPercent}</b>
                      </span>
                    </td>
                    <td>
                      <button
                        className="row-action"
                        type="button"
                        data-skill={item.skill}
                        onClick={() => handleRowAction(item)}
                      >
                        View plan <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="empty-state"
            id="emptyState"
            style={{ display: filteredGaps.length === 0 ? 'block' : 'none' }}
          >
            No matching skills found.
          </div>
        </section>
      </main>

      {/* ACTIONABLE LEARNING & UPSKILLING PLAN MODAL */}
      {selectedPlanModal && (
        <div
          className="plan-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 11, 24, .75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100000,
          }}
          onClick={() => setSelectedPlanModal(null)}
        >
          <div
            className="plan-modal-card"
            style={{
              position: 'relative',
              width: '680px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '34px',
                height: '34px',
                border: '1px solid #d9e2ef',
                borderRadius: '8px',
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                fontSize: '15px',
              }}
              onClick={() => setSelectedPlanModal(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <span
                className={selectedPlanModal.iconClass}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '20px',
                  background: '#eff6ff',
                  color: '#2563eb',
                }}
              >
                <i className={selectedPlanModal.iconFa}></i>
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                    {selectedPlanModal.skill}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {selectedPlanModal.categoryLabel}
                  </span>
                  <span
                    className={`severity ${selectedPlanModal.severityClass}`}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px' }}
                  >
                    {selectedPlanModal.severityLabel} {selectedPlanModal.severityPercent}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                  Actionable Upskilling & Learning Roadmap for Candidate Pipeline
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                  Required Benchmark
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                  {selectedPlanModal.required}
                </div>
                <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px' }}>
                  Company Target Level
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                  Candidate Pool Avg
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                  {selectedPlanModal.candidateAvg}
                </div>
                <div style={{ fontSize: '10px', color: '#d97706', marginTop: '2px' }}>
                  Current Applicant Signal
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '11px', color: '#e11d48', fontWeight: '500' }}>
                  Identified Talent Gap
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#e11d48', marginTop: '2px' }}>
                  {selectedPlanModal.severityPercent}
                </div>
                <div style={{ fontSize: '10px', color: '#be123c', marginTop: '2px' }}>
                  Gap to Bridge
                </div>
              </div>
            </div>

            {/* Curriculum Roadmap */}
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-graduation-cap" style={{ color: '#2563eb' }}></i>
                Structured 3-Phase Upskilling Roadmap
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                      Phase 1: Foundational Remediation & Core Concepts
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      Est. 12 Hours
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                    Comprehensive review of {selectedPlanModal.skill} architecture, syntax patterns, syntax best practices, and runtime debugging.
                  </p>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #10b981',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                      Phase 2: Production Sandbox & Real-World Lab Projects
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      Est. 18 Hours
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                    Hands-on containerized sandbox lab. Building high-availability services and integrating telemetry, unit tests, and performance profiles.
                  </p>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #8b5cf6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                      Phase 3: Benchmark Assessment & Skill Certification
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      Est. 6 Hours
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                    Timed algorithmic & architectural interview simulation. Fulfill {selectedPlanModal.required} benchmark score for automated interview fast-track.
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Enterprise Resource */}
            <div
              style={{
                padding: '14px 16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>
                  Recommended Enterprise Track
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginTop: '2px' }}>
                  {selectedPlanModal.skill} Production Mastery (Coursera & Linux Foundation)
                </div>
                <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px' }}>
                  Includes 24 interactive coding labs & verified certification
                </div>
              </div>
              <span
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                }}
              >
                Accredited
              </span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => {
                  const content = `HIREIQ ACTIONABLE LEARNING PLAN\nSkill: ${selectedPlanModal.skill}\nCategory: ${selectedPlanModal.categoryLabel}\nRequired Benchmark: ${selectedPlanModal.required}\nCandidate Average: ${selectedPlanModal.candidateAvg}\nGap Severity: ${selectedPlanModal.severityPercent}\n\nCURRICULUM ROADMAP:\nPhase 1: Foundational Remediation (12 Hours)\nPhase 2: Production Sandbox & Real-World Lab (18 Hours)\nPhase 3: Benchmark Assessment & Skill Certification (6 Hours)\n\nRecommended Track: ${selectedPlanModal.skill} Production Mastery (Coursera & Linux Foundation)\n`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `hireiq-learning-plan-${selectedPlanModal.skill.toLowerCase().replace(/\s+/g, '-')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  triggerToast(`Curriculum syllabus for ${selectedPlanModal.skill} downloaded.`);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-download"></i> Download Syllabus
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPlanModal(null)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerToast(`Upskilling track for ${selectedPlanModal.skill} successfully assigned to candidate cohort!`);
                    setSelectedPlanModal(null);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-user-check"></i> Assign to Candidate Cohort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`toast ${showToast ? 'show' : ''}`}
        id="toast"
        role="status"
        style={{ display: showToast ? 'flex' : 'none' }}
      >
        {toastMessage}
      </div>
    </>
  );
}
