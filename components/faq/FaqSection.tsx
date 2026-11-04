import React from 'react';

export default function FaqSection() {
  return (
    <section id="faq" style={{ paddingTop: 0 }} aria-label="Frequently asked questions" suppressHydrationWarning>
      <div className="w fq" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h2 className="sm rv" suppressHydrationWarning>
            <em>FAQ</em>
          </h2>
          <p className="lede rv" suppressHydrationWarning>
            Quick answers for recruiters, clients and collaborators.
          </p>
        </div>

        <div className="gl fl rv" suppressHydrationWarning>
          <details open suppressHydrationWarning>
            <summary suppressHydrationWarning>Who is Ankit Raj Maurya?</summary>
            <p>
              A full-stack developer in Muzaffarpur, Bihar, India. He builds production-ready web and mobile applications and co-founded Codex Monarch.
            </p>
          </details>

          <details suppressHydrationWarning>
            <summary suppressHydrationWarning>What roles does he fit best?</summary>
            <p>
              Full-stack and frontend roles, freelance product builds, and early-stage teams that need someone who can take a feature from idea to deployment.
            </p>
          </details>

          <details suppressHydrationWarning>
            <summary suppressHydrationWarning>Which technologies are central?</summary>
            <p>
              React and Next.js on the frontend, Node.js and MongoDB on the backend, and Flutter for hybrid mobile apps.
            </p>
          </details>

          <details suppressHydrationWarning>
            <summary suppressHydrationWarning>How can I get in touch?</summary>
            <p>
              Email ankit5242raj1@outlook.com or use the form in the contact section.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
