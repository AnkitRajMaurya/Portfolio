import React from 'react';

export default function FooterSection() {
  return (
    <footer aria-label="Site footer" suppressHydrationWarning>
      <div className="w" suppressHydrationWarning>
        <span>© 2026 Ankit Raj Maurya. Designed and built by me.</span>
        <div suppressHydrationWarning>
          <a href="https://github.com/AnkitRajMaurya" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/ankitrajmaurya/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://www.instagram.com/ankitrajmaurya_/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
