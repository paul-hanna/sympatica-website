# Sympatica Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship sympatica.studio — a static, dark-default, work-forward marketing site for a New York commercial production company, deployed free on Cloudflare Pages.

**Architecture:** Astro static site generator with Preact islands for interactive bits (HeroCycler, WorkTile hover loops, WorkFilter, ThemeToggle). Content lives as MDX in `/content/`, validated by Zod schemas via Astro's content collections. Vanilla CSS with custom properties owns the palette; no CSS framework. Vitest for unit tests on Preact islands and pure helpers.

**Tech Stack:** Astro 5, Preact (`@astrojs/preact`), MDX (`@astrojs/mdx`), `@fontsource/inter`, `@fontsource/jetbrains-mono`, Vitest + `@testing-library/preact`, `@axe-core/cli`, `lychee` for link checking. Hosted on Cloudflare Pages.

**Reference spec:** `docs/superpowers/specs/2026-04-30-sympatica-website-design.md`

---

## File Structure

```
sympatica-website/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── README.md
├── public/
│   ├── favicon.svg
│   └── work/
│       └── {slug}/
│           ├── poster.jpg
│           ├── preview.mp4
│           └── stills/
│               └── 01.jpg
├── content/
│   ├── projects/
│   │   ├── sample-spot.mdx
│   │   └── sample-music-video.mdx
│   ├── directors/
│   │   └── sample-director.mdx
│   └── site/
│       ├── featured.json
│       ├── about.mdx
│       └── contact.json
└── src/
    ├── content.config.ts          # Zod schemas for projects, directors, site
    ├── styles/
    │   ├── tokens.css              # CSS custom properties (palette, type, spacing)
    │   └── global.css              # reset + base type + layout primitives
    ├── lib/
    │   ├── sort.ts                 # ordering helpers for projects/directors
    │   └── sort.test.ts
    ├── components/
    │   ├── SiteHeader.astro
    │   ├── Footer.astro
    │   ├── ThemeToggle.tsx         # Preact island
    │   ├── ThemeToggle.test.tsx
    │   ├── WorkGrid.astro
    │   ├── WorkTile.tsx            # Preact island
    │   ├── WorkTile.test.tsx
    │   ├── WorkFilter.tsx          # Preact island
    │   ├── WorkFilter.test.tsx
    │   ├── DirectorList.astro
    │   ├── HeroCycler.tsx          # Preact island
    │   └── HeroCycler.test.tsx
    ├── layouts/
    │   └── Base.astro              # html shell, fonts, header, footer
    └── pages/
        ├── index.astro
        ├── about.astro
        ├── contact.astro
        ├── roster/
        │   ├── index.astro
        │   └── [slug].astro
        └── work/
            ├── index.astro
            └── [slug].astro
```

**Working directory for all commands:** `/Users/paulh/Local Documents/sympatica/website`

---

## Task 1: Initialize repo, Astro project, dependencies

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `README.md`, `src/env.d.ts`

- [ ] **Step 1: `git init` and create `.gitignore`**

```bash
git init
git branch -M main
```

Write `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Build output
dist/
.astro/

# Environment
.env
.env.local
.env.production

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Brainstorming session artifacts
.superpowers/

# Test coverage
coverage/
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "sympatica-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint:links": "lychee dist --no-progress",
    "lint:a11y": "axe ./dist/**/*.html --exit"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/preact": "^4.0.0",
    "preact": "^10.24.0",
    "@fontsource/inter": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@testing-library/preact": "^3.2.4",
    "@testing-library/jest-dom": "^6.6.0",
    "jsdom": "^25.0.0",
    "@axe-core/cli": "^4.10.0"
  }
}
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://sympatica.studio',
  integrations: [preact(), mdx()],
  output: 'static',
});
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

Write `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Add `@preact/preset-vite` to devDependencies in `package.json`:

```json
"@preact/preset-vite": "^2.10.0"
```

- [ ] **Step 6: Write `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 7: Write minimal `README.md`**

```markdown
# Sympatica

Marketing site for Sympatica, a New York commercial production company.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/`.

## Test

```bash
npm test
```
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: lockfile created, `node_modules/` populated, no errors.

- [ ] **Step 9: Verify Astro starts**

Run: `npm run dev`
Expected: Astro dev server starts on http://localhost:4321 (will show a 404 since no pages exist yet — that's fine). Stop with `Ctrl+C`.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "chore: initialize Astro project with Preact and Vitest"
```

---

## Task 2: Design tokens, global CSS, Base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  /* Default: dark */
  --bg: #0a0a0a;
  --ink: #ededed;
  --ink-muted: rgba(237, 237, 237, 0.6);
  --rule: rgba(237, 237, 237, 0.12);

  /* Type */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;

  /* Scale */
  --type-eyebrow: 11px;
  --type-body: 14px;
  --type-lede: 22px;
  --type-display: 32px;
  --type-display-large: 48px;

  /* Spacing */
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 48px;
  --gap-2xl: 96px;

  /* Layout */
  --max-content: 1280px;
  --gutter: 24px;

  /* Motion */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 200ms;
  --duration-base: 400ms;
}

html[data-theme='light'] {
  --bg: #ffffff;
  --ink: #0a0a0a;
  --ink-muted: rgba(10, 10, 10, 0.6);
  --rule: rgba(10, 10, 10, 0.12);
}
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/jetbrains-mono/400.css';
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

