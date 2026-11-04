# Creative Portfolio Reference Research & Design Synthesis

**Author:** Ankit Raj Maurya  
**Date:** October 30, 2026  
**Project:** Creative Developer Portfolio Redesign & Architecture Migration  

---

## 1. Executive Summary

This research study evaluates four benchmark creative web experiences to define an original, high-craft creative identity for Ankit Raj Maurya:
1. **Sarthak Sharma Portfolio** (`https://sarthak-sharma-portfolio-six.vercel.app/`): The gold standard for dark editorial typography, high-density halftone human portraiture, and scroll-driven particle dispersion.
2. **Razorpay AI Builders** (`https://razorpay.com/ai-builders/`): Pioneer of cinematic multi-layered storytelling, massive mixed-style serif typography, and visceral visual depth with floating interface artifacts.
3. **Christen Dijoux** (`https://christendijoux.com/`): Benchmark for creative interaction design, tactile micro-transitions, spatial rhythm, and bespoke editorial layout compositions.
4. **Oryzo AI (by Lusion)** (`https://oryzo.ai/`): Benchmark for advanced WebGL/Three.js GPU-assisted visual rendering, GLSL custom shaders, dynamic depth lighting, and organic particle physics.

Rather than copying any single reference, our direction is a synthesis:
$$\text{DARK EDITORIAL} \times \text{PIXEL / HALFTONE ART} \times \text{CREATIVE ENGINEERING} \times \text{CINEMATIC STORYTELLING}$$

---

## 2. In-Depth Reference Analysis

### 2.1 Sarthak Sharma Portfolio
- **URL:** `https://sarthak-sharma-portfolio-six.vercel.app/`
- **Core Visual Character:** Restrained, intellectual, luxury-editorial dark aesthetic with warm incandescent amber accents (`#D97745` / `#FF9B54`).
- **Typography:**
  - Display: High-contrast transitional/modern editorial serif (*Instrument Serif* / *Cormorant Garamond*), rendered at immense scales (11vw–15vw).
  - Body: Low-contrast neutral sans (*Inter* / *Geist*), 14–16px, high line-height (1.65), tracking neutral to tight.
  - Metadata: Uppercase Monospaced (*IBM Plex Mono* / *JetBrains Mono*), 10–12px with wide tracking (`0.15em–0.25em`).
- **Hero Composition & Portrait Treatment:**
  - Centered human portrait masked cleanly against pitch black (`#080807`).
  - No rectangular card or photo frame boundary.
  - The face is rendered through a dense matrix of halftone dots/particles.
  - Dramatic warm amber rim lighting hugs the jawline, ears, and hair.
  - The oversized serif name sits directly layered over the chest/neck area, producing depth: background grid $\rightarrow$ halftone portrait $\rightarrow$ foreground typography $\rightarrow$ floating metadata.
- **Scroll Dispersion Mechanism:**
  - **State 1 (0%–15%):** Face intact, recognizable, halftone matrix sharp and stable.
  - **State 2 (15%–35%):** Outermost edge dots detach; shoulder and hair silhouettes begin dissolving into free particles.
  - **State 3 (35%–60%):** Active dispersion; thousands of individual particles separate along organic curl noise paths with vertical and radial drift.
  - **State 4 (60%–85%):** Portrait deconstructs into an expansive particle field with varying z-depth.
  - **State 5 (85%–100%):** Particles accelerate outward and dissolve into the next section.
  - **Reverse Scroll:** Complete, deterministic reconstruction back into the crystal-clear portrait.
- **Navigation:** Floating pill bar with dark translucent backdrop (`rgba(16, 16, 15, 0.75)`), fine border (`rgba(240, 234, 224, 0.12)`), plain text name mark (NO graphical logo), minimal anchor links, and a primary CTA.

### 2.2 Razorpay AI Builders
- **URL:** `https://razorpay.com/ai-builders/`
- **Core Visual Character:** Dramatic, bold, visceral tech narrative. High visual weight, oversized mixed-font headlines, and multi-plane perspective.
- **Visual Storytelling & Composition:**
  - Massive multi-line headlines combining upright serif and italic serif for emotional cadence (e.g., *"WE BUILD"* in bold serif, *"what ideas"* in fluid italic serif, *"IMAGINE"* in capitalized modern grotesque).
  - Overlapping physicalized interface cards: actual application screenshots, code snippets, analytics graphs, and IDE previews layered at different z-indices and tilt angles.
  - Scroll-driven multi-plane parallax: foreground artifacts translate faster than background headlines, creating genuine spatial depth.
- **Key Takeaway for Ankit's Portfolio:**
  - We will introduce a dedicated **Visual Story Section** (*"FROM AN IDEA TO SOMETHING REAL"*) directly below the hero dispersion.
  - This section will showcase Ankit's real projects (Codex Monarch, ReadyToGo, Orbit UI, Weather App) as layered, floating interface fragments rather than sterile cards.

