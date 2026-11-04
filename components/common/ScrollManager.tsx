'use client';

import React, { useEffect, useRef } from 'react';

export default function ScrollManager() {
  const pgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('js');

    const updateScrollAndReveals = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const progress = h > 0 ? window.scrollY / h : 0;

      if (pgRef.current) {
        pgRef.current.style.transform = `scaleX(${progress})`;
      }

      // Update timeline fill
      const tls = document.querySelectorAll<HTMLElement>('.tl');
      tls.forEach((t) => {
        const r = t.getBoundingClientRect();
        const p = (window.innerHeight * 0.7 - r.top) / r.height;
        t.style.setProperty('--p', `${Math.max(0, Math.min(1, p))}`);

        const items = t.querySelectorAll<HTMLElement>('li');
        items.forEach((li) => {
          const lr = li.getBoundingClientRect();
          if (lr.top < window.innerHeight * 0.85) {
            li.classList.add('in', 'vis');
          }
        });
      });

      // Direct check to ensure no in-viewport .rv element is ever missed
      const targets = document.querySelectorAll<HTMLElement>('.rv:not(.in), .reveal:not(.in)');
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.15) {
          el.classList.add('in', 'vis');
        }
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          updateScrollAndReveals();
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    let observer: IntersectionObserver | null = null;
    let sectionObserver: IntersectionObserver | null = null;

    const observeTargets = () => {
      if (!observer) return;
      const targets = document.querySelectorAll<HTMLElement>('.rv:not(.in), .reveal:not(.in)');
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.15) {
          el.classList.add('in', 'vis');
        } else {
          observer?.observe(el);
        }
      });
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in', 'vis');
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px 80px 0px' }
      );

      observeTargets();

      // Active section spy
      const navLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-s], .nav-item'));
      const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id], section[id]'));
      sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const secId = entry.target.id;
              navLinks.forEach((a) => {
                const match =
                  a.dataset.s === secId || a.getAttribute('href') === '#' + secId;
                if (match) {
                  a.setAttribute('aria-current', 'true');
                  a.classList.add('active');
                } else {
                  a.removeAttribute('aria-current');
                  a.classList.remove('active');
                }
              });
            }
          });
        },
        { rootMargin: '-30% 0px -50% 0px' }
      );
      sections.forEach((s) => sectionObserver?.observe(s));
    } else {
      const targets = document.querySelectorAll<HTMLElement>('.rv, .reveal');
      targets.forEach((el) => el.classList.add('in', 'vis'));
    }

    // Immediate and delayed triggers to ensure hydration and late-rendering elements are caught
    updateScrollAndReveals();
    const t1 = setTimeout(() => {
      updateScrollAndReveals();
      observeTargets();
    }, 100);
    const t2 = setTimeout(() => {
      updateScrollAndReveals();
      observeTargets();
    }, 500);

    // MutationObserver to automatically bind any newly added elements
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        observeTargets();
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (observer) observer.disconnect();
      if (sectionObserver) sectionObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, []);

  return <div id="pg" ref={pgRef} aria-hidden="true" suppressHydrationWarning />;
}
