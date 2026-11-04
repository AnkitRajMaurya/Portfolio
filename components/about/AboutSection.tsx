'use client';

import React, { useEffect, useState } from 'react';

export default function AboutSection() {
  const [content, setContent] = useState({
    about_slogan: 'From problem to production-ready.',
    about_description:
      "Hello, I'm Ankit, a Full-Stack Developer and Co-founder at Codex Monarch, based in Muzaffarpur, Bihar. I build highly scalable, production-ready applications that merge technical efficiency with elegant user experiences.",
    location: 'Muzaffarpur, Bihar, India',
    email: 'ankit5242raj1@outlook.com',
    resume_url: 'https://drive.google.com/file/d/1359Lhc3l75iBDmdHSWJDFBz4O8sG33MJ/view?usp=drivesdk',
  });

  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setContent((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" aria-label="About">
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          From problem to <em>production-ready.</em>
        </h2>
        <div className="ab" suppressHydrationWarning>
          <div className="gl rv" suppressHydrationWarning>
            <p>{content.about_description}</p>
            <p>
              My toolkit spans the modern web landscape, from reactive Next.js frontends to robust Node.js microservices. I thrive on architectural puzzles and on turning abstract ideas into software people love to use.
            </p>
            <div className="tags">
              <span>React &amp; Next.js</span>
              <span>Node.js &amp; MongoDB</span>
              <span>Flutter hybrid</span>
            </div>
            <a
              className="btn"
              href={content.resume_url || 'https://drive.google.com/file/d/1359Lhc3l75iBDmdHSWJDFBz4O8sG33MJ/view?usp=drivesdk'}
              target="_blank"
              rel="noopener noreferrer"
              download="Ankit_Raj_Maurya_CV.pdf"
            >
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
              <dd>{content.location || 'Muzaffarpur, Bihar, India'}</dd>
            </div>
            <div>
              <dt>Studying</dt>
              <dd>Diploma in CSE, NIRT</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${content.email || 'ankit5242raj1@outlook.com'}`}>
                  {content.email || 'ankit5242raj1@outlook.com'}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
