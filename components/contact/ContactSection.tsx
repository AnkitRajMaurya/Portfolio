'use client';

import React, { useState, useRef } from 'react';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('ankit5242raj1@outlook.com').then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - r.left - r.width / 2;
    const dy = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.3}px)`;
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || !message.trim()) {
      setStatus('Please provide your name, a valid email address and a message.');
      setIsError(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus('Sending message...');
      setIsError(false);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('Thank you! Your message has been sent successfully. I will get back to you soon.');
        setIsError(false);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus(data.error || 'Failed to send message. Please try again or email directly.');
        setIsError(true);
      }
    } catch {
      setStatus('Network error. Please try again or reach out directly at ankit5242raj1@outlook.com');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" aria-label="Contact">
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          Let&apos;s build <em>something meaningful.</em>
        </h2>
        <p className="lede rv" suppressHydrationWarning>
          Have a project idea, internship opportunity or collaboration in mind? Send a message and I&apos;ll get back to you soon.
        </p>

        <div className="cg" suppressHydrationWarning>
          <div className="rv" suppressHydrationWarning>
            <a className="mail" href="mailto:ankit5242raj1@outlook.com">
              ankit5242raj1@outlook.com
            </a>
            <button className="cp" id="cp" type="button" onClick={handleCopy} suppressHydrationWarning>
              {copied ? 'Copied' : 'Copy email'}
            </button>
            <p className="loc">Muzaffarpur, Bihar, India</p>

            <div className="contact-social-links" suppressHydrationWarning>
              <a
                href="https://github.com/AnkitRajMaurya"
                target="_blank"
                rel="noopener noreferrer"
                className="social-pill"
                aria-label="GitHub Profile"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/AnkitRajMaurya/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-pill"
                aria-label="LinkedIn Profile"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="https://www.instagram.com/ankitrajmaurya_/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-pill"
                aria-label="Instagram Profile"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <form id="f" className="rv" onSubmit={handleSubmit} noValidate suppressHydrationWarning>
            <label suppressHydrationWarning>
              Your name
              <input
                id="n"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                disabled={isSubmitting}
                suppressHydrationWarning
              />
            </label>
            <label suppressHydrationWarning>
              Email address
              <input
                id="e"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isSubmitting}
                suppressHydrationWarning
              />
            </label>
            <label suppressHydrationWarning>
              Your message
              <textarea
                id="m"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                disabled={isSubmitting}
                suppressHydrationWarning
              />
            </label>
            <div>
              <button
                ref={btnRef}
                className="btn mg"
                type="submit"
                disabled={isSubmitting}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                suppressHydrationWarning
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </div>
            {status && (
              <p id="st" role="status" style={{ color: isError ? '#ff4d4d' : '#4ade80', marginTop: '12px', fontSize: '14px' }}>
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
