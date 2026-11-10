'use client';

import React, { useState, useEffect } from 'react';

interface Skill {
  id?: number;
  name: string;
  icon_class?: string;
  category?: string;
}

function renderTechLogo(name: string) {
  const n = (name || '').toLowerCase();

  if (n.includes('javascript') || n === 'js') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="#F7DF1E" />
        <text x="21" y="20.5" textAnchor="end" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9.5" fill="#000">
          JS
        </text>
      </svg>
    );
  }

  if (n.includes('react')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="#61DAFB" strokeWidth="1.2">
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </g>
        <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
      </svg>
    );
  }

  if (n.includes('next')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <path d="M9 8v8M9 8l7 8.5M15.5 8v4" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (n.includes('html')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 2.5l1.6 17.8L12 22V2.5z" fill="#E44D26" />
        <path d="M12 2.5V22l6.9-1.7 1.6-17.8z" fill="#F16529" />
        <text x="12" y="15.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="8" fill="#fff">
          5
        </text>
      </svg>
    );
  }

  if (n.includes('css') || n.includes('scss') || n.includes('sass')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 2.5l1.6 17.8L12 22V2.5z" fill="#1572B6" />
        <path d="M12 2.5V22l6.9-1.7 1.6-17.8z" fill="#33A9DC" />
        <text x="12" y="15.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="8" fill="#fff">
          3
        </text>
      </svg>
    );
  }

  if (n.includes('typescript') || n === 'ts') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="#3178C6" />
        <text x="21" y="20.5" textAnchor="end" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9.5" fill="#fff">
          TS
        </text>
      </svg>
    );
  }

  if (n.includes('tailwind')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#38BDF8"
          d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6C13.7 10.6 15 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C16.3 6.2 15 4.8 12 4.8zM6 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C10.3 13.4 9 12 6 12z"
        />
      </svg>
    );
  }

  if (n.includes('bootstrap')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#7952B3" />
        <text x="12" y="17.2" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#fff">
          B
        </text>
      </svg>
    );
  }

  if (n.includes('node')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1.8l8.8 5.1v10.2L12 22.2 3.2 17.1V6.9z" fill="#5FA04E" />
        <text x="12" y="14.8" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="7.5" fill="#fff">
          JS
        </text>
      </svg>
    );
  }

  if (n.includes('express')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="16.5" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" fontWeight="700" fontSize="15" fill="#fff">
          ex
        </text>
      </svg>
    );
  }

  if (n.includes('mongo')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1.5c.4 2.6 5.2 5.8 5.2 11.2 0 3.6-2.2 6.2-4.7 7.4L12.2 22h-.4l-.3-1.9c-2.5-1.2-4.7-3.8-4.7-7.4C6.8 7.3 11.6 4.1 12 1.5z" fill="#47A248" />
        <path d="M12 8v14" stroke="#000" strokeOpacity=".5" strokeWidth=".9" />
      </svg>
    );
  }

  if (n.includes('turso') || n.includes('sqlite') || n.includes('database') || n.includes('sql')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="8" ry="3" fill="none" stroke="#00E599" strokeWidth="1.6" />
        <path d="M4 5v6c0 1.657 3.582 3 8 3s8-1.343 8-3V5" fill="none" stroke="#00E599" strokeWidth="1.6" />
        <path d="M4 11v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" fill="none" stroke="#00E599" strokeWidth="1.6" />
      </svg>
    );
  }

  if (n.includes('rest') || n.includes('api')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="16" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="12" fill="#ff6b2c">
          {'{ }'}
        </text>
      </svg>
    );
  }

  if (n.includes('microservice')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="#ff6b2c" strokeWidth="1.5">
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5" cy="18" r="2.5" />
          <circle cx="19" cy="18" r="2.5" />
          <path d="M11 7.3L6 15.8M13 7.3l5 8.5M7.5 18h9" />
        </g>
      </svg>
    );
  }

  if (n.includes('flutter')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="14,2 5,11 7.6,13.6 19.6,2" fill="#54C5F8" />
        <polygon points="14,11.4 19.6,11.4 14,17 11.3,14.2" fill="#54C5F8" />
        <polygon points="11.3,14.2 14,17 14,22 10,18" fill="#01579B" />
        <polygon points="14,17 16.8,19.8 14,22" fill="#29B6F6" />
      </svg>
    );
  }

  if (n.includes('git') || n.includes('github')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#fff"
          d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 24 12.3C24 5.7 18.6.3 12 .3z"
        />
      </svg>
    );
  }

  if (n.includes('postman')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#FF6C37" />
        <path d="M8 16l7-7M14 8.5l1.5 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (n.includes('vercel')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l10 18H2z" fill="#fff" />
      </svg>
    );
  }

  if (n.includes('docker')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 13.5h18c-.4 4.5-4 7.5-9 7.5s-8.6-3-9-7.5zm3-5h2v2H6zm3 0h2v2H9zm3 0h2v2h-2zm-6 2.5h2v2H6zm3 0h2v2H9zm3 0h2v2h-2zm3 0h2v2h-2z" fill="#2496ED" />
      </svg>
    );
  }

  if (n.includes('figma')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="15" cy="12" r="3" fill="#1ABCFE" />
        <path d="M12 3H9a3 3 0 00-3 3v0a3 3 0 003 3h3V3z" fill="#F24E1E" />
        <path d="M12 9H9a3 3 0 00-3 3v0a3 3 0 003 3h3V9z" fill="#A259FF" />
        <path d="M12 15H9a3 3 0 00-3 3v0a3 3 0 003 3 3 3 0 003-3v-3z" fill="#0ACF83" />
        <circle cx="15" cy="6" r="3" fill="#FF7262" />
      </svg>
    );
  }

  if (n.includes('java')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 17c3 .5 6 .5 8-.5m-7 2.5c2.5.5 5 .5 7-.5M9 7c1 1.5 0 2.5 2 4s2-1.5 1-3.5" stroke="#EA2D2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M6 13h12a2 2 0 012 2v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1a2 2 0 012-2z" fill="none" stroke="#5382A1" strokeWidth="1.5" />
      </svg>
    );
  }

  if (n.includes('python')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.9 2c-3.1 0-2.9 1.3-2.9 1.3v2.8h5.9v.9H6.6S3 6.6 3 11.9s3.3 5 3.3 5h1v-2.5c0-1.4 1.2-2.5 2.6-2.5h5.9c1.2 0 2.2-1 2.2-2.2V4.2C18 3.1 16.9 2 11.9 2zm-1.7 1.8a.9.9 0 110 1.8.9.9 0 010-1.8zm1.9 18.2c3.1 0 2.9-1.3 2.9-1.3v-2.8H9.1V17h8.3s3.6.4 3.6-4.9-3.3-5-3.3-5h-1v2.5c0 1.4-1.2 2.5-2.6 2.5H8.2c-1.2 0-2.2 1-2.2 2.2v5.5c0 1.1 1.1 2.2 6.1 2.2zm1.7-1.8a.9.9 0 110-1.8.9.9 0 010 1.8z" fill="#3776AB" />
      </svg>
    );
  }

  if (n.includes('android')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9H6v9zm9.5-12.7l1.3-1.3c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0l-1.5 1.5C13.6 4.3 12.8 4 12 4s-1.6.3-2.6.8L7.9 3.3c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7l1.3 1.3C7.1 6.1 6.1 7.4 6 9h12c-.1-1.6-1.1-2.9-2.5-3.7z" fill="#3DDC84" />
      </svg>
    );
  }

  if (n.includes('firebase')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.2 18.4L3 4.8c-.1-.6.6-1 1-.5l5.2 9.8-4 4.3zm6.8 3.6c-.4.2-.9.2-1.3 0L3.8 18l6.9-12.8c.3-.5 1-.4 1.2.1l1.8 3.5-1.7 13.2zm6.8-3.6l-5.6-10.4 4.1-7.7c.3-.6 1.2-.4 1.3.3l1.8 16.3-1.6 1.5z" fill="#FFA000" />
      </svg>
    );
  }

  if (n.includes('php')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="10" ry="6" fill="#777BB4" />
        <text x="12" y="14.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="7" fill="#fff">
          PHP
        </text>
      </svg>
    );
  }

  // Fallback stylish code brackets
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="rgba(255, 107, 44, 0.15)" stroke="#ff6b2c" strokeWidth="1.2" />
      <text x="12" y="16" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="11" fill="#ff6b2c">
        &lt;/&gt;
      </text>
    </svg>
  );
}

