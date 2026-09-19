import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { candidatePortalApi } from '../../api/candidatePortal';
import '../../css/candidate-portal.css';

export default function MyApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'IN_REVIEW' | 'INTERVIEW' | 'DECIDED'
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true);
        const res = await candidatePortalApi.getMyApplications();
        if (res?.data) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  const getStepIndex = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPLIED':
        return 1;
      case 'UNDER_REVIEW':
        return 2;
      case 'INTERVIEW':
        return 3;
      case 'SHORTLISTED':
      case 'HIRED':
      case 'OFFERED':
        return 4;
      default:
        return 1;
    }
  };

  const handleAskCopilot = (app) => {
    const jobTitle = app.jobRole?.title || 'this role';
    const dept = app.jobRole?.department || 'Engineering';
    const prompt = `I applied for the ${jobTitle} position (${dept}) and my application is currently in "${app.status || 'Under Review'}" stage. Can you help me prepare behavioral and technical questions for this interview?`;
    window.dispatchEvent(new CustomEvent('hireiq-open-chatbot', { detail: { prompt } }));
  };

  const counts = useMemo(() => {
    const total = applications.length;
    const inReview = applications.filter((a) => ['APPLIED', 'UNDER_REVIEW'].includes(a.status?.toUpperCase())).length;
    const interview = applications.filter((a) => a.status?.toUpperCase() === 'INTERVIEW').length;
    const decided = applications.filter((a) =>
      ['SHORTLISTED', 'HIRED', 'OFFERED', 'REJECTED'].includes(a.status?.toUpperCase())
    ).length;
    return { total, inReview, interview, decided };
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const st = app.status?.toUpperCase();
      if (activeTab === 'IN_REVIEW') return ['APPLIED', 'UNDER_REVIEW'].includes(st);
      if (activeTab === 'INTERVIEW') return st === 'INTERVIEW';
      if (activeTab === 'DECIDED') return ['SHORTLISTED', 'HIRED', 'OFFERED', 'REJECTED'].includes(st);
      return true;
    });
  }, [applications, activeTab]);

  return (
    <div className="candidate-portal-root">
      <Sidebar activePage="candidate-applications" />

      <div className="portal-main-content">
        <Header
          title="My Applications"
          subtitle="Track recruitment progress, stage updates, and evaluation status"
          eyebrow="APPLICATION TRACKER"
        />

        <div className="portal-body">
          {/* Quick Header Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Filter Tabs */}
            <div className="portal-filter-tabs" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`portal-tab-pill ${activeTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                <i className="fa-solid fa-list-check"></i> All
                <span className="pill-count">{counts.total}</span>
              </button>
              <button
                type="button"
                className={`portal-tab-pill ${activeTab === 'IN_REVIEW' ? 'active' : ''}`}
                onClick={() => setActiveTab('IN_REVIEW')}
              >
                <i className="fa-solid fa-clock-rotate-left"></i> In Review
                <span className="pill-count">{counts.inReview}</span>
              </button>
              <button
                type="button"
                className={`portal-tab-pill ${activeTab === 'INTERVIEW' ? 'active' : ''}`}
                onClick={() => setActiveTab('INTERVIEW')}
              >
                <i className="fa-solid fa-user-tie"></i> Interview
                <span className="pill-count">{counts.interview}</span>
              </button>
              <button
                type="button"
                className={`portal-tab-pill ${activeTab === 'DECIDED' ? 'active' : ''}`}
                onClick={() => setActiveTab('DECIDED')}
              >
                <i className="fa-solid fa-flag-checkered"></i> Decided
                <span className="pill-count">{counts.decided}</span>
              </button>
            </div>

            <button
              type="button"
              className="browse-files-btn"
              style={{ margin: 0, height: '38px', padding: '0 16px', fontSize: '13px' }}
              onClick={() => navigate('/candidate/jobs')}
            >
              <i className="fa-solid fa-briefcase"></i> Explore More Jobs
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}></i>
              Loading your applications...
            </div>
          ) : filteredApps.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b',
                maxWidth: '600px',
                margin: '40px auto',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 16px',
                }}
              >
                <i className="fa-regular fa-paper-plane"></i>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
                {activeTab === 'ALL' ? 'No active applications yet' : 'No applications in this category'}
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
                Explore open positions and submit your resume with 1 click to begin your hiring process.
              </p>
              <button
                type="button"
                className="browse-files-btn"
                onClick={() => navigate('/candidate/jobs')}
              >
                Explore Open Jobs
              </button>
            </div>
          ) : (
            <div>
              {filteredApps.map((app) => {
                const stepIdx = getStepIndex(app.status);
                const isRejected = app.status?.toUpperCase() === 'REJECTED';
                const formattedDate = app.appliedAt
                  ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div key={app.id} className="app-tracker-card">
                    <div className="app-header-row">
                      <div className="app-title-block">
                        <h3>{app.jobRole?.title || 'Software Role'}</h3>
                        <span>
                          {app.jobRole?.department || 'Engineering'} • Applied on {formattedDate} • Match:{' '}
                          <strong style={{ color: app.matchScore >= 80 ? '#059669' : '#2563eb' }}>
                            {app.matchScore || 85}%
                          </strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`app-stage-badge ${app.status?.toLowerCase() || 'applied'}`}>
                          {app.status?.replace('_', ' ') || 'Applied'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper Timeline */}
                    {!isRejected ? (
                      <div className="stepper-timeline">
                        <div className={`step-node ${stepIdx >= 1 ? (stepIdx === 1 ? 'active' : 'completed') : ''}`}>
                          <div className="step-circle">
                            {stepIdx > 1 ? <i className="fa-solid fa-check"></i> : '1'}
                          </div>
                          <span>Applied</span>
                        </div>

                        <div className={`step-node ${stepIdx >= 2 ? (stepIdx === 2 ? 'active' : 'completed') : ''}`}>
                          <div className="step-circle">
                            {stepIdx > 2 ? <i className="fa-solid fa-check"></i> : '2'}
                          </div>
                          <span>Under Review</span>
                        </div>

                        <div className={`step-node ${stepIdx >= 3 ? (stepIdx === 3 ? 'active' : 'completed') : ''}`}>
                          <div className="step-circle">
                            {stepIdx > 3 ? <i className="fa-solid fa-check"></i> : '3'}
                          </div>
                          <span>Interview</span>
                        </div>

                        <div className={`step-node ${stepIdx >= 4 ? 'completed' : ''}`}>
                          <div className="step-circle">
                            {stepIdx >= 4 ? <i className="fa-solid fa-check"></i> : '4'}
                          </div>
                          <span>Decision</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          color: '#e11d48',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <i className="fa-solid fa-circle-xmark"></i>
                        Application not moving forward at this time. We encourage you to apply for other matching openings!
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '16px',
                        paddingTop: '14px',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <button
                        type="button"
                        className="copilot-trigger-btn"
                        onClick={() => handleAskCopilot(app)}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        Prepare with AI Copilot
                      </button>

                      <button
                        type="button"
                        className="job-secondary-btn"
                        onClick={() => setSelectedApp(app)}
                      >
                        <i className="fa-solid fa-circle-info"></i>
                        View Stage Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Application Stage Details Modal */}
      {selectedApp && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="job-role-code">{selectedApp.jobRole?.department || 'ENG'}</span>
                <h3>{selectedApp.jobRole?.title || 'Application Review'}</h3>
              </div>
              <button
                type="button"
                className="portal-modal-close-btn"
                onClick={() => setSelectedApp(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="portal-modal-body">
              {/* Status Banner */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CURRENT STAGE</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                    {selectedApp.status?.replace('_', ' ') || 'Applied'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>MATCH ACCURACY</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> {selectedApp.matchScore || 85}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>SUBMITTED</span>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                    {selectedApp.appliedAt
                      ? new Date(selectedApp.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </div>
                </div>
              </div>

              {/* Recruitment Stage Explanations */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>Hiring Pipeline Stages</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      background: getStepIndex(selectedApp.status) >= 1 ? '#eff6ff' : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: getStepIndex(selectedApp.status) >= 1 ? '#bfdbfe' : '#e2e8f0',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <i className="fa-solid fa-circle-check" style={{ color: '#2563eb', marginTop: '3px' }}></i>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>Stage 1: Application Received</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#3b82f6' }}>
                        Your resume was submitted and parsed by the ATS. Match score was computed against the job profile.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: getStepIndex(selectedApp.status) >= 2 ? '#eff6ff' : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: getStepIndex(selectedApp.status) >= 2 ? '#bfdbfe' : '#e2e8f0',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <i
                      className={`fa-solid ${getStepIndex(selectedApp.status) >= 2 ? 'fa-circle-check' : 'fa-circle-notch'}`}
                      style={{ color: getStepIndex(selectedApp.status) >= 2 ? '#2563eb' : '#94a3b8', marginTop: '3px' }}
                    ></i>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>Stage 2: Recruiter Review</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569' }}>
                        The hiring manager inspects candidate rankings, technical depth, and past experience.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: getStepIndex(selectedApp.status) >= 3 ? '#eff6ff' : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: getStepIndex(selectedApp.status) >= 3 ? '#bfdbfe' : '#e2e8f0',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <i
                      className={`fa-solid ${getStepIndex(selectedApp.status) >= 3 ? 'fa-circle-check' : 'fa-circle-notch'}`}
                      style={{ color: getStepIndex(selectedApp.status) >= 3 ? '#2563eb' : '#94a3b8', marginTop: '3px' }}
                    ></i>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>Stage 3: Technical & Culture Interview</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569' }}>
                        Live technical evaluation, problem solving session, and engineering collaboration interview.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: getStepIndex(selectedApp.status) >= 4 ? '#eff6ff' : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: getStepIndex(selectedApp.status) >= 4 ? '#bfdbfe' : '#e2e8f0',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <i
                      className={`fa-solid ${getStepIndex(selectedApp.status) >= 4 ? 'fa-circle-check' : 'fa-circle-notch'}`}
                      style={{ color: getStepIndex(selectedApp.status) >= 4 ? '#2563eb' : '#94a3b8', marginTop: '3px' }}
                    ></i>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>Stage 4: Final Offer Decision</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569' }}>
                        Compensation package structuring and final hiring letter delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Details */}
              {selectedApp.jobRole?.description && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#0f172a' }}>About the Role</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    {selectedApp.jobRole.description}
                  </p>
                </div>
              )}
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="job-secondary-btn"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="copilot-trigger-btn"
                onClick={() => {
                  setSelectedApp(null);
                  handleAskCopilot(selectedApp);
                }}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Prepare for Interview with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
