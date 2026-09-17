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
  const profileRole = user ? (user.role === 'ADMIN' ? 'Administrator' : user.role === 'HR_MANAGER' ? 'HR Manager' : user.role) : "Administrator";
  const avatarText = user
    ? `${user.firstName?.[0] || 'H'}${user.lastName?.[0] || 'R'}`.toUpperCase()
    : "HR";

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
      window.alert("Notifications\n\nYou are all caught up.");
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

          {/* Notification Button */}
          {showNotification && (
            <button
              className="notification"
              type="button"
              aria-label="Notifications"
              onClick={handleNotification}
            >
              <i className="fa-regular fa-bell"></i>
              <span></span>
            </button>
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
