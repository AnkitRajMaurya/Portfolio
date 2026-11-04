'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url: string;
  image_url: string;
  type: string;
  sort_order: number;
}

const DEFAULT_CERTS: Certificate[] = [
  {
    id: 1,
    title: 'AI Prompt War – Runner-Up',
    issuer: 'Oriental Group of Institutes',
    issue_date: 'Apr 2026',
    credential_url: 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg',
    image_url: 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg',
    type: 'certificate',
    sort_order: 1,
  },
];

export default function AwardsSection() {
  const [certs, setCerts] = useState<Certificate[]>(DEFAULT_CERTS);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCerts(data);
        }
      })
      .catch(() => {});
  }, []);

  const activeCert = certs[0] || DEFAULT_CERTS[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cd = cardRef.current;
    if (!cd) return;
    const r = cd.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cd.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
    cd.style.setProperty('--sx', `${x * 120}%`);
  };

  const handleMouseLeave = () => {
    const cd = cardRef.current;
    if (!cd) return;
    cd.style.transform = '';
    cd.style.setProperty('--sx', '-30%');
  };

  return (
    <section id="awards" aria-label="Awards" suppressHydrationWarning>
      <div className="w aw" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h2 className="sm rv" suppressHydrationWarning>
            Certificates <em>&amp; awards.</em>
          </h2>
          <div className="meta rv" style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '14px 0' }} suppressHydrationWarning>
            <span style={{ textTransform: 'capitalize', padding: '4px 10px', background: 'rgba(255, 107, 44, 0.1)', border: '1px solid rgba(255, 107, 44, 0.3)', borderRadius: 'var(--radius-2xl)', fontSize: 'var(--type-sm)', color: 'var(--text-bright-accent)' }}>
              {activeCert.type || 'Certificate'}
            </span>
            <span style={{ fontSize: 'var(--type-base)', color: 'var(--mute)' }}>
              {activeCert.issue_date || 'Apr 2026'}
            </span>
          </div>
          <p className="lede rv" style={{ marginTop: 0, color: 'var(--fg)', fontSize: 'var(--type-2xl)', fontWeight: 600 }} suppressHydrationWarning>
            {activeCert.title}
          </p>
          <p className="lede rv" style={{ marginTop: '6px', color: 'var(--mute)' }} suppressHydrationWarning>
            {activeCert.issuer}
          </p>

          {activeCert.image_url && (
            <div style={{ marginTop: '24px' }} suppressHydrationWarning>
              <button
                type="button"
                className="btn rv"
                onClick={() => setSelectedCert(activeCert)}
                style={{ cursor: 'pointer' }}
                suppressHydrationWarning
              >
                Inspect certificate
              </button>
            </div>
          )}

          {certs.length > 1 && (
            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: 'var(--type-sm)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mute)' }}>All Credentials</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {certs.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCert(c)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      color: 'var(--fg)',
                      fontSize: 'var(--type-base)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <strong>{c.title}</strong>
                    <span style={{ display: 'block', fontSize: 'var(--type-xs)', color: 'var(--mute)' }}>{c.issuer}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ct rv" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} suppressHydrationWarning>
          <div
            className="cd"
            id="cd"
            ref={cardRef}
            onClick={() => setSelectedCert(activeCert)}
            style={{ cursor: 'pointer' }}
            title="Click to expand credential"
            suppressHydrationWarning
          >
            <small>{activeCert.type === 'award' ? 'Official Distinction' : 'Certificate of collaboration'}</small>
            <b>{activeCert.title.split('–')[0]?.trim() || activeCert.title}</b>
            <em>{activeCert.title.includes('–') ? activeCert.title.split('–')[1]?.trim() : 'Runner-up'}</em>
            <small>{activeCert.issuer}</small>
          </div>
        </div>
      </div>

      {/* Certificate Lightbox Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedCert(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '850px',
              width: '100%',
              background: '#161920',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 107, 44, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--type-lg)', color: 'var(--fg)' }}>{selectedCert.title}</h3>
                <span style={{ fontSize: 'var(--type-base)', color: 'var(--mute)' }}>{selectedCert.issuer} • {selectedCert.issue_date}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fg)',
                  fontSize: 'var(--type-2xl)',
                  cursor: 'pointer',
                  padding: '4px 10px',
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '20px', textAlign: 'center', background: '#0a0d12' }}>
              {selectedCert.image_url ? (
                <img
                  src={selectedCert.image_url}
                  alt={selectedCert.title}
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
                />
              ) : (
                <div style={{ padding: '60px 20px', color: 'var(--mute)' }}>No preview image available</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <a
                href={selectedCert.credential_url || selectedCert.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn o"
                style={{ padding: '8px 16px', fontSize: 'var(--type-base)' }}
              >
                Open in Full Resolution
              </a>
              <button
                type="button"
                className="btn"
                onClick={() => setSelectedCert(null)}
                style={{ padding: '8px 16px', fontSize: 'var(--type-base)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
