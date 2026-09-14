import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/upgrade.css';
import '../css/upgrade-polish.css';
import '../css/upgrade-plans.css';

export default function Upgrade() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(
    'Pro plan selected. Our team will contact you shortly.'
  );
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleStartPro = () => {
    triggerToast('Pro plan selected. Our team will contact you shortly.');
  };

  const handlePlanClick = (planName) => {
    triggerToast(`${planName} plan selected. Our team will contact you shortly.`);
  };

  const handleBackNav = (e) => {
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      document.body.classList.remove('page-leaving');
      navigate('/');
    }, 420);
  };

  return (
    <div className="upgrade-page-layout">
      <main className="upgrade-page">
        <header className="upgrade-header">
          <a
            className="back-link"
            href="index.html"
            onClick={handleBackNav}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </a>
          <div className="upgrade-title-block">
            <h1>Upgrade to Pro</h1>
            <p>Unlock advanced insights and hire top talent faster.</p>
          </div>
        </header>
        <section className="upgrade-hero">
          <div className="crown">
            <i className="fa-solid fa-crown"></i>
          </div>
          <span className="eyebrow">HireIQ Pro</span>
          <h1>Build a sharper hiring team.</h1>
          <p>
            Unlock advanced insights, deeper skill analysis and faster decisions
            for every candidate.
          </p>
          <div className="plans">
            <article className="plan-card compact-plan">
              <span className="plan-label">For small teams</span>
              <h2>Starter</h2>
              <p className="plan-copy">
                A focused toolkit for growing hiring teams.
              </p>
              <div className="price">
                <strong>$9</strong>
                <span>/ month</span>
              </div>
              <button
                type="button"
                className="plan-button"
                data-plan="Starter"
                onClick={() => handlePlanClick('Starter')}
              >
                <i className="fa-solid fa-arrow-right"></i> Choose Starter
              </button>
              <ul>
                <li>
                  <i className="fa-solid fa-check"></i> 50 resume screenings
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Core candidate insights
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Monthly hiring summary
                </li>
              </ul>
            </article>
            <article className="plan-card featured">
              <span className="plan-badge">Recommended</span>
              <h2>Pro</h2>
              <p className="plan-copy">
                Everything you need to hire with confidence.
              </p>
              <div className="price">
                <strong>$29</strong>
                <span>/ month</span>
              </div>
              <button type="button" id="startPro" onClick={handleStartPro}>
                <i className="fa-solid fa-bolt"></i> Start Pro
              </button>
              <ul>
                <li>
                  <i className="fa-solid fa-check"></i> Advanced resume
                  screening
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Complete skill gap
                  insights
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Unlimited hiring
                  reports
                </li>
              </ul>
            </article>
            <article className="plan-card compact-plan enterprise-plan">
              <span className="plan-label">For larger teams</span>
              <h2>Enterprise</h2>
              <p className="plan-copy">
                Flexible intelligence for high-volume hiring.
              </p>
              <div className="price">
                <strong>Custom</strong>
              </div>
              <button
                type="button"
                className="plan-button"
                data-plan="Enterprise"
                onClick={() => handlePlanClick('Enterprise')}
              >
                <i className="fa-solid fa-calendar-check"></i> Talk to Sales
              </button>
              <ul>
                <li>
                  <i className="fa-solid fa-check"></i> Unlimited screening
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Team access and
                  controls
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Dedicated success
                  support
                </li>
              </ul>
            </article>
            <article className="benefit-panel">
              <span className="eyebrow">What you get</span>
              <h2>Turn every gap into a growth plan.</h2>
              <div className="benefit">
                <i className="fa-solid fa-chart-line"></i>
                <div>
                  <strong>Smarter matching</strong>
                  <span>See candidate fit beyond keywords.</span>
                </div>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <div>
                  <strong>Actionable insights</strong>
                  <span>Know exactly which skills to build next.</span>
                </div>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-clock"></i>
                <div>
                  <strong>More time saved</strong>
                  <span>Move from shortlist to decision faster.</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <div
        className={`upgrade-toast ${showToast ? 'show' : ''}`}
        id="upgradeToast"
        role="status"
      >
        {toastMessage}
      </div>
    </div>
  );
}
