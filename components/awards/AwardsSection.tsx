'use client';

import React, { useRef } from 'react';

export default function AwardsSection() {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cd = cardRef.current;
    if (!cd) return;
    const r = cd.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cd.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
    cd.style.setProperty('--sx', `${x * 120}%`);
  };

  const handleMouseLeave = () => {
    const cd = cardRef.current;
    if (!cd) return;
    cd.style.transform = '';
    cd.style.setProperty('--sx', '-30%');
  };

  return (
    <section id="awards" aria-label="Awards" suppressHydrationWarning>
      <div className="w aw" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h2 className="sm rv" suppressHydrationWarning>
            Certificates <em>&amp; awards.</em>
          </h2>
          <div className="meta rv" suppressHydrationWarning>
            <span>Certificate</span>
            <span>Apr 2026</span>
          </div>
          <p className="lede rv" style={{ marginTop: 0, color: 'var(--fg)' }} suppressHydrationWarning>
            AI Prompt War, Runner-up
          </p>
          <p className="lede rv" style={{ marginTop: '4px' }} suppressHydrationWarning>
            Oriental Group of Institutes
          </p>
          <a className="btn o rv" href="#" style={{ marginTop: '24px' }} suppressHydrationWarning>
            View credential
          </a>
        </div>

        <div className="ct rv" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} suppressHydrationWarning>
          <div className="cd" id="cd" ref={cardRef} suppressHydrationWarning>
            <small>Certificate of collaboration</small>
            <b>AI Prompt War</b>
            <em>Runner-up</em>
            <small>Oriental Group of Institutes</small>
          </div>
        </div>
      </div>
    </section>
  );
}
