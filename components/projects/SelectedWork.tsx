'use client';

import React, { useEffect, useState } from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  demo_url: string;
  github_url: string;
  tech_tags: string[];
  badge: string;
  sort_order: number;
  visible: number;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Codex Monarch',
    description: 'A student-led technical community platform for events, workshops and collaboration. Co-founded and led by me.',
    image_url: '/img/projects/codex-monarch.png',
    demo_url: 'https://www.codexmonarch.me/',
    github_url: '',
    tech_tags: ['Node.js', 'MongoDB', 'JavaScript'],
    badge: 'Community platform',
    sort_order: 1,
    visible: 1,
  },
  {
    id: 2,
    title: 'ReadyToGo',
    description: 'Career-readiness and placement preparation platform that helps students prepare and get hired.',
    image_url: '/img/projects/readytogo.png',
    demo_url: 'https://readytogo.codexmonarch.me/',
    github_url: '',
    tech_tags: ['Next.js', 'DSA Prep', 'Full-Stack'],
    badge: 'Career platform',
    sort_order: 2,
    visible: 1,
  },
  {
    id: 3,
    title: 'Orbit UI',
    description: 'A lightweight, zero-dependency component library for fast, accessible interfaces.',
    image_url: '/img/projects/orbit-ui.png',
    demo_url: 'https://orbitui-eta.vercel.app/',
    github_url: 'https://github.com/AnkitRajMaurya/ORBITUI',
    tech_tags: ['HTML5', 'CSS3', 'JavaScript'],
    badge: 'Component library',
    sort_order: 3,
    visible: 1,
  },
  {
    id: 4,
    title: 'Weather App',
    description: 'Live conditions and forecasts in a clean, minimal interface.',
    image_url: '/img/projects/weather-app.png',
    demo_url: 'https://weather-project-lovat-five.vercel.app/',
    github_url: 'https://github.com/AnkitRajMaurya/weather-project',
    tech_tags: ['React', 'OpenWeather', 'CSS Modules'],
    badge: 'Web app',
    sort_order: 4,
    visible: 1,
  },
];

const CARD_STYLES = [
  { bg: '#1a110a', color: '#f4e9dc', quote: 'We build what others only imagine.' },
  { bg: '#fff', color: '#101827', quote: 'Make strategy and demonstrate potential.' },
  { bg: 'linear-gradient(135deg,#0b1030,#2b3bb0)', color: '#eef0ff', quote: 'Book your seat to space.' },
  { bg: 'linear-gradient(160deg,#12343a,#0a1417)', color: '#d6f0f2', quote: '24°' },
];

export default function SelectedWork() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="work" aria-label="Selected work">
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          Things I <em>build.</em>
        </h2>
        <p className="lede rv" suppressHydrationWarning>
          Community platforms, UI systems and product-focused web apps, shipped end to end.
        </p>

        <div style={{ marginTop: '56px' }} suppressHydrationWarning>
          {projects.map((p, index) => {
            const cardTheme = CARD_STYLES[index % CARD_STYLES.length];
            const words = p.title.split(' ');
            const firstWord = words[0];
            const remaining = words.slice(1).join(' ');

            return (
              <article
                key={p.id || index}
                className={`pc c${index % 4}`}
                style={{ '--i': index } as React.CSSProperties}
                suppressHydrationWarning
              >
                <div>
                  <p className="k">{p.badge || 'Project'}</p>
                  <h3>
                    {firstWord} {remaining ? <em>{remaining}</em> : null}
                  </h3>
                  <p>{p.description}</p>
                  {p.tech_tags && p.tech_tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '14px 0 20px' }}>
                      {p.tech_tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            borderRadius: '4px',
                            color: 'var(--mute)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {p.demo_url && (
                      <a className="b" href={p.demo_url} target="_blank" rel="noopener noreferrer">
                        <span>Live project</span>
                      </a>
                    )}
                    {p.github_url && (
                      <a className="b o" href={p.github_url} target="_blank" rel="noopener noreferrer">
                        <span>Source code</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="fr">
                  <div className="cr">
                    <i />
                    <i />
                    <i />
                  </div>
                  {p.image_url ? (
                    <div
                      className="mk"
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0e1117',
                      }}
                    >
                      <img
                        src={p.image_url}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="mk" style={{ background: cardTheme.bg, color: cardTheme.color }}>
                      <h4>{cardTheme.quote}</h4>
                      <div className="r">
                        <b />
                        <s />
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
