'use client';

import React, { useRef, useEffect } from 'react';
import ParticlePortrait from '../particle-portrait/ParticlePortrait';
import { gsap } from '@/animations/gsap/initGsap';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation on mount
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-meta-item',
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, delay: 0.2 }
      )
      .fromTo(
        '.hero-eyebrow',
        { opacity: 0, letterSpacing: '0.35em' },
        { opacity: 1, letterSpacing: '0.22em', duration: 1.2 },
        '-=0.6'
      )
      .fromTo(
        '.hero-title-part',
        { opacity: 0, y: 40, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 1.4, stagger: 0.2 },
        '-=0.9'
      )
      .fromTo(
        '.hero-description, .hero-cta-group, .hero-bottom-bar',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15 },
        '-=0.7'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} id="hero-stage" className="hero-section">
      {/* Upper Metadata Bar */}
      <div ref={metadataRef} className="hero-top-meta">
        <div className="hero-meta-item left">
          <span className="live-pulse" />
          <span className="mono-text">FULL-STACK DEVELOPER &bull; PRODUCT BUILDER &bull; CREATIVE ENGINEER</span>
        </div>
        <div className="hero-meta-item right">
          <span className="mono-text">Based in Muzaffarpur, India &bull; Open to worldwide impact</span>
        </div>
      </div>

      {/* Hero Centerpiece: Three.js GLSL Particle Portrait */}
      <div className="hero-portrait-container">
        <ParticlePortrait />
      </div>

      {/* Layered Foreground Typography */}
      <div className="hero-foreground-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          <span>A HUMAN PERSPECTIVE ON TECHNOLOGY</span>
        </div>

        <h1 ref={headlineRef} className="hero-main-title">
          <span className="hero-title-part upright">Ankit</span>
          <span className="hero-title-part italic">Raj</span>
          <span className="hero-title-part upright">Maurya</span>
        </h1>

        <p className="hero-description">
          I build scalable digital products, engineer high-performance web systems,
          and turn complex engineering challenges into fluid, production-ready experiences.
        </p>

        <div ref={ctaRef} className="hero-cta-group">
          <a href="#work" className="btn-hero-primary">
            <span>Explore my work</span>
            <span className="btn-arrow">↓</span>
          </a>
          <a href="#contact" className="btn-hero-secondary">
            <span>Start a conversation</span>
            <span className="btn-arrow">↗</span>
          </a>
        </div>
      </div>

      {/* Hero Bottom Bar */}
      <div className="hero-bottom-bar">
        <div className="bottom-meta-col">
          <span className="scroll-indicator-text">
            <span className="scroll-arrow">↓</span>
            <span>SCROLL TO DISCOVER</span>
          </span>
        </div>
        <div className="bottom-meta-col center">
          <span className="meta-text">CORE TEAM &bull; CODEX MONARCH &bull; READYTOGO ARCHITECT</span>
        </div>
        <div className="bottom-meta-col right">
          <span className="meta-text">AN ONGOING TECHNICAL EXPLORATION ↗</span>
        </div>
      </div>
    </section>
  );
}
