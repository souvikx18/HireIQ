import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/signup.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Disconnect from Dashboard dark/light mode: Always use fixed appearance
  useEffect(() => {
    document.body.classList.remove('dark-mode');

    return () => {
      // Restore Dashboard theme on leaving Login page
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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login();
    handleNavWithTransition('/dashboard')();
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
            Leverage Enterprise LLM context parsing to align your
            engineers with next-gen project requirements.
          </p>
        </div>
      </section>

      <section className="signup-form-panel" aria-label="Login form">
        <form className="signup-form" id="loginForm" onSubmit={handleLoginSubmit}>
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Login with email</p>

          <div className="signup-field">
            <input
              id="loginEmail"
              type="email"
              placeholder="Email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>

          <div className="signup-field input-with-icon">
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button
              id="togglePassword"
              type="button"
              className="password-toggle"
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={`fa-regular fa-eye${showPassword ? '-slash' : ''}`}
              ></i>
            </button>
          </div>

          <div className="login-options-row">
            <a
              href="#"
              className="forgot-password-link"
              onClick={(e) => {
                e.preventDefault();
                window.alert('Password reset link sent to your email.');
              }}
            >
              Forgot password?
            </a>
          </div>

          <button className="create-button" type="submit">
            Login
          </button>

          <p className="existing-account">
            New to TalentAI?{' '}
            <a href="signup.html" onClick={handleNavWithTransition('/signup')}>
              Create an account
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
