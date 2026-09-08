# Public visual system

Priority: Design Tokens → deliberate navigation → Home Selected Work → Project Detail/Gallery → Notes reading UX.

- Source of truth: `src/styles/theme.css`. Near-white canvas, white surface, graphite text and restrained red accent. Semantic CSS variables are exposed as Tailwind `canvas`, `surface`, `ink`, `muted`, `line`, `accent` utilities. Existing gray/red utilities alias this palette; avoid introducing another hard-coded palette.
- Radius: 12/16px; elevation and section spacing are shared tokens. Reserve the raised shadow for the profile IDE. Status colors remain distinct from branding.
- Hero retains `about.tsx`, existing code content and dimensional grid. Its static backplate, contact shadow and slight desktop perspective establish depth; mobile flattens perspective. Syntax uses three muted semantic colors. No new illustrations or animation system.
- Scrolling never changes routes. Home/About no longer register wheel/touch navigation. Visitors follow ordinary links.
- Home Selected Work reads up to three published projects explicitly marked `featured`, in repository order. Empty selection hides the section. Current development content has one selected project. No fabricated selection or project outcomes.
- Gallery uses a main image, numbered status, native thumbnail buttons and an explicit full-size action. No autoplay; keyboard focus and Escape work through the existing lightbox. Empty images render no gallery.
- Notes use document scrolling on every viewport, a maximum 70ch reading measure, and horizontal scrolling only inside code/tables. Desktop retains sticky navigation; smaller screens have All notes/Search and a disclosure TOC. Existing code tools remain available.

Verification: desktop 1440×1000 and mobile 390×844 inspected locally, no page overflow on Home/Project/Notes; gallery selection/open/Escape and scroll-without-route-change checked. `e2e/visual-navigation.spec.ts` preserves these behavior checks with Thai routes. Screenshots are local ignored artifacts under `artifacts/visual/`. SEO tests remain separate. Preview/Production require their own verification; local screenshots are not deployment evidence.
