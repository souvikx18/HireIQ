import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageSEO } from '../hooks/usePageSEO';
import logo from '../assets/img/hireiq-logo.png';
import '../css/landing.css';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [activeNav, setActiveNav] = useState('home');
  const [openFaq, setOpenFaq] = useState(0); // First question open by default
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

  usePageSEO({
    title: 'HireIQ — AI Resume Screening & Skill Gap Analysis Platform',
    description: 'Transform your recruitment process with HireIQ. Automated AI resume parsing, candidate scoring, skill gap analysis, and ATS optimization.',
    keywords: 'AI recruitment, resume screening, skill gap analysis, ATS checker, candidate ranking, hiring platform',
  });

  // Disconnect from Dashboard dark/light mode: Always use fixed normal appearance
  useEffect(() => {
    document.body.classList.remove('dark-mode');

    return () => {
      // Restore Dashboard theme on leaving Landing page
      const savedTheme = localStorage.getItem('theme') || 'light';
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    };
  }, []);

  const scrollToSection = (e, sectionId, navName) => {
    e.preventDefault();
    setActiveNav(navName);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? -1 : idx);
  };

  const faqs = [
    {
      q: 'How does HireIQ analyze resumes?',
      a: 'HireIQ uses advanced AI and natural language processing to extract skills, experience and relevant information from resumes, matching them against job requirements and calculating ATS compatibility scores.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes, your candidate data and uploaded resumes are protected with enterprise-grade AES-256 encryption. We adhere to stringent privacy standards and GDPR compliance.',
    },
    {
      q: 'Can I integrate HireIQ with other tools?',
      a: 'HireIQ offers seamless REST API integration with popular ATS and HRIS platforms like Greenhouse, Lever, Workday, and standard webhook endpoints.',
    },
    {
      q: 'How is HireIQ deployed in an enterprise environment?',
      a: 'HireIQ can be deployed via Docker container orchestration, Kubernetes, or hosted cloud environments (AWS, GCP, Azure) with dedicated PostgreSQL databases and isolated AI microservices.',
    },
    {
      q: 'What role-based access controls and audit capabilities are included?',
      a: 'HireIQ enforces granular RBAC distinguishing Recruiters, Hiring Managers, and Candidates, with full tamper-evident audit logging for all candidate status transitions and resume evaluations.',
    },
  ];

  return (
    <div className="landing-page-root">
      {/* ================= 1. NAVBAR ================= */}
      <header className="lp-navbar">
        <div className="landing-container lp-navbar-inner">
          <a
            href="#home"
            className="lp-brand"
            onClick={(e) => scrollToSection(e, 'home', 'home')}
          >
            <img src={logo} alt="HireIQ" className="lp-brand-logo" />
            <span className="lp-brand-name">
              Hire<span>IQ</span>
            </span>
          </a>

          <nav>
            <ul className="lp-nav-menu">
              <li>
                <a
                  href="#home"
                  className={`lp-nav-link ${activeNav === 'home' ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(e, 'home', 'home')}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className={`lp-nav-link ${activeNav === 'features' ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(e, 'features', 'features')}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className={`lp-nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(e, 'how-it-works', 'how-it-works')}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#why-hireiq"
                  className={`lp-nav-link ${activeNav === 'why-hireiq' ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(e, 'why-hireiq', 'why-hireiq')}
                >
                  Why HireIQ
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className={`lp-nav-link ${activeNav === 'testimonials' ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(e, 'testimonials', 'testimonials')}
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className={`lp-nav-link ${activeNav === 'faq' ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(e, 'faq', 'faq')}
                >
                  FAQs
                </a>
              </li>
            </ul>
          </nav>

          <div className="lp-nav-actions">
            <Link
              to={isAuthenticated ? "/candidate/resume-checker" : "/login?redirect=/candidate/resume-checker"}
              className="lp-btn-login"
              style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-file-shield"></i>
              ATS Check
            </Link>
            <Link to="/login" className="lp-btn-login">
              Login
            </Link>
            <Link to="/signup" className="lp-btn-signup">
              Sign Up
            </Link>
            <button
              type="button"
              className="lp-mobile-toggle"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              title={mobileNavOpen ? "Close menu" : "Open menu"}
            >
              <i className={`fa-solid ${mobileNavOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Nav Backdrop */}
        {mobileNavOpen && (
          <div
            className="lp-mobile-backdrop"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Slide Drawer */}
        <div className={`lp-mobile-drawer ${mobileNavOpen ? 'open' : ''}`} aria-hidden={!mobileNavOpen}>
          <ul className="lp-mobile-nav-list">
            <li>
              <a
                href="#home"
                className={`lp-mobile-nav-link ${activeNav === 'home' ? 'active' : ''}`}
                onClick={(e) => {
                  scrollToSection(e, 'home', 'home');
                  setMobileNavOpen(false);
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#features"
                className={`lp-mobile-nav-link ${activeNav === 'features' ? 'active' : ''}`}
                onClick={(e) => {
                  scrollToSection(e, 'features', 'features');
                  setMobileNavOpen(false);
                }}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className={`lp-mobile-nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`}
                onClick={(e) => {
                  scrollToSection(e, 'how-it-works', 'how-it-works');
                  setMobileNavOpen(false);
                }}
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#why-hireiq"
                className={`lp-mobile-nav-link ${activeNav === 'why-hireiq' ? 'active' : ''}`}
                onClick={(e) => {
                  scrollToSection(e, 'why-hireiq', 'why-hireiq');
                  setMobileNavOpen(false);
                }}
              >
                Why HireIQ
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className={`lp-mobile-nav-link ${activeNav === 'testimonials' ? 'active' : ''}`}
                onClick={(e) => {
                  scrollToSection(e, 'testimonials', 'testimonials');
                  setMobileNavOpen(false);
                }}
              >
                Testimonials
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className={`lp-mobile-nav-link ${activeNav === 'faq' ? 'active' : ''}`}
                onClick={(e) => {
                  scrollToSection(e, 'faq', 'faq');
                  setMobileNavOpen(false);
                }}
              >
                FAQs
              </a>
            </li>
          </ul>

          <div className="lp-mobile-drawer-actions">
            <Link
              to={isAuthenticated ? "/candidate/resume-checker" : "/login?redirect=/candidate/resume-checker"}
              className="lp-btn-login"
              style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => setMobileNavOpen(false)}
            >
              <i className="fa-solid fa-file-shield"></i>
              ATS Check
            </Link>
            <Link to="/login" className="lp-btn-login" onClick={() => setMobileNavOpen(false)}>
              Login
            </Link>
            <Link to="/signup" className="lp-btn-signup" onClick={() => setMobileNavOpen(false)}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <section id="home" className="lp-hero-section">
        <div className="landing-container lp-hero-grid">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>Smarter Hiring with AI</span>
            </div>

            <h1 className="lp-hero-title">
              AI Resume Screening &
              <span>Skill Gap Analysis</span>
            </h1>

            <p className="lp-hero-subtitle">
              HireIQ helps you find the right talent faster with AI-powered
              resume screening, skill gap analysis and intelligent candidate
              matching.
            </p>

            <div className="lp-hero-buttons">
              <Link to="/signup" className="lp-btn-primary">
                Get Started <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <a
                href="#features"
                className="lp-btn-secondary"
                onClick={(e) => scrollToSection(e, 'features', 'features')}
              >
                Learn More
              </a>
            </div>

            <div className="lp-hero-metrics">
              <div className="lp-metric-item">
                <span className="lp-metric-number">10K+</span>
                <span className="lp-metric-label">Resumes Analyzed</span>
              </div>
              <div className="lp-metric-divider"></div>
              <div className="lp-metric-item">
                <span className="lp-metric-number">500+</span>
                <span className="lp-metric-label">Companies Trust Us</span>
              </div>
              <div className="lp-metric-divider"></div>
              <div className="lp-metric-item">
                <span className="lp-metric-number">95%</span>
                <span className="lp-metric-label">Accurate Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURES SECTION ================= */}
      <section id="features" className="lp-features-section">
        <div className="landing-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Features</h2>
            <p className="lp-section-subtitle">
              Powerful tools to make your hiring process simple and effective.
            </p>
          </div>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon-wrap">
                <i className="fa-regular fa-file-lines"></i>
              </div>
              <h3 className="lp-feature-title">Resume Screening</h3>
              <p className="lp-feature-desc">
                Automatically analyze and shortlist the best candidates using AI.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-wrap">
                <i className="fa-solid fa-chart-column"></i>
              </div>
              <h3 className="lp-feature-title">Skill Gap Analysis</h3>
              <p className="lp-feature-desc">
                Identify missing skills and recommend training paths.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-wrap">
                <i className="fa-solid fa-users"></i>
              </div>
              <h3 className="lp-feature-title">Candidate Matching</h3>
              <p className="lp-feature-desc">
                Match candidates with the right job roles based on skills and experience.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-wrap purple">
                <i className="fa-regular fa-lightbulb"></i>
              </div>
              <h3 className="lp-feature-title">AI Insights</h3>
              <p className="lp-feature-desc">
                Get data-driven insights to make better hiring decisions.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-wrap">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h3 className="lp-feature-title">Reports & Analytics</h3>
              <p className="lp-feature-desc">
                Track your hiring process with detailed reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. HOW IT WORKS ================= */}
      <section id="how-it-works" className="lp-how-section">
        <div className="landing-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">How It Works</h2>
            <p className="lp-section-subtitle">
              Get started in just a few simple steps.
            </p>
          </div>

          <div className="lp-how-grid">
            {/* Step 1 */}
            <div className="lp-how-card">
              <div className="lp-how-icon-container">
                <span className="lp-how-step-num">1</span>
                <i className="fa-solid fa-arrow-up-from-bracket"></i>
              </div>
              <h3 className="lp-how-card-title">Upload Resume</h3>
              <p className="lp-how-card-desc">
                Upload candidate resumes in seconds.
              </p>
            </div>

            <div className="lp-how-arrow">
              <i className="fa-solid fa-arrow-right-long"></i>
            </div>

            {/* Step 2 */}
            <div className="lp-how-card">
              <div className="lp-how-icon-container">
                <span className="lp-how-step-num">2</span>
                <i className="fa-solid fa-magnifying-glass-chart"></i>
              </div>
              <h3 className="lp-how-card-title">AI Analyzes Resume</h3>
              <p className="lp-how-card-desc">
                Our AI analyzes skills, experience and more.
              </p>
            </div>

            <div className="lp-how-arrow">
              <i className="fa-solid fa-arrow-right-long"></i>
            </div>

            {/* Step 3 */}
            <div className="lp-how-card">
              <div className="lp-how-icon-container">
                <span className="lp-how-step-num">3</span>
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <h3 className="lp-how-card-title">Identify Skills & Gaps</h3>
              <p className="lp-how-card-desc">
                Find missing skills and get recommendations.
              </p>
            </div>

            <div className="lp-how-arrow">
              <i className="fa-solid fa-arrow-right-long"></i>
            </div>

            {/* Step 4 */}
            <div className="lp-how-card">
              <div className="lp-how-icon-container">
                <span className="lp-how-step-num">4</span>
                <i className="fa-solid fa-user-check"></i>
              </div>
              <h3 className="lp-how-card-title">Get Candidate Insights</h3>
              <p className="lp-how-card-desc">
                View detailed analysis and match the best talent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. WHY HIREIQ? ================= */}
      <section id="why-hireiq" className="lp-why-section">
        <div className="landing-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Why HireIQ?</h2>
            <p className="lp-section-subtitle">
              Everything you need to hire smarter and build stronger teams.
            </p>
          </div>

          <div className="lp-why-grid">
            <div className="lp-why-card">
              <div className="lp-why-icon-wrap">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h3 className="lp-why-title">Faster Hiring</h3>
              <p className="lp-why-desc">
                Reduce time-to-hire with automated screening.
              </p>
            </div>

            <div className="lp-why-card">
              <div className="lp-why-icon-wrap">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <h3 className="lp-why-title">Better Matching</h3>
              <p className="lp-why-desc">
                Find candidates who truly fit your job roles.
              </p>
            </div>

            <div className="lp-why-card">
              <div className="lp-why-icon-wrap">
                <i className="fa-solid fa-users"></i>
              </div>
              <h3 className="lp-why-title">Identify Skill Gaps</h3>
              <p className="lp-why-desc">
                Understand skill gaps and plan training.
              </p>
            </div>

            <div className="lp-why-card">
              <div className="lp-why-icon-wrap">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="lp-why-title">Data-Driven Decisions</h3>
              <p className="lp-why-desc">
                Make confident hiring decisions with insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. TESTIMONIALS ================= */}
      <section id="testimonials" className="lp-testimonials-section">
        <div className="landing-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">What Our Users Say</h2>
            <p className="lp-section-subtitle">
              Trusted by HR teams and companies around the world.
            </p>
          </div>

          <div className="lp-testimonials-grid">
            {/* Testimonial 1 */}
            <div className="lp-testimonial-card">
              <p className="lp-testimonial-text">
                "HireIQ has reduced our hiring time by 70%. The AI insights are
                incredibly accurate and helpful!"
              </p>
              <div className="lp-testimonial-author-wrap">
                <div className="lp-testimonial-profile">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt="Priya Sharma"
                    className="lp-testimonial-img"
                  />
                  <div>
                    <h4 className="lp-testimonial-name">Priya Sharma</h4>
                    <p className="lp-testimonial-role">HR Manager, TechCorp</p>
                  </div>
                </div>
                <div className="lp-testimonial-stars">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="lp-testimonial-card">
              <p className="lp-testimonial-text">
                "The skill gap analysis feature is a game changer. It helps us
                find and grow the right talent."
              </p>
              <div className="lp-testimonial-author-wrap">
                <div className="lp-testimonial-profile">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Rahul Mehta"
                    className="lp-testimonial-img"
                  />
                  <div>
                    <h4 className="lp-testimonial-name">Rahul Mehta</h4>
                    <p className="lp-testimonial-role">
                      Talent Acquisition Lead, InnovateX
                    </p>
                  </div>
                </div>
                <div className="lp-testimonial-stars">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="lp-testimonial-card">
              <p className="lp-testimonial-text">
                "Simple, powerful and easy to use. HireIQ has transformed our
                recruitment process."
              </p>
              <div className="lp-testimonial-author-wrap">
                <div className="lp-testimonial-profile">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                    alt="Anjali Verma"
                    className="lp-testimonial-img"
                  />
                  <div>
                    <h4 className="lp-testimonial-name">Anjali Verma</h4>
                    <p className="lp-testimonial-role">HR Director, GrowthSoft</p>
                  </div>
                </div>
                <div className="lp-testimonial-stars">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. FAQ SECTION ================= */}
      <section id="faq" className="lp-faq-section">
        <div className="landing-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Frequently Asked Questions</h2>
            <p className="lp-section-subtitle">
              Find answers to common questions about HireIQ.
            </p>
          </div>

          <div className="lp-faq-grid">
            <div className="lp-faq-accordion">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`lp-faq-item ${openFaq === idx ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className="lp-faq-question"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.q}</span>
                    <i className="fa-solid fa-chevron-down lp-faq-icon"></i>
                  </button>
                  {openFaq === idx && (
                    <div className="lp-faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Still have questions card */}
            <div className="lp-faq-card">
              <h3 className="lp-faq-card-title">Still have questions?</h3>
              <p className="lp-faq-card-desc">
                We're here to help you get started with HireIQ.
              </p>
              <a
                href="mailto:support@hireiq.com"
                className="lp-faq-contact-btn"
              >
                Contact Us <i className="fa-solid fa-arrow-right"></i>
              </a>
              <div className="lp-faq-card-illustration">
                <i className="fa-regular fa-comments"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. FINAL CTA ================= */}
      <section className="lp-cta-section">
        <div className="landing-container">
          <div className="lp-cta-box">
            <div className="lp-cta-badge">Get Started Today</div>
            <h2 className="lp-cta-title">Ready to hire smarter?</h2>
            <p className="lp-cta-subtitle">
              Join thousands of companies already using HireIQ to find and grow top talent.
            </p>
            <Link to="/signup" className="lp-btn-primary">
              Create Your Account <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 9. FOOTER ================= */}
      <footer className="lp-footer">
        <div className="landing-container">
          <div className="lp-footer-grid">
            {/* Col 1 */}
            <div>
              <div className="lp-brand">
                <img src={logo} alt="HireIQ" className="lp-brand-logo" />
                <span className="lp-brand-name">
                  Hire<span>IQ</span>
                </span>
              </div>
              <p className="lp-footer-tagline">Smart Hiring Simplified</p>
              <div className="lp-footer-socials">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-footer-social-link"
                  aria-label="LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                <a
                  href="https://www.Twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-footer-social-link"
                  aria-label="Twitter"
                >
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-footer-social-link"
                  aria-label="YouTube"
                >
                  <i className="fa-brands fa-youtube"></i>
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-footer-social-link"
                  aria-label="Facebook"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="lp-footer-col-title">Quick Links</h4>
              <ul className="lp-footer-links">
                <li>
                  <a
                    href="#home"
                    className="lp-footer-link"
                    onClick={(e) => scrollToSection(e, 'home', 'home')}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="lp-footer-link"
                    onClick={(e) => scrollToSection(e, 'features', 'features')}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="lp-footer-link"
                    onClick={(e) => scrollToSection(e, 'how-it-works', 'how-it-works')}
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#why-hireiq"
                    className="lp-footer-link"
                    onClick={(e) => scrollToSection(e, 'why-hireiq', 'why-hireiq')}
                  >
                    Why HireIQ
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="lp-footer-link"
                    onClick={(e) => scrollToSection(e, 'testimonials', 'testimonials')}
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="lp-footer-link"
                    onClick={(e) => scrollToSection(e, 'faq', 'faq')}
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="lp-footer-col-title">Features</h4>
              <ul className="lp-footer-links">
                <li>
                  <span className="lp-footer-link">Resume Screening</span>
                </li>
                <li>
                  <span className="lp-footer-link">Skill Gap Analysis</span>
                </li>
                <li>
                  <span className="lp-footer-link">Candidate Matching</span>
                </li>
                <li>
                  <span className="lp-footer-link">AI Insights</span>
                </li>
                <li>
                  <span className="lp-footer-link">Reports & Analytics</span>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="lp-footer-col-title">Contact</h4>
              <div className="lp-footer-contact-item">
                <i className="fa-regular fa-envelope"></i>
                <a href="mailto:support@hireiq.com" className="lp-footer-link" title="Send email to support">
                  support@hireiq.com
                </a>
              </div>
              <div className="lp-footer-contact-item">
                <i className="fa-solid fa-phone"></i>
                <a href="tel:+919732145124" className="lp-footer-link" title="Call support">
                  +91 9732145124
                </a>
              </div>
              <div className="lp-footer-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>Kolkata, India</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="lp-footer-bottom">
            <div>© 2026 HireIQ. All rights reserved.</div>
            <div className="lp-footer-legal">
              <button
                type="button"
                className="lp-legal-btn"
                onClick={() => setLegalModal('privacy')}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                className="lp-legal-btn"
                onClick={() => setLegalModal('terms')}
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Dialog Modal */}
      {legalModal && (
        <div className="lp-legal-overlay" onClick={() => setLegalModal(null)} role="dialog" aria-modal="true">
          <div className="lp-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lp-legal-header">
              <h3>{legalModal === 'privacy' ? 'HireIQ Privacy Policy' : 'HireIQ Terms of Service'}</h3>
              <button
                type="button"
                className="lp-legal-close"
                onClick={() => setLegalModal(null)}
                aria-label="Close dialog"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="lp-legal-body">
              {legalModal === 'privacy' ? (
                <>
                  <p><strong>Effective Date:</strong> January 1, 2026</p>
                  <p>HireIQ is committed to protecting the privacy of recruiters, hiring managers, and candidates. This policy explains how we collect, use, and safeguard personal and evaluation data.</p>
                  <h4>1. Information We Collect</h4>
                  <p>We process candidate resumes, contact details, parsed skill histories, and job role specifications strictly for AI screening, ATS compatibility checks, and hiring workflows.</p>
                  <h4>2. Data Security & Encryption</h4>
                  <p>All stored resumes and assessment profiles are encrypted at rest with AES-256 and in transit via TLS 1.3. We do not sell your personal data or candidate resumes to third parties.</p>
                  <h4>3. Data Retention</h4>
                  <p>Candidate resumes and audit metrics are retained in accordance with your organization's compliance policy or until an account administrator requests deletion.</p>
                  <h4>4. Inquiries</h4>
                  <p>For data access requests or GDPR inquiries, contact our Data Protection Officer at <a href="mailto:support@hireiq.com">support@hireiq.com</a>.</p>
                </>
              ) : (
                <>
                  <p><strong>Effective Date:</strong> January 1, 2026</p>
                  <p>By accessing or using HireIQ, you agree to be bound by these Terms of Service.</p>
                  <h4>1. Usage & Accounts</h4>
                  <p>HireIQ provides AI-driven candidate ranking, skill gap analysis, and resume evaluation services. You agree to maintain account credential confidentiality and use the service in compliance with labor regulations.</p>
                  <h4>2. Candidate Screening Compliance</h4>
                  <p>Organizations remain responsible for fair hiring decisions. HireIQ operates as an intelligent decision-support assistant and does not guarantee employment outcomes.</p>
                  <h4>3. Service Availability</h4>
                  <p>We maintain an enterprise 99.9% uptime SLA for Pro and Enterprise subscribers. Planned maintenance will be communicated with advance notice.</p>
                  <h4>4. Contact</h4>
                  <p>Questions regarding service agreements can be directed to <a href="mailto:support@hireiq.com">support@hireiq.com</a>.</p>
                </>
              )}
            </div>
            <div className="lp-legal-footer">
              <button type="button" className="lp-btn-login" onClick={() => setLegalModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
