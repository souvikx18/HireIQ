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
  const [toastMessage, setToastMessage] = useState('');
  const [applyingId, setApplyingId] = useState(null);

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
    } catch (err) {
      triggerToast(err.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  const departments = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return ['ALL', ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesDept = selectedDept === 'ALL' || job.department?.toUpperCase() === selectedDept.toUpperCase();
      const matchesSearch =
        !searchTerm.trim() ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesDept && matchesSearch;
    });
  }, [jobs, selectedDept, searchTerm]);

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
              fontSize: '13.5px',
            }}
          >
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
          </div>
        )}

        <div className="portal-body">
          {/* Filter Bar */}
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
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
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
          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}></i>
              Loading open opportunities...
            </div>
          ) : filteredJobs.length === 0 ? (
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
              <p style={{ margin: 0, fontSize: '13.5px' }}>Try adjusting your search query or department filter.</p>
            </div>
          ) : (
            <div className="jobs-explorer-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card-candidate">
                  <div>
                    <div className="job-card-header">
                      <span className="job-role-code">{job.department || 'TECH'}</span>
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

                    <p className="job-desc-snippet">{job.description || 'Deliver top-notch engineering work and collaborate with cross-functional product teams.'}</p>

                    <div className="job-skills-req">
                      {job.skills?.slice(0, 6).map((skill, idx) => (
                        <span key={idx} className="job-skill-chip">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {job.isApplied ? (
                      <button type="button" className="job-apply-btn applied" disabled>
                        <i className="fa-solid fa-circle-check"></i>
                        Applied ({job.applicationStatus || 'Under Review'})
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="job-apply-btn apply"
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
