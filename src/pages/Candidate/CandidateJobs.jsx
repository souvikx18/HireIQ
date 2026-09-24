import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { candidatePortalApi } from '../../api/candidatePortal';
import '../../css/candidate-portal.css';

export default function CandidateJobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'RECOMMENDED' | 'APPLIED'
  const [sortBy, setSortBy] = useState('MATCH_DESC');
  const [toastMessage, setToastMessage] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await candidatePortalApi.getJobs();
      if (res?.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      await candidatePortalApi.applyForJob(jobId);
      triggerToast('Application submitted successfully!');
      await loadJobs();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob((prev) => (prev ? { ...prev, isApplied: true, applicationStatus: 'APPLIED' } : null));
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  const handleAskCopilot = (job) => {
    const prompt = `I am interested in applying for the ${job.title} role in ${job.department || 'Engineering'}. Can you give me actionable advice on how to tailor my resume and prepare for the technical interview for this position?`;
    window.dispatchEvent(new CustomEvent('hireiq-open-chatbot', { detail: { prompt } }));
  };

  const departments = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return ['ALL', ...Array.from(set)];
  }, [jobs]);

  const counts = useMemo(() => {
    const total = jobs.length;
    const recommended = jobs.filter((j) => (j.matchScore || 0) >= 75).length;
    const applied = jobs.filter((j) => j.isApplied).length;
    return { total, recommended, applied };
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      // Tab filter
      if (activeTab === 'RECOMMENDED' && (job.matchScore || 0) < 75) return false;
      if (activeTab === 'APPLIED' && !job.isApplied) return false;

      // Dept filter
      const matchesDept = selectedDept === 'ALL' || job.department?.toUpperCase() === selectedDept.toUpperCase();

      // Search filter
      const matchesSearch =
        !searchTerm.trim() ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      return matchesDept && matchesSearch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'MATCH_DESC') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'MATCH_ASC') return (a.matchScore || 0) - (b.matchScore || 0);
      if (sortBy === 'EXP_DESC') return (b.minExperience || 0) - (a.minExperience || 0);
      if (sortBy === 'EXP_ASC') return (a.minExperience || 0) - (b.minExperience || 0);
      if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [jobs, activeTab, selectedDept, searchTerm, sortBy]);

  return (
    <div className="candidate-portal-root">
      <Sidebar activePage="candidate-jobs" />

      <div className="portal-main-content">
        <Header
          title="Explore Open Roles"
          subtitle="Positions matched against your resume skills with 1-click application"
          eyebrow="JOB OPPORTUNITIES"
        />

        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              background: '#059669',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
          </div>
        )}

        <div className="portal-body">
          {/* Quick Filter Tabs */}
          <div className="portal-filter-tabs">
            <button
              type="button"
              className={`portal-tab-pill ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              <i className="fa-solid fa-list-check"></i> All Positions
              <span className="pill-count">{counts.total}</span>
            </button>
            <button
              type="button"
              className={`portal-tab-pill ${activeTab === 'RECOMMENDED' ? 'active' : ''}`}
              onClick={() => setActiveTab('RECOMMENDED')}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Recommended (≥75% Match)
              <span className="pill-count">{counts.recommended}</span>
            </button>
            <button
              type="button"
              className={`portal-tab-pill ${activeTab === 'APPLIED' ? 'active' : ''}`}
              onClick={() => setActiveTab('APPLIED')}
            >
              <i className="fa-solid fa-circle-check"></i> Applied
              <span className="pill-count">{counts.applied}</span>
            </button>
          </div>

          {/* Search & Secondary Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              background: '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              ></i>
              <input
                type="text"
                placeholder="Search by job title, skill, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 14px 0 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                    color: '#1e293b',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'ALL' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                    color: '#1e293b',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="MATCH_DESC">Highest Match</option>
                  <option value="MATCH_ASC">Lowest Match</option>
                  <option value="EXP_DESC">Experience (High to Low)</option>
                  <option value="EXP_ASC">Experience (Low to High)</option>
                  <option value="TITLE_ASC">Role Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}></i>
              Loading open opportunities...
            </div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              <i className="fa-solid fa-folder-open" style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px', display: 'block' }}></i>
              <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>No matching openings found</h3>
              <p style={{ margin: 0, fontSize: '13.5px' }}>Try adjusting your search query, filters, or active tab.</p>
            </div>
          ) : (
            <div className="jobs-explorer-grid">
              {filteredAndSortedJobs.map((job) => (
                <div key={job.id} className="job-card-candidate">
                  <div>
                    <div className="job-card-header">
                      <span className="job-role-code">{job.department || 'ENGINEERING'}</span>
                      <span className={`job-match-pill ${job.matchScore >= 80 ? 'high' : 'medium'}`}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <h3>{job.title}</h3>

                    <div className="job-meta-row">
                      <span><i className="fa-solid fa-layer-group"></i> {job.experienceLevel || 'Mid-Level'}</span>
                      <span><i className="fa-regular fa-clock"></i> {job.minExperience || 2}+ Yrs Exp</span>
                      <span><i className="fa-solid fa-chair"></i> {job.openPositions || 1} Open</span>
                    </div>

                    <p className="job-desc-snippet">
                      {job.description || 'Deliver top-notch engineering work and collaborate with cross-functional product teams.'}
                    </p>

                    <div className="job-skills-req">
                      {job.skills?.slice(0, 6).map((skill, idx) => (
                        <span key={idx} className="job-skill-chip">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="job-secondary-btn"
                      onClick={() => setSelectedJob(job)}
                    >
                      <i className="fa-regular fa-eye"></i>
                      View Details
                    </button>

                    <div style={{ flex: 1 }}>
                      {job.isApplied ? (
                        <button type="button" className="job-apply-btn applied" style={{ width: '100%', margin: 0 }} disabled>
                          <i className="fa-solid fa-circle-check"></i>
                          Applied
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="job-apply-btn apply"
                          style={{ width: '100%', margin: 0 }}
                          onClick={() => handleApply(job.id)}
                          disabled={applyingId === job.id}
                        >
                          {applyingId === job.id ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i>
                              Applying...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-paper-plane"></i>
                              1-Click Apply
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Job Details Modal */}
      {selectedJob && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="job-role-code">{selectedJob.department || 'GENERAL'}</span>
                <h3>{selectedJob.title}</h3>
              </div>
              <button
                type="button"
                className="portal-modal-close-btn"
                onClick={() => setSelectedJob(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="portal-modal-body">
              {/* Specs Grid */}
              <div className="portal-specs-grid">
                <div className="portal-spec-item">
                  <span className="spec-label">Match Score</span>
                  <span className="spec-val" style={{ color: selectedJob.matchScore >= 80 ? '#059669' : '#2563eb' }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> {selectedJob.matchScore || 85}%
                  </span>
                </div>
                <div className="portal-spec-item">
                  <span className="spec-label">Experience</span>
                  <span className="spec-val">{selectedJob.minExperience || 2}+ Years</span>
                </div>
                <div className="portal-spec-item">
                  <span className="spec-label">Career Level</span>
                  <span className="spec-val">{selectedJob.experienceLevel || 'Mid-Senior'}</span>
                </div>
                <div className="portal-spec-item">
                  <span className="spec-label">Open Positions</span>
                  <span className="spec-val">{selectedJob.openPositions || 1} Open</span>
                </div>
              </div>

              {/* Role Overview */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0f172a' }}>Role Description</h4>
                <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#475569', whiteSpace: 'pre-line' }}>
                  {selectedJob.description ||
                    'In this position, you will collaborate with cross-functional teams to build, deploy, and scale robust software solutions. You will participate in architecture reviews, code reviews, and drive engineering excellence.'}
                </p>
              </div>

              {/* Required Skills & Candidate Match */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0f172a' }}>
                  Required Competencies & Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedJob.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-check" style={{ color: '#059669', fontSize: '10px' }}></i>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Career Copilot Callout */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-robot" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
                      Ask AI Career Copilot
                    </h5>
                    <span style={{ fontSize: '11px', color: '#15803d' }}>
                      Get personalized interview questions and resume tips for this role
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="copilot-trigger-btn"
                  onClick={() => handleAskCopilot(selectedJob)}
                >
                  <i className="fa-solid fa-comment-dots"></i>
                  Ask Copilot
                </button>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="job-secondary-btn"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>

              {selectedJob.isApplied ? (
                <button type="button" className="job-apply-btn applied" disabled>
                  <i className="fa-solid fa-circle-check"></i>
                  Application Submitted ({selectedJob.applicationStatus || 'In Review'})
                </button>
              ) : (
                <button
                  type="button"
                  className="job-apply-btn apply"
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applyingId === selectedJob.id}
                >
                  {applyingId === selectedJob.id ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Applying...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Submit 1-Click Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
