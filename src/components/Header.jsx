import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const [loginOpen, setLoginOpen] = useState(
    () => searchParams.get('openLogin') === '1'
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [profileName, setProfileName] = useState('HR Manager');
  const [profileRole, setProfileRole] = useState('Administrator');
  const [avatarText, setAvatarText] = useState('HR');

  useEffect(() => {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('profile') || 'null');
        if (saved && saved.name) {
          setProfileName(saved.name);
          const initials = saved.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          setAvatarText(initials || 'HR');
        }
        if (saved && saved.role) {
          setProfileRole(saved.role);
        }
      } catch {
        // ignore
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (loginOpen) {
      document.body.classList.add('login-open');
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.remove('login-open');
      const savedTheme = localStorage.getItem('theme') || 'light';
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    }
  }, [loginOpen]);

  useEffect(() => {
    if (searchParams.get('openLogin') === '1') {
      setLoginOpen(true);
    }
  }, [searchParams]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleOpenLogin = (e) => {
    if (onProfileClick) {
      onProfileClick(e);
    } else {
      navigate('/setting');
    }
  };

  const handleCloseLogin = () => {
    setLoginOpen(false);
    document.body.classList.remove("login-open");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    handleCloseLogin();
  };

  const handleCreateAccountClick = (e) => {
    e.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(() => {
      document.body.classList.remove("page-leaving");
      handleCloseLogin();
      navigate("/signup");
    }, 350);
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

          {/* Profile / Login Area */}
          {showProfile && (
            <button
              className="profile"
              id="profileBtn"
              type="button"
              aria-label="Open login"
              onClick={handleOpenLogin}
            >
              <div className="avatar">{avatarText}</div>

              <div>
                <strong>{profileName}</strong>
                <small>{profileRole}</small>
              </div>

              <i className="fa-solid fa-chevron-down"></i>
            </button>
          )}
        </div>
      </header>

      {/* Built-in Login Overlay mounted to document.body */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={`login-overlay ${loginOpen ? "show" : ""}`}
            id="loginOverlay"
            aria-hidden={!loginOpen}
            onClick={(e) => {
              if (e.target.id === "loginOverlay") handleCloseLogin();
            }}
          >
            <section className="login-visual">
              <div className="login-orbit" aria-hidden="true">
                <span className="orbit orbit-one"></span>
                <span className="orbit orbit-two"></span>
                <span className="orbit-line orbit-line-one"></span>
                <span className="orbit-line orbit-line-two"></span>
                <span className="orbit-core"></span>
              </div>
              <div className="orbit-label">HireIQ</div>
              <div className="login-message">
                <span className="login-kicker">HireIQ Talent Console</span>
                <h2>Identify Gaps. Match Potential. Accelerate Growth.</h2>
                <p>
                  Leverage Enterprise LLM context parsing to align your
                  engineers with next-gen project requirements.
                </p>
              </div>
            </section>

            <section className="login-panel" aria-label="Login form">
              <button
                className="login-close"
                id="loginClose"
                type="button"
                aria-label="Close login"
                onClick={handleCloseLogin}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              <div className="login-form-wrap">
                <h1>Welcome Back</h1>
                <p className="login-subtitle">Login to your talent console</p>
                <form id="loginForm" onSubmit={handleLoginSubmit}>
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <div className="password-label">
                    <label htmlFor="loginPassword">Password</label>
                    <a href="#">Forgot password?</a>
                  </div>
                  <div className="password-field">
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      id="togglePassword"
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`fa-regular fa-eye${showPassword ? "-slash" : ""}`}
                      ></i>
                    </button>
                  </div>
                  <button className="sign-in-btn" type="submit">
                    Login
                  </button>
                </form>
                <p className="create-account">
                  New to TalentAI?{" "}
                  <a href="signup.html" onClick={handleCreateAccountClick}>
                    Create an account
                  </a>
                </p>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
