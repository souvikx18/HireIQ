import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      const confirmInput = document.getElementById('confirmPassword');
      if (confirmInput) {
        confirmInput.setCustomValidity('Passwords do not match');
        e.target.reportValidity();
        confirmInput.setCustomValidity('');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        firstName,
        lastName,
        email,
        password,
      });

      document.body.classList.add('page-leaving');
      setTimeout(() => {
        document.body.classList.remove('page-leaving');
        navigate('/dashboard');
      }, 350);
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

          {errorMessage && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '15px',
              }}
            >
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
              {errorMessage}
            </div>
          )}

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
              placeholder="Password (min 8 characters)"
              required
              minLength={8}
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
              minLength={8}
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

          <button className="create-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
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
        </form>
      </section>
    </main>
  );
}
