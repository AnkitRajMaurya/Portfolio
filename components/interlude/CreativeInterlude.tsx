'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from '@/animations/gsap/initGsap';

export default function CreativeInterlude() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.interlude-quote-line',
        { opacity: 0.15, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center+=150',
            end: 'center center',
            scrub: 1.0,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="creative-interlude-section">
      <div className="interlude-ambient-circle" />
      <div className="interlude-content">
        <div className="interlude-symbol">• • •</div>
        <blockquote className="interlude-quote">
          <p className="interlude-quote-line">
            Curiosity is what turns
          </p>
          <p className="interlude-quote-line quote-accent">
            an engineer into a creator.
          </p>
        </blockquote>
        <span className="interlude-author">— ANKIT RAJ MAURYA • REFLECTION ON CRAFT</span>
      </div>
    </section>
  );
}
