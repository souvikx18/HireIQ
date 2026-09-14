import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

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
    setIsCreated(true);
  };

  const handleNavWithTransition = (to) => (e) => {
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      document.body.classList.remove('page-leaving');
      navigate(to);
    }, 350);
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
          <div className="steps" aria-label="Sign up progress">
            <div className="step active">
              <b>1</b>
              <span>Your Info</span>
            </div>
            <i></i>
            <div className="step active">
              <b>2</b>
              <span>Company</span>
            </div>
          </div>

          <h2>Set up your company</h2>
          <p className="form-intro">Tell us about your business</p>

          <label htmlFor="Name"> Name</label>
          <input
            id="Name"
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="industry">Industry</label>
          <input
            id="industry"
            type="text"
            placeholder="Industry"
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <label htmlFor="signupPassword">Password</label>
          <div className="input-with-icon">
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

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="input-with-icon">
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

          <div className="form-actions">
            <a
              className="back-button"
              href="index.html"
              onClick={handleNavWithTransition('/')}
            >
              &larr; Back
            </a>
            <button className="create-button" type="submit">
              {isCreated ? (
                'Account Created'
              ) : (
                <>
                  Create Account <span>&rarr;</span>
                </>
              )}
            </button>
          </div>
          <p className="existing-account">
            Already have an account?{' '}
            <a
              href="index.html?openLogin=1"
              onClick={handleNavWithTransition('/?openLogin=1')}
            >
              Sign in
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
