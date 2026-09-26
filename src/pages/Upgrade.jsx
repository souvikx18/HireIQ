import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/upgrade.css';
import '../css/upgrade-polish.css';
import '../css/upgrade-plans.css';

export default function Upgrade() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';
  const targetDashboard = isCandidate ? '/candidate/dashboard' : '/dashboard';
  const [toastMessage, setToastMessage] = useState(
    'Pro plan selected. Our team will contact you shortly.'
  );
  const [showToast, setShowToast] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null); // 'pro' | 'plus' | null

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPaymentModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  const handleStartPro = () => {
    setPaymentModal('pro');
  };

  const handleStartPlus = () => {
    setPaymentModal('plus');
  };

  const handlePayNow = () => {
    const planTitle = paymentModal === 'pro' ? 'HireIQ Pro' : 'HireIQ Plus';
    setPaymentModal(null);
    triggerToast(`Payment successful! Your ${planTitle} subscription is now active.`);
  };

  const handleChangePaymentMethod = () => {
    triggerToast('UPI selected. Alternate payment options will be available at checkout.');
  };

  const handlePlanClick = (planName) => {
    if (planName === 'Free') {
      triggerToast('You are currently on the Free plan.');
      return;
    }
    triggerToast(`${planName} plan selected. Our team will contact you shortly.`);
  };

  const handleBackNav = (e) => {
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      document.body.classList.remove('page-leaving');
      navigate(targetDashboard);
    }, 420);
  };

  return (
    <div className="upgrade-page-layout">
      <main className="upgrade-page">
        <header className="upgrade-header">
          <button
            type="button"
            className="back-link"
            onClick={handleBackNav}
            aria-label={isCandidate ? 'Back to Overview' : 'Back to Dashboard'}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>{isCandidate ? 'Back to Overview' : 'Back to Dashboard'}</span>
          </button>
          <div className="upgrade-title-block">
            <h1>Upgrade to Pro</h1>
            <p>Unlock advanced insights and hire top talent faster.</p>
          </div>
        </header>
        <section className="upgrade-hero">
          <div className="crown">
            <i className="fa-solid fa-crown"></i>
          </div>
          <span className="eyebrow">HireIQ Plans</span>
          <h1>Build a sharper hiring team.</h1>
          <p>
            Unlock advanced insights, deeper skill analysis and faster decisions
            for every candidate.
          </p>
          <div className="plans">
            {/* 1. FREE PLAN */}
            <article className="plan-card compact-plan current-plan">
              <span className="current-badge">Active</span>
              <span className="plan-label">Basic Access</span>
              <h2>Free</h2>
              <p className="plan-copy">
                Essential resume screening tools to get started.
              </p>
              <div className="price">
                <strong>$0</strong>
                <span>/ month</span>
              </div>
              <button
                type="button"
                className="plan-button current-plan-button"
                data-plan="Free"
                onClick={() => handlePlanClick('Free')}
              >
                <i className="fa-solid fa-check"></i> Your current plan
              </button>
              <ul>
                <li>
                  <i className="fa-solid fa-check"></i> 10 resume screenings / month
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Basic candidate matching
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Standard skill breakdown
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Community support
                </li>
              </ul>
            </article>

            {/* 2. PRO PLAN (Recommended) */}
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
                  <i className="fa-solid fa-check"></i> Advanced resume screening
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Complete skill gap insights
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Unlimited hiring reports
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Priority AI processing
                </li>
              </ul>
            </article>

            {/* 3. PLUS PLAN */}
            <article className="plan-card compact-plan plus-plan">
              <span className="plan-label">For growing teams</span>
              <h2>Plus</h2>
              <p className="plan-copy">
                Expanded intelligence and deeper analytics for fast-scaling teams.
              </p>
              <div className="price">
                <strong>$49</strong>
                <span>/ month</span>
              </div>
              <button
                type="button"
                className="plan-button"
                data-plan="Plus"
                onClick={handleStartPlus}
              >
                <i className="fa-solid fa-arrow-right"></i> Start Plus
              </button>
              <ul>
                <li>
                  <i className="fa-solid fa-check"></i> 500 resume screenings
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Custom skill benchmarks
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Multi-seat team access
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Dedicated priority support
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

      {/* Payment Confirmation Modal (Matching Reference Image) */}
      {paymentModal && (
        <div
          className="payment-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('payment-modal-overlay')) {
              setPaymentModal(null);
            }
          }}
        >
          <div
            className={`payment-modal-card ${
              paymentModal === 'pro' ? 'pro-modal-theme' : 'plus-modal-theme'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="paymentModalTitle"
          >
            {/* Modal Header */}
            <div className="payment-modal-header">
              <h2 id="paymentModalTitle">Confirm plan changes</h2>
              <button
                type="button"
                className="payment-modal-close"
                aria-label="Close modal"
                onClick={() => setPaymentModal(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Plan Info Row */}
            <div className="payment-modal-plan-row">
              <div className="payment-modal-plan-info">
                <div
                  className={`payment-modal-plan-icon ${
                    paymentModal === 'pro' ? 'pro-theme' : 'plus-theme'
                  }`}
                >
                  <i
                    className={
                      paymentModal === 'pro'
                        ? 'fa-solid fa-bolt'
                        : 'fa-solid fa-wand-magic-sparkles'
                    }
                  ></i>
                </div>
                <div>
                  <h3 className="payment-modal-plan-title">
                    {paymentModal === 'pro'
                      ? 'HireIQ Pro subscription'
                      : 'HireIQ Plus subscription'}
                  </h3>
                  <p className="payment-modal-plan-subtitle">
                    Billed monthly, starting today
                  </p>
                </div>
              </div>
              <span className="payment-modal-plan-price">
                {paymentModal === 'pro' ? '$29.00' : '$49.00'}
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="payment-modal-breakdown">
              <div className="payment-breakdown-row">
                <span className="label">Subtotal</span>
                <span className="value">
                  {paymentModal === 'pro' ? '$29.00' : '$49.00'}
                </span>
              </div>
              <div className="payment-breakdown-row tax">
                <span className="label">Tax 18%</span>
                <span className="value">
                  {paymentModal === 'pro' ? '$5.22' : '$8.82'}
                </span>
              </div>
              <div className="payment-breakdown-row total">
                <span className="label">Total due today</span>
                <span className="value">
                  {paymentModal === 'pro' ? '$34.22' : '$57.82'}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-method-section">
              <span className="payment-method-label">Payment method</span>
              <div className="payment-method-actions">
                <span className="payment-method-badge">UPI</span>
                <button
                  type="button"
                  className="change-payment-btn"
                  onClick={handleChangePaymentMethod}
                >
                  Change payment method
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="payment-security-note">
              <i className="fa-solid fa-lock"></i>
              <span>Secure and encrypted payment</span>
            </div>

            {/* Action Buttons */}
            <div className="payment-modal-footer">
              <button
                type="button"
                className="payment-btn-cancel"
                onClick={() => setPaymentModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`payment-btn-pay ${
                  paymentModal === 'pro' ? 'pro-btn' : 'plus-btn'
                }`}
                onClick={handlePayNow}
              >
                Pay now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
