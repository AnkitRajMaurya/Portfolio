'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#f0eae0',
      }}
    >
      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 600 }}>
        Something went wrong
      </h2>
      <p style={{ color: '#a69d91', marginBottom: '1.5rem', maxWidth: '400px', lineHeight: 1.5 }}>
        An error occurred while loading this section.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '10px 20px',
          borderRadius: '9999px',
          backgroundColor: '#f0eae0',
          color: '#080807',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </div>
  );
}

