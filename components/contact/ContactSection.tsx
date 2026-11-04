'use client';

import React, { useState, useRef } from 'react';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || !message.trim()) {
      setStatus('Please add your name, a valid email and a message.');
      return;
    }
    setStatus('Opening your email app to send the message…');
    window.location.href = `mailto:ankit5242raj1@outlook.com?subject=${encodeURIComponent(
      'Portfolio message from ' + name
    )}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')')}`;
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
                suppressHydrationWarning
              />
            </label>
            <div>
              <button
                ref={btnRef}
                className="btn mg"
                type="submit"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                suppressHydrationWarning
              >
                Send message
              </button>
            </div>
            {status && (
              <p id="st" role="status">
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
