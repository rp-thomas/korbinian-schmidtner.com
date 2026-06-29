# korbinian-schmidtner.com

Personal website for Korbinian Schmidtner, mountain guide. Built with Astro, React, Tailwind CSS v4, and deployed on Vercel.

## Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 7](https://astro.build) — SSR, server output |
| Components | [React 19](https://react.dev) — interactive islands |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Content | Astro Content Collections — Markdown with Zod schema |
| Images | Astro `<Image>` component — optimized via Sharp + Vercel |
| Forms | Astro Actions + Zod validation + AWS SES |
| Deployment | [Vercel](https://vercel.com) via `@astrojs/vercel` adapter |

## Project Structure

```
site/
├── public/
│   ├── favicon.ico
│   └── favicon.svg
│
└── src/
    ├── actions/
    │   └── index.ts              # Contact form action (Zod + AWS SES)
    │
    ├── assets/
    │   └── pics/                 # Images used by <Image> component
    │       ├── sommer/
    │       │   ├── felsklettern/
    │       │   └── hochtouren/
    │       └── winter/
    │           ├── eisklettern/
    │           └── skitouren/
    │
    ├── components/
    │   ├── Nav.astro             # Sticky transparent→solid navigation
    │   ├── Footer.astro          # Dark footer with CTA band
    │   └── ContactForm.tsx       # React contact form (client island)
    │
    ├── content/
    │   └── angebote/             # Markdown content for activity pages
    │       ├── hochtouren.md
    │       ├── felsklettern.md
    │       ├── eisklettern.md
    │       └── skitouren.md
    │
    ├── content.config.ts         # Content collection schema (Zod + image())
    │
    ├── layouts/
    │   ├── BaseLayout.astro      # HTML shell, fonts, global CSS
    │   └── Layout.astro          # Page layout: Nav + slot + Footer
    │
    ├── pages/
    │   ├── index.astro           # Homepage — hero, cards, trust strip
    │   ├── sommer.astro          # Summer hub
    │   ├── winter.astro          # Winter hub
    │   ├── ueber-mich.astro      # About page
    │   ├── kontakt.astro         # Contact page
    │   └── angebote/
    │       └── [slug].astro      # Dynamic activity detail page
    │
    └── styles/
        └── global.css            # Tailwind v4 @theme tokens + base styles
```

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `index.astro` | Hero, intro, activity card grid, trust strip |
| `/sommer` | `sommer.astro` | Hochtouren & Felsklettern hub |
| `/winter` | `winter.astro` | Eisklettern & Skitouren hub |
| `/angebote/hochtouren` | `[slug].astro` | Hochtouren detail |
| `/angebote/felsklettern` | `[slug].astro` | Felsklettern detail |
| `/angebote/eisklettern` | `[slug].astro` | Eisklettern detail |
| `/angebote/skitouren` | `[slug].astro` | Skitouren detail |
| `/ueber-mich` | `ueber-mich.astro` | About — portrait hero, bio, credentials |
| `/kontakt` | `kontakt.astro` | Contact form with hero image |

## Content Collections

Activity pages are driven by Markdown files in `src/content/angebote/`. Each file defines frontmatter validated against the schema in `src/content.config.ts`:

```ts
{
  title:           string
  kategorie:       'sommer' | 'winter'
  heroImage:       image()          // resolved & optimized by Astro
  beschreibung:    string
  leistungen:      string[]
  voraussetzungen: string[]         // optional
  highlights:      string[]         // optional
  order:           number           // optional, controls sort order
}
```

## Styling

Tailwind CSS v4 is configured entirely via `src/styles/global.css` using the `@theme` block — no `tailwind.config.*` file is needed. Brand tokens:

```css
@theme {
  --color-accent:        #2f81f7;   /* primary blue */
  --color-accent-hover:  #1f6feb;
  --color-stone:         #1a1a1a;   /* primary text */
  --color-stone-mid:     #4a4a4a;   /* secondary text */
  --color-stone-muted:   #888888;   /* muted text */
  --color-surface:       #f5f3f0;   /* off-white background */
  --color-border:        #e5e2de;
  --color-border-strong: #c8c4bf;
}
```

Two gradient values (`--hero-overlay`, `--card-overlay`) are kept as plain CSS custom properties and applied via `style=` attributes since they are not expressible as Tailwind utilities.

## Contact Form

The contact form uses [Astro Actions](https://docs.astro.build/en/guides/actions/) with Zod validation and sends email via AWS SES. Copy `.env.example` to `.env` and fill in credentials before running locally or deploying.

```
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SES_FROM_EMAIL=no-reply@korbinian-schmidtner.com
SES_TO_EMAIL=info@korbinian-schmidtner.com
```

## Development

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org) | ≥ 22.12 | JavaScript runtime |
| [pnpm](https://pnpm.io) | ≥ 10 | Package manager |

**Install Node.js** (via [nvm](https://github.com/nvm-sh/nvm) — recommended):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Install and use the required Node version
nvm install 22
nvm use 22
```

Or download directly from [nodejs.org](https://nodejs.org).

**Install pnpm:**

```bash
npm install -g pnpm
```

Or via the standalone installer:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Setup & commands

```bash
pnpm install      # install dependencies
pnpm dev          # start dev server at http://localhost:4321
pnpm build        # production build → .vercel/output/
pnpm preview      # preview the production build locally
```

## Deployment

The project deploys to Vercel automatically on push. `@astrojs/vercel` with `imageService: true` is configured so Vercel handles image optimization natively — no Sharp binary issues in serverless functions.
