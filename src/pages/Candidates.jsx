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
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

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
                    <th>Candidate</th>
                    <th>Role</th>
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
