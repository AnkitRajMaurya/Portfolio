import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#080807',
        color: '#f0eae0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--type-sm)',
          letterSpacing: '0.25em',
          color: '#d97745',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        SIGNAL DISCONNECTED // 404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--type-display)',
          fontWeight: 400,
          margin: '0 0 1rem',
          lineHeight: 1,
        }}
      >
        Coordinates Not Found.
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: '#a69d91',
          maxWidth: '460px',
          marginBottom: '2.5rem',
          fontSize: 'var(--type-md)',
          lineHeight: 1.6,
        }}
      >
        The requested transmission route does not exist in this digital portfolio.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.85rem 1.85rem',
          borderRadius: 'var(--radius-pill)',
          background: '#f0eae0',
          color: '#080807',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--type-base)',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Return to Core Stage &rarr;
      </Link>
    </div>
  );
}
