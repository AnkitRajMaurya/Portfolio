'use client';

import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" aria-label="About">
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          From problem to <em>production-ready.</em>
        </h2>
        <div className="ab" suppressHydrationWarning>
          <div className="gl rv" suppressHydrationWarning>
            <p>
              Hello, I&apos;m Ankit, a Full-Stack Developer and Co-founder at Codex Monarch, based in Muzaffarpur, Bihar. I build highly scalable, production-ready applications that merge technical efficiency with elegant user experiences.
            </p>
            <p>
              My toolkit spans the modern web landscape, from reactive Next.js frontends to robust Node.js microservices. I thrive on architectural puzzles and on turning abstract ideas into software people love to use.
            </p>
            <div className="tags">
              <span>React &amp; Next.js</span>
              <span>Node.js &amp; MongoDB</span>
              <span>Flutter hybrid</span>
            </div>
            <a className="btn" href="#" download>
              Download CV
            </a>
            <a className="btn o" href="#contact">
              Let&apos;s talk
            </a>
          </div>
          <dl className="gl fx rv" style={{ padding: '12px 30px', alignSelf: 'start' }} suppressHydrationWarning>
            <div>
              <dt>Role</dt>
              <dd>Co-founder, Codex Monarch</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>Muzaffarpur, Bihar, India</dd>
            </div>
            <div>
              <dt>Studying</dt>
              <dd>Diploma in CSE, NIRT</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:ankit5242raj1@outlook.com">ankit5242raj1@outlook.com</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