const DEFAULT_FRONTEND: Skill[] = [
  { name: 'JavaScript' },
  { name: 'React.js' },
  { name: 'Next.js' },
  { name: 'HTML5' },
  { name: 'CSS3/SCSS' },
  { name: 'TypeScript' },
  { name: 'Tailwind CSS' },
  { name: 'Bootstrap' },
];

const DEFAULT_BACKEND: Skill[] = [
  { name: 'Node.js' },
  { name: 'Express.js' },
  { name: 'MongoDB' },
  { name: 'Microservices' },
  { name: 'REST APIs' },
];

const DEFAULT_OTHERS: Skill[] = [
  { name: 'Flutter' },
  { name: 'Git & GitHub' },
  { name: 'Postman' },
  { name: 'Vercel' },
];

export default function StackSection() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [dbSkills, setDbSkills] = useState<Record<string, Skill[]>>({});

  useEffect(() => {
    fetch('/api/skills')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setDbSkills(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  const frontendSkills = dbSkills.frontend && dbSkills.frontend.length > 0 ? dbSkills.frontend : DEFAULT_FRONTEND;
  const backendSkills = [
    ...(dbSkills.backend && dbSkills.backend.length > 0 ? dbSkills.backend : DEFAULT_BACKEND),
    ...(dbSkills.databases || []),
  ];
  const otherSkills = [
    ...(dbSkills.tools && dbSkills.tools.length > 0 ? dbSkills.tools : DEFAULT_OTHERS),
    ...(dbSkills.mobile || []),
    ...(dbSkills.languages || []),
  ];

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
            type="button"
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
            type="button"
            role="tab"
            id="t1"
            aria-selected={activeTab === 1}
            aria-controls="p1"
            tabIndex={activeTab === 1 ? 0 : -1}
            onClick={() => setActiveTab(1)}
            suppressHydrationWarning
          >
            Backend &amp; DB
          </button>
          <button
            type="button"
            role="tab"
            id="t2"
            aria-selected={activeTab === 2}
            aria-controls="p2"
            tabIndex={activeTab === 2 ? 0 : -1}
            onClick={() => setActiveTab(2)}
            suppressHydrationWarning
          >
            Tools &amp; Languages
          </button>
        </div>

        {/* Panel 0: Frontend */}
        <div className="tp" id="p0" role="tabpanel" aria-labelledby="t0" hidden={activeTab !== 0} style={activeTab !== 0 ? { display: 'none' } : undefined}>
          {frontendSkills.map((s, idx) => (
            <div key={s.id || idx} className="tk" onMouseMove={handleMouseMove}>
              {renderTechLogo(s.name)}
              <b>{s.name}</b>
            </div>
          ))}
        </div>

        {/* Panel 1: Backend */}
        <div className="tp" id="p1" role="tabpanel" aria-labelledby="t1" hidden={activeTab !== 1} style={activeTab !== 1 ? { display: 'none' } : undefined}>
          {backendSkills.map((s, idx) => (
            <div key={s.id || idx} className="tk" onMouseMove={handleMouseMove}>
              {renderTechLogo(s.name)}
              <b>{s.name}</b>
            </div>
          ))}
        </div>

        {/* Panel 2: Others */}
        <div className="tp" id="p2" role="tabpanel" aria-labelledby="t2" hidden={activeTab !== 2} style={activeTab !== 2 ? { display: 'none' } : undefined}>
          {otherSkills.map((s, idx) => (
            <div key={s.id || idx} className="tk" onMouseMove={handleMouseMove}>
              {renderTechLogo(s.name)}
              <b>{s.name}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
