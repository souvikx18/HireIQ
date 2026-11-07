import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis with smooth inertial easing
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential ease-out
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false, // Keep native touch on mobile/tablets to prevent scroll stutter
      touchMultiplier: 1.5,
      wheelMultiplier: 1.0,
      autoResize: true,
    });

    // Make lenis globally accessible for programmatic scrolling
    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Watch for DOM changes to recalculate scroll boundaries automatically
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      resizeObserver.observe(document.body);
    }

    const handleWindowResize = () => {
      lenis.resize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // When route changes, reset scroll smoothly to top and recalculate layout
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.resize();
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return children;
}
