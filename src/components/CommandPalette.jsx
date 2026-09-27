import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const inputRef = useRef(null);

  const currentPath = location.pathname.toLowerCase();
  const isCandidatePortal =
    user?.role === 'CANDIDATE' || currentPath.startsWith('/candidate');

  // Candidate-specific command set
  const candidateCommands = [
    {
      id: 'cand-dash',
      category: 'Candidate Portal',
      title: 'Candidate Overview',
      subtitle: 'ATS score readiness, skill inventory & career alignment',
      icon: 'fa-solid fa-gauge-high',
      action: () => navigate('/candidate/dashboard'),
    },
    {
      id: 'cand-resume-checker',
      category: 'Candidate Portal',
      title: 'ATS Resume Checker',
      subtitle: 'Upload, audit, and benchmark your resume for ATS engines',
      icon: 'fa-solid fa-file-shield',
      action: () => navigate('/candidate/resume-checker'),
    },
    {
      id: 'cand-bullet-optimizer',
      category: 'AI Career Tools',
      title: 'ATS Bullet Point Optimizer',
      subtitle: 'Generate quantifiable, high-impact resume bullet points',
      icon: 'fa-solid fa-wand-magic-sparkles',
      action: () => navigate('/candidate/resume-checker'),
    },
    {
      id: 'cand-copilot',
      category: 'AI Career Tools',
      title: 'Career AI Copilot',
      subtitle: 'Ask interview preparation & resume enhancement questions',
      icon: 'fa-solid fa-robot',
      action: () => {
        window.dispatchEvent(
          new CustomEvent('hireiq-open-chatbot', {
            detail: { prompt: 'Give me a quick checklist to make my resume 100% ATS compliant.' },
          })
        );
      },
    },
    {
      id: 'act-theme',
      category: 'Preferences',
      title: 'Toggle Dark / Light Theme',
      subtitle: 'Switch between ambient dark and crisp light theme',
      icon: 'fa-solid fa-circle-half-stroke',
      action: () => {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
        } else {
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
        }
      },
    },
    {
      id: 'cand-upgrade',
      category: 'Account',
      title: 'Upgrade to Pro Account',
      subtitle: 'Unlock unlimited AI resume audits and priority screening',
      icon: 'fa-solid fa-crown',
      action: () => navigate('/upgrade'),
    },
  ];

  // Recruiter-specific command set
  const recruiterCommands = [
    {
      id: 'rec-dashboard',
      category: 'Recruiter Console',
      title: 'Dashboard Overview',
      subtitle: 'Recruiter pipeline metrics & intelligence stream',
      icon: 'fa-solid fa-gauge-high',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'rec-candidates',
      category: 'Recruiter Console',
      title: 'Candidates Roster',
      subtitle: 'Search, filter, evaluate and shortlist talent',
      icon: 'fa-solid fa-users',
      action: () => navigate('/candidates'),
    },
    {
      id: 'rec-upload',
      category: 'Recruiter Console',
      title: 'Bulk Resume Ingestion',
      subtitle: 'Upload and parse PDF / DOCX resumes',
      icon: 'fa-solid fa-cloud-arrow-up',
      action: () => navigate('/resumeupload'),
    },
    {
      id: 'rec-skillgap',
      category: 'Recruiter Console',
      title: 'Skill Gap Analysis',
      subtitle: 'Benchmark candidate competencies against thresholds',
      icon: 'fa-solid fa-chart-pie',
      action: () => navigate('/skillgapanalysis'),
    },
    {
      id: 'rec-jobroles',
      category: 'Recruiter Console',
      title: 'Job Roles & Requisitions',
      subtitle: 'Manage open requisitions and required skills',
      icon: 'fa-solid fa-briefcase',
      action: () => navigate('/jobrole'),
    },
    {
      id: 'rec-reports',
      category: 'Recruiter Console',
      title: 'Reports & Analytics',
      subtitle: 'Export executive hiring and velocity reports',
      icon: 'fa-solid fa-file-invoice',
      action: () => navigate('/report'),
    },
    {
      id: 'rec-settings',
      category: 'Administration',
      title: 'Settings & Hiring Benchmarks',
      subtitle: 'Customize company criteria and RBAC permissions',
      icon: 'fa-solid fa-sliders',
      action: () => navigate('/setting'),
    },
    {
      id: 'rec-copilot',
      category: 'AI Intelligence',
      title: 'Ask HireIQ Assistant',
      subtitle: 'Query hiring pipeline, role benchmarks, or interview questions',
      icon: 'fa-solid fa-wand-magic-sparkles',
      action: () => {
        window.dispatchEvent(
          new CustomEvent('hireiq-open-chatbot', {
            detail: { prompt: 'What are the top improvements recommended for my pipeline today?' },
          })
        );
      },
    },
    {
      id: 'act-theme',
      category: 'Preferences',
      title: 'Toggle Dark / Light Theme',
      subtitle: 'Switch between ambient dark and crisp light theme',
      icon: 'fa-solid fa-circle-half-stroke',
      action: () => {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
        } else {
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
        }
      },
    },
    {
      id: 'rec-upgrade',
      category: 'Account',
      title: 'View Subscription & Pricing',
      subtitle: 'Manage team subscription tier and billing',
      icon: 'fa-solid fa-crown',
      action: () => navigate('/upgrade'),
    },
  ];

  // Active command pool based strictly on portal context
  const activeCommands = isCandidatePortal ? candidateCommands : recruiterCommands;

  // Filter commands by search query
  const filteredCommands = activeCommands.filter((cmd) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hireiq-open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hireiq-open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard list navigation
  const handleKeyNavigation = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  const isDarkMode = document.body.classList.contains('dark-mode');

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 23, 41, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: isDarkMode ? '#10223a' : '#ffffff',
          borderRadius: '14px',
          boxShadow: isDarkMode
            ? '0 25px 65px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px #263f60'
            : '0 25px 65px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: isDarkMode ? '1px solid #263f60' : '1px solid #e2e8f0',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: isDarkMode ? '1px solid #263f60' : '1px solid #e2e8f0',
            background: isDarkMode ? '#0d1b2e' : '#ffffff',
          }}
        >
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ color: '#2563eb', fontSize: '15px' }}
          ></i>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isCandidatePortal
                ? 'Search candidate portal, ATS tools, or commands... (e.g. resume, ats, dark)'
                : 'Search recruiter tools, candidates, or pages... (e.g. candidates, upload, roles)'
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNavigation}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '13.5px',
              fontFamily: 'inherit',
              color: isDarkMode ? '#ffffff' : '#0f172a',
            }}
          />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '5px',
              background: isDarkMode ? '#1e334f' : '#f1f5f9',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Command List */}
        <div
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: isDarkMode ? '#10223a' : '#ffffff',
          }}
          data-lenis-prevent
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected
                      ? isDarkMode
                        ? 'rgba(37, 99, 235, 0.22)'
                        : 'rgba(37, 99, 235, 0.08)'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(37, 99, 235, 0.35)'
                      : '1px solid transparent',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected
                        ? '#2563eb'
                        : isDarkMode
                        ? '#142740'
                        : '#f1f5f9',
                      color: isSelected
                        ? '#ffffff'
                        : isDarkMode
                        ? '#60a5fa'
                        : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={cmd.icon}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong
                        style={{
                          fontSize: '13px',
                          color: isSelected
                            ? isDarkMode
                              ? '#ffffff'
                              : '#2563eb'
                            : isDarkMode
                            ? '#f1f5f9'
                            : '#0f172a',
                          fontWeight: 600,
                        }}
                      >
                        {cmd.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isDarkMode ? '#142740' : '#f1f5f9',
                          color: isDarkMode ? '#94a3b8' : '#64748b',
                          fontWeight: 500,
                          border: isDarkMode ? '1px solid #263f60' : 'none',
                        }}
                      >
                        {cmd.category}
                      </span>
                    </div>
                    <small
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cmd.subtitle}
                    </small>
                  </div>
                  {isSelected && (
                    <i
                      className="fa-solid fa-arrow-turn-down"
                      style={{
                        fontSize: '11px',
                        color: '#2563eb',
                        transform: 'rotate(90deg)',
                      }}
                    ></i>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: '13px',
              }}
            >
              <i
                className="fa-solid fa-ghost"
                style={{ fontSize: '24px', marginBottom: '8px', display: 'block', color: '#64748b' }}
              ></i>
              No commands found for "{search}"
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            padding: '9px 16px',
            borderTop: isDarkMode ? '1px solid #263f60' : '1px solid #e2e8f0',
            background: isDarkMode ? '#0d1b2e' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: isDarkMode ? '#1e334f' : '#f1f5f9', borderRadius: '3px' }}>↑</kbd> <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: isDarkMode ? '#1e334f' : '#f1f5f9', borderRadius: '3px' }}>↓</kbd> Navigate
            </span>
            <span>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: isDarkMode ? '#1e334f' : '#f1f5f9', borderRadius: '3px' }}>↵</kbd> Select
            </span>
            <span>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: isDarkMode ? '#1e334f' : '#f1f5f9', borderRadius: '3px' }}>ESC</kbd> Close
            </span>
          </div>
          <span style={{ fontWeight: 600, color: '#2563eb' }}>
            {isCandidatePortal ? 'Candidate Spotlight' : 'Recruiter Spotlight'}
          </span>
        </div>
      </div>
    </div>
  );
}
