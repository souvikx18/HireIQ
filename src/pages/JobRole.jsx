import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { jobsApi } from '../api/jobs';
import '../css/jobrole.css';

export default function JobRole() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newOpenPositions, setNewOpenPositions] = useState('1');

  const [selectedRoleDetails, setSelectedRoleDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getJobs();
      if (res?.data) {
        setRoles(res.data);
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentFilter('all');
    setExperienceFilter('all');
    setStatusFilter('all');
    triggerToast('Filters have been reset');
  };

  const getRoleIconClass = (name) => {
    const role = name.toLowerCase();
    if (role.includes('data') || role.includes('analyst')) return 'green-role';
    if (role.includes('designer') || role.includes('marketing'))
      return 'orange-role';
    if (role.includes('devops') || role.includes('cloud')) return 'purple-role';
    if (role.includes('security') || role.includes('cyber')) return 'red-role';
    if (role.includes('product')) return 'cyan-role';
    return 'blue-role';
  };

  const getRoleIcon = (name) => {
    const role = name.toLowerCase();
    if (role.includes('data') || role.includes('analyst'))
      return 'fa-solid fa-chart-column';
    if (role.includes('designer'))
      return 'fa-solid fa-mobile-screen-button';
    if (role.includes('marketing')) return 'fa-solid fa-bullhorn';
    if (role.includes('devops') || role.includes('cloud'))
      return 'fa-solid fa-gear';
    if (role.includes('security') || role.includes('cyber'))
      return 'fa-solid fa-shield-halved';
    if (role.includes('product')) return 'fa-solid fa-briefcase';
    return 'fa-solid fa-code';
  };

  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newDepartment) {
      triggerToast('Please enter the required information');
      return;
    }

    try {
      await jobsApi.createJob({
        title: newRoleName.trim(),
        department: newDepartment,
        experienceLevel: newExperience || '2 - 5 years',
        openPositions: parseInt(newOpenPositions, 10) || 1,
        skills: newSkills,
      });

      setModalOpen(false);
      setNewRoleName('');
      setNewDepartment('');
      setNewExperience('');
      setNewSkills('');
      setNewOpenPositions('1');
      triggerToast(`${newRoleName} created successfully`);
      loadRoles();
    } catch (err) {
      triggerToast(err.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (role) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.name}"?`
    );
    if (!confirmed) return;

    try {
      await jobsApi.deleteJob(role.id);
      setRoles(roles.filter((r) => r.id !== role.id));
      triggerToast(`${role.name} deleted successfully`);
    } catch (err) {
      triggerToast(err.message || 'Failed to delete role');
    }
  };

  const filteredRoles = roles.filter((r) => {
    const searchMatch =
      r.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      r.department.toLowerCase().includes(search.toLowerCase().trim());
    const departmentMatch =
      departmentFilter === 'all' || r.departmentVal === departmentFilter;
    const experienceMatch =
      experienceFilter === 'all' ||
      r.experienceVal === experienceFilter ||
      r.experience.toLowerCase().includes(experienceFilter);
    const statusMatch =
      statusFilter === 'all' || r.statusVal === statusFilter;
    return searchMatch && departmentMatch && experienceMatch && statusMatch;
  });

  return (
    <>
      <Sidebar activePage="jobrole" />

      {/* MAIN CONTENT */}
      <main className="main-content jobrole-main">
        <div className="jobroles-page">
          {/* PAGE HEADER */}
          <Header
            title="Job Roles"
            subtitle="Manage all job roles, requirements and track open positions."
          >
            <button
              className="create-role-btn"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i> Create New Role
            </button>
          </Header>

          {/* STATISTICS */}
          <section className="role-stats">
            {/* Total Roles */}
            <div className="stat-card">
              <div className="stat-icon blue-icon">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <div className="stat-content">
                <span>Total Roles</span>
                <strong>{roles.length}</strong>
                <small>All job roles</small>
              </div>
            </div>

            {/* Active Roles */}
            <div className="stat-card">
              <div className="stat-icon green-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="stat-content">
                <span>Active Roles</span>
                <strong>
                  {roles.filter((r) => r.statusVal === 'active').length}
                </strong>
                <small>Currently active</small>
              </div>
            </div>

            {/* Candidates */}
            <div className="stat-card">
              <div className="stat-icon purple-icon">
                <i className="fa-solid fa-user-group"></i>
              </div>
              <div className="stat-content">
                <span>Total Candidates</span>
                <strong>
                  {roles.reduce(
                    (acc, r) => acc + parseInt(r.candidates || 0, 10),
                    0
                  )}
                </strong>
                <small>Across all roles</small>
              </div>
            </div>

            {/* Open Positions */}
            <div className="stat-card">
              <div className="stat-icon orange-icon">
                <i className="fa-regular fa-circle-user"></i>
              </div>
              <div className="stat-content">
                <span>Open Positions</span>
                <strong>32</strong>
                <small>Positions to fill</small>
              </div>
            </div>
          </section>

          {/* JOB ROLES CARD */}
          <section className="roles-card">
            {/* FILTER BAR */}
            <div className="filter-bar">
              {/* Search */}
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  id="roleSearch"
                  placeholder="Search job roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="filter-group">
                <label>Department</label>
                <select
                  id="departmentFilter"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="data-science">Data Science</option>
                  <option value="design">Design</option>
                  <option value="security">Security</option>
                  <option value="marketing">Marketing</option>
                  <option value="product">Product</option>
                </select>
              </div>

              {/* Experience */}
              <div className="filter-group">
                <label>Experience</label>
                <select
                  id="experienceFilter"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                >
                  <option value="all">All Experience</option>
                  <option value="0-2">0 - 2 years</option>
                  <option value="1-3">1 - 3 years</option>
                  <option value="2-5">2 - 5 years</option>
                  <option value="3-6">3 - 6 years</option>
                  <option value="4-7">4 - 7 years</option>
                </select>
              </div>

              {/* Status */}
              <div className="filter-group">
                <label>Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Reset */}
              <button
                type="button"
                className="reset-btn"
                id="resetFilters"
                onClick={handleResetFilters}
              >
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>
            </div>

            {/* TABLE */}
            <div className="table-wrapper">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>Job Role</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Required Skills</th>
                    <th>Candidates</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRoles.map((r) => (
                    <tr
                      key={r.id}
                      data-role={r.name}
                      data-department={r.departmentVal}
                      data-experience={r.experienceVal}
                      data-status={r.statusVal}
                    >
                      <td>
                        <div className="role-info">
                          <div className={`role-icon ${r.iconClass}`}>
                            <i className={r.iconFa}></i>
                          </div>
                          <div>
                            <strong>{r.name}</strong>
                            <span>{r.code}</span>
                          </div>
                        </div>
                      </td>

                      <td>{r.department}</td>

                      <td>{r.experience}</td>

                      <td>
                        <div className="skill-tags">
                          {r.skills.map((s, idx) => (
                            <span key={idx}>{s}</span>
                          ))}
                          {r.extraSkillsCount > 0 && (
                            <span>+{r.extraSkillsCount}</span>
                          )}
                          {r.skills.length === 0 && <span>No skills</span>}
                        </div>
                      </td>

                      <td>
                        <span className="candidate-count">
                          <i className="fa-solid fa-users"></i> {r.candidates}
                        </span>
                      </td>

                      <td>
                        <span className={`status ${r.statusVal}`}>
                          {r.status}
                        </span>
                      </td>

                      <td>{r.createdDate}</td>

                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="action-btn view-btn"
                            title="View"
                            onClick={() => setSelectedRoleDetails(r)}
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>

                          <button
                            type="button"
                            className="action-btn edit-btn"
                            title="Edit"
                            onClick={() => triggerToast(`Editing ${r.name}`)}
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDeleteRole(r)}
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* CREATE ROLE MODAL */}
      {modalOpen && (
        <div
          className="role-modal-overlay show"
          id="roleModal"
          onClick={() => setModalOpen(false)}
        >
          <div className="role-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              id="closeRoleModal"
              onClick={() => setModalOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header">
              <h2>Create New Job Role</h2>
              <p>Add a new role and define its requirements.</p>
            </div>

            <form id="roleForm" onSubmit={handleCreateRoleSubmit}>
              <div className="form-group">
                <label>Job Role</label>
                <input
                  type="text"
                  id="jobRoleName"
                  placeholder="e.g. Full Stack Developer"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    id="jobDepartment"
                    required
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option>Engineering</option>
                    <option>Data Science</option>
                    <option>Design</option>
                    <option>Security</option>
                    <option>Marketing</option>
                    <option>Product</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <select
                    id="jobExperience"
                    required
                    value={newExperience}
                    onChange={(e) => setNewExperience(e.target.value)}
                  >
                    <option value="">Select Experience</option>
                    <option>0 - 2 years</option>
                    <option>1 - 3 years</option>
                    <option>2 - 5 years</option>
                    <option>3 - 6 years</option>
                    <option>4 - 7 years</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Required Skills</label>
                <input
                  type="text"
                  id="jobSkills"
                  placeholder="JavaScript, React, Node.js"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Number of Open Positions</label>
                <input
                  type="number"
                  id="openPositions"
                  min="1"
                  value={newOpenPositions}
                  onChange={(e) => setNewOpenPositions(e.target.value)}
                />
              </div>

              <div className="modal-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  id="cancelRole"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-role-btn">
                  <i className="fa-solid fa-plus"></i> Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE DETAILS OVERLAY */}
      {selectedRoleDetails && (
        <div
          className="role-details-overlay"
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
          onClick={() => setSelectedRoleDetails(null)}
        >
          <div
            className="role-modal role-details-modal"
            style={{
              position: 'relative',
              width: '450px',
              maxWidth: '100%',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close role-details-close"
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
              onClick={() => setSelectedRoleDetails(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header">
              <h2>{selectedRoleDetails.name}</h2>
              <p>Job role details</p>
            </div>

            <div
              className="role-detail-list"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                margin: '20px 0',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  Department
                </span>
                <strong style={{ color: '#1e293b' }}>
                  {selectedRoleDetails.department}
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  Experience
                </span>
                <strong style={{ color: '#1e293b' }}>
                  {selectedRoleDetails.experience}
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  Candidates
                </span>
                <strong style={{ color: '#1e293b' }}>
                  {selectedRoleDetails.candidates}
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  Status
                </span>
                <strong className="detail-active" style={{ color: '#0c8275' }}>
                  Active
                </strong>
              </div>
            </div>

            <div className="modal-form-actions">
              <button
                type="button"
                className="cancel-btn role-details-close-btn"
                onClick={() => setSelectedRoleDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`hireiq-toast ${showToast ? 'show' : ''}`}
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
    </>
  );
}
