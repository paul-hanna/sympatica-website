# Sympatica Website — Design Spec

**Date:** 2026-04-30
**Domain:** sympatica.studio
**Status:** Design approved; ready for implementation planning.

## 1. Overview

A pre-launch marketing site for Sympatica, a New York commercial production company / agency representing director talent across commercials and music videos. The site is reel-forward, optimized for brand creatives and agency producers vetting Sympatica for jobs, with the underlying structure to scale gracefully as the roster and selected works grow.

Visual reference territory: **Object & Animal / Pulse** for cinematic mood (dark, restrained, "film studio" feel); **Iconoclast** for editorial discipline (work-first grid, generous white space, restrained typography). Sympatica's site sits at that intersection — cinematic temperature, editorial bones.

## 2. Goals & non-goals

**Goals (v1):**
- Establish Sympatica's identity at sympatica.studio.
- Showcase a small selected-works set (mix of commercials and music videos) with room to grow.
- Surface the director roster as the site fills out.
- Provide a low-friction inbound channel for new business / talent inquiries.
- Be cheap to run ($0/month for hosting), trivial to update, and fast to launch.

**Non-goals (v1):**
- E-commerce, login, account, or any authenticated flows.
- Self-hosted video infrastructure or custom video player.
- A CMS dashboard. Content lives in the repo as MDX.
- Press / awards / news sections (deferred to v2 or later).
- A master sizzle/company reel video (deferred until reel matures).

## 3. Audience

**Primary:** brand creatives and agency producers vetting Sympatica for projects. They land on the site, want to see the reel and the roster fast, and want to know how to reach the company.

The homepage and /work page are optimized for this audience: minimal chrome, immediate exposure to the work, easy path to /contact.

## 4. Sitemap & URL structure

```
/                       Homepage — full-bleed cycling hero, nothing below
/work                   Single grid; filter [All | Commercials | Music Videos]
/work/[slug]            Project page (video + stills + credits)
/roster                 Typographic list of director names
/roster/[slug]          Director page (work grid + bio sidebar)
/about                  Manifesto + team
/contact                Typeform embed + general email + "New York"
```

Filter state on `/work` is reflected in the URL (`?cat=commercials`) so links are shareable.

## 5. Content model

Content lives in the repo as MDX/JSON files; a content edit is a commit + push.

```
/content
  /projects/{slug}.mdx           # one file per project
  /directors/{slug}.mdx          # one file per director
  /site
    featured.json                # ordered slugs for homepage hero cycle
    about.mdx                    # manifesto + team
    contact.json                 # email, city, Typeform URL
```

### 5.1 Project schema (frontmatter)

```yaml
title: "Spot Title"               # required
client: "Brand Name"              # required for commercials, optional for MVs
artist: "Artist Name"             # required for MVs, omitted for commercials
director: "director-slug"         # required; references a director slug
category: commercial | music-video   # required
year: 2025                        # required
youtube_id: "abcd1234"            # required (full video host)
preview_clip: "/work/{slug}/preview.mp4"   # required (hover loop)
poster: "/work/{slug}/poster.jpg"          # required (static thumbnail)
stills: ["/work/{slug}/01.jpg", ...]       # optional, 0-N
credits:                          # optional block
  - { role: "Director", name: "Jane Doe" }
  - { role: "DP", name: "John Smith" }
  - { role: "Production Co.", name: "Sympatica" }
  - { role: "Agency", name: "..." }
order: 12                         # manual sort weight on /work grid (lower = earlier)
```

### 5.2 Director schema (frontmatter)

```yaml
name: "Jane Doe"                  # required
slug: "jane-doe"                  # required
bio: |                            # required, MDX body
  Multi-paragraph bio...
order: 1                          # ordering on /roster list
```

A director's project list is **derived at build time** from all projects with matching `director: <slug>`. No manual sync.

### 5.3 Site files

- `featured.json` — `{ "slugs": ["spot-title", "music-video-x", ...] }`. Sole source of truth for which projects appear on the homepage cycler and in what order. Length 3-5.
- `about.mdx` — frontmatter with `team: [{ name, role }]`; body is the manifesto.
- `contact.json` — `{ "email": "...", "city": "New York", "typeform_id": "..." }`.

### 5.4 Resilience

Project pages degrade gracefully:
- Missing `stills` → no stills section rendered.
- Missing `credits` → no credits block.
- Missing `client` (MV) or `artist` (commercial) → label omitted, not "—".
- Missing `preview_clip` → hover behavior falls back to the static `poster`.

Schema is enforced via Zod content collections — missing required fields fail the build, not deploy.

## 6. Page-by-page design

### 6.1 Homepage (`/`)

