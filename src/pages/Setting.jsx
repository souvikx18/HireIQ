import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/auth.js';
import { adminApi } from '../api/admin.js';
import { skillsApi } from '../api/skills.js';
import '../css/setting.css';

export default function Setting() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [healthData, setHealthData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [logSearch, setLogSearch] = useState('');
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

  const handleSeedDefaults = async () => {
    try {
      await skillsApi.seedDefaultSkills();
      triggerToast('Standard industry skill benchmarks seeded successfully');
      loadSkills();
    } catch {
      triggerToast('Failed to seed default skill benchmarks');
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

          {/* TAB NAVIGATION */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              margin: '18px 0 24px',
              borderBottom: '1px solid #e1e7ef',
              paddingBottom: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'account' ? '#2869e8' : '#f1f5f9',
                color: activeTab === 'account' ? '#ffffff' : '#64748b',
                transition: 'all .2s ease',
              }}
            >
              <i className="fa-solid fa-user-gear"></i> Account & Preferences
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('criteria')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'criteria' ? '#2869e8' : '#f1f5f9',
                color: activeTab === 'criteria' ? '#ffffff' : '#64748b',
                transition: 'all .2s ease',
              }}
            >
              <i className="fa-solid fa-sliders"></i> Company Hiring Criteria & Benchmarks
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'admin' ? '#2869e8' : '#f1f5f9',
                color: activeTab === 'admin' ? '#ffffff' : '#64748b',
                transition: 'all .2s ease',
              }}
            >
              <i className="fa-solid fa-shield-halved"></i> Admin Security & Audit Center
            </button>
          </div>

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
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="Recruiter">Recruiter</option>
                      <option value="Hiring Manager">Hiring Manager</option>
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

            {/* NOTIFICATION SETTINGS */}
            <section className="settings-card notification-card">
              <div className="card-title">
                <div className="title-icon orange">
                  <i className="fa-regular fa-bell"></i>
                </div>
                <h2>Notification Settings</h2>
              </div>

              <div className="notification-settings">
                {/* Hiring Updates */}
                <div className="notification-setting">
                  <div className="notification-setting-icon">
                    <i className="fa-solid fa-briefcase"></i>
                  </div>
                  <div className="notification-setting-text">
                    <strong>Hiring Updates</strong>
                    <span>
                      Get notified about hiring progress and updates.
                    </span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="hiringUpdates"
                      checked={hiringUpdates}
                      onChange={(e) => setHiringUpdates(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Candidate Updates */}
                <div className="notification-setting">
                  <div className="notification-setting-icon">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className="notification-setting-text">
                    <strong>Candidate Updates</strong>
                    <span>
                      Receive updates on candidate applications and status.
                    </span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="candidateUpdates"
                      checked={candidateUpdates}
                      onChange={(e) => setCandidateUpdates(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Interview Reminders */}
                <div className="notification-setting">
                  <div className="notification-setting-icon">
                    <i className="fa-regular fa-calendar"></i>
                  </div>
                  <div className="notification-setting-text">
                    <strong>Interview Reminders</strong>
                    <span>Get reminded about upcoming interviews.</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="interviewReminders"
                      checked={interviewReminders}
                      onChange={(e) => setInterviewReminders(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Tracked Skills</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-layer-group" style={{ color: '#2869e8', fontSize: '16px' }}></i>
                    <strong style={{ fontSize: '20px', color: '#0f172a' }}>{skillStats.totalSkills}</strong>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>Company criteria library</small>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Mandatory For Hire</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '16px' }}></i>
                    <strong style={{ fontSize: '20px', color: '#10b981' }}>{skillStats.mandatoryCount}</strong>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>Must-have competencies</small>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Avg Benchmark Target</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-chart-line" style={{ color: '#8b5cf6', fontSize: '16px' }}></i>
                    <strong style={{ fontSize: '20px', color: '#8b5cf6' }}>{skillStats.avgBenchmark}%</strong>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>Company passing threshold</small>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Quick Actions</span>
                  <button
                    type="button"
                    onClick={handleSeedDefaults}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: '#f8fafc',
                      color: '#2869e8',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fa-solid fa-sparkles"></i> Seed Defaults
                  </button>
                  <small style={{ color: '#94a3b8', fontSize: '10px', display: 'block', marginTop: '4px', textAlign: 'center' }}>Reset to tech industry standards</small>
                </div>
              </div>

              {/* ADD NEW SKILL CRITERION CARD */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edf3ff', color: '#2869e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-bullseye"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>Add Company Skill Benchmark & Hiring Requirement</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Define what skills are required for hiring and how much proficiency is expected.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSkill}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                        Skill Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Docker, Python, System Design, SQL"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                        Category
                      </label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        <option value="TECHNICAL">Technical Skills</option>
                        <option value="TOOLS">Tools & Frameworks</option>
                        <option value="SOFT_SKILLS">Soft Skills</option>
                        <option value="DOMAIN">Domain Knowledge</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                        Importance Level
                      </label>
                      <select
                        value={newSkill.importance}
                        onChange={(e) => setNewSkill({ ...newSkill, importance: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        <option value="CRITICAL">Critical (Must-Have)</option>
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low / Preferred</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px', alignItems: 'center' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Required Benchmark Threshold (%):</span>
                        <strong style={{ fontSize: '14px', color: '#2869e8', background: '#edf3ff', padding: '2px 8px', borderRadius: '4px' }}>
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
                      <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                        Candidates scoring below this proficiency will trigger an evaluation gap.
                      </small>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="isCompanyRequired"
                        checked={newSkill.isCompanyRequired}
                        onChange={(e) => setNewSkill({ ...newSkill, isCompanyRequired: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isCompanyRequired" style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                        Mandatory For Hiring
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 'normal', color: '#64748b' }}>Candidates without this skill are flagged as unqualified</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Evaluation Criteria & Minimum Expectations (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Must have hands-on production experience designing scalable APIs and optimizing SQL queries"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 22px',
                      background: '#2869e8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background .2s ease',
                    }}
                  >
                    <i className="fa-solid fa-plus"></i> Add Skill Benchmark Requirement
                  </button>
                </form>
              </div>

              {/* COMPANY CRITERIA LIST & INLINE BENCHMARK EDITOR */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>Company Skill Benchmarks & Thresholds</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                      Directly edit how much proficiency is required per skill. Changes immediately impact candidate scoring and gap analysis.
                    </p>
                  </div>

                  {/* SEARCH & FILTER */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search company skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadSkills()}
                      style={{ padding: '7px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '180px' }}
                    />

                    <select
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                    >
                      <option value="all">All Categories</option>
                      <option value="TECHNICAL">Technical Skills</option>
                      <option value="TOOLS">Tools & Frameworks</option>
                      <option value="SOFT_SKILLS">Soft Skills</option>
                      <option value="DOMAIN">Domain Knowledge</option>
                    </select>

                    <button
                      type="button"
                      onClick={loadSkills}
                      style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>
                  </div>
                </div>

                {/* SKILLS TABLE WITH INLINE BENCHMARK SLIDERS */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '12px 10px', width: '22%' }}>Skill Name</th>
                        <th style={{ padding: '12px 10px', width: '16%' }}>Category</th>
                        <th style={{ padding: '12px 10px', width: '14%' }}>Status</th>
                        <th style={{ padding: '12px 10px', width: '32%' }}>Required Benchmark (%)</th>
                        <th style={{ padding: '12px 10px', width: '16%', textAlign: 'right' }}>Actions</th>
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

                          return (
                            <tr key={skill.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong style={{ color: '#0f172a' }}>{skill.name}</strong>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background:
                                        skill.importance === 'CRITICAL'
                                          ? '#fee2e2'
                                          : skill.importance === 'HIGH'
                                          ? '#fef3c7'
                                          : '#f1f5f9',
                                      color:
                                        skill.importance === 'CRITICAL'
                                          ? '#991b1b'
                                          : skill.importance === 'HIGH'
                                          ? '#92400e'
                                          : '#475569',
                                    }}
                                  >
                                    {skill.importance || 'HIGH'}
                                  </span>
                                </div>
                                {skill.description && (
                                  <small style={{ color: '#64748b', display: 'block', fontSize: '11px', marginTop: '2px' }}>
                                    {skill.description}
                                  </small>
                                )}
                              </td>

                              <td style={{ padding: '12px 10px', color: '#475569', fontSize: '12px' }}>
                                {skill.category}
                              </td>

                              <td style={{ padding: '12px 10px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRequired(skill)}
                                  title="Click to toggle Mandatory status"
                                  style={{
                                    border: 'none',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: skill.isCompanyRequired ? '#dbeafe' : '#f1f5f9',
                                    color: skill.isCompanyRequired ? '#1e40af' : '#64748b',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  <i className={`fa-solid fa-${skill.isCompanyRequired ? 'circle-check' : 'circle-dot'}`}></i>
                                  {skill.isCompanyRequired ? 'MANDATORY' : 'PREFERRED'}
                                </button>
                              </td>

                              {/* INLINE EDITABLE BENCHMARK SLIDER */}
                              <td style={{ padding: '12px 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                      minWidth: '46px',
                                      textAlign: 'right',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      color: currentVal >= 80 ? '#1e40af' : '#0f172a',
                                    }}
                                  >
                                    {currentVal}%
                                  </span>
                                  {hasUnsavedChanges && (
                                    <button
                                      type="button"
                                      onClick={() => handleSaveSkillBenchmark(skill)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        background: '#2869e8',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Save
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSkillBenchmark(skill)}
                                    title="Save Benchmark"
                                    style={{
                                      padding: '6px 10px',
                                      border: '1px solid #cbd5e1',
                                      background: '#f8fafc',
                                      color: '#2869e8',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                    }}
                                  >
                                    <i className="fa-solid fa-floppy-disk"></i>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSkill(skill.id, skill.name)}
                                    title="Delete Skill"
                                    style={{
                                      padding: '6px 10px',
                                      border: '1px solid #fee2e2',
                                      background: '#fff1f2',
                                      color: '#e11d48',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                    }}
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
                          <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>System Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                    <strong style={{ fontSize: '18px', color: '#0f172a' }}>{healthData?.status || 'OPERATIONAL'}</strong>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>Uptime: {healthData?.uptimeSeconds || 120}s</small>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Supabase PostgreSQL</span>
                  <strong style={{ fontSize: '18px', color: '#1769ff' }}>{healthData?.database?.latencyMs ? `${healthData.database.latencyMs}ms` : 'Connected'}</strong>
                  <small style={{ color: '#10b981', display: 'block', fontSize: '11px' }}>Status: {healthData?.database?.status || 'Active'}</small>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Total Records</span>
                  <strong style={{ fontSize: '18px', color: '#0f172a' }}>
                    {(healthData?.counts?.totalCandidates || 0) + (healthData?.counts?.totalJobs || 0)}
                  </strong>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    {healthData?.counts?.totalCandidates || 0} Cand. • {healthData?.counts?.totalJobs || 0} Roles
                  </small>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.03)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Server Memory (RSS)</span>
                  <strong style={{ fontSize: '18px', color: '#8b5cf6' }}>{healthData?.memory?.rssMb || 110} MB</strong>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>Heap: {healthData?.memory?.heapUsedMb || 45} MB</small>
                </div>
              </div>

              {/* AUDIT LOGS SECTION */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>Security & Activity Audit Logs</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>Immutable audit trail of recruiter and administrator events</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Search audit trail..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadAdminData()}
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d9e2ef', width: '220px' }}
                    />
                    <button
                      type="button"
                      onClick={loadAdminData}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d9e2ef', background: '#f8fafc', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-rotate-right"></i> Refresh
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '10px 8px' }}>Timestamp</th>
                        <th style={{ padding: '10px 8px' }}>Actor</th>
                        <th style={{ padding: '10px 8px' }}>Action</th>
                        <th style={{ padding: '10px 8px' }}>Resource</th>
                        <th style={{ padding: '10px 8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length > 0 ? (
                        auditLogs.slice(0, 10).map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 8px', color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</td>
                            <td style={{ padding: '10px 8px', fontWeight: '500' }}>{log.actorEmail || log.user?.email || 'system'}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: '600' }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', color: '#475569' }}>{log.resource}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '600' }}>
                                {log.status || 'SUCCESS'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                            {loadingAdmin ? 'Loading audit trail...' : 'No audit records found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* USER ROLE MANAGEMENT SECTION */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px' }}>
                <h3 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 4px' }}>User Access & Role-Based Access Control (RBAC)</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>Manage user permissions across Administrator, HR Manager, Recruiter, and Interviewer</p>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                      <th style={{ padding: '10px 8px' }}>Name</th>
                      <th style={{ padding: '10px 8px' }}>Email</th>
                      <th style={{ padding: '10px 8px' }}>Assigned Role</th>
                      <th style={{ padding: '10px 8px' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length > 0 ? (
                      usersList.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', fontWeight: '600' }}>{u.firstName} {u.lastName}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{u.email}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '600' }}
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="HR_MANAGER">HR_MANAGER</option>
                              <option value="RECRUITER">RECRUITER</option>
                              <option value="INTERVIEWER">INTERVIEWER</option>
                            </select>
                          </td>
                          <td style={{ padding: '10px 8px', color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                          {loadingAdmin ? 'Loading users...' : 'No users loaded.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
