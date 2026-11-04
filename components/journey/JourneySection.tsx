'use client';

import React from 'react';

export default function JourneySection() {
  return (
    <section id="journey" aria-label="Experience and education" suppressHydrationWarning>
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          Experience <em>&amp; education.</em>
        </h2>
        <div className="cols" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h3 suppressHydrationWarning>Experience</h3>
            <ol className="tl" suppressHydrationWarning>
              <li className="rv" suppressHydrationWarning>
                <time>2024 – Present</time>
                <b>Co-founder</b>
                <span>Codex Monarch</span>
              </li>
              <li className="rv" suppressHydrationWarning>
                <time>2023 – 2024</time>
                <b>Freelance Developer</b>
                <span>Remote, self-employed</span>
              </li>
            </ol>
          </div>
          <div suppressHydrationWarning>
            <h3 suppressHydrationWarning>Education</h3>
            <ol className="tl" suppressHydrationWarning>
              <li className="rv" suppressHydrationWarning>
                <time>2024 – 2027 (expected)</time>
                <b>Diploma in CSE</b>
                <span>NIRT Institute (NIRT)</span>
              </li>
              <li className="rv" suppressHydrationWarning>
                <time>2024 (completed)</time>
                <b>Matriculation</b>
                <span>BSEB, Bihar</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
