import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);

  // Default command list
  const commands = [
    // Recruiter Navigation
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Dashboard Overview',
      subtitle: 'Recruiter pipeline metrics & intelligence stream',
      icon: 'fa-solid fa-gauge-high',
      action: () => navigate('/dashboard'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },
    {
      id: 'nav-candidates',
      category: 'Navigation',
      title: 'Candidates Roster',
      subtitle: 'Search, filter, and review evaluated talent',
      icon: 'fa-solid fa-users',
      action: () => navigate('/candidates'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },
    {
      id: 'nav-upload',
      category: 'Navigation',
      title: 'Bulk Resume Ingestion',
      subtitle: 'Upload and parse PDF / DOCX resumes',
      icon: 'fa-solid fa-cloud-arrow-up',
      action: () => navigate('/resumeupload'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },
    {
      id: 'nav-skillgap',
      category: 'Navigation',
      title: 'Skill Gap Analysis',
      subtitle: 'Benchmark candidate competencies against thresholds',
      icon: 'fa-solid fa-chart-pie',
      action: () => navigate('/skillgapanalysis'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },
    {
      id: 'nav-jobroles',
      category: 'Navigation',
      title: 'Job Roles & Requisitions',
      subtitle: 'Manage open requisitions and required skills',
      icon: 'fa-solid fa-briefcase',
      action: () => navigate('/jobrole'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },
    {
      id: 'nav-reports',
      category: 'Navigation',
      title: 'Reports & Analytics',
      subtitle: 'Export executive hiring and velocity reports',
      icon: 'fa-solid fa-file-invoice',
      action: () => navigate('/report'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Settings & Hiring Benchmarks',
      subtitle: 'Customize company criteria and RBAC permissions',
      icon: 'fa-solid fa-sliders',
      action: () => navigate('/setting'),
      roles: ['ADMIN', 'HR_MANAGER', 'RECRUITER'],
    },

    // Candidate Navigation
    {
      id: 'nav-candidate-dash',
      category: 'Candidate Portal',
      title: 'Candidate Overview',
      subtitle: 'Personal ATS readiness dashboard',
      icon: 'fa-solid fa-user-tie',
      action: () => navigate('/candidate/dashboard'),
      roles: ['CANDIDATE', 'ADMIN'],
    },
    {
      id: 'nav-resume-checker',
      category: 'Candidate Portal',
      title: 'ATS Resume Checker',
      subtitle: 'Scan resume and receive instant keyword fixes',
      icon: 'fa-solid fa-file-shield',
      action: () => navigate('/candidate/resume-checker'),
      roles: ['CANDIDATE', 'ADMIN'],
    },

    // Fast Power Actions
    {
      id: 'act-theme',
      category: 'Quick Actions',
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
      id: 'act-copilot',
      category: 'Quick Actions',
      title: 'Ask HireIQ AI Assistant',
      subtitle: 'Launch interactive career & hiring intelligence copilot',
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
      id: 'act-upgrade',
      category: 'Quick Actions',
      title: 'View Subscription & Pricing',
      subtitle: 'Explore Starter, Pro, and Enterprise tiers',
      icon: 'fa-solid fa-crown',
      action: () => navigate('/upgrade'),
    },
  ];

  // Filter commands by search query
  const filteredCommands = commands.filter((cmd) => {
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

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'cmdFadeIn 0.18s ease-out',
      }}
    >
      <div
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--white, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px var(--border, #e2e8f0)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'cmdScaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            background: 'inherit',
          }}
        >
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ color: '#2563eb', fontSize: '15px' }}
          ></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, or search query... (e.g. candidates, dark, ats)"
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
              fontSize: '14px',
              fontFamily: 'inherit',
              color: 'var(--text, #0f172a)',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '5px',
              background: 'var(--border, #f1f5f9)',
              color: '#64748b',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Command List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
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
                    background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(37, 99, 235, 0.25)'
                      : '1px solid transparent',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#2563eb' : 'var(--border, #f1f5f9)',
                      color: isSelected ? '#ffffff' : '#64748b',
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
                          color: isSelected ? '#2563eb' : 'var(--text, #0f172a)',
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
                          background: 'var(--border, #f1f5f9)',
                          color: '#64748b',
                          fontWeight: 500,
                        }}
                      >
                        {cmd.category}
                      </span>
                    </div>
                    <small
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        color: '#64748b',
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
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              <i
                className="fa-solid fa-ghost"
                style={{ fontSize: '24px', marginBottom: '8px', display: 'block', color: '#94a3b8' }}
              ></i>
              No commands found for "{search}"
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            padding: '9px 16px',
            borderTop: '1px solid var(--border, #e2e8f0)',
            background: 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: 'var(--border, #f1f5f9)', borderRadius: '3px' }}>↑</kbd> <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: 'var(--border, #f1f5f9)', borderRadius: '3px' }}>↓</kbd> Navigate
            </span>
            <span>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: 'var(--border, #f1f5f9)', borderRadius: '3px' }}>↵</kbd> Select
            </span>
            <span>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', background: 'var(--border, #f1f5f9)', borderRadius: '3px' }}>ESC</kbd> Close
            </span>
          </div>
          <span style={{ fontWeight: 600, color: '#2563eb' }}>HireIQ Spotlight</span>
        </div>
      </div>
    </div>
  );
}
