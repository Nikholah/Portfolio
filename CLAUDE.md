# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for Nicolas Lyfoung, a third-year IUT (BUT Informatique) student in Montpellier. Dark "neon" design with heavy use of animation, built with vanilla HTML/CSS/JavaScript and no build step. Content is in French.

## Project Structure

```
Portfolio/
├── index.html                      # Landing page: hero, about, education, projects, skills, passions
├── contact.html                    # Contact form page (mailto)
├── portfolio-dapprentissage.html   # Learning portfolio / competency evidence (not linked in the navbar)
├── projet1.html, projet3.html, projet4.html  # Project detail pages (there is no projet2.html)
├── css/
│   ├── variables.css               # Design tokens (imported by modern.css)
│   ├── modern.css                  # Base, shared components, home page sections
│   ├── project.css                 # Project pages
│   ├── contact.css                 # Contact page
│   └── portfolio-dapprentissage.css
├── js/
│   └── main.js                     # All JavaScript, shared by every page
├── img/                            # Project screenshots
└── pdf/cv.pdf
```

## Common Development Commands

```bash
# Any static server works, e.g.
npx serve -l 8000 .
python -m http.server 8000
```

Opening `index.html` directly also works, but page transitions and CDN scripts behave best over HTTP.

## Architecture

### Libraries (CDN, loaded before `js/main.js` on every page)
- GSAP 3 + ScrollTrigger (cdnjs) — all scroll/entrance animations
- Lenis (unpkg) — smooth scrolling
- Font Awesome (cdnjs), Google Fonts (Space Grotesk, Inter, JetBrains Mono)

`main.js` must keep working when these are missing: it adds `has-motion` or `no-motion` on `<html>`. `no-motion` (no GSAP, or `prefers-reduced-motion`) shows all content with no animation. Never hide content in CSS waiting for JS — initial hidden states are set by GSAP only.

### Design system (`variables.css`)
Single dark theme (no light mode). Neon palette `--neon-blue`, `--neon-violet`, `--neon-cyan` (with `-rgb` variants for `rgba()`), glass surfaces `--surface`, `--border-color`, `--gradient-neon`, `--glow-*`. Legacy token names (`--primary-color`, `--bg-primary`, `--space-*`, `--radius-*`…) are kept and still used.

### JavaScript (`main.js`)
One IIFE with an `init*` function per feature; each returns early when its elements are absent, since the script is shared by all pages.
- `initSmoothScroll` — Lenis + anchor links (`a[href^="#"]`)
- `initNav` — mobile menu, hide/show navbar on scroll, reading progress bar, active link scroll-spy
- `initPageTransitions` / `playIntro` — veil between internal pages; counter loader on the first home visit of a session (`sessionStorage`)
- `initHero`, `initRoles`, `initBackground` — letter-by-letter name, rotating typed roles (`data-roles`, `|`-separated), particle constellation canvas
- `initScrollAnimations` — reveals, word-split titles, counters (`data-count`), timeline drawing, image parallax
- `initMarquee`, `initCursor`, `initMagnetic`, `initTilt` — desktop-only pointer effects (`hover: hover` and `pointer: fine`)
- `initPassions` — interactive SVGs (`data-passion="volley|basket|guitar"`)
- `initContactForm` — validation, then opens a pre-filled `mailto:`
- `initLearningPortfolio` — nav pills scroll-spy, back button

### Conventions
- **Reveal on scroll**: add `data-reveal` (variants: `left`, `right`, `scale`) on home-page elements. Secondary pages are revealed automatically through the selector list `REVEAL_SELECTOR` in `main.js` — add new component classes there rather than editing each page.
- **Custom cursor label**: `data-cursor="Texte"` on an element.
- **Tilt cards**: listed in `TILT_SELECTOR`; their transforms are driven by GSAP, so avoid CSS `transform` on hover for them (use `scale`/`translate` individual properties or box-shadow).
- `.btn` and `.social-link` are magnetic (GSAP `x`/`y`): don't add CSS hover transforms on them.
- The navbar must not get `backdrop-filter` or a permanent `transform` directly (the full-screen mobile menu is `position: fixed` inside it); the blur lives on `.navbar::before`.
- Contact email is `nicolaslyf@gmail.com` everywhere (also the `EMAIL` constant in `main.js`).
- The footer year is injected by JS.

### English version (`en/`)
- `en/index.html`, `en/contact.html`, `en/projet1|3|4.html` are **generated** from the French pages by `node tools/make-en.js .` — never edit them by hand.
- The script translates with the `pairs` table (exact French text → English, whitespace-insensitive), rewrites asset paths to `../`, sets `lang="en"`, and adds the FR/EN switch (`.lang-switch` in the navbar) plus `hreflang` links to both versions.
- After changing French text, add or update the matching pair, rerun the script, and check its output: `[non trouvé]` = a pair no longer matches, `[reste FR]` = French text left untranslated.
- `portfolio-dapprentissage.html` has no English version.
- Strings generated by `main.js` (form errors, notifications, menu label) come from the `STRINGS` table, picked from `<html lang>`.

### Responsive
Main breakpoint at 768px (full-screen mobile menu), plus 900px/1024px layout breakpoints. Pointer effects are disabled on touch devices.
