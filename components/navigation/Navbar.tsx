'use client';

import React, { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Journey', href: '#journey' },
  { label: 'Awards', href: '#awards' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Scroll-spy active section detection
      const sections = ['about', 'work', 'stack', 'journey', 'awards', 'faq', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="site-header">
      <nav
        className={`floating-navbar ${isScrolled ? 'is-scrolled' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Plain text wordmark strictly without any graphical logo */}
        <a href="#hero-stage" className="nav-brandmark" aria-label="Ankit Raj Maurya Home">
          <span className="brand-name">Ankit Raj Maurya</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.replace('#', '');
            return (
              <a
                key={item.label}
                href={item.href}
                className={`nav-link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
                {isActive && <span className="active-dot" />}
              </a>
            );
          })}
        </div>

        {/* Primary CTA */}
        <div className="nav-action">
          <a href="#contact" className="btn-lets-talk">
            <span>Let&apos;s talk</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open-1' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className="mobile-cta-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              Let&apos;s talk ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
