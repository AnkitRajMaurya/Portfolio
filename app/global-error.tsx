'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '40px 20px',
          backgroundColor: '#0b0a09',
          color: '#f0eae0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ color: '#a69d91', marginBottom: '2rem', maxWidth: '420px', lineHeight: 1.6 }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            backgroundColor: '#f0eae0',
            color: '#080807',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

