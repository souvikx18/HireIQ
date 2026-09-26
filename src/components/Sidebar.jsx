import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/img/hireiq-logo.png';
import '../css/sidebar-common.css';

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('hireiq_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    localStorage.setItem('hireiq_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-main">
          <div className="brand-icon">
            <img src={logo} alt="HireIQ Logo" />
          </div>

          {!isCollapsed && (
            <div className="brand-info">
              <h2>HireIQ</h2>
              <span>{isCandidate ? 'Candidate Portal' : 'Smart Hiring Simplified'}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
          aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <i className={isCollapsed ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left'}></i>
        </button>
      </div>

      <nav className="menu">
        {isCandidate ? (
          <>
            <Link
              to="/candidate/dashboard"
              className={`menu-item ${activePage === 'candidate-dashboard' ? 'active' : ''}`}
              title="Overview"
            >
              <i className="fa-solid fa-gauge-high"></i>
              {!isCollapsed && <span>Overview</span>}
            </Link>

            <Link
              to="/candidate/resume-checker"
              className={`menu-item ${activePage === 'resume-checker' ? 'active' : ''}`}
              title="ATS Resume Audit"
            >
              <i className="fa-solid fa-file-shield"></i>
              {!isCollapsed && <span>ATS Resume Audit</span>}
            </Link>

            <Link
              to="/setting"
              className={`menu-item ${activePage === 'setting' ? 'active' : ''}`}
              title="Account Settings"
            >
              <i className="fa-solid fa-user-gear"></i>
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className={`menu-item ${activePage === 'dashboard' ? 'active' : ''}`}
              title="Dashboard"
            >
              <i className="fa-solid fa-house"></i>
              {!isCollapsed && <span>Dashboard</span>}
            </Link>

            <Link
              to="/resumeupload"
              className={`menu-item ${activePage === 'resumeupload' ? 'active' : ''}`}
              title="Resume Upload"
            >
              <i className="fa-regular fa-file-lines"></i>
              {!isCollapsed && <span>Resume Upload</span>}
            </Link>

            <Link
              to="/candidates"
              className={`menu-item ${activePage === 'candidates' ? 'active' : ''}`}
              title="Candidates"
            >
              <i className="fa-solid fa-users"></i>
              {!isCollapsed && <span>Candidates</span>}
            </Link>

            <Link
              to="/skillgapanalysis"
              className={`menu-item ${activePage === 'skillgapanalysis' ? 'active' : ''}`}
              title="Skill Gap Analysis"
            >
              <i className="fa-solid fa-chart-line"></i>
              {!isCollapsed && <span>Skill Gap Analysis</span>}
            </Link>

            <Link
              to="/jobrole"
              className={`menu-item ${activePage === 'jobrole' ? 'active' : ''}`}
              title="Job Roles"
            >
              <i className="fa-solid fa-briefcase"></i>
              {!isCollapsed && <span>Job Roles</span>}
            </Link>

            <Link
              to="/report"
              className={`menu-item ${activePage === 'report' ? 'active' : ''}`}
              title="Reports"
            >
              <i className="fa-solid fa-chart-column"></i>
              {!isCollapsed && <span>Reports</span>}
            </Link>

            <Link
              to="/setting"
              className={`menu-item ${activePage === 'setting' ? 'active' : ''}`}
              title="Settings"
            >
              <i className="fa-solid fa-gear"></i>
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Upgrade Card */}
      {!isCollapsed ? (
        <div className="upgrade-card">
          <div className="upgrade-icon">
            <i className="fa-solid fa-crown"></i>
          </div>

          <h3>Upgrade to Pro</h3>

          <p>Unlock advanced insights and hire top talent faster.</p>

          <button type="button" onClick={handleUpgradeClick}>
            Upgrade Now
          </button>
        </div>
      ) : (
        <div
          className="upgrade-card-collapsed"
          onClick={handleUpgradeClick}
          title="Upgrade to Pro"
        >
          <i className="fa-solid fa-crown"></i>
        </div>
      )}
    </aside>
  );
}
