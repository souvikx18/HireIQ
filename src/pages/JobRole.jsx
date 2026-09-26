import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { jobsApi } from '../api/jobs';
import { candidatesApi } from '../api/candidates';
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
  const [newPreferredSkills, setNewPreferredSkills] = useState('');
  const [newEducationLevel, setNewEducationLevel] = useState("Bachelor's or equivalent");
  const [newMinExperience, setNewMinExperience] = useState('2');
  const [newOpenPositions, setNewOpenPositions] = useState('1');

  // Edit role states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editPreferredSkills, setEditPreferredSkills] = useState('');
  const [editEducationLevel, setEditEducationLevel] = useState("Bachelor's or equivalent");
  const [editMinExperience, setEditMinExperience] = useState('2');
  const [editOpenPositions, setEditOpenPositions] = useState('1');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  // Role candidate roster & assignment states
  const [selectedRoleDetails, setSelectedRoleDetails] = useState(null);
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [allAvailableCandidates, setAllAvailableCandidates] = useState([]);
  const [selectedCandidateToAssign, setSelectedCandidateToAssign] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

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
      const reqSkills = newSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const prefSkills = newPreferredSkills.split(',').map((s) => s.trim()).filter(Boolean);

      await jobsApi.createJob({
        title: newRoleName,
        department: newDepartment,
        experienceLevel: newExperience,
        openPositions: parseInt(newOpenPositions, 10) || 1,
        minExperience: parseFloat(newMinExperience) || 2,
        educationLevel: newEducationLevel,
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        skills: [...reqSkills, ...prefSkills],
      });

      setModalOpen(false);
      setNewRoleName('');
      setNewDepartment('');
      setNewExperience('');
      setNewSkills('');
      setNewPreferredSkills('');
      setNewEducationLevel("Bachelor's or equivalent");
      setNewMinExperience('2');
      setNewOpenPositions('1');
      triggerToast(`${newRoleName} created successfully with criteria`);
      loadRoles();
    } catch (err) {
      triggerToast(err.message || 'Failed to create role');
    }
  };

  const handleOpenEditModal = (role) => {
    setEditingRoleId(role.id);
    setEditRoleName(role.name || role.title || '');
    setEditDepartment(role.department || '');
    setEditExperience(role.experience || role.experienceLevel || '');
    setEditSkills((role.skills || []).join(', '));
    setEditPreferredSkills((role.preferredSkills || []).join(', '));
    setEditEducationLevel(role.educationLevel || "Bachelor's or equivalent");
    setEditMinExperience(String(role.minExperience ?? 2));
    setEditOpenPositions(String(role.openPositions ?? 1));
    setEditStatus(role.statusVal ? role.statusVal.toUpperCase() : 'ACTIVE');
    setEditModalOpen(true);
  };

  const handleEditRoleSubmit = async (e) => {
    e.preventDefault();
    if (!editRoleName.trim() || !editDepartment) {
      triggerToast('Please enter the required information');
      return;
    }

    try {
      const reqSkills = editSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const prefSkills = editPreferredSkills.split(',').map((s) => s.trim()).filter(Boolean);

      await jobsApi.updateJob(editingRoleId, {
        title: editRoleName.trim(),
        department: editDepartment.trim(),
        experienceLevel: editExperience.trim(),
        openPositions: parseInt(editOpenPositions, 10) || 1,
        minExperience: parseFloat(editMinExperience) || 2,
        educationLevel: editEducationLevel,
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        skills: [...reqSkills, ...prefSkills],
        status: editStatus,
      });

      setEditModalOpen(false);
      triggerToast(`Job role "${editRoleName}" updated successfully`);
      loadRoles();
    } catch (err) {
      triggerToast(err.message || 'Failed to update job role');
    }
  };

  const handleOpenRoleDetails = async (role) => {
    setSelectedRoleDetails(role);
    setLoadingAssigned(true);
    setAssignedCandidates([]);
    setSelectedCandidateToAssign('');
    try {
      const [candRes, allRes] = await Promise.all([
        jobsApi.getJobCandidates(role.id),
        candidatesApi.getCandidates(),
      ]);
      const roleCandidates = Array.isArray(candRes?.data?.candidates)
        ? candRes.data.candidates
        : Array.isArray(candRes?.data)
        ? candRes.data
        : [];
      setAssignedCandidates(roleCandidates);

      const allCands = Array.isArray(allRes?.data?.candidates)
        ? allRes.data.candidates
        : Array.isArray(allRes?.data)
        ? allRes.data
        : [];
      setAllAvailableCandidates(allCands);
    } catch (err) {
      console.error('Failed to load role candidates:', err);
      setAssignedCandidates([]);
    } finally {
      setLoadingAssigned(false);
    }
  };

  const handleAssignCandidateToRole = async () => {
    if (!selectedCandidateToAssign) {
      triggerToast('Please select a candidate to assign');
      return;
    }
    setIsAssigning(true);
    try {
      await candidatesApi.assignJobRole(selectedCandidateToAssign, selectedRoleDetails.id);
      triggerToast(`Candidate assigned to ${selectedRoleDetails?.name || selectedRoleDetails?.title || 'role'}`);
      const [candRes, allRes] = await Promise.all([
        jobsApi.getJobCandidates(selectedRoleDetails.id),
        candidatesApi.getCandidates(),
      ]);
      const roleCandidates = Array.isArray(candRes?.data?.candidates)
        ? candRes.data.candidates
        : Array.isArray(candRes?.data)
        ? candRes.data
        : [];
      setAssignedCandidates(roleCandidates);

      const allCands = Array.isArray(allRes?.data?.candidates)
        ? allRes.data.candidates
        : Array.isArray(allRes?.data)
        ? allRes.data
        : [];
      setAllAvailableCandidates(allCands);
      setSelectedCandidateToAssign('');
      loadRoles();
    } catch (err) {
      triggerToast(err.message || 'Failed to assign candidate');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignCandidate = async (cand) => {
    try {
      await candidatesApi.assignJobRole(cand.id, 'unassigned');
      triggerToast(`${cand.name} unassigned from role`);
      const [candRes, allRes] = await Promise.all([
        jobsApi.getJobCandidates(selectedRoleDetails.id),
        candidatesApi.getCandidates(),
      ]);
      const roleCandidates = Array.isArray(candRes?.data?.candidates)
        ? candRes.data.candidates
        : Array.isArray(candRes?.data)
        ? candRes.data
        : [];
      setAssignedCandidates(roleCandidates);

      const allCands = Array.isArray(allRes?.data?.candidates)
        ? allRes.data.candidates
        : Array.isArray(allRes?.data)
        ? allRes.data
        : [];
      setAllAvailableCandidates(allCands);
      loadRoles();
    } catch (err) {
      triggerToast(err.message || 'Failed to unassign candidate');
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
                            title="View Role & Assigned Candidates"
                            onClick={() => handleOpenRoleDetails(r)}
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>

                          <button
                            type="button"
                            className="action-btn edit-btn"
                            title="Edit Role Requirements"
                            onClick={() => handleOpenEditModal(r)}
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
                <label>Required Skills (Mandatory Criteria)</label>
                <input
                  type="text"
                  id="jobSkills"
                  placeholder="e.g. JavaScript, React, Node.js, SQL"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Preferred Skills (Bonus Criteria)</label>
                <input
                  type="text"
                  id="jobPreferredSkills"
                  placeholder="e.g. Docker, AWS, TypeScript, GraphQL"
                  value={newPreferredSkills}
                  onChange={(e) => setNewPreferredSkills(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newMinExperience}
                    onChange={(e) => setNewMinExperience(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Education Requirement</label>
                  <select
                    value={newEducationLevel}
                    onChange={(e) => setNewEducationLevel(e.target.value)}
                  >
                    <option value="Bachelor's or equivalent">Bachelor's or equivalent</option>
                    <option value="Master's / Advanced Degree">Master's / Advanced Degree</option>
                    <option value="Associate / Technical Degree">Associate / Technical Degree</option>
                    <option value="Any / Experience Equivalent">Any / Experience Equivalent</option>
                  </select>
                </div>
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

      {/* EDIT ROLE MODAL */}
      {editModalOpen && (
        <div
          className="role-modal-overlay show"
          id="editRoleModal"
          onClick={() => setEditModalOpen(false)}
        >
          <div className="role-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              id="closeEditRoleModal"
              onClick={() => setEditModalOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header">
              <h2>Edit Job Role Criteria</h2>
              <p>Modify role requirements, required skills, and hiring targets.</p>
            </div>

            <form id="editRoleForm" onSubmit={handleEditRoleSubmit}>
              <div className="form-group">
                <label>Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    required
                  >
                    <option value="">Select Experience</option>
                    <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                    <option value="Mid Level (2-5 yrs)">Mid Level (2-5 yrs)</option>
                    <option value="Senior Level (5+ yrs)">Senior Level (5+ yrs)</option>
                    <option value="Lead / Principal">Lead / Principal</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Open Positions</label>
                  <input
                    type="number"
                    min="1"
                    value={editOpenPositions}
                    onChange={(e) => setEditOpenPositions(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Required Skills (Must have, comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
                  required
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Preferred Skills (Bonus / nice to have, comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Docker, GraphQL, Kubernetes, Redis"
                  value={editPreferredSkills}
                  onChange={(e) => setEditPreferredSkills(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editMinExperience}
                    onChange={(e) => setEditMinExperience(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Education Level</label>
                  <select
                    value={editEducationLevel}
                    onChange={(e) => setEditEducationLevel(e.target.value)}
                  >
                    <option value="Bachelor's or equivalent">Bachelor's or equivalent</option>
                    <option value="Master's / Advanced Degree">Master's / Advanced Degree</option>
                    <option value="Associate / Technical Degree">Associate / Technical Degree</option>
                    <option value="Any / Experience Equivalent">Any / Experience Equivalent</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-role-btn">
                  <i className="fa-solid fa-check"></i> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE DETAILS & CANDIDATES ROSTER OVERLAY */}
      {selectedRoleDetails && (
        <div
          className="role-details-overlay"
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
          onClick={() => setSelectedRoleDetails(null)}
        >
          <div
            className="role-modal role-details-modal"
            style={{
              position: 'relative',
              width: '820px',
              maxWidth: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              borderRadius: '14px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close role-details-close"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                fontSize: '13px',
              }}
              onClick={() => setSelectedRoleDetails(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Header */}
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                  {selectedRoleDetails?.name || selectedRoleDetails?.title || 'Job Role'}
                </h2>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                  }}
                >
                  {selectedRoleDetails?.code || 'ROLE'}
                </span>
                <span
                  className={`status ${selectedRoleDetails?.statusVal || 'active'}`}
                  style={{ fontSize: '10.5px', padding: '3px 9px', borderRadius: '12px' }}
                >
                  {selectedRoleDetails?.status || 'Active'}
                </span>
              </div>
              <p style={{ fontSize: '12px', marginTop: '3px' }}>
                Role specifications and candidates assigned to this field
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div
              className="role-detail-list"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                margin: '14px 0 18px 0',
              }}
            >
              <div className="role-meta-box">
                <span>Department</span>
                <strong>{selectedRoleDetails?.department || 'General'}</strong>
              </div>

              <div className="role-meta-box">
                <span>Experience</span>
                <strong>{selectedRoleDetails?.experience || 'All'}</strong>
              </div>

              <div className="role-meta-box">
                <span>Open Positions</span>
                <strong>{selectedRoleDetails?.openPositions || 1}</strong>
              </div>

              <div className="role-meta-box highlight">
                <span>Assigned Candidates</span>
                <strong>
                  {loadingAssigned ? '...' : (Array.isArray(assignedCandidates) ? assignedCandidates.length : 0)}
                </strong>
              </div>
            </div>

            {/* Required & Preferred Skills */}
            <div className="role-criteria-box">
              <div className="role-criteria-title">
                Required Skill Criteria
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(selectedRoleDetails?.skills || []).map((s, idx) => (
                  <span key={idx} className="role-skill-badge">
                    {s}
                  </span>
                ))}
                {(!selectedRoleDetails?.skills || selectedRoleDetails.skills.length === 0) && (
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>No criteria specified</span>
                )}
              </div>
            </div>

            {/* ASSIGNED CANDIDATES ROSTER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-users-viewfinder" style={{ color: '#2563eb' }}></i>
                  Assigned Candidates Roster ({Array.isArray(assignedCandidates) ? assignedCandidates.length : 0})
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Real-time pipeline tracking for this role
                </span>
              </div>

              {loadingAssigned ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Loading assigned candidates...
                </div>
              ) : (!Array.isArray(assignedCandidates) || assignedCandidates.length === 0) ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  <i className="fa-solid fa-user-clock" style={{ fontSize: '24px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}></i>
                  No candidates currently assigned to this role.
                  <br />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Select a candidate below to assign them to this position.
                  </span>
                </div>
              ) : (
                <div className="role-table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Candidate</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Stage</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Match Score</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>ATS Score</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(assignedCandidates) ? assignedCandidates : []).map((cand) => (
                        <tr key={cand.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <div className="role-cand-name" style={{ fontWeight: '600' }}>{cand.name}</div>
                            <div className="role-cand-email" style={{ fontSize: '10.5px' }}>{cand.email}</div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                padding: '2px 7px',
                                borderRadius: '12px',
                                fontSize: '9.5px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                background:
                                  cand.currentStage === 'SHORTLISTED'
                                    ? '#dcfce7'
                                    : cand.currentStage === 'INTERVIEW'
                                    ? '#dbeafe'
                                    : cand.currentStage === 'SELECTED'
                                    ? '#f3e8ff'
                                    : cand.currentStage === 'REJECTED'
                                    ? '#fee2e2'
                                    : '#f1f5f9',
                                color:
                                  cand.currentStage === 'SHORTLISTED'
                                    ? '#15803d'
                                    : cand.currentStage === 'INTERVIEW'
                                    ? '#1d4ed8'
                                    : cand.currentStage === 'SELECTED'
                                    ? '#7e22ce'
                                    : cand.currentStage === 'REJECTED'
                                    ? '#b91c1c'
                                    : '#475569',
                              }}
                            >
                              {(cand.currentStage || 'Screening').replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <strong style={{ color: (cand.matchScore || 85) >= 80 ? '#16a34a' : '#d97706' }}>
                              {cand.matchScore ? `${cand.matchScore}%` : '85%'}
                            </strong>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <strong style={{ color: '#2563eb' }}>
                              {cand.atsScore || 90}
                            </strong>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleUnassignCandidate(cand)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                border: '1px solid #fecdd3',
                                borderRadius: '6px',
                                background: '#fff1f2',
                                color: '#be123c',
                                fontSize: '10.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                              title="Unassign candidate from this role"
                            >
                              <i className="fa-solid fa-user-minus"></i> Unassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* QUICK ASSIGN TOOL */}
            <div className="role-assign-box">
              <div className="role-assign-title">
                <i className="fa-solid fa-user-plus" style={{ color: '#16a34a' }}></i>
                Assign Candidate to this Role
              </div>
              <p className="role-assign-desc">
                Assign an unassigned applicant or transfer an active candidate directly to {selectedRoleDetails?.name || selectedRoleDetails?.title || 'this role'}.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedCandidateToAssign}
                  onChange={(e) => setSelectedCandidateToAssign(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '7px 11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                  }}
                >
                  <option value="">Select Candidate to Assign...</option>
                  {(Array.isArray(allAvailableCandidates) ? allAvailableCandidates : [])
                    .filter((c) => c && c.jobRoleId !== selectedRoleDetails?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email}) — Current Role: {c.role || c.roleApplied || 'Unassigned'}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  disabled={!selectedCandidateToAssign || isAssigning}
                  onClick={handleAssignCandidateToRole}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedCandidateToAssign ? '#16a34a' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    cursor: selectedCandidateToAssign ? 'pointer' : 'not-allowed',
                  }}
                >
                  <i className="fa-solid fa-check"></i>
                  {isAssigning ? 'Assigning...' : 'Assign to Role'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="action-btn edit-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const roleToEdit = selectedRoleDetails;
                  setSelectedRoleDetails(null);
                  handleOpenEditModal(roleToEdit);
                }}
              >
                <i className="fa-regular fa-pen-to-square"></i> Edit Role Criteria
              </button>

              <button
                type="button"
                className="cancel-btn role-details-close-btn"
                onClick={() => setSelectedRoleDetails(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
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
