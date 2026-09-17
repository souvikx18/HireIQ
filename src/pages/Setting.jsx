import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/auth.js';
import { adminApi } from '../api/admin.js';

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

          {activeTab === 'account' ? (
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
              onClick={handleSave}
            >
              <i className="fa-regular fa-floppy-disk"></i> Save Changes
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
          ) : (
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