Full-bleed cycling hero. Nothing below the fold. Site nav overlays the top.

- **Hero**: 3-5 featured projects (drawn from `featured.json`), each shown for 8-10 sec as a muted-autoplay clip with cross-fade transitions.
- **Overlay (bottom-left)**: position counter (mono, e.g. `01 / 05`), project title (sans), `director · client/artist` (mono).
- **Tickbar (bottom-right)**: 3-5 thin segments. Active segment is full-opacity; click any segment to jump.
- **Click on the video itself** → navigates to `/work/[slug]` of the active piece.
- **Reduced motion**: when `prefers-reduced-motion: reduce`, no autoplay; first poster shown, manual ←/→ keys to advance.

### 6.2 Work index (`/work`)

Single grid. Filter pills at top swap which projects render.

- **Header**: small "Selected Works" eyebrow, then three filter pills: `All` (default) / `Commercials` / `Music Videos`. Active pill is filled (ink/bg inverted).
- **Grid**: 3-up desktop / 2-up tablet / 1-up mobile, 16:9 tiles, gap ~12px.
- **Tile** (`<WorkTile />`):
  - Default: static `poster` image with a small mono label overlay revealed on hover (`director · client/artist`).
  - Desktop hover: cross-fade to muted `preview_clip` MP4 looping inline. Loop is loaded lazily (only when tile enters viewport).
  - Mobile: no hover state; tap navigates to project page.
- **Filter state**: written to URL as `?cat=commercials` for shareability.
- **Order**: by `order` ascending, then `year` descending.

### 6.3 Project page (`/work/[slug]`)

- **Hero**: YouTube embed (16:9), full-bleed within the content max-width.
- **Title block (left, 2/3 width)**: mono eyebrow `Commercial · 2025`, large project title, client/artist line below.
- **Credits (right, 1/3 width)**: key:value rows separated by hairline rules. Field labels in mono uppercase; names in sans.
- **Stills strip**: 3-up grid of stills below, if present. Otherwise omitted entirely.
- **Footer link**: "Next project →" (linked sequentially by `order`).

### 6.4 Roster (`/roster`)

- Typographic list, no images.
- Names stacked vertically, large display sans, generous line-height (~1.4 of font size at 36-48px).
- On hover: name shifts to full-opacity ink; non-hovered names fade to ~60%.
- Click → `/roster/[slug]`.

### 6.5 Director page (`/roster/[slug]`)

