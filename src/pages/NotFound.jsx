import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/img/hireiq-logo.png';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';

  useEffect(() => {
    document.title = '404 - Page Not Found | HireIQ';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'The page you are looking for could not be found on HireIQ.');
    }
  }, []);

  const homeDestination = isAuthenticated
    ? isCandidate
      ? '/candidate/dashboard'
      : '/dashboard'
    : '/';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #091224 0%, #0d1b33 50%, #112244 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow decoration */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '580px' }}>
        {/* Brand header */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            marginBottom: '32px',
          }}
        >
          <img src={logo} alt="HireIQ Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
            Hire<span style={{ color: '#3b82f6' }}>IQ</span>
          </span>
        </Link>

        {/* 404 Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.6px',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
          HTTP 404 ERROR
        </div>

        {/* Giant Number */}
        <h1
          style={{
            fontSize: 'clamp(72px, 14vw, 120px)',
            fontWeight: '900',
            lineHeight: 1,
            margin: '0 0 14px 0',
            letterSpacing: '-2px',
            background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 12px 0' }}>
          Page Not Found
        </h2>

        <p style={{ fontSize: '14.5px', color: '#94a3b8', lineHeight: 1.6, margin: '0 auto 32px auto' }}>
          The requested URL does not exist, has been moved, or is temporarily unavailable. Check the link or return to a verified section below.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '36px',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '11px 22px',
              borderRadius: '9px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Go Back
          </button>

          <Link
            to={homeDestination}
            style={{
              padding: '11px 24px',
              borderRadius: '9px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa-solid fa-house"></i>
            {isAuthenticated ? 'Go to Dashboard' : 'Return to Home'}
          </Link>

          <Link
            to="/candidate/resume-checker"
            style={{
              padding: '11px 20px',
              borderRadius: '9px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(37, 99, 235, 0.12)',
              color: '#93c5fd',
              fontSize: '13.5px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa-solid fa-file-shield"></i> ATS Resume Audit
          </Link>
        </div>

        {/* Footer Support Link */}
        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
          Need assistance? Contact our engineering support at{' '}
          <a
            href="mailto:support@hireiq.com"
            style={{ color: '#60a5fa', textDecoration: 'underline' }}
          >
            support@hireiq.com
          </a>
        </div>
      </div>
    </div>
  );
}
