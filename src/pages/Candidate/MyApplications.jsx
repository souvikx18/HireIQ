import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { candidatePortalApi } from '../../api/candidatePortal';
import '../../css/candidate-portal.css';

export default function MyApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

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
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}></i>
              Loading your applications...
            </div>
          ) : applications.length === 0 ? (
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
                No active applications yet
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
              {applications.map((app) => {
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
                          {app.jobRole?.department || 'Engineering'} • Applied on {formattedDate} • Match: <strong>{app.matchScore || 85}%</strong>
                        </span>
                      </div>

                      <div>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