- **Layout**: 2-column desktop. Left (2/3): director name + work grid. Right (1/3): bio.
- **Director name**: large, sans, with a mono eyebrow `Director`.
- **Work grid**: same `<WorkTile />` component as `/work`, filtered to projects where `director: <this-slug>`. 2-up grid (smaller than `/work`'s 3-up) for visual density.
- **Bio**: sans body at ~13px, max-width ~360px.

### 6.6 About (`/about`)

- **Manifesto**: 1-2 short paragraphs at editorial scale (~22px lead, ~14px supporting). Max-width ~780px, left-aligned, generous top padding.
- **Team grid**: below a hairline rule, 3-up grid of `name + role`. No portraits in v1.

### 6.7 Contact (`/contact`)

- **2-column desktop layout.**
- **Left (1/3)**: small "Contact" eyebrow (mono), general email (`hello@sympatica.studio`), city (`NEW YORK` in mono uppercase).
- **Right (2/3)**: embedded Typeform (full-height inline embed, ~480-600px depending on form length). Typeform connects to Airtable via Typeform's native integration — no backend code in this repo.

## 7. Visual design

### 7.1 Typography

- **Sans body** for all readable copy: Inter (or comparable disciplined grotesque). Self-hosted via `@fontsource/inter`.
- **Mono accents** for technical labels — counters (`01 / 05`), credit field labels, category eyebrows, mono microtags (`director.name / client`): JetBrains Mono. Self-hosted via `@fontsource/jetbrains-mono`.
- **No serif** in v1.

### 7.2 Palette

**Default (dark):**
- `--bg`: `#0a0a0a`
- `--ink`: `#ededed`
- `--ink-muted`: `rgba(237,237,237,0.6)`
- `--rule`: `rgba(237,237,237,0.12)`

**Light (toggle-only):**
- `--bg`: `#ffffff`
- `--ink`: `#0a0a0a`
- `--ink-muted`: `rgba(10,10,10,0.6)`
- `--rule`: `rgba(10,10,10,0.12)`

### 7.3 Light-mode toggle

Small mono icon in `<SiteHeader />`. Clicking flips `data-theme="light"` on `<html>`. Session-only — **no persistence**, no `prefers-color-scheme` honoring on first load. The site always loads dark; the toggle is a craft moment, not a settings panel.

Theme transition: ~200ms easing on `background-color` and `color` properties via CSS.

### 7.4 Motion philosophy

Restrained. Cross-fades, slow opacity transitions, gentle cubic-bezier easing. No parallax, no scroll-jacking, no zoom-on-load, no kinetic type. The work moves; the chrome doesn't.

All motion respects `prefers-reduced-motion: reduce` — autoplay disabled, transitions instant.

## 8. Components

| Component | Where | Type |
|---|---|---|
| `<SiteHeader />` | All pages | Static (Astro) — wordmark, nav, ThemeToggle |
| `<HeroCycler />` | `/` only | Interactive island — autoplay video carousel |
| `<WorkGrid />` | `/work`, `/roster/[slug]` | Static (Astro) — wraps `<WorkTile />`s |
| `<WorkTile />` | Inside `<WorkGrid />` | Interactive island — hover-to-preview |
| `<WorkFilter />` | `/work` only | Interactive island — filter pills, URL sync |
| `<DirectorList />` | `/roster` only | Static (Astro) |
| `<ThemeToggle />` | Inside `<SiteHeader />` | Interactive island — flips `data-theme` |
| `<Footer />` | All pages | Static (Astro) |

Interactive islands use Preact (smaller bundle than React) via `@astrojs/preact`.

## 9. Stack & infrastructure

- **Framework**: Astro (latest stable), MDX content collections, Preact for islands.
- **Styling**: vanilla CSS with custom properties. One `theme.css` owns palette tokens; per-component CSS modules for layout. No CSS framework in v1.
- **Type**: `@fontsource/inter`, `@fontsource/jetbrains-mono` (self-hosted, no Google Fonts request).
- **Video**: YouTube embeds for full plays. Per-project preview MP4 (5-10s, h.264, ≤500KB) committed to repo at `/public/work/[slug]/preview.mp4`. Workflow note: each project requires both a YouTube link and a short preview clip.
- **Forms**: Typeform (free tier, embed mode) → Airtable via Typeform's native Airtable integration.
- **Repo**: GitHub, private.
- **Hosting**: Cloudflare Pages, free tier. Auto-deploy on push to `main`.
- **Domain**: sympatica.studio, DNS managed at Cloudflare.
- **Analytics**: Cloudflare Web Analytics (free, privacy-friendly, no cookie banner required).
- **Cost**: $0/month operating cost (excluding domain registration).

## 10. Content workflow

Adding a project:
1. Drop `preview.mp4`, `poster.jpg`, and any `stills/*.jpg` into `/public/work/[slug]/`.
2. Create `/content/projects/[slug].mdx` with frontmatter per §5.1.
3. Commit + push to `main`. Cloudflare Pages rebuilds and deploys (~1 min).

Adding a director:
1. Create `/content/directors/[slug].mdx` with frontmatter per §5.2.
2. Commit + push.

Updating featured projects on the homepage: edit `/content/site/featured.json`.

## 11. Testing

- **Build smoke**: `astro build` succeeds with no errors. Add a link-check pass on the built output (specific tool selected during planning — likely `lychee` or `linkinator`).
- **Schema**: Zod validation on content collection frontmatter — typos in `category`, missing required fields fail the build before deploy.
- **Accessibility**: `@axe-core/cli` in CI on the built output. Manual keyboard-nav check on every page type before launch.
- **Visual regression** *(deferred)*: Playwright screenshot diff for `/`, `/work`, a sample `/work/[slug]`. Add when the site has stabilized.
- **Reduced-motion check**: manually verify all interactive components honor `prefers-reduced-motion: reduce` on every release.

## 12. Roadmap

**v1 — launch:**
- All 7 page types
- HeroCycler, WorkGrid + filter, hover preview clips, theme toggle
- Typeform contact
- 3-5 featured projects, 6-9 total in `/work`, 1-3 directors

**v1.1 — first month after launch:**
- Cloudflare Web Analytics dashboard wired up
- OG images per project (auto-generated at build from `poster` + title)
- RSS feed at `/rss.xml`

**v2 — when reel matures:**
- Optional: collapse homepage to "single hero, no cycler" if a master sizzle becomes the calling card
- Optional: swap YouTube → Vimeo Pro per project (schema already supports per-project host)
- Press / awards section on `/about` if it becomes a story worth telling
- Director portraits on `/roster` if the roster grows to a point where typographic-only feels thin

## 13. Resolved details

- Light-palette background is `#ffffff`.
- Mobile work-tile behavior: tap navigates to the project page; no inline play.
- Footer carries wordmark, general email, city, and ©. No social links in v1.
- A "Next project →" link appears at the bottom of `/work/[slug]`, sequenced by `order`.
