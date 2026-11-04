'use client';

import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/animations/gsap/initGsap';

interface Milestone {
  period: string;
  category: string;
  title: string;
  context: string;
  details: string[];
}

const MILESTONES: Milestone[] = [
  {
    period: '2024',
    category: 'FOUNDATIONAL MILESTONE',
    title: 'Completed BSEB Matriculation',
    context: 'Bihar School Examination Board (BSEB)',
    details: [
      'Graduated secondary education with strong analytical and mathematical fundamentals.',
      'Began self-directed programming exploration with C, HTML5, and JavaScript.',
    ],
  },
  {
    period: '2024 — 2027',
    category: 'HIGHER ENGINEERING EDUCATION',
    title: 'Commenced Diploma in Computer Science Engineering',
    context: 'NRI Institute of Research and Technology',
    details: [
      'Enrolled in 3-year intensive CSE curriculum focusing on computer systems, logic design, and OOP.',
      'Active leadership in collaborative coding circles and hackathon participation.',
    ],
  },
  {
    period: '2024 — Present',
    category: 'ORGANIZATIONAL LEADERSHIP',
    title: 'Core Team Member & Team Lead at Codex Monarch',
    context: 'Codex Monarch Technical Community',
    details: [
      'Joined core engineering leadership of the student-led technical community platform.',
      'Collaborated on real-time coding arenas, LeetCode-style challenge engines, and community hackathons.',
    ],
  },
  {
    period: '2025 — 2026',
    category: 'FLAGSHIP PRODUCT BUILD',
    title: 'Architected & Shipped ReadyToGo',
    context: 'Programming & Placement Preparation Platform',
    details: [
      'Engineered complete platform featuring Daemon’s DSA Sheet tracker, topic guides, and placement roadmaps.',
      'Focused on high-speed page loads, responsive navigation, and frictionless study workflows.',
    ],
  },
  {
    period: 'Current Focus',
    category: 'ENGINEERING EXPANSION',
    title: 'DSA Mastery, Java Architecture & Creative WebGL',
    context: 'Continuous Self-Directed Exploration',
    details: [
      'Deepening algorithmic problem-solving in Java (trees, graphs, dynamic programming).',
      'Exploring WebGL, Three.js custom GLSL shader mechanics, and high-performance frontend architecture.',
    ],
  },
];

export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline scroll progress animation
      gsap.fromTo(
        '.timeline-progress-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.journey-timeline-track',
            start: 'top center+=100',
            end: 'bottom center',
            scrub: true,
          },
        }
      );

      // Milestone items reveal
      const items = gsap.utils.toArray('.timeline-milestone-item') as HTMLElement[];
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.2, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom-=60',
              end: 'center center',
              scrub: 0.6,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="journey" className="journey-section">
      <div className="journey-header">
        <div className="section-label">04 / THE JOURNEY</div>
        <h2 className="journey-title">
          Milestones in <span className="title-italic">the making.</span>
        </h2>
        <p className="journey-desc">
          A continuous timeline of technical discipline, verified education, and real engineering milestones.
        </p>
      </div>

      <div className="journey-timeline-track">
        {/* Animated Vertical Line */}
        <div className="timeline-axis-line">
          <div className="timeline-progress-fill" />
        </div>

        <div className="timeline-milestones-list">
          {MILESTONES.map((m, index) => (
            <div key={index} className="timeline-milestone-item">
              {/* Luminous Node Marker */}
              <div className="milestone-marker">
                <span className="marker-core" />
              </div>

              {/* Milestone Details Card */}
              <div className="milestone-content-card">
                <div className="milestone-top-meta">
                  <span className="milestone-period">{m.period}</span>
                  <span className="milestone-category">{m.category}</span>
                </div>

                <h3 className="milestone-heading">{m.title}</h3>
                <h4 className="milestone-context">{m.context}</h4>

                <ul className="milestone-bullet-points">
                  {m.details.map((point, pIdx) => (
                    <li key={pIdx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
