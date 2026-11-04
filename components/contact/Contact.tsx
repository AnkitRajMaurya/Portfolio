'use client';

import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('ankit5242raj1@outlook.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Client-side quick validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please complete all transmission parameters.');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch transmission.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Signal transmission failed. Please reach out directly via ankit5242raj1@outlook.com');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        {/* Left Column: Direct Connection Info */}
        <div className="contact-direct-info">
          <div className="section-label">07 / THE NEXT CONVERSATION</div>
          <h2 className="contact-headline">
            Let&apos;s build <br />
            <span className="headline-italic">something meaningful.</span>
          </h2>

          <p className="contact-description">
            Whether you have a product to build, an engineering opportunity to discuss,
            or simply want to exchange ideas on systems architecture and WebGL,
            my inbox is always open.
          </p>

          <div className="contact-channels-box">
            <div className="channel-row">
              <span className="channel-label">DIRECT FREQUENCY</span>
              <div className="email-action-wrap">
                <a href="mailto:ankit5242raj1@outlook.com" className="channel-link">
                  ankit5242raj1@outlook.com
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="btn-copy-email"
                  aria-label="Copy email address to clipboard"
                >
                  {copiedEmail ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="channel-row">
              <span className="channel-label">CURRENT COORDINATES</span>
              <span className="channel-val">Muzaffarpur, Bihar, India • UTC+05:30</span>
            </div>

            <div className="channel-row">
              <span className="channel-label">NETWORK NODES</span>
              <div className="social-links-list">
                <a
                  href="https://github.com/AnkitRajMaurya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-tag"
                >
                  GitHub ↗
                </a>
                <a
                  href="https://www.linkedin.com/in/ankitrajmaurya/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-tag"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="https://www.instagram.com/ankitrajmaurya_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-tag"
                >
                  Instagram ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transmission Form */}
        <div className="contact-form-stage">
          <div className="form-card-wrapper">
            <div className="form-header-bar">
              <span className="terminal-title">TRANSMISSION INTERFACE // TERMINAL 01</span>
              <span className="secure-badge">• ENCRYPTED</span>
            </div>

            <form onSubmit={handleSubmit} className="transmission-form">
              <div className="form-field">
                <label htmlFor="contact-name" className="field-label">
                  YOUR IDENTITY / NAME
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarthak Sharma"
                  className="field-input"
                  disabled={status === 'loading'}
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-email" className="field-label">
                  YOUR EMAIL FREQUENCY
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. hello@domain.com"
                  className="field-input"
                  disabled={status === 'loading'}
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-message" className="field-label">
                  SIGNAL PAYLOAD / MESSAGE
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about the idea, product, or challenge you're exploring..."
                  className="field-textarea"
                  disabled={status === 'loading'}
                />
              </div>

              {/* Status Notifications */}
              {status === 'error' && (
                <div className="form-alert error-alert" role="alert">
                  <span className="alert-dot" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {status === 'success' && (
                <div className="form-alert success-alert" role="status">
                  <span className="alert-dot" />
                  <span>Transmission successfully dispatched to Ankit Raj Maurya. I will respond promptly.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`btn-send-transmission ${status === 'loading' ? 'is-loading' : ''}`}
              >
                <span>{status === 'loading' ? 'Transmitting Signal...' : 'Transmit Message'}</span>
                <span className="btn-send-arrow">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
