import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/header-common.css";

export default function Header({
  title,
  subtitle,
  eyebrow,
  children,
  showThemeToggle = true,
  showUploadBtn = false,
  onUploadClick,
  showNotification = true,
  onNotificationClick,
  showProfile = true,
  onProfileClick,
  extraLeft,
  className = "",
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const profileName = user ? `${user.firstName} ${user.lastName}`.trim() : "HR Manager";
  const profileRole = user
    ? (user.role === 'ADMIN'
        ? 'Administrator'
        : user.role === 'HR_MANAGER'
        ? 'HR Manager'
        : user.role === 'CANDIDATE'
        ? 'Job Seeker'
        : user.role)
    : "Administrator";
  const avatarText = user
    ? `${user.firstName?.[0] || 'H'}${user.lastName?.[0] || 'R'}`.toUpperCase()
    : "HR";

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const isCandidate = user?.role === 'CANDIDATE';
  const [notifications, setNotifications] = useState(() => {
    return isCandidate
      ? [
          {
            id: 1,
            title: "Application Under Review",
            desc: "Your application for Senior Full Stack Engineer is being reviewed by hiring team.",
            time: "25m ago",
            read: false,
            icon: "fa-solid fa-briefcase",
            color: "#2563eb",
            bg: "#eff6ff",
            link: "/candidate/applications",
          },
          {
            id: 2,
            title: "ATS Optimization Tip",
            desc: "Add 2+ quantifiable metric bullet points to boost your ATS match score above 90%.",
            time: "2h ago",
            read: false,
            icon: "fa-solid fa-wand-magic-sparkles",
            color: "#059669",
            bg: "#ecfdf5",
            link: "/candidate/resume-checker",
          },
          {
            id: 3,
            title: "New Matching Job Opening",
            desc: "DevOps Engineer role matches 88% of your skill profile.",
            time: "1d ago",
            read: false,
            icon: "fa-solid fa-bolt",
            color: "#7c3aed",
            bg: "#faf5ff",
            link: "/candidate/jobs",
          },
          {
            id: 4,
            title: "Candidate Profile Configured",
            desc: "Your job preferences and notification settings are active.",
            time: "3d ago",
            read: true,
            icon: "fa-solid fa-circle-check",
            color: "#10b981",
            bg: "#f0fdf4",
            link: "/setting",
          },
        ]
      : [
          {
            id: 1,
            title: "New Candidate Application",
            desc: "Alex Morgan applied for Senior Full Stack Engineer role.",
            time: "15m ago",
            read: false,
            icon: "fa-solid fa-user-plus",
            color: "#2563eb",
            bg: "#eff6ff",
            link: "/candidates",
          },
          {
            id: 2,
            title: "Skill Gap Benchmark Alert",
            desc: "React & Node.js benchmarks updated for Engineering department.",
            time: "2h ago",
            read: false,
            icon: "fa-solid fa-chart-pie",
            color: "#d97706",
            bg: "#fffbeb",
            link: "/skillgapanalysis",
          },
          {
            id: 3,
            title: "Resume Intake Complete",
            desc: "12 candidate resumes successfully parsed with ATS scores computed.",
            time: "5h ago",
            read: false,
            icon: "fa-solid fa-file-shield",
            color: "#059669",
            bg: "#ecfdf5",
            link: "/resumeupload",
          },
          {
            id: 4,
            title: "System Telemetry Healthy",
            desc: "Database connections, AI models, and background services 100% operational.",
            time: "1d ago",
            read: true,
            icon: "fa-solid fa-server",
            color: "#10b981",
            bg: "#f0fdf4",
            link: "/setting",
          },
        ];
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleProfileClick = (e) => {
    if (onProfileClick) {
      onProfileClick(e);
    } else {
      setMenuOpen(!menuOpen);
      setNotificationOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotification = (e) => {
    if (onNotificationClick) {
      onNotificationClick(e);
    } else {
      setNotificationOpen((prev) => !prev);
      setMenuOpen(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationItemClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setNotificationOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleUpload = (e) => {
    if (onUploadClick) {
      onUploadClick(e);
    } else {
      navigate("/resumeupload");
    }
  };

  return (
    <>
      <header className={`header ${className}`.trim()}>
        <div className="header-left">
          {extraLeft}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="header-actions">
          {/* Page specific right controls */}
          {children}

          {/* Theme Toggle Button */}
          {showThemeToggle && (
            <button
              className="theme-toggle"
              id="themeToggle"
              type="button"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              onClick={toggleTheme}
            >
              <i
                className={`fa-solid fa-${theme === "dark" ? "sun" : "moon"}`}
              ></i>
            </button>
          )}

          {/* Upload Resume Button (where applicable) */}
          {showUploadBtn && (
            <button
              className="upload-btn"
              id="uploadBtn"
              type="button"
              onClick={handleUpload}
            >
              <i className="fa-solid fa-upload"></i>
              Upload Resume
            </button>
          )}

          {/* Notification Button & Dropdown */}
          {showNotification && (
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="notification"
                type="button"
                aria-label="Notifications"
                onClick={handleNotification}
                title="Notifications"
              >
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && <span></span>}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <div className="notif-header-left">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="notif-badge-count">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notif-mark-read-btn"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="notification-dropdown-body">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <i className="fa-regular fa-bell-slash" style={{ fontSize: "24px", color: "#94a3b8", marginBottom: "8px", display: "block" }}></i>
                        You have no notifications.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`notif-item ${!item.read ? "unread" : ""}`}
                          onClick={() => handleNotificationItemClick(item)}
                        >
                          <div
                            className="notif-item-icon"
                            style={{ background: item.bg, color: item.color }}
                          >
                            <i className={item.icon}></i>
                          </div>

                          <div className="notif-item-content">
                            <div className="notif-item-title">{item.title}</div>
                            <div className="notif-item-desc">{item.desc}</div>
                            <div className="notif-item-time">{item.time}</div>
                          </div>

                          {!item.read && <span className="notif-unread-dot"></span>}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="notification-dropdown-footer">
                    <button
                      type="button"
                      className="notif-footer-link"
                      onClick={() => setNotificationOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile / Menu Area */}
          {showProfile && (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                className="profile"
                id="profileBtn"
                type="button"
                aria-label="Open profile menu"
                onClick={handleProfileClick}
              >
                <div className="avatar">{avatarText}</div>

                <div>
                  <strong>{profileName}</strong>
                  <small>{profileRole}</small>
                </div>

                <i className="fa-solid fa-chevron-down"></i>
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "190px",
                    background: "#0d1b2e",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    padding: "8px",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: "none",
                      background: "transparent",
                      color: "#e2e8f0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/setting");
                    }}
                  >
                    <i className="fa-solid fa-gear"></i> Account Settings
                  </button>

                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: "none",
                      background: "transparent",
                      color: "#f87171",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
