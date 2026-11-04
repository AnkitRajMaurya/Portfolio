'use client';

import React from 'react';

interface SkillCategory {
  categoryNumber: string;
  categoryName: string;
  context: string;
  skills: { name: string; proficiencyDesc: string; highlight?: boolean }[];
}

const SKILL_DOMAINS: SkillCategory[] = [
  {
    categoryNumber: '01',
    categoryName: 'FRONTEND ARCHITECTURE',
    context: 'Responsive, accessible, production web interfaces',
    skills: [
      { name: 'JavaScript (ESNext)', proficiencyDesc: 'Modern syntax, asynchronous pipelines, event architectures' },
      { name: 'React.js', proficiencyDesc: 'Component lifecycles, custom hooks, virtual DOM optimization' },
      { name: 'Next.js (App Router)', proficiencyDesc: 'Server components, Route Handlers, SSR & static generation' },
      { name: 'HTML5 & Semantic Web', proficiencyDesc: 'Accessible markup, SEO structured data, clean DOM hierarchy' },
      { name: 'SCSS / Sass / CSS3', proficiencyDesc: 'Custom design tokens, responsive mixins, fluid typography' },
    ],
  },
  {
    categoryNumber: '02',
    categoryName: 'BACKEND & RESTFUL SYSTEMS',
    context: 'Server runtimes, API endpoints & data persistence',
    skills: [
      { name: 'Node.js', proficiencyDesc: 'Event loop execution, file streams, package management' },
      { name: 'Express.js', proficiencyDesc: 'Routing, JWT middleware, rate limiting, security headers' },
      { name: 'REST APIs', proficiencyDesc: 'Stateless architecture, clean HTTP semantics, error handling' },
      { name: 'Nodemailer & SMTP', proficiencyDesc: 'Transactional email pipelines and transmission dispatch' },
    ],
  },
  {
    categoryNumber: '03',
    categoryName: 'DATABASES & PERSISTENCE',
    context: 'Relational & document databases at the edge',
    skills: [
      { name: 'Turso / LibSQL', proficiencyDesc: 'Distributed edge SQLite, schema migrations, parameterized queries' },
      { name: 'MongoDB', proficiencyDesc: 'NoSQL document schemas, aggregation pipelines, Mongoose models' },
      { name: 'SQLite', proficiencyDesc: 'Embedded lightweight relational storage and fast local development' },
    ],
  },
  {
    categoryNumber: '04',
    categoryName: 'CORE LANGUAGES & MOBILE',
    context: 'Algorithmic problem-solving and multi-platform apps',
    skills: [
      { name: 'Java', proficiencyDesc: 'Object-oriented programming, Collections framework, DSA implementation' },
      { name: 'C Language', proficiencyDesc: 'Pointers, memory management, low-level data structures' },
      { name: 'Flutter', proficiencyDesc: 'Cross-platform mobile UI prototyping and widget composition' },
    ],
  },
  {
    categoryNumber: '05',
    categoryName: 'ENGINEERING TOOLING & WORKFLOWS',
    context: 'Version control, interface design & deployment platforms',
    skills: [
      { name: 'Git & GitHub', proficiencyDesc: 'Feature branching, pull requests, collaborative version tracking' },
      { name: 'Vercel', proficiencyDesc: 'Edge networks, continuous integration, DNS management' },
      { name: 'Figma', proficiencyDesc: 'Design systems, wireframing, layout tokens, UX prototyping' },
    ],
  },
];

export default function TechnicalSkills() {
  return (
    <section id="skills" className="skills-section">
      <div className="skills-header">
        <div className="section-label">05 / TECHNICAL ARSENAL</div>
        <h2 className="skills-main-title">
          Technology is a tool. <br />
          <span className="title-italic">Building is the purpose.</span>
        </h2>
        <p className="skills-desc">
          Verified technologies actively utilized across production applications and real software repositories.
        </p>
      </div>

      <div className="skills-domains-grid">
        {SKILL_DOMAINS.map((domain) => (
          <div key={domain.categoryNumber} className="skill-domain-card">
            <div className="domain-card-header">
              <span className="domain-num">{domain.categoryNumber}</span>
              <div className="domain-title-wrap">
                <h3 className="domain-name">{domain.categoryName}</h3>
                <p className="domain-context">{domain.context}</p>
              </div>
            </div>

            <div className="domain-skills-table">
              {domain.skills.map((skill) => (
                <div key={skill.name} className="skill-row-item">
                  <div className="skill-name-col">
                    <span className="bullet-amber">&bull;</span>
                    <span className="skill-text-name">{skill.name}</span>
                  </div>
                  <div className="skill-detail-col">
                    <span className="skill-desc-text">{skill.proficiencyDesc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