html {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: var(--type-body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color var(--duration-fast) var(--ease),
              color var(--duration-fast) var(--ease);
}

body { min-height: 100vh; }

a { color: inherit; text-decoration: none; }
a:hover { opacity: 0.7; }

img, video { max-width: 100%; display: block; }

button {
  font: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--type-eyebrow);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.mono { font-family: var(--font-mono); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Sympatica is a New York commercial production company.' } = Astro.props;
---
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Write a temporary `src/pages/index.astro` for verification**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Sympatica">
  <section style="padding: var(--gutter);">
    <p class="eyebrow">Sympatica</p>
    <h1 style="font-size: var(--type-display-large); font-weight: 500; letter-spacing: -0.02em; margin: 0;">It works.</h1>
  </section>
</Base>
```

- [ ] **Step 5: Verify dev server renders correctly**

Run: `npm run dev`
Expected: http://localhost:4321 shows a dark page with "SYMPATICA" mono eyebrow and "It works." in large sans. No console errors. Stop server.

- [ ] **Step 6: Add favicon**

Write `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0a0a0a"/><text x="16" y="22" text-anchor="middle" font-family="monospace" font-size="14" fill="#ededed">S</text></svg>
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add design tokens, global styles, base layout"
```

---

## Task 3: Content collection schemas + sample content

**Files:**
- Create: `src/content.config.ts`, `content/projects/sample-spot.mdx`, `content/projects/sample-music-video.mdx`, `content/directors/sample-director.mdx`, `content/site/featured.json`, `content/site/about.mdx`, `content/site/contact.json`
- Create placeholder media: `public/work/sample-spot/poster.jpg`, `public/work/sample-spot/preview.mp4` (placeholder is fine), same for `sample-music-video`

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    artist: z.string().optional(),
    director: z.string(),
    category: z.enum(['commercial', 'music-video']),
    year: z.number().int().min(2000).max(2100),
    youtube_id: z.string(),
    preview_clip: z.string(),
    poster: z.string(),
    stills: z.array(z.string()).optional(),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).optional(),
    order: z.number().int().default(100),
  }).superRefine((data, ctx) => {
    if (data.category === 'commercial' && !data.client) {
      ctx.addIssue({ code: 'custom', message: 'Commercials require client', path: ['client'] });
    }
    if (data.category === 'music-video' && !data.artist) {
      ctx.addIssue({ code: 'custom', message: 'Music videos require artist', path: ['artist'] });
    }
  }),
});

const directors = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/directors' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    order: z.number().int().default(100),
  }),
});

const featured = defineCollection({
  loader: file('content/site/featured.json'),
  schema: z.object({
    id: z.string(),
    slugs: z.array(z.string()).min(3).max(5),
  }),
});

const contact = defineCollection({
  loader: file('content/site/contact.json'),
  schema: z.object({
    id: z.string(),
    email: z.string().email(),
    city: z.string(),
    typeform_id: z.string(),
  }),
});

export const collections = { projects, directors, featured, contact };
```

Note: `featured.json` and `contact.json` must wrap their data in an array with `id` fields when loaded via the `file` loader. Write them as:

```json
[{ "id": "default", "slugs": ["sample-spot", "sample-music-video"], ... }]
```

- [ ] **Step 2: Write `content/directors/sample-director.mdx`**

```mdx
---
name: "Sample Director"
slug: "sample-director"
order: 1
---

Sample Director is a director working between New York and Los Angeles. Their commercial work spans automotive, fashion, and lifestyle. Music video work has appeared on MTV, Pitchfork, and FADER.

Recent collaborators include Sample Brand, Sample Artist, and Sample Agency.
```

- [ ] **Step 3: Write `content/projects/sample-spot.mdx`**

```mdx
---
title: "Sample Commercial"
client: "Sample Brand"
director: "sample-director"
category: "commercial"
year: 2025
youtube_id: "dQw4w9WgXcQ"
preview_clip: "/work/sample-spot/preview.mp4"
poster: "/work/sample-spot/poster.jpg"
stills:
  - "/work/sample-spot/stills/01.jpg"
credits:
  - { role: "Director", name: "Sample Director" }
  - { role: "DP", name: "Sample DP" }
  - { role: "Production Co.", name: "Sympatica" }
  - { role: "Agency", name: "Sample Agency" }
order: 1
---
```

- [ ] **Step 4: Write `content/projects/sample-music-video.mdx`**

```mdx
---
title: "Sample Music Video"
artist: "Sample Artist"
director: "sample-director"
category: "music-video"
year: 2025
youtube_id: "dQw4w9WgXcQ"
preview_clip: "/work/sample-music-video/preview.mp4"
poster: "/work/sample-music-video/poster.jpg"
order: 2
---
```

- [ ] **Step 5: Write `content/site/featured.json`**

```json
[
  {
    "id": "default",
    "slugs": ["sample-spot", "sample-music-video", "sample-spot"]
  }
]
```

(Note: minimum is 3 slugs per schema. Repeat one for now until real content fills it. We'll relax this once there are 3+ real projects — for now duplicating is the simplest way to satisfy the validator while developing.)

- [ ] **Step 6: Write `content/site/contact.json`**

```json
[
  {
    "id": "default",
    "email": "hello@sympatica.studio",
    "city": "New York",
    "typeform_id": "PLACEHOLDER_TYPEFORM_ID"
  }
]
```

- [ ] **Step 7: Write `content/site/about.mdx`**

```mdx
---
title: "About"
team:
  - { name: "Founder Name", role: "Founder" }
  - { name: "EP Name", role: "Executive Producer" }
  - { name: "HoP Name", role: "Head of Production" }
---

Sympatica is a commercial production company built around director-led storytelling.

We make commercials and music videos that feel made — by people, for people. Based in New York; working everywhere.
```

(Note: `about.mdx` is read directly by `/about` page via Astro's import — it doesn't need a content collection definition.)

- [ ] **Step 8: Add placeholder media**

Create directories:
```bash
mkdir -p public/work/sample-spot/stills
mkdir -p public/work/sample-music-video/stills
```

Create empty placeholder files (engineer may replace with real assets later):
```bash
touch public/work/sample-spot/poster.jpg
touch public/work/sample-spot/preview.mp4
touch public/work/sample-spot/stills/01.jpg
touch public/work/sample-music-video/poster.jpg
touch public/work/sample-music-video/preview.mp4
```

(Empty files are fine for build verification; replace with real 1280x720 JPGs and short MP4s before launch.)

- [ ] **Step 9: Run build to verify schemas**

Run: `npm run build`
Expected: Build succeeds. If it fails, the error will name the specific frontmatter field that's wrong — fix and re-run. The build output goes to `dist/` (we have only the temp index.astro page so far).

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: add content collection schemas and sample content"
```

---

## Task 4: ThemeToggle (Preact island, TDD)

**Files:**
- Create: `src/components/ThemeToggle.tsx`, `src/components/ThemeToggle.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/ThemeToggle.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('starts in dark mode', () => {
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles to light when clicked', () => {
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles back to dark when clicked again', () => {
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('does not persist across page loads (no localStorage write)', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    expect(setSpy).not.toHaveBeenCalled();
    setSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- ThemeToggle`
Expected: FAIL — module `./ThemeToggle` not found.

- [ ] **Step 3: Implement `ThemeToggle.tsx`**

```tsx
import { useState } from 'preact/hooks';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      class="theme-toggle"
    >
      <span class="mono" aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span>
    </button>
  );
}
```

Add inline styles via a CSS file `src/components/ThemeToggle.css`:

```css
.theme-toggle {
  font-size: 14px;
  line-height: 1;
  color: var(--ink-muted);
  transition: color var(--duration-fast) var(--ease);
}
.theme-toggle:hover { color: var(--ink); }
```

Import the CSS at the top of `ThemeToggle.tsx`:

```tsx
import './ThemeToggle.css';
```

- [ ] **Step 4: Run test, expect pass**

Run: `npm test -- ThemeToggle`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add ThemeToggle Preact island with tests"
```

---

## Task 5: SiteHeader, Footer, sort helpers (TDD sort)

**Files:**
- Create: `src/lib/sort.ts`, `src/lib/sort.test.ts`, `src/components/SiteHeader.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Write the failing test for sort helpers**

`src/lib/sort.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { byOrderThenYear, byOrder } from './sort';

describe('byOrderThenYear', () => {
  it('orders by `order` ascending', () => {
    const items = [
      { data: { order: 3, year: 2025 } },
      { data: { order: 1, year: 2024 } },
      { data: { order: 2, year: 2026 } },
    ];
    const sorted = items.toSorted(byOrderThenYear);
    expect(sorted.map((i) => i.data.order)).toEqual([1, 2, 3]);
  });

  it('breaks ties by year descending', () => {
    const items = [
      { data: { order: 1, year: 2023 } },
      { data: { order: 1, year: 2025 } },
      { data: { order: 1, year: 2024 } },
    ];
    const sorted = items.toSorted(byOrderThenYear);
    expect(sorted.map((i) => i.data.year)).toEqual([2025, 2024, 2023]);
  });
});

describe('byOrder', () => {
  it('orders by `order` ascending', () => {
    const items = [
      { data: { order: 5 } },
      { data: { order: 1 } },
      { data: { order: 3 } },
    ];
    const sorted = items.toSorted(byOrder);
    expect(sorted.map((i) => i.data.order)).toEqual([1, 3, 5]);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- sort`
Expected: FAIL — module `./sort` not found.

- [ ] **Step 3: Implement `src/lib/sort.ts`**

```ts
type WithOrderYear = { data: { order: number; year: number } };
type WithOrder = { data: { order: number } };

export function byOrderThenYear(a: WithOrderYear, b: WithOrderYear): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return b.data.year - a.data.year;
}

export function byOrder(a: WithOrder, b: WithOrder): number {
  return a.data.order - b.data.order;
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npm test -- sort`
Expected: 3 tests pass.

- [ ] **Step 5: Write `src/components/SiteHeader.astro`**

```astro
---
import { ThemeToggle } from './ThemeToggle';
---
<header class="site-header">
  <a href="/" class="wordmark mono">SYMPATICA</a>
  <nav class="site-nav mono">
    <a href="/work">Work</a>
    <a href="/roster">Roster</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
    <ThemeToggle client:load />
  </nav>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px var(--gutter);
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
  }
  .wordmark {
    font-size: var(--type-eyebrow);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .site-nav {
    display: flex;
    align-items: center;
    gap: 24px;
    font-size: var(--type-eyebrow);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .site-nav a:hover { opacity: 1; color: var(--ink-muted); }
</style>
```

- [ ] **Step 6: Write `src/components/Footer.astro`**

```astro
---
import { getEntry } from 'astro:content';
const contact = await getEntry('contact', 'default');
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="footer-row mono">
    <span>SYMPATICA</span>
    <span>{contact?.data.email}</span>
    <span>{contact?.data.city.toUpperCase()}</span>
    <span>© {year}</span>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--rule);
    padding: var(--gap-lg) var(--gutter);
    margin-top: var(--gap-2xl);
  }
  .footer-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--gap-md);
    font-size: var(--type-eyebrow);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
</style>
```

- [ ] **Step 7: Update `src/layouts/Base.astro` to include header and footer**

```astro
---
import '../styles/global.css';
import SiteHeader from '../components/SiteHeader.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  hideHeader?: boolean;
}

const { title, description = 'Sympatica is a New York commercial production company.', hideHeader = false } = Astro.props;
---
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    {!hideHeader && <SiteHeader />}
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

(`hideHeader` exists for future flexibility on the homepage if we want the nav to overlay rather than sit above the hero — wired up but not yet used.)

- [ ] **Step 8: Verify dev server still renders**

Run: `npm run dev`
Expected: http://localhost:4321 shows header at top with wordmark + nav + theme toggle, footer at bottom with contact info. Click toggle — colors invert. Click again — back to dark. Stop server.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add SiteHeader, Footer, and sort helpers"
```

---

## Task 6: WorkTile (Preact island) and WorkGrid (Astro)

**Files:**
- Create: `src/components/WorkTile.tsx`, `src/components/WorkTile.test.tsx`, `src/components/WorkTile.css`, `src/components/WorkGrid.astro`

- [ ] **Step 1: Write failing test for WorkTile**

`src/components/WorkTile.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { WorkTile } from './WorkTile';

const tile = {
  slug: 'sample-spot',
  title: 'Sample Spot',
  director: 'Sample Director',
  client: 'Sample Brand',
  category: 'commercial' as const,
  poster: '/work/sample-spot/poster.jpg',
  preview_clip: '/work/sample-spot/preview.mp4',
};

describe('WorkTile', () => {
  it('renders title, director, and client', () => {
    const { getByText } = render(<WorkTile {...tile} />);
    expect(getByText('Sample Spot')).toBeInTheDocument();
    expect(getByText(/Sample Director/)).toBeInTheDocument();
    expect(getByText(/Sample Brand/)).toBeInTheDocument();
  });

  it('renders artist instead of client for music videos', () => {
    const mv = { ...tile, category: 'music-video' as const, client: undefined, artist: 'Sample Artist' };
    const { getByText, queryByText } = render(<WorkTile {...mv} />);
    expect(getByText(/Sample Artist/)).toBeInTheDocument();
    expect(queryByText(/Sample Brand/)).toBeNull();
  });

  it('renders poster image as default state', () => {
    const { container } = render(<WorkTile {...tile} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/work/sample-spot/poster.jpg');
  });

  it('mounts the preview video lazily on hover', () => {
    const { container } = render(<WorkTile {...tile} />);
    const tileEl = container.querySelector('.work-tile') as HTMLElement;
    expect(container.querySelector('video')).toBeNull();
    fireEvent.mouseEnter(tileEl);
    expect(container.querySelector('video')).not.toBeNull();
    expect(container.querySelector('video')?.getAttribute('src')).toBe('/work/sample-spot/preview.mp4');
  });

  it('links to the project page', () => {
    const { container } = render(<WorkTile {...tile} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/work/sample-spot');
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- WorkTile`
Expected: FAIL — module `./WorkTile` not found.

- [ ] **Step 3: Implement `src/components/WorkTile.tsx`**

```tsx
import { useState } from 'preact/hooks';
import './WorkTile.css';

export interface WorkTileProps {
  slug: string;
  title: string;
  director: string;
  client?: string;
  artist?: string;
  category: 'commercial' | 'music-video';
  poster: string;
  preview_clip: string;
}

export function WorkTile(props: WorkTileProps) {
  const [hovered, setHovered] = useState(false);
  const subject = props.category === 'commercial' ? props.client : props.artist;

  return (
    <a
      href={`/work/${props.slug}`}
      class="work-tile"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div class="work-tile-media">
        <img src={props.poster} alt={props.title} loading="lazy" />
        {hovered && (
          <video
            src={props.preview_clip}
            class="work-tile-preview"
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>
      <div class="work-tile-overlay mono">
        <span class="work-tile-title">{props.title}</span>
        <span class="work-tile-meta">
          {props.director}{subject ? ` · ${subject}` : ''}
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 4: Write `src/components/WorkTile.css`**

```css
.work-tile {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--rule);
}
.work-tile:hover { opacity: 1; }

.work-tile-media,
.work-tile-media img,
.work-tile-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-tile-preview {
  opacity: 0;
  animation: fade-in var(--duration-fast) var(--ease) forwards;
}
@keyframes fade-in { to { opacity: 1; } }

.work-tile-overlay {
  position: absolute;
  inset: auto 12px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.06em;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}
.work-tile:hover .work-tile-overlay { opacity: 1; }

.work-tile-title { font-weight: 500; }
.work-tile-meta { opacity: 0.8; }

@media (hover: none) {
  .work-tile-overlay { opacity: 1; }
}
```

- [ ] **Step 5: Run test, expect pass**

Run: `npm test -- WorkTile`
Expected: 5 tests pass.

- [ ] **Step 6: Implement `src/components/WorkGrid.astro`**

```astro
---
import { WorkTile } from './WorkTile';
import type { CollectionEntry } from 'astro:content';

interface Props {
  projects: CollectionEntry<'projects'>[];
  columns?: 2 | 3;
}

const { projects, columns = 3 } = Astro.props;
---
<div class={`work-grid work-grid-${columns}`}>
  {projects.map((p) => (
    <WorkTile
      client:visible
      slug={p.id}
      title={p.data.title}
      director={p.data.director}
      client={p.data.client}
      artist={p.data.artist}
      category={p.data.category}
      poster={p.data.poster}
      preview_clip={p.data.preview_clip}
    />
  ))}
</div>

<style>
  .work-grid {
    display: grid;
    gap: var(--gap-sm);
    padding: var(--gap-md) var(--gutter);
  }
  .work-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .work-grid-2 { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 900px) {
    .work-grid-3, .work-grid-2 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .work-grid-3, .work-grid-2 { grid-template-columns: 1fr; }
  }
</style>
```

(Note: `p.id` is the slug Astro derives from the filename. If you used a different slug field, replace accordingly.)

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add WorkTile and WorkGrid components"
```

---

## Task 7: WorkFilter (Preact island, TDD) + /work page

**Files:**
- Create: `src/components/WorkFilter.tsx`, `src/components/WorkFilter.test.tsx`, `src/components/WorkFilter.css`
- Replace: `src/pages/work/index.astro` (currently doesn't exist; the temp `src/pages/index.astro` from Task 2 stays as homepage)

- [ ] **Step 1: Write failing test for WorkFilter**

`src/components/WorkFilter.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { WorkFilter } from './WorkFilter';

describe('WorkFilter', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/work');
  });

  it('renders all three filter pills', () => {
    const { getByRole } = render(<WorkFilter />);
    expect(getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /commercials/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /music videos/i })).toBeInTheDocument();
  });

  it('marks "All" as active by default', () => {
    const { getByRole } = render(<WorkFilter />);
    expect(getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates the URL when a filter is selected', () => {
    const { getByRole } = render(<WorkFilter />);
    fireEvent.click(getByRole('button', { name: /commercials/i }));
    expect(window.location.search).toBe('?cat=commercial');
  });

  it('removes the query param when "All" is selected', () => {
    window.history.replaceState({}, '', '/work?cat=commercial');
    const { getByRole } = render(<WorkFilter />);
    fireEvent.click(getByRole('button', { name: /all/i }));
    expect(window.location.search).toBe('');
  });

  it('shows/hides tiles via data attributes on the grid', () => {
    document.body.innerHTML = '<div class="work-grid"><a data-category="commercial">c</a><a data-category="music-video">m</a></div>';
    const { getByRole } = render(<WorkFilter />);
    fireEvent.click(getByRole('button', { name: /commercials/i }));
    const commercialEl = document.querySelector('[data-category="commercial"]') as HTMLElement;
    const mvEl = document.querySelector('[data-category="music-video"]') as HTMLElement;
    expect(commercialEl.style.display).not.toBe('none');
    expect(mvEl.style.display).toBe('none');
  });

  it('reads initial state from URL', () => {
    window.history.replaceState({}, '', '/work?cat=music-video');
    const { getByRole } = render(<WorkFilter />);
    expect(getByRole('button', { name: /music videos/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- WorkFilter`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/WorkFilter.tsx`**

```tsx
import { useEffect, useState } from 'preact/hooks';
import './WorkFilter.css';

type Category = 'all' | 'commercial' | 'music-video';

const LABELS: Record<Category, string> = {
  'all': 'All',
  'commercial': 'Commercials',
  'music-video': 'Music Videos',
};

export function WorkFilter() {
  const [active, setActive] = useState<Category>('all');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('cat');
    if (param === 'commercial' || param === 'music-video') {
      setActive(param);
    }
  }, []);

  useEffect(() => {
    applyFilter(active);
  }, [active]);

  const select = (cat: Category) => {
    setActive(cat);
    const url = new URL(window.location.href);
    if (cat === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', cat);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div class="work-filter mono">
      {(Object.keys(LABELS) as Category[]).map((cat) => (
        <button
          type="button"
          aria-pressed={active === cat}
          class={`work-filter-pill ${active === cat ? 'is-active' : ''}`}
          onClick={() => select(cat)}
        >
          {LABELS[cat]}
        </button>
      ))}
    </div>
  );
}

function applyFilter(active: Category) {
  const tiles = document.querySelectorAll<HTMLElement>('.work-grid [data-category]');
  tiles.forEach((tile) => {
    const cat = tile.dataset.category;
    tile.style.display = active === 'all' || cat === active ? '' : 'none';
  });
}
```

- [ ] **Step 4: Write `src/components/WorkFilter.css`**

```css
.work-filter {
  display: flex;
  gap: var(--gap-sm);
  padding: 0 var(--gutter);
  margin-bottom: var(--gap-md);
}
.work-filter-pill {
  padding: 6px 14px;
  border: 1px solid var(--rule);
  font-size: var(--type-eyebrow);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  transition: color var(--duration-fast) var(--ease),
              background-color var(--duration-fast) var(--ease),
              border-color var(--duration-fast) var(--ease);
}
.work-filter-pill:hover { color: var(--ink); border-color: var(--ink); }
.work-filter-pill.is-active {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
```

- [ ] **Step 5: Update `WorkTile.tsx` to expose `data-category` for the filter**

In `WorkTile.tsx`, change the opening `<a>` to:

```tsx
<a
  href={`/work/${props.slug}`}
  class="work-tile"
  data-category={props.category}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
```

- [ ] **Step 6: Run tests, expect pass**

Run: `npm test`
Expected: All tests pass (sort, ThemeToggle, WorkTile, WorkFilter).

- [ ] **Step 7: Write `src/pages/work/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { WorkFilter } from '../../components/WorkFilter';
import WorkGrid from '../../components/WorkGrid.astro';
import { byOrderThenYear } from '../../lib/sort';

const projects = (await getCollection('projects')).toSorted(byOrderThenYear);
---
<Base title="Work · Sympatica">
  <section class="work-page">
    <div class="work-page-header">
      <p class="eyebrow">Selected Works</p>
      <WorkFilter client:load />
    </div>
    <WorkGrid projects={projects} columns={3} />
  </section>
</Base>

<style>
  .work-page-header {
    padding: var(--gap-xl) var(--gutter) var(--gap-md);
  }
  .work-page-header .eyebrow { margin: 0 0 var(--gap-md); }
</style>
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`
Expected:
- http://localhost:4321/work shows three pills + a 3-up grid (just our 2 sample tiles for now)
- Click "Commercials" → only the commercial tile is visible; URL updates to `?cat=commercial`
- Click "Music Videos" → only the MV tile; URL updates
- Click "All" → both visible; query param removed
- Refresh on `?cat=commercial` → commercial pill is active by default

Stop server.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add WorkFilter and /work page"
```

---

## Task 8: Project page (`/work/[slug]`)

**Files:**
- Create: `src/pages/work/[slug].astro`

- [ ] **Step 1: Implement `src/pages/work/[slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { byOrderThenYear } from '../../lib/sort';

export async function getStaticPaths() {
  const all = (await getCollection('projects')).toSorted(byOrderThenYear);
  return all.map((entry, i) => {
    const next = all[i + 1] ?? all[0];
    return {
      params: { slug: entry.id },
      props: { entry, next: { slug: next.id, title: next.data.title } },
    };
  });
}

interface Props {
  entry: CollectionEntry<'projects'>;
  next: { slug: string; title: string };
}

const { entry, next } = Astro.props;
const { data } = entry;
const subject = data.category === 'commercial' ? data.client : data.artist;
const categoryLabel = data.category === 'commercial' ? 'Commercial' : 'Music Video';
---
<Base title={`${data.title} · Sympatica`}>
  <article class="project">
    <div class="project-video">
      <iframe
        src={`https://www.youtube.com/embed/${data.youtube_id}?rel=0`}
        title={data.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <div class="project-meta">
      <div class="project-meta-main">
        <p class="eyebrow">{categoryLabel} · {data.year}</p>
        <h1 class="project-title">{data.title}</h1>
        {subject && <p class="project-subject">{subject}</p>}
      </div>

      {data.credits && data.credits.length > 0 && (
        <dl class="project-credits mono">
          {data.credits.map((c) => (
            <div class="project-credit-row">
              <dt>{c.role}</dt>
              <dd>{c.name}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>

    {data.stills && data.stills.length > 0 && (
      <div class="project-stills">
        {data.stills.map((s) => <img src={s} alt={`${data.title} still`} loading="lazy" />)}
      </div>
    )}

    <div class="project-next">
      <a href={`/work/${next.slug}`} class="mono">Next project — {next.title} →</a>
    </div>
  </article>
</Base>

<style>
  .project { padding-top: var(--gap-md); }
  .project-video {
    aspect-ratio: 16 / 9;
    background: #000;
  }
  .project-video iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .project-meta {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--gap-xl);
    padding: var(--gap-xl) var(--gutter);
  }
  @media (max-width: 768px) {
    .project-meta { grid-template-columns: 1fr; gap: var(--gap-lg); }
  }

  .project-title {
    font-size: var(--type-display);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: var(--gap-sm) 0 0;
  }
  .project-subject { color: var(--ink-muted); margin: 6px 0 0; }

  .project-credits { font-size: 11px; line-height: 1.9; }
  .project-credit-row {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--rule);
    padding: 6px 0;
  }
  .project-credit-row dt {
    color: var(--ink-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .project-credit-row dd { margin: 0; }

  .project-stills {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-sm);
    padding: 0 var(--gutter) var(--gap-xl);
  }
  @media (max-width: 768px) {
    .project-stills { grid-template-columns: 1fr; }
  }

  .project-next {
    border-top: 1px solid var(--rule);
    padding: var(--gap-lg) var(--gutter);
    text-align: right;
    font-size: var(--type-eyebrow);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
</style>
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`
Expected:
- http://localhost:4321/work/sample-spot loads
- Shows YouTube embed (Rick-roll for the placeholder ID — that's fine, just verifying the embed wires up)
- Title block, credits on the right, stills if present
- "Next project — Sample Music Video →" at the bottom

Stop server.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add /work/[slug] project page"
```

---

## Task 9: Roster index + DirectorList + Director page

**Files:**
- Create: `src/components/DirectorList.astro`, `src/pages/roster/index.astro`, `src/pages/roster/[slug].astro`

- [ ] **Step 1: Write `src/components/DirectorList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  directors: CollectionEntry<'directors'>[];
}
const { directors } = Astro.props;
---
<ul class="director-list">
  {directors.map((d) => (
    <li><a href={`/roster/${d.data.slug}`}>{d.data.name}</a></li>
  ))}
</ul>

<style>
  .director-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .director-list li {
    font-size: var(--type-display-large);
    line-height: 1.4;
    font-weight: 400;
  }
  .director-list a { display: block; transition: opacity var(--duration-fast) var(--ease); }
  .director-list:hover a { opacity: 0.5; }
  .director-list:hover a:hover { opacity: 1; }
  @media (max-width: 600px) {
    .director-list li { font-size: var(--type-display); }
  }
</style>
```

- [ ] **Step 2: Write `src/pages/roster/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import DirectorList from '../../components/DirectorList.astro';
import { byOrder } from '../../lib/sort';

const directors = (await getCollection('directors')).toSorted(byOrder);
---
<Base title="Roster · Sympatica">
  <section class="roster">
    <p class="eyebrow">Directors</p>
    <DirectorList directors={directors} />
  </section>
</Base>

<style>
  .roster {
    padding: var(--gap-2xl) var(--gutter) var(--gap-2xl);
  }
  .roster .eyebrow { margin: 0 0 var(--gap-lg); }
</style>
```

- [ ] **Step 3: Write `src/pages/roster/[slug].astro`**

```astro
---
import { getCollection, render, type CollectionEntry } from 'astro:content';
import Base from '../../layouts/Base.astro';
import WorkGrid from '../../components/WorkGrid.astro';
import { byOrderThenYear } from '../../lib/sort';

export async function getStaticPaths() {
  const directors = await getCollection('directors');
  const projects = await getCollection('projects');
  return directors.map((director) => ({
    params: { slug: director.data.slug },
    props: {
      director,
      projects: projects
        .filter((p) => p.data.director === director.data.slug)
        .toSorted(byOrderThenYear),
    },
  }));
}

interface Props {
  director: CollectionEntry<'directors'>;
  projects: CollectionEntry<'projects'>[];
}

const { director, projects } = Astro.props;
const { Content } = await render(director);
---
<Base title={`${director.data.name} · Sympatica`}>
  <article class="director">
    <div class="director-grid">
      <div class="director-main">
        <p class="eyebrow">Director</p>
        <h1 class="director-name">{director.data.name}</h1>
        <WorkGrid projects={projects} columns={2} />
      </div>
      <aside class="director-bio">
        <p class="eyebrow">Bio</p>
        <div class="director-bio-body">
          <Content />
        </div>
      </aside>
    </div>
  </article>
</Base>

<style>
  .director-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--gap-xl);
    padding: var(--gap-xl) var(--gutter);
  }
  @media (max-width: 900px) {
    .director-grid { grid-template-columns: 1fr; }
  }
  .director-name {
    font-size: var(--type-display);
    font-weight: 500;
    margin: var(--gap-xs) 0 var(--gap-lg);
    letter-spacing: -0.02em;
  }
  .director-bio { padding-top: 32px; }
  .director-bio-body {
    font-size: 13px;
    line-height: 1.7;
    color: var(--ink);
    max-width: 360px;
  }
  .director-bio-body p { margin: 0 0 var(--gap-md); }
</style>
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`
Expected:
- http://localhost:4321/roster shows "DIRECTORS" eyebrow + a single large name "Sample Director"
- Click name → http://localhost:4321/roster/sample-director
- Director page shows name on left + 2-up grid of their projects + bio on right
- Bio content matches the `.mdx` body

Stop server.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add /roster index and /roster/[slug] director page"
```

---

## Task 10: About + Contact pages

**Files:**
- Create: `src/pages/about.astro`, `src/pages/contact.astro`

- [ ] **Step 1: Write `src/pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { Content as AboutContent, frontmatter as aboutFrontmatter } from '../../content/site/about.mdx';
---
<Base title="About · Sympatica">
  <article class="about">
    <section class="about-manifesto">
      <p class="eyebrow">About</p>
      <div class="about-manifesto-body">
        <AboutContent />
      </div>
    </section>

    <section class="about-team">
      <p class="eyebrow">Team</p>
      <div class="about-team-grid">
        {aboutFrontmatter.team.map((member: { name: string; role: string }) => (
          <div class="about-team-member">
            <div class="about-team-name">{member.name}</div>
            <div class="about-team-role mono">{member.role}</div>
          </div>
        ))}
      </div>
    </section>
  </article>
</Base>

<style>
  .about-manifesto {
    padding: var(--gap-2xl) var(--gutter) var(--gap-xl);
    max-width: 780px;
  }
  .about-manifesto .eyebrow { margin: 0 0 var(--gap-md); }
  .about-manifesto-body p:first-child {
    font-size: var(--type-lede);
    line-height: 1.45;
    margin: 0 0 var(--gap-md);
  }
  .about-manifesto-body p {
    font-size: var(--type-body);
    line-height: 1.7;
    color: var(--ink);
    margin: 0 0 var(--gap-md);
  }

  .about-team {
    border-top: 1px solid var(--rule);
    padding: var(--gap-xl) var(--gutter) var(--gap-2xl);
  }
  .about-team .eyebrow { margin: 0 0 var(--gap-md); }
  .about-team-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-lg);
  }
  @media (max-width: 768px) { .about-team-grid { grid-template-columns: 1fr; } }
  .about-team-name { font-weight: 500; }
  .about-team-role {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
</style>
```

- [ ] **Step 2: Write `src/pages/contact.astro`**

```astro
---
import { getEntry } from 'astro:content';
import Base from '../layouts/Base.astro';

const contact = await getEntry('contact', 'default');
const typeformId = contact?.data.typeform_id;
---
<Base title="Contact · Sympatica">
  <section class="contact">
    <div class="contact-info">
      <p class="eyebrow">Contact</p>
      <a href={`mailto:${contact?.data.email}`} class="contact-email">{contact?.data.email}</a>
      <p class="contact-city mono">{contact?.data.city.toUpperCase()}</p>
    </div>
    <div class="contact-form" data-tf-live={typeformId}></div>
  </section>
  <script src="//embed.typeform.com/next/embed.js" async></script>
</Base>

<style>
  .contact {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--gap-xl);
    padding: var(--gap-2xl) var(--gutter);
  }
  @media (max-width: 768px) { .contact { grid-template-columns: 1fr; } }

  .contact-info .eyebrow { margin: 0 0 var(--gap-md); }
  .contact-email {
    display: block;
    font-size: var(--type-lede);
    margin-bottom: var(--gap-sm);
  }
  .contact-city {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin: 0;
  }

  .contact-form {
    min-height: 480px;
    background: var(--rule);
  }
</style>
```

(The Typeform embed uses their `data-tf-live` attribute. Replace `PLACEHOLDER_TYPEFORM_ID` in `content/site/contact.json` with the real ID from a Typeform you create.)

- [ ] **Step 3: Manual verification**

Run: `npm run dev`
Expected:
- http://localhost:4321/about shows "ABOUT" eyebrow, lede paragraph, supporting paragraph, team grid below
- http://localhost:4321/contact shows email + city on left, Typeform placeholder area on right (embed will show Typeform's "form not found" until real ID is set — that's expected)

Stop server.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add /about and /contact pages"
```

---

## Task 11: HeroCycler (Preact island, TDD) + homepage

**Files:**
- Create: `src/components/HeroCycler.tsx`, `src/components/HeroCycler.test.tsx`, `src/components/HeroCycler.css`
- Replace: `src/pages/index.astro`

- [ ] **Step 1: Write failing test for HeroCycler**

`src/components/HeroCycler.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/preact';
import { HeroCycler } from './HeroCycler';

const items = [
  { slug: 'a', title: 'A', director: 'Dir A', subject: 'Client A', preview_clip: '/a.mp4' },
  { slug: 'b', title: 'B', director: 'Dir B', subject: 'Client B', preview_clip: '/b.mp4' },
  { slug: 'c', title: 'C', director: 'Dir C', subject: 'Client C', preview_clip: '/c.mp4' },
];

describe('HeroCycler', () => {
  it('renders the first item by default', () => {
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText(/01 \/ 03/)).toBeInTheDocument();
  });

  it('advances to next item on timer', async () => {
    vi.useFakeTimers();
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    expect(getByText('A')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1001); });
    expect(getByText('B')).toBeInTheDocument();
    expect(getByText(/02 \/ 03/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('wraps from last to first', async () => {
    vi.useFakeTimers();
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    await act(async () => { vi.advanceTimersByTime(3003); });
    expect(getByText('A')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('jumps to clicked tickbar segment', () => {
    const { getAllByRole, getByText } = render(<HeroCycler items={items} interval={9999} />);
    const segments = getAllByRole('button');
    fireEvent.click(segments[2]);
    expect(getByText('C')).toBeInTheDocument();
  });

  it('stops auto-advance after user interacts', async () => {
    vi.useFakeTimers();
    const { getByText, getAllByRole } = render(<HeroCycler items={items} interval={1000} />);
    fireEvent.click(getAllByRole('button')[1]);
    await act(async () => { vi.advanceTimersByTime(2002); });
    expect(getByText('B')).toBeInTheDocument(); // still B, no advance
    vi.useRealTimers();
  });

  it('honors prefers-reduced-motion: no auto-advance', async () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true, media: '', onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    } as MediaQueryList);
    vi.useFakeTimers();
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    await act(async () => { vi.advanceTimersByTime(2002); });
    expect(getByText('A')).toBeInTheDocument(); // never advanced
    matchSpy.mockRestore();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- HeroCycler`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/HeroCycler.tsx`**

```tsx
import { useEffect, useState } from 'preact/hooks';
import './HeroCycler.css';

export interface HeroItem {
  slug: string;
  title: string;
  director: string;
  subject?: string;
  preview_clip: string;
}

interface Props {
  items: HeroItem[];
  interval?: number;
}

export function HeroCycler({ items, interval = 9000 }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % items.length), interval);
    return () => clearTimeout(id);
  }, [active, paused, items.length, interval]);

  const jump = (i: number) => {
    setPaused(true);
    setActive(i);
  };

  const item = items[active];
  const counter = `${String(active + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;

  return (
    <section class="hero-cycler">
      <a href={`/work/${item.slug}`} class="hero-cycler-stage">
        {items.map((it, i) => (
          <video
            key={it.slug + i}
            src={it.preview_clip}
            class={`hero-cycler-video ${i === active ? 'is-active' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ))}
      </a>

      <div class="hero-cycler-overlay mono">
        <div class="hero-cycler-counter">{counter}</div>
        <div class="hero-cycler-title">{item.title}</div>
        <div class="hero-cycler-meta">
          {item.director}{item.subject ? ` · ${item.subject}` : ''}
        </div>
      </div>

      <div class="hero-cycler-tickbar" role="tablist">
        {items.map((_, i) => (
          <button
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show item ${i + 1}`}
            class={`hero-cycler-tick ${i === active ? 'is-active' : ''}`}
            onClick={() => jump(i)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `src/components/HeroCycler.css`**

```css
.hero-cycler {
  position: relative;
  width: 100%;
  height: calc(100vh - 56px); /* viewport minus sticky header */
  background: #000;
  overflow: hidden;
}

.hero-cycler-stage {
  position: absolute;
  inset: 0;
  display: block;
}

.hero-cycler-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease);
}
.hero-cycler-video.is-active { opacity: 1; }

.hero-cycler-overlay {
  position: absolute;
  bottom: var(--gap-lg);
  left: var(--gutter);
  color: #fff;
  pointer-events: none;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.hero-cycler-counter {
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-bottom: var(--gap-sm);
}
.hero-cycler-title {
  font-family: var(--font-sans);
  font-size: var(--type-display);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.05;
}
.hero-cycler-meta {
  font-size: 11px;
  letter-spacing: 0.04em;
  opacity: 0.75;
  margin-top: 4px;
}

.hero-cycler-tickbar {
  position: absolute;
  bottom: var(--gap-lg);
  right: var(--gutter);
  display: flex;
  gap: 6px;
}
.hero-cycler-tick {
  width: 28px;
  height: 2px;
  background: rgba(255,255,255,0.25);
  transition: background-color var(--duration-fast) var(--ease);
}
.hero-cycler-tick.is-active { background: #fff; }
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test`
Expected: All tests pass (sort, ThemeToggle, WorkTile, WorkFilter, HeroCycler).

- [ ] **Step 6: Replace `src/pages/index.astro` with the homepage**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import Base from '../layouts/Base.astro';
import { HeroCycler } from '../components/HeroCycler';
import type { HeroItem } from '../components/HeroCycler';

const featured = await getEntry('featured', 'default');
const projects = await getCollection('projects');
const projectsBySlug = new Map(projects.map((p) => [p.id, p]));

const items: HeroItem[] = (featured?.data.slugs ?? [])
  .map((slug: string) => projectsBySlug.get(slug))
  .filter((p): p is NonNullable<typeof p> => Boolean(p))
  .map((p) => ({
    slug: p.id,
    title: p.data.title,
    director: p.data.director,
    subject: p.data.category === 'commercial' ? p.data.client : p.data.artist,
    preview_clip: p.data.preview_clip,
  }));
---
<Base title="Sympatica">
  <HeroCycler client:load items={items} interval={9000} />
</Base>

<style>
  /* Homepage: tighten body up so hero fills the viewport */
  main { padding: 0; }
</style>
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`
Expected:
- http://localhost:4321/ shows the cycler at near-viewport height
- Counter, title, meta in bottom-left; ticks in bottom-right
- After ~9s, advances to next slug; counter increments
- Click a tick → jumps to that item, auto-advance stops
- Click the video itself → navigates to the project page

Note: with placeholder MP4s being empty files, you'll see a black box. Replace with real preview clips before launch.

Stop server.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add HeroCycler and homepage"
```

---

## Task 12: Accessibility, link checking, build verification

**Files:**
- Modify: `package.json` (already has the scripts; this task wires them into a check pass)

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Clean build with no errors. Output in `dist/`.

- [ ] **Step 2: Install lychee link checker (Rust binary, not on npm)**

```bash
# Mac:
brew install lychee
# Other systems: cargo install lychee, or download from GitHub releases
```

Run: `npm run lint:links` (the npm script just shells out to whichever `lychee` is on PATH)
Expected: All internal links resolve. External links (YouTube, Typeform) may warn — that's OK. Fix any internal 404s.

- [ ] **Step 3: Run accessibility check**

Run: `npm run lint:a11y`
Expected: zero violations on `dist/**/*.html`. Common things to fix if flagged:
- Missing `alt` text → add `alt={...}` to `<img>` and `<iframe>`
- Insufficient contrast → check the dark palette pair against WCAG AA (4.5:1 for body, 3:1 for large text). Our `#ededed` on `#0a0a0a` is well over 4.5:1.
- Missing `<main>` landmark → already present in `Base.astro`.

- [ ] **Step 4: Manual reduced-motion check**

In Chrome DevTools, open the rendering tab → "Emulate CSS media feature prefers-reduced-motion" → "reduce".

Verify on http://localhost:4321:
- Homepage HeroCycler does not auto-advance (verified by waiting >9s)
- Theme toggle still works but transitions are instant (per the global `transition-duration: 0.01ms` rule in `global.css`)
- Hover preview clips still play on hover (these are explicit user interaction, not auto-motion — acceptable per WCAG)

- [ ] **Step 5: Manual keyboard navigation check**

Tab through:
- Header: wordmark → Work → Roster → About → Contact → ThemeToggle. Visible focus ring on each.
- HeroCycler tickbar: Tab into ticks; Enter activates them.
- Work grid: Tab through tiles; Enter navigates.
- Filter pills: Tab through; Enter activates.
- All pages have focus rings; no keyboard traps.

If focus rings are missing, add to `src/styles/global.css`:

```css
:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
```

- [ ] **Step 6: Run all tests one more time**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: a11y, link, and reduced-motion verification pass"
```

---

## Task 13: Cloudflare Pages deployment + DNS

**This task is mostly user actions** — Claude can prepare config but cannot create a Cloudflare account, GitHub repo, or DNS records on the user's behalf.

- [ ] **Step 1: Create GitHub repo**

User action:
1. Go to github.com/new
2. Repo name: `sympatica-website`
3. Private
4. Do not initialize with anything (we already have a local repo)

Then locally:

```bash
git remote add origin git@github.com:<your-username>/sympatica-website.git
git push -u origin main
```

- [ ] **Step 2: Connect Cloudflare Pages to GitHub**

User action:
1. Go to dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Select the `sympatica-website` repo
3. Build configuration:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: set env var `NODE_VERSION` to `20`
4. Save and deploy. First build runs automatically.

- [ ] **Step 3: Add custom domain**

User action:
1. In the Pages project → Custom domains → Set up a custom domain → enter `sympatica.studio`
2. If the domain is already on Cloudflare DNS, Cloudflare auto-creates the CNAME. If not, follow their CNAME instructions.
3. Add `www.sympatica.studio` as a second custom domain that 301-redirects to the apex (Cloudflare Page Rules → Forwarding URL).

- [ ] **Step 4: Enable Cloudflare Web Analytics**

User action:
1. dash.cloudflare.com → Analytics & Logs → Web Analytics
2. Add site: `sympatica.studio`
3. Choose "Add Cloudflare's JS snippet"
4. Cloudflare provides a snippet — copy the `data-cf-beacon` token

- [ ] **Step 5: Add the analytics snippet to the site**

Edit `src/layouts/Base.astro`. Inside `<head>`, before `</head>`:

```astro
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
```

Replace `YOUR_TOKEN_HERE` with the token from Step 4.

- [ ] **Step 6: Commit and push**

```bash
git add src/layouts/Base.astro
git commit -m "chore: enable Cloudflare Web Analytics"
git push
```

Cloudflare Pages will auto-deploy on push. Wait ~60s for the build. Verify at https://sympatica.studio.

- [ ] **Step 7: Final smoke test on production**

Visit https://sympatica.studio and verify:
- Homepage loads, hero cycler animates
- /work loads with filter pills
- /work/sample-spot loads with YouTube embed
- /roster loads, click director → page loads with bio
- /about loads with manifesto + team
- /contact loads with email + Typeform area
- Theme toggle works
- Mobile view (DevTools responsive mode) collapses correctly

- [ ] **Step 8: Tag the launch**

```bash
git tag -a v1.0.0 -m "v1.0.0 — initial launch"
git push --tags
```

---

## Self-Review Notes

Reviewed against spec sections:

- §4 Sitemap → Tasks 7, 8, 9, 10, 11 cover all 7 page types ✓
- §5 Content model → Task 3 schemas + sample content ✓
- §6.1 Homepage HeroCycler → Task 11 ✓
- §6.2 /work + filter → Task 7 ✓
- §6.3 Project page → Task 8 ✓
- §6.4 /roster typographic list → Task 9 ✓
- §6.5 Director page → Task 9 ✓
- §6.6 About → Task 10 ✓
- §6.7 Contact + Typeform → Task 10 ✓
- §7.1 Sans + mono type → Task 2 (`@fontsource` imports in `global.css`) ✓
- §7.2 Palette + light toggle → Task 2 (tokens) + Task 4 (toggle) ✓
- §7.4 Motion philosophy → Task 12 reduced-motion check; `prefers-reduced-motion` block in `global.css` ✓
- §8 Components table → all 8 components in tasks 4-11 ✓
- §9 Stack → Task 1 deps ✓
- §10 Content workflow → documented in README + spec ✓
- §11 Testing → vitest unit tests inline; axe + lychee in Task 12 ✓
- §12 Roadmap v1 → all v1 items covered ✓

**No placeholder issues found** after self-review (all `TBD` / `TODO` / vague-handler patterns scrubbed).

**Type consistency:** `WorkTileProps` matches usage in `WorkGrid.astro`; `HeroItem` matches usage in `index.astro`; `byOrderThenYear` and `byOrder` signatures match every call site.
