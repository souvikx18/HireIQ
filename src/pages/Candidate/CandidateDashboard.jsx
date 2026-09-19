import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { candidatePortalApi } from '../../api/candidatePortal';
import '../../css/candidate-portal.css';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profRes, jobsRes, appsRes] = await Promise.allSettled([
          candidatePortalApi.getProfile(),
          candidatePortalApi.getJobs(),
          candidatePortalApi.getMyApplications(),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value?.data) {
          setProfile(profRes.value.data);
        }
        if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
          setJobs(jobsRes.value.data);
        }
        if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
          setApplications(appsRes.value.data);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await candidatePortalApi.applyForJob(jobId);
      triggerToast('Application submitted successfully!');
      // Refresh jobs & applications
      const [jobsRes, appsRes] = await Promise.all([
        candidatePortalApi.getJobs(),
        candidatePortalApi.getMyApplications(),
      ]);
      if (jobsRes?.data) setJobs(jobsRes.data);
      if (appsRes?.data) setApplications(appsRes.data);
    } catch (err) {
      triggerToast(err.message || 'Failed to apply');
    }
  };

  const handleAskCopilot = (prompt) => {
    window.dispatchEvent(new CustomEvent('hireiq-open-chatbot', { detail: { prompt } }));
  };

  const candidateAtsScore = profile?.atsScore || profile?.resumes?.[0]?.atsScore || 0;
  const activeApplicationsCount = applications.length;
  const topJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 2);

  return (
    <div className="candidate-portal-root">
      <Sidebar activePage="candidate-dashboard" />

      <div className="portal-main-content">
        <Header
          title="Candidate Overview"
          subtitle="Real-time resume health, matching opportunities, and application status"
          eyebrow="JOB SEEKER CONSOLE"
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
          {/* Hero Welcome Banner */}
          <div className="portal-hero">
            <div className="portal-hero-text">
              <h1>Welcome, {user?.firstName || 'Candidate'}!</h1>
              <p>
                Optimize your resume for applicant tracking systems (ATS), inspect keyword gaps,
                and discover tailored roles with 1-click applications.
              </p>

              {/* Quick AI Copilot Prompts */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleAskCopilot('How do I optimize my resume bullet points for high ATS match?')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-robot"></i> How to optimize bullet points?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskCopilot('What are common interview questions for software engineering roles?')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-lightbulb"></i> Engineering interview prep tips
                </button>
              </div>
            </div>

            <div className="portal-hero-actions">
              <Link to="/candidate/resume-checker" className="hero-cta-btn primary">
                <i className="fa-solid fa-file-shield"></i>
                Audit Resume
              </Link>
              <Link to="/candidate/jobs" className="hero-cta-btn secondary">
                <i className="fa-solid fa-briefcase"></i>
                Browse Jobs
              </Link>
            </div>
          </div>

          {/* Overview Stats Cards */}
          <div className="portal-stats-grid">
            <div className="stat-card-portal">
              <div className="stat-card-icon emerald">
                <i className="fa-solid fa-shield-heart"></i>
              </div>
              <div className="stat-card-info">
                <span>ATS Resume Score</span>
                <h3>{candidateAtsScore ? `${candidateAtsScore}%` : 'Scan Needed'}</h3>
              </div>
            </div>

            <div className="stat-card-portal">
              <div className="stat-card-icon blue">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div className="stat-card-info">
                <span>Active Applications</span>
                <h3>{activeApplicationsCount}</h3>
              </div>
            </div>

            <div className="stat-card-portal">
              <div className="stat-card-icon amber">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <div className="stat-card-info">
                <span>Open Positions</span>
                <h3>{jobs.length}</h3>
              </div>
            </div>

            <div className="stat-card-portal">
              <div className="stat-card-icon purple">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <div className="stat-card-info">
                <span>Identified Skills</span>
                <h3>{profile?.skills?.length || 0}</h3>
              </div>
            </div>
          </div>

          {/* Recent Applications Tracker Preview (If applications exist) */}
          {recentApplications.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary, #0f172a)' }}>
                    Recent Applications
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Track latest hiring stage updates and recruiter reviews
                  </p>
                </div>
                <Link
                  to="/candidate/applications"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View All ({applications.length}) <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '18px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        {app.jobRole?.title || 'Software Role'}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {app.jobRole?.department || 'Engineering'} • Match: <strong style={{ color: '#059669' }}>{app.matchScore || 85}%</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span className={`app-stage-badge ${app.status?.toLowerCase() || 'applied'}`}>
                        {app.status?.replace('_', ' ') || 'Applied'}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/candidate/applications')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Track Progress →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Jobs */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary, #0f172a)' }}>
                  Recommended Openings For You
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Positions sorted by semantic match against your experience and skills
                </p>
              </div>
              <Link
                to="/candidate/jobs"
                style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All Jobs <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                Loading opportunities...
              </div>
            ) : topJobs.length === 0 ? (
              <div style={{ padding: '30px', background: '#ffffff', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                No active job roles open at the moment. Please check back soon!
              </div>
            ) : (
              <div className="jobs-explorer-grid">
                {topJobs.map((job) => (
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
                        <span><i className="fa-solid fa-layer-group"></i> {job.experienceLevel || 'Mid-Senior'}</span>
                        <span><i className="fa-regular fa-clock"></i> {job.minExperience || 2}+ Yrs Exp</span>
                      </div>

                      <p className="job-desc-snippet">{job.description || 'Join our team to build industry-leading products and scale applications.'}</p>

                      <div className="job-skills-req">
                        {job.skills?.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="job-skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="job-secondary-btn"
                        onClick={() => navigate('/candidate/jobs')}
                      >
                        Details
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
                          >
                            <i className="fa-solid fa-paper-plane"></i>
                            1-Click Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Resume Audit Banner if score is missing */}
          {!candidateAtsScore && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-solid fa-file-arrow-up"></i>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1e3a8a', fontWeight: 700 }}>
                    Have you audited your resume today?
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1e40af' }}>
                    Upload your resume to receive an immediate ATS compatibility analysis and action verb suggestions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="browse-files-btn"
                onClick={() => navigate('/candidate/resume-checker')}
              >
                Scan Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
