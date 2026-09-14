import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/img/hireiq-logo.png';
import '../css/sidebar-common.css';

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <img src={logo} alt="HireIQ Logo" />
        </div>

        <div>
          <h2>HireIQ</h2>
          <span>Smart Hiring Simplified</span>
        </div>
      </div>

      <nav className="menu">
        <Link
          to="/dashboard"
          className={`menu-item ${activePage === 'dashboard' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-house"></i>
          <span>Dashboard</span>
        </Link>

        <Link
          to="/resumeupload"
          className={`menu-item ${activePage === 'resumeupload' ? 'active' : ''}`}
        >
          <i className="fa-regular fa-file-lines"></i>
          <span>Resume Upload</span>
        </Link>

        <Link
          to="/candidates"
          className={`menu-item ${activePage === 'candidates' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-users"></i>
          <span>Candidates</span>
        </Link>

        <Link
          to="/skillgapanalysis"
          className={`menu-item ${activePage === 'skillgapanalysis' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-chart-line"></i>
          <span>Skill Gap Analysis</span>
        </Link>

        <Link
          to="/jobrole"
          className={`menu-item ${activePage === 'jobrole' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-briefcase"></i>
          <span>Job Roles</span>
        </Link>

        <Link
          to="/report"
          className={`menu-item ${activePage === 'report' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-chart-column"></i>
          <span>Reports</span>
        </Link>

        <Link
          to="/setting"
          className={`menu-item ${activePage === 'setting' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </Link>
      </nav>

      {/* Upgrade Card */}
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
    </aside>
  );
}
