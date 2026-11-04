# Architecture & Migration Plan: Next.js + Three.js + GSAP Redesign

**Project:** Ankit Raj Maurya Portfolio  
**Target Stack:** Next.js 15 (App Router), React 19, TypeScript, GSAP 3, Three.js, Custom GLSL Shaders, Lenis 1.1, SCSS, Turso LibSQL, Nodemailer  
**Production Host:** Vercel (`https://ankitrajmaurya.vercel.app/`)  
**Date:** October 30, 2026  

---

## 1. Technical Audit of Existing System

### 1.1 Existing Architecture
- **Server:** Node.js + Express (`server.js`) with routes for:
  - `GET /api/projects` (reads visible projects from Turso)
  - `GET /api/skills` (reads and groups skills by category)
  - `GET /api/content` (reads portfolio text copy from `portfolio_content`)
  - `GET /api/certificates` (reads certificates)
  - `POST /api/contact` (inserts into `messages`, sends email via `nodemailer`)
  - `POST /api/analytics/track` (logs IP, user agent, geolocation)
  - `/api/admin/*` (authenticated admin endpoints using JWT + bcrypt)
  - Serves static files from root and `/admin/index.html`
- **Database:** Turso SQLite / LibSQL (`db.js`) with tables: `projects`, `skills`, `messages`, `portfolio_content`, `certificates`, `admin_users`, `visitor_logs`.
- **Assets:** Real portrait at `img/pic.webp`, project screenshots at `img/projects/`.

### 1.2 Migration Strategy: Next.js App Router
Instead of abandoning the database or existing features, we migrate the architecture cleanly into Next.js App Router:
1. **Next.js App Router Architecture:**
   - `app/layout.tsx`: Root HTML layout importing typography (`Instrument Serif`, `Inter`, `IBM Plex Mono`), global SCSS, Lenis smooth scrolling provider, and metadata.
   - `app/page.tsx`: Server Component rendering page skeleton, feeding data to interactive client components.
   - `app/globals.scss`: Reset, CSS variables, typography imports, grid background.
2. **Next.js Route Handlers (`app/api/*`):**
   - `app/api/projects/route.ts`: Replaces `GET /api/projects`
   - `app/api/skills/route.ts`: Replaces `GET /api/skills`
   - `app/api/content/route.ts`: Replaces `GET /api/content`
   - `app/api/certificates/route.ts`: Replaces `GET /api/certificates`
   - `app/api/contact/route.ts`: Replaces `POST /api/contact` (validates body, writes to Turso, dispatches Nodemailer to `ankit5242raj1@outlook.com`)
   - `app/api/analytics/track/route.ts`: Replaces `POST /api/analytics/track`
3. **Admin Dashboard Compatibility:**
   - The existing admin dashboard in `admin/` will be preserved in `public/admin/` or routed via `next.config.ts` rewrites, ensuring all admin workflows (editing projects, viewing messages, analytics) continue functioning without disruption.
4. **Turso LibSQL Client:**
   - Preserved in `lib/db/turso.ts` with TypeScript types and environment variable isolation.
5. **Nodemailer Service:**
   - Implemented in `lib/email/transporter.ts`.

---

## 2. Directory Structure

```
portfolio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.scss
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── api/
│       ├── contact/route.ts
│       ├── projects/route.ts
│       ├── skills/route.ts
│       ├── content/route.ts
│       └── certificates/route.ts
├── components/
│   ├── navigation/Navbar.tsx
│   ├── hero/Hero.tsx
│   ├── particle-portrait/ParticlePortrait.tsx
│   ├── visual-story/VisualStory.tsx
│   ├── projects/SelectedWork.tsx
│   ├── about/About.tsx
│   ├── journey/Journey.tsx
│   ├── skills/TechnicalSkills.tsx
│   ├── interests/CurrentInterests.tsx
│   ├── interlude/CreativeInterlude.tsx
│   ├── contact/Contact.tsx
│   └── footer/Footer.tsx
├── animations/
│   ├── gsap/initGsap.ts
│   └── scroll/SmoothScroll.tsx (Lenis)
├── lib/
│   ├── db/turso.ts
│   └── email/mailer.ts
├── shaders/
│   ├── portrait.vert.glsl
│   └── portrait.frag.glsl
├── styles/
│   ├── abstracts/_variables.scss
│   ├── abstracts/_mixins.scss
│   └── sections/*.scss
├── public/
│   ├── img/
│   │   ├── pic.webp
│   │   └── projects/*.png
│   └── admin/
├── docs/
│   ├── portfolio-reference-research.md
│   ├── architecture-migration-plan.md
│   └── technology-compliance.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 3. Shader & Particle Architecture (Three.js + GLSL)

- **Texture Input:** Real photograph `img/pic.webp` loaded via `THREE.TextureLoader`.
- **Canvas Resolution:** Target particle density of 18,000–35,000 points arranged in an indexed grid over the portrait dimensions.
- **Vertex Shader (`portrait.vert.glsl`):**
  - Reads UV coordinates from buffer attributes.
  - Samples luminance from the portrait texture to modulate point size (brighter areas = larger dots, darker = smaller dots).
  - Receives `uProgress` (0.0 to 1.0) driven by GSAP ScrollTrigger.
  - Implements 3D curl / Perlin noise displacement on $(x, y, z)$ as `uProgress` increases.
  - Adds subtle interactive deflection based on `uMouse`.
- **Fragment Shader (`portrait.frag.glsl`):**
  - Renders circular points using `length(gl_PointCoord - vec2(0.5))`.
  - Discards fragments outside the circle radius for crisp circular dots.
  - Colors points with high-contrast monochrome silver-white (`#F0EAE0`) on the face, blending into warm incandescent amber (`#D97745`) on the highlighted edges.

---

## 4. Rollback and Safety Strategy

1. All original static assets and database tables in Turso remain 100% intact.
2. The legacy `server.js` and `db.js` remain as verified backups.
3. Git commits guarantee instant rollback capability at any point.
4. Next.js production build (`npm run build`) will be fully verified locally before any production deployment.
