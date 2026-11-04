'use client';

import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/animations/gsap/initGsap';

export default function VisualStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scrubbed multi-plane parallax timeline inspired by Razorpay AI Builders
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom-=100',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // Layer 1: Giant headline progressive scale & reveal
      tl.fromTo(
        '.story-headline-line',
        { y: 60, opacity: 0.2 },
        { y: -30, opacity: 1, stagger: 0.1, ease: 'none' },
        0
      );

      // Layer 2: Floating interface cards at distinct parallax depths
      tl.fromTo(
        '.story-layer-card.depth-back',
        { y: 140, rotate: -4 },
        { y: -120, rotate: 2, ease: 'none' },
        0
      );

      tl.fromTo(
        '.story-layer-card.depth-mid',
        { y: 90, rotate: 3 },
        { y: -160, rotate: -2, ease: 'none' },
        0
      );

      tl.fromTo(
        '.story-layer-card.depth-front',
        { y: 200, rotate: -2 },
        { y: -220, rotate: 4, ease: 'none' },
        0
      );

      // Layer 3: Floating code badge artifacts
      tl.fromTo(
        '.story-floating-badge',
        { y: 80, opacity: 0.4 },
        { y: -100, opacity: 1, stagger: 0.15, ease: 'none' },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="visual-story" className="visual-story-section">
      {/* Background Architectural Grid Lines */}
      <div className="story-ambient-glow" />

      <div className="story-content-wrapper">
        {/* Section Metadata */}
        <div className="story-section-header">
          <span className="section-label">01 / THE PHILOSOPHY</span>
          <span className="story-meta-badge">ENGINEERING STORYTELLING</span>
        </div>

        {/* Oversized Cinematic Typography with Upright & Italic Contrast */}
        <div ref={headlineRef} className="story-headline-block">
          <h2 className="story-headline-line">
            <span className="serif-upright">WE BUILD</span>
          </h2>
          <h2 className="story-headline-line">
            <span className="serif-italic">what ideas</span>
          </h2>
          <h2 className="story-headline-line">
            <span className="serif-upright">IMAGINE.</span>
          </h2>
        </div>

        <p className="story-subtext">
          Turning conceptual logic into tactile digital architecture. From student hackathons
          to high-throughput learning platforms, every line of code serves a human purpose.
        </p>

        {/* Multi-Plane Layered Composition with Genuine Screenshots */}
        <div ref={cardsContainerRef} className="story-parallax-stage">
          {/* Card 1: ReadyToGo (Deep Layer, Left) */}
          <div className="story-layer-card depth-back card-readytogo">
            <div className="card-browser-chrome">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="browser-url">readytogo.codexmonarch.me</span>
            </div>
            <div className="card-image-box">
              <img
                src="/img/projects/readytogo.png"
                alt="ReadyToGo Learning Ecosystem Preview"
                className="card-screenshot"
              />
            </div>
            <div className="card-caption">
              <span className="card-tag">DSA &amp; Placement Engine</span>
              <span className="card-title">ReadyToGo Core</span>
            </div>
          </div>

          {/* Card 2: Codex Monarch (Main Stage, Center-Front) */}
          <div className="story-layer-card depth-front card-codex">
            <div className="card-browser-chrome">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="browser-url">codexmonarch.me/hub</span>
            </div>
            <div className="card-image-box">
              <img
                src="/img/projects/codex-monarch.png"
                alt="Codex Monarch Technical Community Interface"
                className="card-screenshot"
              />
            </div>
            <div className="card-caption">
              <span className="card-tag">Technical Community</span>
              <span className="card-title">Codex Monarch Platform</span>
            </div>
          </div>

          {/* Card 3: Orbit UI (Mid Depth, Right) */}
          <div className="story-layer-card depth-mid card-orbit">
            <div className="card-browser-chrome">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="browser-url">orbitui-eta.vercel.app</span>
            </div>
            <div className="card-image-box">
              <img
                src="/img/projects/orbit-ui.png"
                alt="Orbit UI Component Design System"
                className="card-screenshot"
              />
            </div>
            <div className="card-caption">
              <span className="card-tag">Design System</span>
              <span className="card-title">Orbit UI Components</span>
            </div>
          </div>

          {/* Floating Artifact Badges */}
          <div className="story-floating-badge badge-top-right">
            <span className="badge-icon">&lt;/&gt;</span>
            <span className="badge-text">100% PRODUCTION VERIFIED</span>
          </div>
          <div className="story-floating-badge badge-bottom-left">
            <span className="badge-icon">&bull;</span>
            <span className="badge-text">TURSO &bull; NEXT.JS &bull; THREE.JS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
