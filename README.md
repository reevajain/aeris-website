# AERIS — Awareness & Education for Invisible Risk and Screening

A single-page, youth-led awareness site about the everyday, easy-to-miss
lung health risks — air pollution, cooking fumes, occupational exposure,
and secondhand smoke — and why lung screening is a conversation worth
having early. Warm, hopeful, and built to feel approachable for a teenager
and their grandparent alike.

Live sections: **Hero → About → Invisible Risk Translator (quiz) → Myth vs
Fact → Risk Relay → Get Involved → Footer**.

## Highlights

- **Invisible Risk Translator** — a 7-question, client-side quiz with a
  weighted score and a friendly, non-diagnostic 3-tier result (always
  framed as a conversation-starter, never a diagnosis), plus a Share
  Result button (Web Share API with a clipboard fallback).
- **Hover-mask reveal** — the hero's signature interaction: a
  cursor-following circular mask (built with Framer Motion springs) wipes
  away a hazy "invisible risk" scene to reveal a vivid "now you see it"
  scene underneath. Works with touch too.
- **Myth vs Fact** — five flip cards (pure CSS 3D transforms) that bust
  common lung cancer myths.
- **Risk Relay** — a client-side generated QR code (via the `qrcode`
  package) pointing at the site's own URL, for peer-to-peer sharing.
- **Get Involved** — a front-end-only sign-up form that opens a
  pre-filled `mailto:` link (no backend yet — ready to wire up to a form
  service later).

## Tech stack

- [Astro](https://astro.build) (static output) + TypeScript
- Tailwind CSS (custom theme palette in `tailwind.config.mjs`)
- A couple of small React islands (`@astrojs/react`) for the quiz and the
  hover-mask reveal, animated with `framer-motion`
- `qrcode` for the client-side QR code
- No backend, no database — everything ships as static HTML/CSS/JS

## Project structure

```
src/
  components/       Astro components (sections, nav, footer, icons)
  components/icons/ Hand-built inline SVG line-art icons
  islands/          Interactive React components (client-hydrated)
  layouts/          BaseLayout.astro (head, nav, footer, scroll-reveal script)
  pages/            index.astro — assembles the single page
  styles/           global.css (Tailwind directives + custom utilities)
public/             Static assets (favicon)
```

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
```

## Building for production

```bash
npm run build      # outputs static files to ./dist
npm run preview    # serve the production build locally to sanity-check it
```

The `dist/` folder is a fully static site — upload it anywhere, or connect
the repo to Netlify/Vercel for automatic deploys on every push.

## Notes

- The custom color palette (peony, dustyRose, cacao, lavender, leaf,
  grass, jungle, sky) lives in `tailwind.config.mjs` under
  `theme.extend.colors` and is used throughout as named Tailwind classes
  (e.g. `bg-peony`, `text-cacao`).
- Nothing on this site is medical advice. Every result screen and the
  footer repeat that clearly.
