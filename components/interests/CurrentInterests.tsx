'use client';

import React from 'react';

const INTEREST_AREAS = [
  {
    code: 'INT_01',
    title: 'Advanced Java & DSA',
    description: 'Mastering tree structures, dynamic programming algorithms, and memory-conscious system architecture.',
    category: 'ALGORITHMS & LOGIC',
  },
  {
    code: 'INT_02',
    title: 'Creative WebGL & Shaders',
    description: 'Exploring custom vertex and fragment shaders, GPU particle acceleration, and mathematical procedural noise.',
    category: 'CREATIVE ENGINEERING',
  },
  {
    code: 'INT_03',
    title: 'Edge Database Architectures',
    description: 'Designing low-latency distributed databases with Turso / LibSQL and edge caching strategies.',
    category: 'SYSTEM DESIGN',
  },
  {
    code: 'INT_04',
    title: 'Product Engineering & DX',
    description: 'Building developer platforms where speed, visual polish, and technical utility converge seamlessly.',
    category: 'PRODUCT THINKING',
  },
];

export default function CurrentInterests() {
  return (
    <section id="interests" className="interests-section">
      <div className="interests-header">
        <div className="section-label">06 / BEYOND THE CURRENT BUILD</div>
        <h2 className="interests-title">
          Current frontiers <br />
          <span className="title-italic">& technical curiosities.</span>
        </h2>
        <p className="interests-desc">
          Domains where I invest deliberate study and continuous architectural experimentation outside daily projects.
        </p>
      </div>

      <div className="interests-grid">
        {INTEREST_AREAS.map((item) => (
          <div key={item.code} className="interest-card">
            <div className="card-top-row">
              <span className="interest-code">{item.code}</span>
              <span className="interest-cat">{item.category}</span>
            </div>
            <h3 className="interest-heading">{item.title}</h3>
            <p className="interest-body">{item.description}</p>
            <div className="card-bottom-line" />
          </div>
        ))}
      </div>
    </section>
  );
}
