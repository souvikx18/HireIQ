import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { candidatesApi } from '../api/candidates';
import '../css/candidates.css';

export default function Candidates() {
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);
  const [actionMenu, setActionMenu] = useState(null); // { candidate, top, left }
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareModalData, setCompareModalData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleToggleCompare = (id) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStageChange = async (candidateId, newStage) => {
    try {
      await candidatesApi.updateStatus(candidateId, { currentStage: newStage });
      setCandidatesList((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, currentStage: newStage } : c))
      );
      triggerToast(`Candidate stage updated to ${newStage.replace('_', ' ')}`);
    } catch (err) {
      triggerToast(err.message || 'Failed to update candidate stage');
    }
  };

  const handleRunComparison = async () => {
    if (selectedForCompare.length < 2) {
      triggerToast('Select at least 2 candidates using the checkboxes to compare');
      return;
    }
    setIsComparing(true);
    try {
      const res = await candidatesApi.compareCandidates(selectedForCompare);
      if (res?.data) {
        setCompareModalData(res.data);
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to compare candidates');
    } finally {
      setIsComparing(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await candidatesApi.getCandidates();
      if (res?.data) {
        setCandidatesList(res.data);
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const filteredCandidates = candidatesList.filter((c) => {
    const matchesRole =
      roleFilter === 'All Roles' ||
      c.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'All Status' ||
      c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesRole && matchesStatus;
  });

  const handleExport = () => {
    if (filteredCandidates.length === 0) {
      triggerToast('No candidates available to export');
      return;
    }

    let csv = 'Candidate,Email,Role,Views,Reviews,Rating\n';
    filteredCandidates.forEach((c) => {
      csv += `"${c.name}","${c.email}","${c.role}","${c.views}","${c.reviews}","${c.rating}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hireiq-candidates.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    triggerToast('Candidate data exported successfully');
  };

  const handleMoreClick = (e, candidate) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenu({
      candidate,
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - 190),
    });
  };

  useEffect(() => {
    const handleDocumentClick = () => {
      setActionMenu(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleDeleteCandidate = async (candidate) => {
    const confirmDelete = window.confirm(
      `Remove ${candidate.name} from candidates?`
    );
    if (confirmDelete) {
      try {
        await candidatesApi.deleteCandidate(candidate.id);
        setCandidatesList((prev) => prev.filter((c) => c.id !== candidate.id));
        triggerToast(`${candidate.name} removed successfully`);
      } catch (err) {
        triggerToast(err.message || 'Failed to remove candidate');
      }
    }
  };

  return (
    <div className="app">
      <Sidebar activePage="candidates" />

      {/* MAIN CONTENT */}
      <main className="main">
        {/* TOP HEADER */}
        <Header
          title="Candidates"
          subtitle="View candidate activity, reviews and ratings."
          showUploadBtn={false}
        />

        <div className="content">
          {/* CANDIDATE STATISTICS */}
          <div className="candidate-stats">
            {/* Total Views */}
            <div className="stat-card">
              <div className="stat-icon views-icon">
                <i className="fa-regular fa-eye"></i>
              </div>
              <div className="stat-content">
                <h3>Total Views</h3>
                <strong>{candidatesList.reduce((acc, c) => acc + parseInt(c.views || 0, 10), 0)}</strong>
                <span className="positive">↑ 0% this month</span>
              </div>
            </div>

            {/* Users Viewed */}
            <div className="stat-card">
              <div className="stat-icon users-icon">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>Users Who Viewed</h3>
                <strong>{candidatesList.length}</strong>
                <span className="positive">↑ 0% this month</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="stat-card">
              <div className="stat-icon reviews-icon">
                <i className="fa-regular fa-star"></i>
              </div>
              <div className="stat-content">
                <h3>Total Reviews</h3>
                <strong>{candidatesList.reduce((acc, c) => acc + parseInt(c.reviews || 0, 10), 0)}</strong>
                <span className="positive">↑ 0% this month</span>
              </div>
            </div>

            {/* Rating */}
            <div className="stat-card">
              <div className="stat-icon rating-icon">
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="stat-content">
                <h3>Average Rating</h3>
                <strong>4.2 / 5</strong>
                <div className="rating-stars">★ ★ ★ ★ ★</div>
              </div>
            </div>
          </div>

          {/* CANDIDATE TABLE */}
          <div className="candidate-table-card">
            {/* Table Header */}
            <div className="table-header">
              <div className="table-title">
                <h2>All Candidates</h2>
                <span className="candidate-count">
                  {filteredCandidates.length}
                </span>
              </div>

              <div className="table-controls">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option>All Roles</option>
                  <option>Frontend Engineer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>UI/UX Designer</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Shortlisted</option>
                  <option>Rejected</option>
                </select>

                <input
                  type="date"
                  title="Select date"
                  onChange={(e) => {
                    if (e.target.value) {
                      triggerToast('Date filter applied: ' + e.target.value);
                    } else {
                      triggerToast('Date filter cleared');
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={handleRunComparison}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: selectedForCompare.length >= 2 ? '#1769ff' : '#f1f5f9',
                    color: selectedForCompare.length >= 2 ? '#ffffff' : '#64748b',
                    border: '1px solid #d9e2ef',
                    transition: 'all .2s ease',
                  }}
                  title={selectedForCompare.length < 2 ? 'Select at least 2 candidates using the checkboxes' : 'Compare selected candidates side-by-side'}
                >
                  <i className="fa-solid fa-code-compare"></i>
                  {isComparing ? 'Comparing...' : `Compare ${selectedForCompare.length > 0 ? `(${selectedForCompare.length})` : ''}`}
                </button>

                <button
                  className="export-btn"
                  type="button"
                  onClick={handleExport}
                >
                  <i className="fa-solid fa-download"></i>
                  Export
                </button>
              </div>
            </div>

            {/* CANDIDATE TABLE */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        title="Select All"
                        checked={filteredCandidates.length > 0 && selectedForCompare.length === filteredCandidates.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForCompare(filteredCandidates.map((c) => c.id));
                          } else {
                            setSelectedForCompare([]);
                          }
                        }}
                      />
                    </th>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Pipeline Stage</th>
                    <th>Views</th>
                    <th>Reviews</th>
                    <th>Average Rating</th>
                    <th>Latest Review</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCandidates.map((c) => (
                    <tr key={c.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(c.id)}
                          onChange={() => handleToggleCompare(c.id)}
                          title={`Select ${c.name} for comparison`}
                        />
                      </td>

                      <td>
                        <div className="candidate-info">
                          <div className={`candidate-avatar ${c.avatarColor}`}>
                            {c.avatar}
                          </div>
                          <div>
                            <strong>{c.name}</strong>
                            <span>{c.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{c.role}</td>

                      <td>
                        <select
                          value={c.currentStage || 'UNDER_REVIEW'}
                          onChange={(e) => handleStageChange(c.id, e.target.value)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '20px',
                            border: '1px solid #d9e2ef',
                            background:
                              c.currentStage === 'SHORTLISTED'
                                ? '#e8f5e9'
                                : c.currentStage === 'INTERVIEW'
                                ? '#e3f2fd'
                                : c.currentStage === 'SELECTED'
                                ? '#ede7f6'
                                : c.currentStage === 'REJECTED'
                                ? '#ffebee'
                                : '#f8fafc',
                            color:
                              c.currentStage === 'SHORTLISTED'
                                ? '#2e7d32'
                                : c.currentStage === 'INTERVIEW'
                                ? '#1565c0'
                                : c.currentStage === 'SELECTED'
                                ? '#6a1b9a'
                                : c.currentStage === 'REJECTED'
                                ? '#c62828'
                                : '#475569',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="UPLOADED">Uploaded</option>
                          <option value="PARSED">Parsed</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="SELECTED">Selected</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      <td>
                        <strong className="views">{c.views}</strong>
                        <small>{c.viewsThisWeek}</small>
                      </td>

                      <td>{c.reviews}</td>

                      <td>
                        <strong>{c.rating}</strong>
                        <div className="stars">
                          {c.stars}
                          <span>{c.starEmpty}</span>
                        </div>
                      </td>

                      <td>
                        <div className="reviewer">
                          <i className="fa-regular fa-user"></i>
                          {c.reviewerName}
                          <small>{c.reviewDate}</small>
                        </div>
                        <p className={`review ${c.reviewClass}`}>
                          {c.reviewText}
                        </p>
                      </td>

                      <td>
                        <button
                          className="view-btn"
                          type="button"
                          onClick={() => setSelectedCandidateModal(c)}
                        >
                          View Details
                        </button>

                        <button
                          className="more-btn"
                          type="button"
                          onClick={(e) => handleMoreClick(e, c)}
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Action Menu dropdown */}
      {actionMenu && (
        <div
          className="candidate-action-menu"
          style={{
            position: 'fixed',
            top: `${actionMenu.top}px`,
            left: `${actionMenu.left}px`,
            width: '180px',
            padding: '6px',
            background: '#152943',
            border: '1px solid #d9e2ef',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,.35)',
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            style={{
              width: '100%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              border: 'none',
              background: 'transparent',
              color: '#d6e0ed',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '12px',
            }}
            onClick={() => {
              setSelectedCandidateModal(actionMenu.candidate);
              setActionMenu(null);
            }}
          >
            <i className="fa-regular fa-user"></i>
            View Profile
          </button>

          <button
            type="button"
            style={{
              width: '100%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              border: 'none',
              background: 'transparent',
              color: '#d6e0ed',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '12px',
            }}
            onClick={() => {
              triggerToast(`Opening reviews for ${actionMenu.candidate.name}`);
              setActionMenu(null);
            }}
          >
            <i className="fa-regular fa-star"></i>
            View Reviews
          </button>

          <button
            type="button"
            style={{
              width: '100%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              border: 'none',
              background: 'transparent',
              color: '#d6e0ed',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '12px',
            }}
            onClick={() => {
              triggerToast(`Opening resume for ${actionMenu.candidate.name}`);
              setActionMenu(null);
            }}
          >
            <i className="fa-regular fa-file-lines"></i>
            View Resume
          </button>

          <button
            type="button"
            className="danger"
            style={{
              width: '100%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              border: 'none',
              background: 'transparent',
              color: '#ff7f8d',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '12px',
            }}
            onClick={() => {
              handleDeleteCandidate(actionMenu.candidate);
              setActionMenu(null);
            }}
          >
            <i className="fa-regular fa-trash-can"></i>
            Remove Candidate
          </button>
        </div>
      )}

      {/* Candidate Modal Overlay */}
      {selectedCandidateModal && (
        <div
          className="candidate-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 11, 24, .72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100000,
          }}
          onClick={() => setSelectedCandidateModal(null)}
        >
          <div
            className="candidate-modal"
            style={{
              position: 'relative',
              width: '500px',
              maxWidth: '100%',
              padding: '28px',
              background: '#ffffff',
              border: '1px solid #d9e2ef',
              borderRadius: '14px',
              boxShadow: '0 25px 70px rgba(0,0,0,.45)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '34px',
                height: '34px',
                border: '1px solid #d9e2ef',
                borderRadius: '7px',
                background: '#ffffff',
                color: '#647084',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCandidateModal(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div
              className="modal-profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '25px',
              }}
            >
              <div
                className="modal-avatar"
                style={{
                  width: '55px',
                  height: '55px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#5e54c8',
                  color: '#ffffff',
                  borderRadius: '50%',
                  fontWeight: 700,
                }}
              >
                {selectedCandidateModal.avatar}
              </div>

              <div>
                <h2
                  style={{
                    color: '#182235',
                    fontSize: '20px',
                    margin: '0 0 5px',
                  }}
                >
                  {selectedCandidateModal.name}
                </h2>
                <p
                  style={{
                    color: '#8497b0',
                    fontSize: '12px',
                    margin: 0,
                  }}
                >
                  {selectedCandidateModal.email}
                </p>
              </div>
            </div>

            <div
              className="modal-details"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '14px',
                  background: '#ffffff',
                  border: '1px solid #d9e2ef',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#647084',
                    fontSize: '10px',
                    marginBottom: '6px',
                  }}
                >
                  Applied Role
                </span>
                <strong style={{ color: '#182235', fontSize: '15px' }}>
                  {selectedCandidateModal.role}
                </strong>
              </div>

              <div
                style={{
                  padding: '14px',
                  background: '#ffffff',
                  border: '1px solid #d9e2ef',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#647084',
                    fontSize: '10px',
                    marginBottom: '6px',
                  }}
                >
                  Total Views
                </span>
                <strong style={{ color: '#182235', fontSize: '15px' }}>
                  {selectedCandidateModal.views}
                </strong>
              </div>

              <div
                style={{
                  padding: '14px',
                  background: '#ffffff',
                  border: '1px solid #d9e2ef',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#647084',
                    fontSize: '10px',
                    marginBottom: '6px',
                  }}
                >
                  Total Reviews
                </span>
                <strong style={{ color: '#182235', fontSize: '15px' }}>
                  {selectedCandidateModal.reviews}
                </strong>
              </div>

              <div
                style={{
                  padding: '14px',
                  background: '#ffffff',
                  border: '1px solid #d9e2ef',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#647084',
                    fontSize: '10px',
                    marginBottom: '6px',
                  }}
                >
                  Average Rating
                </span>
                <strong style={{ color: '#182235', fontSize: '15px' }}>
                  {selectedCandidateModal.rating} / 5
                </strong>
              </div>
            </div>

            <div
              className="modal-rating"
              style={{
                marginTop: '18px',
                padding: '15px',
                background: '#ffffff',
                border: '1px solid #d9e2ef',
                borderRadius: '8px',
              }}
            >
              <span style={{ color: '#647084', fontSize: '11px' }}>
                Candidate Rating
              </span>
              <div
                style={{
                  marginTop: '7px',
                  color: '#ffb000',
                  fontSize: '18px',
                }}
              >
                ★ ★ ★ ★ ★
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                className="modal-resume-btn"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  background: '#1769ff',
                  color: '#ffffff',
                  border: 'none',
                }}
                onClick={() => triggerToast('Opening candidate resume...')}
              >
                <i className="fa-regular fa-file-lines"></i> View Resume
              </button>

              <button
                type="button"
                className="modal-review-btn"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #d9e2ef',
                }}
                onClick={() => triggerToast('Opening candidate reviews...')}
              >
                <i className="fa-regular fa-star"></i> View Reviews
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE COMPARISON MODAL */}
      {compareModalData && (
        <div
          className="candidate-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 14, 28, .75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100000,
          }}
          onClick={() => setCompareModalData(null)}
        >
          <div
            className="candidate-modal"
            style={{
              position: 'relative',
              width: '950px',
              maxWidth: '96vw',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '26px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '34px',
                height: '34px',
                border: '1px solid #d9e2ef',
                borderRadius: '7px',
                background: '#ffffff',
                color: '#647084',
                cursor: 'pointer',
              }}
              onClick={() => setCompareModalData(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: '#eef2ff',
                  color: '#4338ca',
                  fontSize: '11px',
                  fontWeight: '600',
                  marginBottom: '6px',
                }}
              >
                <i className="fa-solid fa-code-compare"></i> Side-by-Side Comparison
              </span>
              <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '4px 0' }}>
                Candidate Cohort Evaluation
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Comparing {compareModalData.comparison.length} candidates against role criteria, verified skills, and experience tenure.
              </p>
            </div>

            {/* Recommendation Highlight Banner */}
            {compareModalData.recommendation && (
              <div
                style={{
                  padding: '14px 18px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#14532d' }}>
                    Top Recommendation
                  </strong>
                  <span style={{ fontSize: '12px', color: '#166534' }}>
                    {compareModalData.recommendation}
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(compareModalData.comparison.length, 3)}, 1fr)`,
                gap: '16px',
              }}
            >
              {compareModalData.comparison.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: c.id === compareModalData.leaderId ? '2px solid #1769ff' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px',
                    background: c.id === compareModalData.leaderId ? '#f8faff' : '#ffffff',
                    position: 'relative',
                  }}
                >
                  {c.id === compareModalData.leaderId && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '16px',
                        background: '#1769ff',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      ★ LEADER
                    </span>
                  )}

                  <h3 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 2px' }}>{c.name}</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                    {c.roleApplied}
                  </span>

                  {/* Metrics Bar */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Match Score</span>
                      <strong style={{ fontSize: '16px', color: '#1769ff' }}>{c.matchScore}%</strong>
                    </div>
                    <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>ATS Score</span>
                      <strong style={{ fontSize: '16px', color: '#059669' }}>{c.atsScore}%</strong>
                    </div>
                  </div>

                  {/* Experience & Stage */}
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Experience:</span>
                      <strong>{c.experienceYears} Years</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Current Stage:</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#e0e7ff',
                          color: '#3730a3',
                        }}
                      >
                        {c.currentStage}
                      </span>
                    </div>
                  </div>

                  {/* Matched Skills */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Verified Competencies:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c.skills.slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '10px',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            background: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Criteria */}
                  {c.missingSkills && c.missingSkills.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#b91c1c', display: 'block', marginBottom: '6px' }}>
                        Missing Criteria:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.missingSkills.slice(0, 3).map((gap, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '10px',
                              padding: '3px 7px',
                              borderRadius: '4px',
                              background: '#fef2f2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                            }}
                          >
                            ! {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Strengths */}
                  {c.strengths && c.strengths.length > 0 && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Key Strength:
                      </span>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                        {c.strengths[0]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                type="button"
                className="cancel-btn"
                style={{ padding: '8px 20px', borderRadius: '7px', cursor: 'pointer' }}
                onClick={() => setCompareModalData(null)}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`toast ${showToast ? 'show' : ''}`}
        id="toast"
        style={{
          position: 'fixed',
          right: '25px',
          bottom: '25px',
          zIndex: 100001,
          minWidth: '260px',
          padding: '13px 17px',
          display: showToast ? 'flex' : 'none',
          alignItems: 'center',
          gap: '10px',
          background: '#152943',
          border: '1px solid #31506f',
          borderRadius: '8px',
          color: '#ffffff',
          boxShadow: '0 10px 35px rgba(0,0,0,.35)',
          fontSize: '12px',
        }}
      >
        <i
          className="fa-solid fa-circle-check"
          style={{ color: '#18bd7e' }}
        ></i>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
