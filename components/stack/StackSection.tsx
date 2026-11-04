'use client';

import React, { useState } from 'react';

export default function StackSection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <section id="stack" aria-label="Technical stack">
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          Tech <em>stack.</em>
        </h2>
        <p className="lede rv" suppressHydrationWarning>
          Technologies I use to ship real products.
        </p>

        <div className="tabs" role="tablist" aria-label="Skill categories" suppressHydrationWarning>
          <button
            role="tab"
            id="t0"
            aria-selected={activeTab === 0}
            aria-controls="p0"
            tabIndex={activeTab === 0 ? 0 : -1}
            onClick={() => setActiveTab(0)}
            suppressHydrationWarning
          >
            Frontend
          </button>
          <button
            role="tab"
            id="t1"
            aria-selected={activeTab === 1}
            aria-controls="p1"
            tabIndex={activeTab === 1 ? 0 : -1}
            onClick={() => setActiveTab(1)}
            suppressHydrationWarning
          >
            Backend
          </button>
          <button
            role="tab"
            id="t2"
            aria-selected={activeTab === 2}
            aria-controls="p2"
            tabIndex={activeTab === 2 ? 0 : -1}
            onClick={() => setActiveTab(2)}
            suppressHydrationWarning
          >
            Others
          </button>
        </div>

        {/* Panel 0: Frontend */}
        <div className="tp" id="p0" role="tabpanel" aria-labelledby="t0" hidden={activeTab !== 0}>
          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="2" fill="#F7DF1E" />
              <text x="21" y="20.5" textAnchor="end" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9.5" fill="#000">
                JS
              </text>
            </svg>
            <b>JavaScript</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <g fill="none" stroke="#61DAFB" strokeWidth="1.2">
                <ellipse cx="12" cy="12" rx="10" ry="4" />
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
              </g>
              <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
            </svg>
            <b>React.js</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#fff" />
              <path d="M9 8v8M9 8l7 8.5M15.5 8v4" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
            <b>Next.js</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 2.5l1.6 17.8L12 22V2.5z" fill="#E44D26" />
              <path d="M12 2.5V22l6.9-1.7 1.6-17.8z" fill="#F16529" />
              <text x="12" y="15.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="8" fill="#fff">
                5
              </text>
            </svg>
            <b>HTML5</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 2.5l1.6 17.8L12 22V2.5z" fill="#1572B6" />
              <path d="M12 2.5V22l6.9-1.7 1.6-17.8z" fill="#33A9DC" />
              <text x="12" y="15.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="8" fill="#fff">
                3
              </text>
            </svg>
            <b>CSS3 / SCSS</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="2" fill="#3178C6" />
              <text x="21" y="20.5" textAnchor="end" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9.5" fill="#fff">
                TS
              </text>
            </svg>
            <b>TypeScript</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#38BDF8"
                d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6C13.7 10.6 15 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C16.3 6.2 15 4.8 12 4.8zM6 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C10.3 13.4 9 12 6 12z"
              />
            </svg>
            <b>Tailwind CSS</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" fill="#7952B3" />
              <text x="12" y="17.2" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#fff">
                B
              </text>
            </svg>
            <b>Bootstrap</b>
          </div>
        </div>

        {/* Panel 1: Backend */}
        <div className="tp" id="p1" role="tabpanel" aria-labelledby="t1" hidden={activeTab !== 1}>
          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1.8l8.8 5.1v10.2L12 22.2 3.2 17.1V6.9z" fill="#5FA04E" />
              <text x="12" y="14.8" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="7.5" fill="#fff">
                JS
              </text>
            </svg>
            <b>Node.js</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <text x="12" y="16.5" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" fontWeight="700" fontSize="15" fill="#fff">
                ex
              </text>
            </svg>
            <b>Express.js</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1.5c.4 2.6 5.2 5.8 5.2 11.2 0 3.6-2.2 6.2-4.7 7.4L12.2 22h-.4l-.3-1.9c-2.5-1.2-4.7-3.8-4.7-7.4C6.8 7.3 11.6 4.1 12 1.5z" fill="#47A248" />
              <path d="M12 8v14" stroke="#000" strokeOpacity=".5" strokeWidth=".9" />
            </svg>
            <b>MongoDB</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <g fill="none" stroke="#ff6b2c" strokeWidth="1.5">
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="5" cy="18" r="2.5" />
                <circle cx="19" cy="18" r="2.5" />
                <path d="M11 7.3L6 15.8M13 7.3l5 8.5M7.5 18h9" />
              </g>
            </svg>
            <b>Microservices</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <text x="12" y="16" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="12" fill="#ff6b2c">
                {'{ }'}
              </text>
            </svg>
            <b>REST APIs</b>
          </div>
        </div>

        {/* Panel 2: Others */}
        <div className="tp" id="p2" role="tabpanel" aria-labelledby="t2" hidden={activeTab !== 2}>
          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="14,2 5,11 7.6,13.6 19.6,2" fill="#54C5F8" />
              <polygon points="14,11.4 19.6,11.4 14,17 11.3,14.2" fill="#54C5F8" />
              <polygon points="11.3,14.2 14,17 14,22 10,18" fill="#01579B" />
              <polygon points="14,17 16.8,19.8 14,22" fill="#29B6F6" />
            </svg>
            <b>Flutter</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#fff"
                d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 24 12.3C24 5.7 18.6.3 12 .3z"
              />
            </svg>
            <b>Git &amp; GitHub</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#FF6C37" />
              <path d="M8 16l7-7M14 8.5l1.5 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <b>Postman</b>
          </div>

          <div className="tk" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l10 18H2z" fill="#fff" />
            </svg>
            <b>Vercel</b>
          </div>
        </div>
      </div>
    </section>
  );
}