### 2.3 Christen Dijoux
- **URL:** `https://christendijoux.com/`
- **Core Visual Character:** Bespoke French-Canadian creative developer aesthetic. Highly deliberate asymmetry, tactile interactions, and rhythmic grid structures.
- **Key Takeaway for Ankit's Portfolio:**
  - Eliminate all boilerplate 2-column card grids.
  - Alternate project layouts: Project 1 uses a full-bleed widescreen hero showcase with metadata side-rail; Project 2 uses a split asymmetric composition; Project 3 uses an interactive browser window mockup; Project 4 uses an editorial code-and-visual pairing.
  - Implement magnetic cursor effects and smooth hover scrubs.

### 2.4 Oryzo AI (by Lusion)
- **URL:** `https://oryzo.ai/`
- **Core Visual Character:** State-of-the-art WebGL particle physics, custom GLSL shader lighting, smooth camera choreography, and mathematical noise-driven displacement.
- **Key Takeaway for Ankit's Portfolio:**
  - Real Three.js WebGL rendering pipeline with `THREE.Points`, custom Vertex and Fragment shaders.
  - GLSL uniforms: `uProgress`, `uTime`, `uPixelSize`, `uDisplacement`, `uMouse`, `uResolution`, `uPortrait`.
  - Simplex/Perlin noise functions evaluated directly on the GPU for 60fps performance without CPU bottlenecking.

---

## 3. Section-by-Section Translation Matrix

| Portfolio Section | Benchmark Influence | Specific Implementation in Ankit's Portfolio |
|---|---|---|
| **01. Floating Navigation** | Sarthak Sharma | Minimalist pill bar, plain text `"ANKIT RAJ MAURYA"` (no logo), section anchor indicators, glassmorphic blur, Let's Talk CTA. |
| **02. Hero Stage & Portrait** | Sarthak + Oryzo | Three.js + GLSL custom shader particle system sampling Ankit's real portrait (`pic.webp`). Halftone matrix dissolving into organic amber particles on scroll, reconstructing on reverse scroll. Oversized serif typography layered over portrait. |
| **03. Visual Story Section** | Razorpay AI Builders | Dedicated narrative stage (*"WE BUILD WHAT IDEAS IMAGINE"*). Multi-plane parallax featuring genuine screenshots of Codex Monarch, ReadyToGo, Orbit UI, and Weather App with floating code fragments. |
| **04. Selected Work** | Christen Dijoux | 4 completely distinct visual layouts. Project 1 (Codex Monarch - flagship full-bleed), Project 2 (ReadyToGo - interactive dual-pane), Project 3 (Orbit UI - component browser frame), Project 4 (Weather App - minimalist data interface). |
| **05. About & Perspective** | Sarthak + Editorial | Split editorial layout. Monospaced metadata rail, authentic biography, verified education (NRI Institute Diploma 2024–2027, BSEB Matriculation 2024), real engineering values. |
| **06. Journey Timeline** | Dark Editorial | Monospaced vertical timeline with luminous amber nodes, scroll-scrubbed line fill, verified chronological milestones (2024 BSEB, 2024 Diploma start, Codex Monarch Team Lead, ReadyToGo launch). |
| **07. Technical Arsenal** | Editorial Typography | Grouped typographic matrix (Frontend, Backend, Databases, Core Languages, Mobile, Tooling). No fake percentage bars; focus on verified demonstrable tech. |
| **08. Current Interests** | Christen Dijoux | Editorial horizontal ticker / cards showcasing technical pursuits (Java & DSA, Backend Architecture, WebGL & Shaders, Distributed Systems). |
| **09. Creative Interlude** | Sarthak Sharma | Full-viewport cinematic typographic pause: *"Curiosity is what turns an engineer into a creator."* Subtle grain, warm rim glow. |
| **10. Contact Stage** | Editorial Form | Asymmetric split: direct connection metadata on left, minimalist validated contact form on right wired to Next.js API route + Turso + Nodemailer. |
| **11. Footer** | Minimalist Clean | Plain text branding, back-to-top scroll trigger, local time indicator (Muzaffarpur, India), copyright. |

---

## 4. Design System Tokens

```scss
// Brand & Color Palette
$color-bg-primary: #080807;
$color-bg-secondary: #10100f;
$color-surface: #151411;
$color-surface-hover: #1e1d19;
$color-foreground: #f0eae0;
$color-muted: #a69d91;
$color-subtle: #5a544c;
$color-accent: #d97745;
$color-accent-glow: rgba(217, 119, 69, 0.35);
$color-border: rgba(240, 234, 224, 0.12);
$color-grid-line: rgba(240, 234, 224, 0.055);

// Typography Tokens
$font-display: 'Instrument Serif', Georgia, serif;
$font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
$font-mono: 'IBM Plex Mono', monospace;

// Breakpoints
$bp-mobile-sm: 360px;
$bp-mobile: 480px;
$bp-tablet: 768px;
$bp-desktop: 1024px;
$bp-desktop-lg: 1440px;
```

---

## 5. Verification Checklist

- [x] Sarthak Sharma inspected via browser subagent across scroll levels (0px, 300px, 700px).
- [x] Razorpay AI Builders inspected for typography layering and visual composition.
- [x] Christen Dijoux inspected for asymmetrical rhythm and non-repetitive layout design.
- [x] Oryzo AI inspected for WebGL shader techniques and particle dynamics.
- [x] Synthesized into custom architecture meeting all creative requirements.
