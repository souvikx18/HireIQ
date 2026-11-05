import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/auth.js';
import { adminApi } from '../api/admin.js';
import { skillsApi } from '../api/skills.js';
import { usePageSEO } from '../hooks/usePageSEO';
import '../css/setting.css';

export default function Setting() {
  usePageSEO({
    title: 'Account & Organization Settings | HireIQ',
    description: 'Manage profile preferences, password security, notification channels, integrations, and administrative controls.',
  });

  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [healthData, setHealthData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('all');
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );
  const [fullName, setFullName] = useState(() => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    return 'HR Manager';
  });
  const [email, setEmail] = useState(() => user?.email || 'hrmanager@hireiq.com');
  const [role, setRole] = useState(() => user?.role || 'Administrator');
  const [photo, setPhoto] = useState(() => user?.avatarUrl || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(
    () => user?.emailNotifications ?? true
  );
  const [hiringUpdates, setHiringUpdates] = useState(
    () => user?.hiringUpdates ?? true
  );
  const [candidateUpdates, setCandidateUpdates] = useState(
    () => user?.candidateUpdates ?? true
  );
  const [interviewReminders, setInterviewReminders] = useState(
    () => user?.interviewReminders ?? true
  );

  const [toastMessage, setToastMessage] = useState('Changes saved successfully.');
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'HR Manager');
      setEmail(user.email || 'hrmanager@hireiq.com');
      setRole(user.role || 'Administrator');
      if (user.avatarUrl) setPhoto(user.avatarUrl);
      if (typeof user.emailNotifications === 'boolean') setEmailNotifications(user.emailNotifications);
      if (typeof user.hiringUpdates === 'boolean') setHiringUpdates(user.hiringUpdates);
      if (typeof user.candidateUpdates === 'boolean') setCandidateUpdates(user.candidateUpdates);
      if (typeof user.interviewReminders === 'boolean') setInterviewReminders(user.interviewReminders);
    }
  }, [user]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Company Skills Benchmark Management
  const [skillsList, setSkillsList] = useState([]);
  const [skillStats, setSkillStats] = useState({
    totalSkills: 0,
    mandatoryCount: 0,
    avgBenchmark: 75,
    categoryCounts: {},
  });
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillFilter, setSkillFilter] = useState('all');
  const [skillSearch, setSkillSearch] = useState('');
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'TECHNICAL',
    requiredBenchmark: 75,
    isCompanyRequired: true,
    importance: 'HIGH',
    description: '',
  });
  const [tempBenchmark, setTempBenchmark] = useState({});

  const loadSkills = async () => {
    setSkillsLoading(true);
    try {
      const res = await skillsApi.getSkills({
        search: skillSearch,
        category: skillFilter,
      });
      if (res?.data) {
        setSkillsList(res.data.skills || []);
        if (res.data.stats) setSkillStats(res.data.stats);
      }
    } catch {
      triggerToast('Failed to load company skill benchmarks');
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'criteria') {
      loadSkills();
    }
  }, [activeTab, skillFilter]);

  const handleCreateSkill = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newSkill.name.trim()) {
      triggerToast('Skill name is required');
      return;
    }
    try {
      await skillsApi.createSkill(newSkill);
      triggerToast(`Added ${newSkill.name} to company hiring criteria`);
      setNewSkill({
        name: '',
        category: 'TECHNICAL',
        requiredBenchmark: 75,
        isCompanyRequired: true,
        importance: 'HIGH',
        description: '',
      });
      loadSkills();
    } catch (err) {
      triggerToast(err.message || 'Failed to add skill requirement');
    }
  };

  const handleBenchmarkSliderChange = (skillId, val) => {
    const num = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
    setTempBenchmark((prev) => ({ ...prev, [skillId]: num }));
    setSkillsList((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, requiredBenchmark: num } : s))
    );
  };

  const handleSaveSkillBenchmark = async (skill) => {
    try {
      const benchmarkVal =
        tempBenchmark[skill.id] !== undefined
          ? tempBenchmark[skill.id]
          : skill.requiredBenchmark;
      await skillsApi.updateSkill(skill.id, {
        requiredBenchmark: benchmarkVal,
        isCompanyRequired: skill.isCompanyRequired,
        importance: skill.importance,
        description: skill.description,
      });
      triggerToast(`Updated ${skill.name} requirement benchmark to ${benchmarkVal}%`);
      loadSkills();
    } catch (err) {
      triggerToast(err.message || 'Failed to update benchmark');
    }
  };

  const handleToggleRequired = async (skill) => {
    try {
      const updatedRequired = !skill.isCompanyRequired;
      await skillsApi.updateSkill(skill.id, {
        isCompanyRequired: updatedRequired,
      });
      setSkillsList((prev) =>
        prev.map((s) =>
          s.id === skill.id ? { ...s, isCompanyRequired: updatedRequired } : s
        )
      );
      triggerToast(
        `${skill.name} marked as ${updatedRequired ? 'MANDATORY requirement' : 'PREFERRED bonus'}`
      );
      loadSkills();
    } catch (err) {
      triggerToast(err.message || 'Failed to update requirement status');
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Remove ${skillName} from company hiring benchmarks?`)) return;
    try {
      await skillsApi.deleteSkill(skillId);
      triggerToast(`Removed ${skillName} from company criteria`);
      loadSkills();
    } catch (err) {
      triggerToast(err.message || 'Failed to delete skill');
    }
  };

  const getCategoryMeta = (cat) => {
    switch (cat?.toUpperCase()) {
      case 'TECHNICAL':
        return { label: 'Technical Skills', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
      case 'TOOLS':
        return { label: 'Tools & Cloud', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
      case 'SOFT':
      case 'SOFT_SKILLS':
        return { label: 'Soft Skills', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
      case 'DOMAIN':
        return { label: 'Domain Knowledge', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
      default:
        return { label: cat || 'General', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' };
    }
  };

  const handleExportCriteriaCSV = () => {
    if (!skillsList || skillsList.length === 0) {
      triggerToast('No criteria data available to export.');
      return;
    }
    const headers = ['Skill Name', 'Category', 'Importance', 'Required Benchmark (%)', 'Mandatory For Hire', 'Evaluation Criteria'];
    const rows = skillsList.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${getCategoryMeta(s.category).label}"`,
      `"${s.importance || 'HIGH'}"`,
      s.requiredBenchmark || 70,
      s.isCompanyRequired ? 'MANDATORY' : 'PREFERRED',
      `"${(s.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hireiq_company_hiring_benchmarks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Company hiring criteria exported as CSV.');
  };

  const handleSyncWithRoles = async () => {
    try {
      await skillsApi.seedDefaultSkills();
      triggerToast('Hiring criteria synchronized with active role standards');
      loadSkills();
    } catch {
      triggerToast('Failed to synchronize role standards');
    }
  };

  const loadAdminData = async () => {
    setLoadingAdmin(true);
    try {
      const [healthRes, logsRes, usersRes] = await Promise.all([
        adminApi.getHealth().catch(() => null),
        adminApi.getAuditLogs({ search: logSearch }).catch(() => null),
        adminApi.getUsers().catch(() => null),
      ]);
      if (healthRes?.data) setHealthData(healthRes.data);
      if (logsRes?.data?.logs) setAuditLogs(logsRes.data.logs);
      if (usersRes?.data) setUsersList(usersRes.data);
    } catch {
      triggerToast('Failed to load admin telemetry');
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      loadAdminData();
    }
  }, [activeTab]);

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await adminApi.updateUserRole(targetUserId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      triggerToast(`User role updated to ${newRole}`);
      loadAdminData();
    } catch (err) {
      triggerToast(err.message || 'Failed to update user role');
    }
  };

  const formatAuditAction = (action) => {
    switch (action) {
      case 'CANDIDATE_STAGE_UPDATE':
        return {
          label: 'Stage Updated',
          icon: 'fa-solid fa-user-pen',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
        };
      case 'RESUME_UPLOAD_EVALUATED':
        return {
          label: 'Resume Evaluated',
          icon: 'fa-solid fa-file-shield',
          color: '#059669',
          bg: '#ecfdf5',
          border: '#a7f3d0',
        };
      case 'CREATE_SKILL_BENCHMARK':
        return {
          label: 'Criteria Added',
          icon: 'fa-solid fa-plus',
          color: '#7c3aed',
          bg: '#f5f3ff',
          border: '#ddd6fe',
        };
      case 'UPDATE_SKILL_BENCHMARK':
        return {
          label: 'Benchmark Updated',
          icon: 'fa-solid fa-sliders',
          color: '#d97706',
          bg: '#fffbeb',
          border: '#fde68a',
        };
      case 'DELETE_SKILL_BENCHMARK':
        return {
          label: 'Criteria Removed',
          icon: 'fa-solid fa-trash-can',
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#fecaca',
        };
      case 'SYNC_COMPANY_CRITERIA':
        return {
          label: 'Criteria Synced',
          icon: 'fa-solid fa-arrows-rotate',
          color: '#0891b2',
          bg: '#ecfeff',
          border: '#a5f3fc',
        };
      case 'USER_ROLE_CHANGED':
        return {
          label: 'Role Changed',
          icon: 'fa-solid fa-shield-halved',
          color: '#4f46e5',
          bg: '#eef2ff',
          border: '#c7d2fe',
        };
      default:
        return {
          label: action?.replace(/_/g, ' ') || 'Event',
          icon: 'fa-solid fa-circle-info',
          color: '#475569',
          bg: '#f8fafc',
          border: '#e2e8f0',
        };
    }
  };

  const formatAuditDetails = (log) => {
    if (!log.details) return 'System automated event completed successfully.';
    let parsed = null;
    try {
      parsed = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
    } catch {
      return String(log.details);
    }

    if (log.action === 'CANDIDATE_STAGE_UPDATE') {
      const name = parsed.candidateName || 'Candidate';
      const stage = parsed.newStage || parsed.newStatus || 'Updated';
      const role = parsed.roleAssigned ? ` (${parsed.roleAssigned})` : '';
      return `${name} moved to stage ${stage}${role}`;
    }

    if (log.action === 'RESUME_UPLOAD_EVALUATED') {
      const name = parsed.candidateName || 'Candidate';
      const role = parsed.targetRole ? ` for ${parsed.targetRole}` : '';
      const score = parsed.matchScore ? ` (${parsed.matchScore}% match)` : '';
      return `${name} resume analyzed${role}${score}`;
    }

    if (log.action === 'SYNC_COMPANY_CRITERIA') {
      return `Synchronized ${parsed.syncedCount || 14} role benchmarks with company policy`;
    }

    if (log.action === 'CREATE_SKILL_BENCHMARK') {
      return `Configured ${parsed.name} with ${parsed.requiredBenchmark}% threshold`;
    }

    if (log.action === 'UPDATE_SKILL_BENCHMARK') {
      const parts = [];
      if (parsed.requiredBenchmark !== undefined) parts.push(`threshold: ${parsed.requiredBenchmark}%`);
      if (parsed.isCompanyRequired !== undefined) parts.push(`mandatory: ${parsed.isCompanyRequired ? 'Yes' : 'No'}`);
      return `Updated benchmark properties: ${parts.join(', ') || 'saved'}`;
    }

    if (log.action === 'USER_ROLE_CHANGED') {
      return `Assigned role ${parsed.newRole} to ${parsed.targetEmail || 'user'}`;
    }

    return Object.entries(parsed)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' • ');
  };

  const handleExportAuditLogsCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      triggerToast('No audit records available to export.');
      return;
    }
    const headers = ['Timestamp', 'Actor', 'Event Type', 'Resource', 'Status', 'Event Summary', 'IP Address'];
    const rows = auditLogs.map((l) => [
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.actorEmail || l.user?.email || 'system'}"`,
      `"${l.action || ''}"`,
      `"${l.resource || ''}"`,
      `"${l.status || 'SUCCESS'}"`,
      `"${(formatAuditDetails(l) || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hireiq_security_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Security audit trail exported successfully.');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (newPassword || confirmPassword) {
        if (!currentPassword) {
          triggerToast('Please enter your current password.');
          setSaving(false);
          return;
        }
        if (newPassword.length < 8) {
          triggerToast('New password must be at least 8 characters.');
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          triggerToast('New passwords do not match.');
          setSaving(false);
          return;
        }

        await authApi.changePassword({ currentPassword, newPassword });
      }

      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || 'User';
      const lastName = parts.slice(1).join(' ') || '';

      const res = await authApi.updateProfile({
        firstName,
        lastName,
        role,
        avatarUrl: photo,
        emailNotifications,
        hiringUpdates,
        candidateUpdates,
        interviewReminders,
      });

      if (res?.data) {
        updateUser(res.data);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Changes saved successfully.');
    } catch (err) {
      triggerToast(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'HR Manager');
      setEmail(user.email || 'hrmanager@hireiq.com');
      setRole(user.role || 'Administrator');
      setPhoto(user.avatarUrl || '');
      setEmailNotifications(user.emailNotifications ?? true);
      setHiringUpdates(user.hiringUpdates ?? true);
      setCandidateUpdates(user.candidateUpdates ?? true);
      setInterviewReminders(user.interviewReminders ?? true);
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('Changes cancelled.');
  };

  return (
    <>
      <Sidebar activePage="setting" />

      {/* MAIN CONTENT */}
      <main className="main-content setting-main">
        {/* SETTINGS CONTENT */}
        <div className="settings-page">
          {/* Page Heading */}
          <Header
            title="Settings"
            subtitle="Manage your account, preferences and system settings."
            showProfile={false}
          />

          {/* TAB NAVIGATION (Hidden for Candidates, active for HR/Admin) */}
          {user?.role !== 'CANDIDATE' && (
            <div className="setting-tabs-bar">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`setting-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-user-gear"></i> Account & Preferences
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('criteria')}
                className={`setting-tab-btn ${activeTab === 'criteria' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-sliders"></i> Company Hiring Criteria & Benchmarks
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`setting-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-shield-halved"></i> Admin Security & Audit Center
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <>
              {/* SETTINGS GRID */}
              <div className="settings-grid">
            {/* PROFILE SETTINGS */}
            <section className="settings-card profile-card">
              <div className="card-title">
                <div className="title-icon blue">
                  <i className="fa-regular fa-user"></i>
                </div>
                <h2>Profile Settings</h2>
              </div>

              <div className="profile-content">
                {/* Profile Photo */}
                <div className="profile-photo-section">
                  <div
                    className="large-avatar"
                    style={
                      photo
                        ? {
                            backgroundImage: `url(${photo})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {}
                    }
                  >
                    {!photo && 'HR'}
                  </div>

                  <button
                    type="button"
                    className="change-photo-btn"
                    id="changePhotoBtn"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <i className="fa-solid fa-upload"></i> Change Photo
                  </button>

                  <input
                    type="file"
                    id="photoInput"
                    ref={photoInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* Profile Fields */}
                <div className="profile-fields">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={user?.role === 'CANDIDATE'}
                    >
                      {user?.role === 'CANDIDATE' ? (
                        <option value="CANDIDATE">Candidate / Job Seeker</option>
                      ) : (
                        <>
                          <option value="Administrator">Administrator</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="Recruiter">Recruiter</option>
                          <option value="Hiring Manager">Hiring Manager</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ACCOUNT SETTINGS */}
            <section className="settings-card account-card">
              <div className="card-title">
                <div className="title-icon green">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h2>Account Settings</h2>
              </div>

              <div className="account-content">
                <h3>Change Password</h3>

                {/* Current Password */}
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-input">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      placeholder="••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      data-target="currentPassword"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      <i
                        className={`fa-regular fa-eye${showCurrentPassword ? '-slash' : ''}`}
                      ></i>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="password-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-input">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        placeholder="••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        data-target="newPassword"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i
                          className={`fa-regular fa-eye${showNewPassword ? '-slash' : ''}`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        data-target="confirmPassword"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <i
                          className={`fa-regular fa-eye${showConfirmPassword ? '-slash' : ''}`}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Notification */}
                <div className="setting-toggle-row">
                  <div>
                    <strong>Email Notifications</strong>
                    <p>Receive important updates and alerts via email.</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* APPEARANCE */}
            <section className="settings-card appearance-card">
              <div className="card-title">
                <div className="title-icon purple">
                  <i className="fa-solid fa-desktop"></i>
                </div>
                <h2>Appearance</h2>
              </div>

              <div className="appearance-content">
                <div className="theme-heading">
                  <strong>Theme</strong>
                  <span>Choose your preferred theme</span>
                </div>

                <div className="theme-options">
                  {/* Light */}
                  <button
                    type="button"
                    className={`theme-option ${theme === 'light' ? 'selected' : ''}`}
                    data-theme="light"
                    id="lightTheme"
                    onClick={() => handleThemeChange('light')}
                  >
                    <span className="theme-radio"></span>
                    <i className="fa-regular fa-sun"></i>
                    <strong>Light Mode</strong>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    className={`theme-option ${theme === 'dark' ? 'selected' : ''}`}
                    data-theme="dark"
                    id="darkTheme"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <span className="theme-radio"></span>
                    <i className="fa-regular fa-moon"></i>
                    <strong>Dark Mode</strong>
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* SAVE ACTIONS */}
          <div className="settings-actions">
            <button
              type="button"
              className="save-btn"
              id="saveChangesBtn"
              disabled={saving}
              onClick={handleSave}
            >
              <i className="fa-regular fa-floppy-disk"></i> {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              className="cancel-btn"
              id="cancelBtn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
            </>
          )}

          {activeTab === 'criteria' && (
            <div className="criteria-console-view">
              {/* BENCHMARK OVERVIEW KPI CARDS */}
              <div className="setting-kpi-grid">
                <div className="setting-kpi-card">
                  <span className="kpi-label">Tracked Skills</span>
                  <div className="kpi-val-row">
                    <i className="fa-solid fa-layer-group" style={{ color: '#2869e8', fontSize: '15px' }}></i>
                    <strong className="kpi-val">{skillStats.totalSkills}</strong>
                  </div>
                  <small className="kpi-sub">Company criteria library</small>
                </div>

                <div className="setting-kpi-card">
                  <span className="kpi-label">Mandatory For Hire</span>
                  <div className="kpi-val-row">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '15px' }}></i>
                    <strong className="kpi-val" style={{ color: '#10b981' }}>{skillStats.mandatoryCount}</strong>
                  </div>
                  <small className="kpi-sub">Must-have competencies</small>
                </div>

                <div className="setting-kpi-card">
                  <span className="kpi-label">Avg Benchmark Target</span>
                  <div className="kpi-val-row">
                    <i className="fa-solid fa-chart-line" style={{ color: '#8b5cf6', fontSize: '15px' }}></i>
                    <strong className="kpi-val" style={{ color: '#8b5cf6' }}>{skillStats.avgBenchmark}%</strong>
                  </div>
                  <small className="kpi-sub">Company passing threshold</small>
                </div>

                <div className="setting-kpi-card">
                  <span className="kpi-label">Criteria Governance</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={handleExportCriteriaCSV}
                      className="kpi-action-btn"
                      title="Export company benchmark criteria policy as CSV"
                    >
                      <i className="fa-solid fa-file-arrow-down"></i> Export Criteria CSV
                    </button>
                    <button
                      type="button"
                      onClick={handleSyncWithRoles}
                      className="kpi-action-btn"
                      style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
                      title="Sync benchmarks with requirements from active job roles"
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Sync Role Standards
                    </button>
                  </div>
                  <small className="kpi-sub" style={{ textAlign: 'center' }}>Aligned with active job roles</small>
                </div>
              </div>

              {/* ADD NEW SKILL CRITERION CARD */}
              <div className="setting-section-card">
                <div className="setting-section-header">
                  <div className="setting-icon-badge">
                    <i className="fa-solid fa-bullseye"></i>
                  </div>
                  <div>
                    <h3>Add Company Skill Benchmark & Hiring Requirement</h3>
                    <p>Define what skills are required for hiring and how much proficiency is expected.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSkill}>
                  <div className="setting-form-row-3">
                    <div>
                      <label className="setting-label">
                        Skill Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Docker, Python, System Design, SQL"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        required
                        className="setting-control"
                      />
                    </div>

                    <div>
                      <label className="setting-label">
                        Category
                      </label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="setting-control"
                      >
                        <option value="TECHNICAL">Technical Skills</option>
                        <option value="TOOLS">Tools & Frameworks</option>
                        <option value="SOFT">Soft Skills</option>
                        <option value="DOMAIN">Domain Knowledge</option>
                      </select>
                    </div>

                    <div>
                      <label className="setting-label">
                        Importance Level
                      </label>
                      <select
                        value={newSkill.importance}
                        onChange={(e) => setNewSkill({ ...newSkill, importance: e.target.value })}
                        className="setting-control"
                      >
                        <option value="CRITICAL">Critical (Must-Have)</option>
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low / Preferred</option>
                      </select>
                    </div>
                  </div>

                  <div className="setting-form-row-2">
                    <div className="setting-box">
                      <div className="setting-box-header">
                        <span style={{ fontSize: '11.5px', fontWeight: '600' }}>Required Benchmark Threshold (%):</span>
                        <strong className="setting-benchmark-badge">
                          {newSkill.requiredBenchmark}% Required
                        </strong>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={newSkill.requiredBenchmark}
                        onChange={(e) => setNewSkill({ ...newSkill, requiredBenchmark: parseInt(e.target.value, 10) })}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <small>
                        Candidates scoring below this proficiency will trigger an evaluation gap.
                      </small>
                    </div>

                    <div className="setting-checkbox-box">
                      <input
                        type="checkbox"
                        id="isCompanyRequired"
                        checked={newSkill.isCompanyRequired}
                        onChange={(e) => setNewSkill({ ...newSkill, isCompanyRequired: e.target.checked })}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isCompanyRequired" className="setting-checkbox-label">
                        Mandatory For Hiring
                        <span>Candidates without this skill are flagged as unqualified</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label className="setting-label">
                      Evaluation Criteria & Minimum Expectations (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Must have hands-on production experience designing scalable APIs and optimizing SQL queries"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                      className="setting-control"
                    />
                  </div>

                  <button
                    type="submit"
                    className="setting-submit-btn"
                  >
                    <i className="fa-solid fa-plus"></i> Add Skill Benchmark Requirement
                  </button>
                </form>
              </div>

              {/* COMPANY CRITERIA LIST & INLINE BENCHMARK EDITOR */}
              <div className="setting-section-card">
                <div className="setting-section-header between">
                  <div>
                    <h3>Company Skill Benchmarks & Thresholds</h3>
                    <p>
                      Directly edit how much proficiency is required per skill. Changes immediately impact candidate scoring and gap analysis.
                    </p>
                  </div>

                  {/* SEARCH & FILTER */}
                  <div className="setting-filter-bar">
                    <input
                      type="text"
                      placeholder="Search company skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadSkills()}
                      className="setting-filter-input"
                      style={{ width: '180px' }}
                    />

                    <select
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      className="setting-filter-select"
                    >
                      <option value="all">All Categories</option>
                      <option value="TECHNICAL">Technical Skills</option>
                      <option value="TOOLS">Tools & Frameworks</option>
                      <option value="SOFT">Soft Skills</option>
                      <option value="DOMAIN">Domain Knowledge</option>
                    </select>

                    <button
                      type="button"
                      onClick={loadSkills}
                      className="setting-refresh-btn"
                    >
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>
                  </div>
                </div>

                {/* SKILLS TABLE WITH INLINE BENCHMARK SLIDERS */}
                <div className="setting-table-wrap">
                  <table className="setting-table">
                    <thead>
                      <tr>
                        <th style={{ width: '24%' }}>Skill Name</th>
                        <th style={{ width: '18%' }}>Category</th>
                        <th style={{ width: '14%' }}>Status</th>
                        <th style={{ width: '30%' }}>Required Benchmark (%)</th>
                        <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skillsList.length > 0 ? (
                        skillsList.map((skill) => {
                          const currentVal =
                            tempBenchmark[skill.id] !== undefined
                              ? tempBenchmark[skill.id]
                              : skill.requiredBenchmark || 70;
                          const hasUnsavedChanges =
                            tempBenchmark[skill.id] !== undefined &&
                            tempBenchmark[skill.id] !== skill.requiredBenchmark;
                          const catMeta = getCategoryMeta(skill.category);

                          return (
                            <tr key={skill.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong>{skill.name}</strong>
                                  <span
                                    className={`setting-importance-badge ${
                                      skill.importance === 'CRITICAL'
                                        ? 'critical'
                                        : skill.importance === 'HIGH'
                                        ? 'high'
                                        : 'medium'
                                    }`}
                                  >
                                    {skill.importance || 'HIGH'}
                                  </span>
                                </div>
                                {skill.description && (
                                  <small style={{ display: 'block', marginTop: '2px' }}>
                                    {skill.description}
                                  </small>
                                )}
                              </td>

                              <td style={{ fontSize: '11px' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: catMeta.color,
                                    background: catMeta.bg,
                                    border: `1px solid ${catMeta.border}`,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {catMeta.label}
                                </span>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRequired(skill)}
                                  title="Click to toggle Mandatory status"
                                  className={`setting-toggle-btn ${skill.isCompanyRequired ? 'mandatory' : 'preferred'}`}
                                >
                                  <i className={`fa-solid fa-${skill.isCompanyRequired ? 'circle-check' : 'circle-dot'}`}></i>
                                  {skill.isCompanyRequired ? 'MANDATORY' : 'PREFERRED'}
                                </button>
                              </td>

                              {/* INLINE EDITABLE BENCHMARK SLIDER */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={currentVal}
                                    onChange={(e) => handleBenchmarkSliderChange(skill.id, e.target.value)}
                                    style={{ flex: 1, cursor: 'pointer' }}
                                  />
                                  <span
                                    style={{
                                      minWidth: '42px',
                                      textAlign: 'right',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                    }}
                                  >
                                    {currentVal}%
                                  </span>
                                  {hasUnsavedChanges && (
                                    <button
                                      type="button"
                                      onClick={() => handleSaveSkillBenchmark(skill)}
                                      className="setting-save-row-btn"
                                    >
                                      Save
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSkillBenchmark(skill)}
                                    title="Save Benchmark"
                                    className="setting-row-btn save"
                                  >
                                    <i className="fa-solid fa-floppy-disk"></i>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSkill(skill.id, skill.name)}
                                    title="Delete Skill"
                                    className="setting-row-btn delete"
                                  >
                                    <i className="fa-regular fa-trash-can"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                            {skillsLoading ? 'Loading skills...' : 'No skill criteria found matching your filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="admin-console-view">
              {/* SYSTEM HEALTH CARDS */}
              <div className="setting-kpi-grid">
                <div className="setting-kpi-card">
                  <span className="kpi-label">System Status</span>
                  <div className="kpi-val-row">
                    <span className="setting-status-dot"></span>
                    <strong className="kpi-val" style={{ fontSize: '16px' }}>{healthData?.status || 'OPERATIONAL'}</strong>
                  </div>
                  <small className="kpi-sub">
                    Uptime: {healthData?.uptimeSeconds ? `${Math.floor(healthData.uptimeSeconds / 60)}m ${healthData.uptimeSeconds % 60}s` : 'Active'}
                  </small>
                </div>

                <div className="setting-kpi-card">
                  <span className="kpi-label">Database Engine</span>
                  <strong className="kpi-val" style={{ fontSize: '15px', color: '#1769ff' }}>
                    {healthData?.database?.provider || 'SQLite Engine'}
                  </strong>
                  <small className="kpi-sub" style={{ color: '#10b981' }}>
                    Status: {healthData?.database?.status || 'CONNECTED'} • {healthData?.database?.latencyMs ?? 1}ms latency
                  </small>
                </div>

                <div className="setting-kpi-card">
                  <span className="kpi-label">Total Managed Records</span>
                  <strong className="kpi-val" style={{ fontSize: '16px' }}>
                    {(healthData?.counts?.totalCandidates || 0) +
                      (healthData?.counts?.totalJobs || 0) +
                      (healthData?.counts?.totalResumes || 0) +
                      (healthData?.counts?.totalSkills || 0)}
                  </strong>
                  <small className="kpi-sub">
                    {healthData?.counts?.totalCandidates || 0} Candidates • {healthData?.counts?.totalJobs || 0} Roles • {healthData?.counts?.totalResumes || 0} Resumes • {healthData?.counts?.totalSkills || 0} Skills
                  </small>
                </div>

                <div className="setting-kpi-card">
                  <span className="kpi-label">Server Memory (RSS)</span>
                  <strong className="kpi-val" style={{ fontSize: '16px', color: '#8b5cf6' }}>
                    {healthData?.memory?.rssMb || 110} MB
                  </strong>
                  <small className="kpi-sub">Heap: {healthData?.memory?.heapUsedMb || 45} MB / {healthData?.memory?.heapTotalMb || 60} MB</small>
                </div>
              </div>

              {/* AUDIT LOGS SECTION */}
              <div className="setting-section-card">
                <div className="setting-section-header between">
                  <div>
                    <h3>Security & Activity Audit Logs</h3>
                    <p>Immutable audit trail of recruiter and administrator events</p>
                  </div>

                  <div className="setting-filter-bar">
                    <input
                      type="text"
                      placeholder="Search audit trail..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadAdminData()}
                      className="setting-filter-input"
                      style={{ width: '180px' }}
                    />

                    <select
                      value={auditCategoryFilter}
                      onChange={(e) => setAuditCategoryFilter(e.target.value)}
                      className="setting-filter-select"
                    >
                      <option value="all">All Events</option>
                      <option value="CANDIDATE">Candidate Pipeline</option>
                      <option value="RESUME">Resume Evaluations</option>
                      <option value="BENCHMARK">Criteria Benchmarks</option>
                      <option value="RBAC">Security & Roles</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleExportAuditLogsCSV}
                      className="setting-filter-input"
                      style={{
                        width: 'auto',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#2869e8',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                      }}
                      title="Download compliance audit trail as CSV"
                    >
                      <i className="fa-solid fa-file-arrow-down"></i> Export CSV
                    </button>

                    <button
                      type="button"
                      onClick={loadAdminData}
                      className="setting-refresh-btn"
                      title="Refresh audit records"
                    >
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>
                  </div>
                </div>

                <div className="setting-table-wrap">
                  <table className="setting-table">
                    <thead>
                      <tr>
                        <th style={{ width: '15%' }}>Timestamp</th>
                        <th style={{ width: '17%' }}>Actor</th>
                        <th style={{ width: '16%' }}>Event Type</th>
                        <th style={{ width: '32%' }}>Event Summary & Audit Details</th>
                        <th style={{ width: '11%' }}>Resource</th>
                        <th style={{ width: '9%', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = auditLogs.filter((log) => {
                          if (auditCategoryFilter === 'all') return true;
                          if (auditCategoryFilter === 'CANDIDATE') return log.action?.includes('CANDIDATE') || log.resource === 'Candidate';
                          if (auditCategoryFilter === 'RESUME') return log.action?.includes('RESUME') || log.resource === 'Resume';
                          if (auditCategoryFilter === 'BENCHMARK') return log.action?.includes('SKILL') || log.action?.includes('CRITERIA') || log.resource?.includes('Skill');
                          if (auditCategoryFilter === 'RBAC') return log.action?.includes('USER') || log.action?.includes('ROLE') || log.resource === 'User';
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                                {loadingAdmin ? 'Loading audit trail...' : 'No audit records found matching your filters.'}
                              </td>
                            </tr>
                          );
                        }

                        return filtered.slice(0, 15).map((log) => {
                          const actionMeta = formatAuditAction(log.action);
                          const detailsSummary = formatAuditDetails(log);

                          return (
                            <tr key={log.id}>
                              <td className="setting-cell-subtext" style={{ whiteSpace: 'nowrap' }}>
                                {new Date(log.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td style={{ fontWeight: '500' }}>
                                <span style={{ fontSize: '12px' }}>
                                  {log.actorEmail || log.user?.email || 'system'}
                                </span>
                              </td>
                              <td>
                                <span
                                  className="setting-audit-badge"
                                  style={{
                                    color: actionMeta.color,
                                    background: actionMeta.bg,
                                    border: `1px solid ${actionMeta.border}`,
                                  }}
                                >
                                  <i className={actionMeta.icon} style={{ fontSize: '10px' }}></i>
                                  {actionMeta.label}
                                </span>
                              </td>
                              <td>
                                <div className="setting-audit-details-text">
                                  {detailsSummary}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>
                                  {log.resource}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="setting-audit-status">
                                  {log.status || 'SUCCESS'}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* USER ROLE MANAGEMENT SECTION */}
              <div className="setting-section-card">
                <div className="setting-section-header">
                  <div>
                    <h3>User Access & Role-Based Access Control (RBAC)</h3>
                    <p>Manage user permissions across Administrator, HR Manager, Recruiter, and Interviewer</p>
                  </div>
                </div>

                <div className="setting-table-wrap">
                  <table className="setting-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Team Member</th>
                        <th style={{ width: '26%' }}>Email Address</th>
                        <th style={{ width: '16%' }}>Account Status</th>
                        <th style={{ width: '18%' }}>Assigned Role</th>
                        <th style={{ width: '12%', textAlign: 'right' }}>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length > 0 ? (
                        usersList.map((u) => {
                          const initials = `${(u.firstName || '')[0] || 'U'}${(u.lastName || '')[0] || ''}`.toUpperCase();
                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="setting-user-cell">
                                  <div className="setting-user-avatar">
                                    {initials}
                                  </div>
                                  <div>
                                    <strong style={{ display: 'block', fontSize: '13px' }}>
                                      {u.firstName} {u.lastName}
                                    </strong>
                                    <small style={{ color: '#64748b', fontSize: '10.5px' }}>
                                      ID: {u.id?.slice(0, 8)}...
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td className="setting-cell-subtext">
                                <a
                                  href={`mailto:${u.email}`}
                                  style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                                  title={`Send email to ${u.email}`}
                                >
                                  {u.email}
                                </a>
                              </td>
                              <td>
                                <span className="setting-active-badge">
                                  <i className="fa-solid fa-circle-check"></i> Active
                                </span>
                              </td>
                              <td>
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="setting-role-select"
                                >
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="HR_MANAGER">HR_MANAGER</option>
                                  <option value="RECRUITER">RECRUITER</option>
                                  <option value="INTERVIEWER">INTERVIEWER</option>
                                </select>
                              </td>
                              <td className="setting-cell-subtext" style={{ textAlign: 'right' }}>
                                {new Date(u.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            {loadingAdmin ? 'Loading users...' : 'No users loaded.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* TOAST */}
      <div
        className={`toast ${showToast ? 'show' : ''}`}
        id="toast"
        aria-live="polite"
        style={{ display: showToast ? 'flex' : 'none' }}
      >
        <i className="fa-solid fa-circle-check"></i>
        <span id="toastMessage">{toastMessage}</span>
      </div>
    </>
  );
}
