import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth.js";
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

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRealNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }
      try {
        setLoadingNotifs(true);
        const res = await authApi.getNotifications();
        if (res?.data && isMounted) {
          const userKey = user.id || user.userId || 'curr';
          const storedReadIds = JSON.parse(
            localStorage.getItem(`hireiq_read_notifs_${userKey}`) || '[]'
          );
          const mapped = res.data.map((item) => ({
            ...item,
            read: storedReadIds.includes(item.id),
          }));
          setNotifications(mapped);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        if (isMounted) setLoadingNotifs(false);
      }
    };

    loadRealNotifications();
    return () => {
      isMounted = false;
    };
  }, [user]);

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
    if (user) {
      const userKey = user.id || user.userId || 'curr';
      const allIds = notifications.map((n) => n.id);
      localStorage.setItem(`hireiq_read_notifs_${userKey}`, JSON.stringify(allIds));
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationItemClick = (item) => {
    if (user) {
      const userKey = user.id || user.userId || 'curr';
      const storedReadIds = JSON.parse(
        localStorage.getItem(`hireiq_read_notifs_${userKey}`) || '[]'
      );
      if (!storedReadIds.includes(item.id)) {
        storedReadIds.push(item.id);
        localStorage.setItem(`hireiq_read_notifs_${userKey}`, JSON.stringify(storedReadIds));
      }
    }
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
                    {loadingNotifs ? (
                      <div style={{ padding: '24px 20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                        Loading updates...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notif-empty-state" style={{ padding: '28px 20px', textAlign: 'center' }}>
                        <i className="fa-regular fa-bell" style={{ fontSize: "26px", color: "#cbd5e1", marginBottom: "8px", display: "block" }}></i>
                        <div style={{ fontWeight: 600, color: "#334155", fontSize: '13px', marginBottom: "4px" }}>No new notifications</div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4 }}>Real-time updates regarding your applications, resume audits, and candidates will appear here.</div>
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
