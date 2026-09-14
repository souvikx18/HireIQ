import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Disconnect from Dashboard dark/light mode: Always use fixed appearance
  useEffect(() => {
    document.body.classList.remove('dark-mode');

    return () => {
      // Restore Dashboard theme on leaving Signup page
      const savedTheme = localStorage.getItem('theme') || 'light';
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    };
  }, []);

  const handleNavWithTransition = (to) => (e) => {
    e?.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      document.body.classList.remove('page-leaving');
      navigate(to);
    }, 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      const confirmInput = document.getElementById('confirmPassword');
      if (confirmInput) {
        confirmInput.setCustomValidity('Passwords do not match');
        e.target.reportValidity();
        confirmInput.setCustomValidity('');
      }
      return;
    }
    login();
    handleNavWithTransition('/dashboard')(e);
  };

  const handleGoogleSignup = (e) => {
    login();
    handleNavWithTransition('/dashboard')(e);
  };

  return (
    <main className="signup-page">
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
            Leverage Enterprise LLM context parsing to align your engineers with
            next-gen project requirements.
          </p>
        </div>
      </section>

      <section className="signup-form-panel">
        <form className="signup-form" id="signupForm" onSubmit={handleSubmit}>
          <h2>Create your account</h2>

          <div className="signup-field">
            <input
              id="firstName"
              type="text"
              placeholder="First name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="signup-field">
            <input
              id="lastName"
              type="text"
              placeholder="Last name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="signup-field">
            <input
              id="email"
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="signup-field input-with-icon">
            <input
              id="signupPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              data-target="signupPassword"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={`fa-regular fa-eye${showPassword ? '-slash' : ''}`}
              ></i>
            </button>
          </div>

          <div className="signup-field input-with-icon">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              data-target="confirmPassword"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i
                className={`fa-regular fa-eye${showConfirmPassword ? '-slash' : ''}`}
              ></i>
            </button>
          </div>

          <button className="create-button" type="submit">
            Sign Up
          </button>

          <p className="existing-account">
            Already have an account?{' '}
            <a
              href="login.html"
              onClick={handleNavWithTransition('/login')}
            >
              Log In
            </a>
          </p>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignup}
          >
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign up with Google
          </button>
        </form>
      </section>
    </main>
  );
}
