import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/img/hireiq-logo.png';
import '../css/sidebar-common.css';

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('hireiq_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    localStorage.setItem('hireiq_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Custom event listener for mobile menu toggle from Header
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    const handleClose = () => setIsMobileOpen(false);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };

    window.addEventListener('hireiq-toggle-mobile-sidebar', handleToggle);
    window.addEventListener('hireiq-close-mobile-sidebar', handleClose);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hireiq-toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('hireiq-close-mobile-sidebar', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleUpgradeClick = () => {
    setIsMobileOpen(false);
    navigate('/upgrade');
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Sidebar Navigation"
      >
        <div className="brand">
          <div className="brand-main">
            <div className="brand-icon">
              <img src={logo} alt="HireIQ Logo" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="brand-info">
                <h2>HireIQ</h2>
                <span>{isCandidate ? 'Candidate Portal' : 'Smart Hiring Simplified'}</span>
              </div>
            )}
          </div>

          <div className="brand-actions">
            {/* Mobile Close Button */}
            <button
              type="button"
              className="sidebar-mobile-close-btn"
              onClick={closeMobile}
              title="Close menu"
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Desktop Collapse Button */}
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
        </div>

        <nav className="menu">
          {isCandidate ? (
            <>
              <Link
                to="/candidate/dashboard"
                className={`menu-item ${activePage === 'candidate-dashboard' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Overview"
              >
                <i className="fa-solid fa-gauge-high"></i>
                {(!isCollapsed || isMobileOpen) && <span>Overview</span>}
              </Link>

              <Link
                to="/candidate/resume-checker"
                className={`menu-item ${activePage === 'resume-checker' ? 'active' : ''}`}
                onClick={closeMobile}
                title="ATS Resume Audit"
              >
                <i className="fa-solid fa-file-shield"></i>
                {(!isCollapsed || isMobileOpen) && <span>ATS Resume Audit</span>}
              </Link>

              <Link
                to="/setting"
                className={`menu-item ${activePage === 'setting' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Account Settings"
              >
                <i className="fa-solid fa-user-gear"></i>
                {(!isCollapsed || isMobileOpen) && <span>Settings</span>}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`menu-item ${activePage === 'dashboard' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Dashboard"
              >
                <i className="fa-solid fa-house"></i>
                {(!isCollapsed || isMobileOpen) && <span>Dashboard</span>}
              </Link>

              <Link
                to="/resumeupload"
                className={`menu-item ${activePage === 'resumeupload' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Resume Upload"
              >
                <i className="fa-regular fa-file-lines"></i>
                {(!isCollapsed || isMobileOpen) && <span>Resume Upload</span>}
              </Link>

              <Link
                to="/candidates"
                className={`menu-item ${activePage === 'candidates' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Candidates"
              >
                <i className="fa-solid fa-users"></i>
                {(!isCollapsed || isMobileOpen) && <span>Candidates</span>}
              </Link>

              <Link
                to="/skillgapanalysis"
                className={`menu-item ${activePage === 'skillgapanalysis' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Skill Gap Analysis"
              >
                <i className="fa-solid fa-chart-line"></i>
                {(!isCollapsed || isMobileOpen) && <span>Skill Gap Analysis</span>}
              </Link>

              <Link
                to="/jobrole"
                className={`menu-item ${activePage === 'jobrole' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Job Roles"
              >
                <i className="fa-solid fa-briefcase"></i>
                {(!isCollapsed || isMobileOpen) && <span>Job Roles</span>}
              </Link>

              <Link
                to="/report"
                className={`menu-item ${activePage === 'report' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Reports"
              >
                <i className="fa-solid fa-chart-column"></i>
                {(!isCollapsed || isMobileOpen) && <span>Reports</span>}
              </Link>

              <Link
                to="/setting"
                className={`menu-item ${activePage === 'setting' ? 'active' : ''}`}
                onClick={closeMobile}
                title="Settings"
              >
                <i className="fa-solid fa-gear"></i>
                {(!isCollapsed || isMobileOpen) && <span>Settings</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Upgrade Card */}
        {(!isCollapsed || isMobileOpen) ? (
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
    </>
  );
}
