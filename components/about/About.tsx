'use client';

import React from 'react';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        {/* Left Column: Metadata & Education Rail */}
        <div className="about-meta-rail">
          <div className="section-label">03 / THE PERSON BEHIND THE CODE</div>

          <div className="meta-card-block">
            <h4 className="meta-block-title">VERIFIED EDUCATION</h4>
            <div className="edu-entry">
              <span className="edu-years">2024 — 2027</span>
              <p className="edu-degree">Diploma in Computer Science Engineering</p>
              <p className="edu-institution">NRI Institute of Research and Technology</p>
            </div>
            <div className="edu-entry">
              <span className="edu-years">2024</span>
              <p className="edu-degree">Matriculation (BSEB)</p>
              <p className="edu-institution">Bihar School Examination Board</p>
            </div>
          </div>

          <div className="meta-card-block">
            <h4 className="meta-block-title">HEADQUARTERS</h4>
            <p className="meta-text-val">Muzaffarpur, Bihar, India</p>
            <p className="meta-subtext-val">Active across UTC+05:30 time zone</p>
          </div>

          <div className="meta-card-block">
            <h4 className="meta-block-title">PRIMARY ROLES</h4>
            <ul className="roles-list">
              <li>Full-Stack Developer</li>
              <li>Product Builder</li>
              <li>Creative Engineer</li>
              <li>Core Team Member • Codex Monarch</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Editorial Biography & Philosophy */}
        <div className="about-editorial-content">
          <h2 className="about-main-headline">
            Curious by nature. <br />
            <span className="headline-italic">Building by intention.</span>
          </h2>

          <div className="bio-paragraphs">
            <p className="lead-bio">
              I&apos;m Ankit Raj Maurya, a Computer Science Engineering student and developer based in India.
              I enjoy turning ideas into digital products, exploring technology, and creating experiences
              that make complex software feel intuitive and dependable.
            </p>
            <p>
              My path in engineering is anchored in active building. Rather than purely theoretical studies,
              I learn by shipping: whether designing time-gated coding challenge interfaces for Codex Monarch,
              structuring comprehensive placement preparation modules for ReadyToGo, or writing custom GLSL shaders
              to deconstruct a digital portrait into mathematical particles.
            </p>
            <p>
              Technology is continuously evolving, but the core objective remains constant: solve real problems,
              respect user focus, and maintain high standards of code architecture and visual craftsmanship.
            </p>
          </div>

          <div className="engineering-values-grid">
            <div className="value-card">
              <span className="value-index">01</span>
              <h4 className="value-title">Craftsmanship</h4>
              <p className="value-desc">No sloppy shortcuts. Every transition, border, database index, and query receives deliberate care.</p>
            </div>
            <div className="value-card">
              <span className="value-index">02</span>
              <h4 className="value-title">Practical Utility</h4>
              <p className="value-desc">Code is built to serve real people. If an application isn&apos;t useful and dependable, aesthetic charm is meaningless.</p>
            </div>
            <div className="value-card">
              <span className="value-index">03</span>
              <h4 className="value-title">Relentless Curiosity</h4>
              <p className="value-desc">Continually expanding into Java, Data Structures, WebGL, and scalable systems architecture.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
