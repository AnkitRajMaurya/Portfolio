# AI Coding Assistant Instructions — Portfolio

This file gives actionable, project-specific guidance for AI coding agents working on this single-page portfolio (vanilla HTML/CSS/JS) hosted at:
`https://ankitrajmaurya.github.io/Portfolio/`

Keep instructions short and focused. Only suggest changes that are discoverable from the repository.

Key files
- `index.html` — main entry point; contains all SEO, Open Graph, JSON-LD data and inlined links to `img/` assets.
- `style.css` — global styles, theme variables, and layout (dark/light via `[data-theme="dark"]`).
- `script.js` — DOM behavior: theme toggle, particles init, preloader, scroll animations.
- `img/` — images referenced by meta tags (use absolute URLs in OG/Twitter tags).

What to change and why
- SEO updates: always update canonical, `og:url`, JSON-LD `url`, and `og/twitter:image` to use the absolute site root `https://ankitrajmaurya.github.io/Portfolio/`.
- Social images: use absolute URLs for `og:image` and `twitter:image` (not relative paths) so link previews work on social platforms.
- Theme toggle: `script.js` reads/writes `localStorage.theme` and toggles `data-theme` on `document.documentElement`. Keep behavior consistent when adding components.

Performance & accessibility notes
- External scripts are loaded with `defer`. Keep that for third-party libraries (GSAP, Particles, ScrollReveal).
- Images: prefer `loading="lazy"` for non-hero images; keep `fetchpriority="high"` on the hero image.

Conventions
- Use semantic sections (`<section id="skills">`) — preserve existing IDs because navigation anchors depend on them.
- Use full absolute URLs in meta/JSON-LD for production builds.

When you make edits
- Run a focused verification: open `index.html` and ensure the canonical, `og:url`, JSON-LD `url` values are identical and point to `https://ankitrajmaurya.github.io/Portfolio/`.
- Do not change visual CSS variables unless asked — small CSS tweaks are acceptable but avoid large refactors.

If you need more context, ask the maintainer for the preferred image to use for `og:image` (hero vs. custom thumbnail).

Examples
- Correct OG image line:
  `<meta property="og:image" content="https://ankitrajmaurya.github.io/Portfolio/img/pic.jpg" />`

End.
