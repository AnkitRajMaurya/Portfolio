'use client';

import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top Tier: Plain Text Wordmark & Back to Top */}
        <div className="footer-top-row">
          <div className="footer-brand-wrap">
            <span className="footer-brand-name">ANKIT RAJ MAURYA</span>
            <span className="footer-brand-sub">FULL-STACK DEVELOPER &bull; CREATIVE ENGINEER</span>
          </div>

          <button onClick={scrollToTop} className="btn-back-to-top" aria-label="Back to top of page">
            <span>BACK TO TOP</span>
            <span className="arrow-up">↑</span>
          </button>
        </div>

        {/* Mid Tier: Navigation & Coordinates */}
        <div className="footer-mid-row">
          <div className="footer-nav-col">
            <span className="col-heading">NAVIGATION</span>
            <div className="footer-links">
              <a href="#selected-work">Work</a>
              <a href="#about">About</a>
              <a href="#journey">Journey</a>
              <a href="#skills">Skills</a>
              <a href="#contact">Contact</a>
            </div>
          </div>

          <div className="footer-nav-col">
            <span className="col-heading">ECOSYSTEM</span>
            <div className="footer-links">
              <a href="https://www.codexmonarch.me/" target="_blank" rel="noopener noreferrer">Codex Monarch ↗</a>
              <a href="https://readytogo.codexmonarch.me/" target="_blank" rel="noopener noreferrer">ReadyToGo ↗</a>
              <a href="https://orbitui-eta.vercel.app/" target="_blank" rel="noopener noreferrer">Orbit UI ↗</a>
              <a href="https://weather-project-lovat-five.vercel.app/" target="_blank" rel="noopener noreferrer">Weather App ↗</a>
            </div>
          </div>

          <div className="footer-nav-col">
            <span className="col-heading">NETWORK</span>
            <div className="footer-links">
              <a href="https://github.com/AnkitRajMaurya" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/ankitrajmaurya/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/ankitrajmaurya_/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>

          <div className="footer-nav-col">
            <span className="col-heading">LOCATION</span>
            <p className="coord-text">Muzaffarpur, Bihar, India</p>
            <p className="coord-text sub">26.12° N, 85.39° E • UTC+05:30</p>
          </div>
        </div>

        {/* Bottom Tier: Copyright & Disclaimers */}
        <div className="footer-bottom-row">
          <p className="copyright-text">
            © {new Date().getFullYear()} Ankit Raj Maurya. Crafted with Next.js, Three.js GLSL & GSAP.
          </p>
          <p className="canonical-domain">
            ankitrajmaurya.vercel.app
          </p>
        </div>
      </div>
    </footer>
  );
}
