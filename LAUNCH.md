# Launch Checklist — sympatica.studio

Step-by-step from "site builds locally" to "site is live at sympatica.studio."

---

## 0. Local sanity check

```bash
cd "/Users/paulh/Local Documents/sympatica/website"
npm install            # if you haven't already
npm test               # all 24 should pass
npm run build          # 8 pages should build clean
npm run dev            # open http://localhost:4321
```

Click around all pages. If anything looks broken, fix it before deploying.

---

## 1. Replace placeholder content with real content

The site is structurally complete but seeded with sample data. Before launch, swap in real content.

### Real projects (`/content/projects/`)

For each piece of work:
- **Frontmatter** (one `.mdx` file per project):
  ```yaml
  title: "Real Spot Title"
  client: "Real Brand"            # OR `artist:` if music video
  director: "real-director-slug"
  category: commercial             # or music-video
  year: 2026
  youtube_id: "abcd1234XYZ"        # 11-char YouTube ID, NOT a URL
  preview_clip: "/work/real-spot/preview.mp4"
  poster: "/work/real-spot/poster.jpg"
  stills:                          # optional
    - "/work/real-spot/stills/01.jpg"
  credits:                         # optional
    - { role: "Director", name: "..." }
    - { role: "DP", name: "..." }
    - { role: "Production Co.", name: "Sympatica" }
  order: 1                         # lower = earlier in /work grid
  ```
- **Assets** at `/public/work/{slug}/`:
  - `poster.jpg` — 1280×720 (16:9), JPG, ≤200KB
  - `preview.mp4` — 5-10 sec muted loop, h.264, ≤500KB
  - `stills/01.jpg`, `stills/02.jpg`, … — optional, 1280×853 ish
- Delete the two `sample-*.mdx` projects and their placeholder media when you have real ones.

### Real directors (`/content/directors/`)

For each director:
- One `.mdx` file with frontmatter:
  ```yaml
  name: "Director Real Name"
  slug: "director-real-name"
  order: 1
  ```
- Body is the bio (markdown — paragraphs, etc.).
- Project entries reference this director by their `slug` field (in their frontmatter `director:`).
- Delete `sample-director.mdx` once a real director has a project assigned.

### Featured (`/content/site/featured.json`)

Update `slugs` to the 3-5 project slugs you want cycling on the homepage:
```json
[{ "id": "default", "slugs": ["spot-a", "mv-b", "spot-c"] }]
```
Schema requires 1-5 entries.

### About (`/content/site/about.mdx`)

- Replace placeholder team names + roles in frontmatter `team:`.
- Rewrite the body with the real manifesto (1-2 paragraphs).

### Contact (`/content/site/contact.json`)

```json
[{
  "id": "default",
  "email": "hello@sympatica.studio",
  "city": "New York",
  "typeform_id": "REAL_TYPEFORM_ID_HERE"
}]
```
Get the Typeform ID from your Typeform's share URL (it's the last path segment, e.g. `https://sympatica.typeform.com/to/XXXXXXXX` → `typeform_id: "XXXXXXXX"`). Then in Typeform's connect tab, wire it to your Airtable base.

---

## 2. Build verification (with real content)

```bash
npm run build
```

The Zod content schemas will reject typos:
- `youtube_id` must be exactly 11 chars, no URLs
- All paths (`poster`, `preview_clip`, `stills`) must start with `/`
- `category` must be exactly `commercial` or `music-video`
- Commercials require `client`; music videos require `artist`

If the build complains, the error message names the project and field.

Optional but recommended: install `lychee` and run the link checker:

```bash
brew install lychee
npm run lint:links
```

---

## 3. GitHub repo

1. Go to https://github.com/new
2. Name: `sympatica-website`
3. Visibility: **Private**
4. Do NOT initialize with README/license/gitignore (we already have them)
5. Create repo

Then locally:

```bash
cd "/Users/paulh/Local Documents/sympatica/website"
git remote add origin git@github.com:<your-username>/sympatica-website.git
git push -u origin main
```

---

## 4. Cloudflare Pages

1. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Authorize Cloudflare to access your GitHub
3. Select the `sympatica-website` repo
4. **Build configuration:**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Environment variables:**
   - `NODE_VERSION` = `20`
6. Save and Deploy. First build runs automatically (~1-2 min).

Cloudflare gives you a `*.pages.dev` URL immediately. Verify the site loads there before adding the custom domain.

---

## 5. Custom domain

You'll need to own `sympatica.studio` (register at any registrar, then transfer DNS to Cloudflare).

1. In the Pages project → **Custom domains** → **Set up a custom domain** → enter `sympatica.studio`
2. If the domain's DNS is on Cloudflare, the CNAME is auto-created. If not, follow the CNAME instructions.
3. Add a second custom domain `www.sympatica.studio` and configure a Page Rule under Cloudflare Rules → Forwarding URL → 301 redirect `www.sympatica.studio/*` → `https://sympatica.studio/$1`

Wait for SSL provisioning (a few minutes). Verify https://sympatica.studio loads.

---

## 6. Cloudflare Web Analytics

1. dash.cloudflare.com → **Analytics & Logs → Web Analytics**
2. **Add site** → enter `sympatica.studio`
3. Choose "Add Cloudflare's JS snippet"
4. Copy the snippet — you only need the `data-cf-beacon` token value
5. Open `src/layouts/Base.astro`. Inside the `<head>`, before `</head>`, add:
   ```astro
   <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
   ```
6. Commit and push:
   ```bash
   git add src/layouts/Base.astro
   git commit -m "chore: enable Cloudflare Web Analytics"
   git push
   ```
   Cloudflare auto-deploys on push.

---

## 7. Final smoke test on production

Visit https://sympatica.studio and verify:

- [ ] Homepage loads, hero cycles between featured projects
- [ ] Theme toggle (mono icon top right) flips dark ↔ light
- [ ] `/work` shows all projects; filter pills (All / Commercials / Music Videos) work; URL updates
- [ ] Hover a tile on desktop — preview video plays
- [ ] `/work/[slug]` plays the YouTube embed; credits and stills render
- [ ] "Next project →" wraps after the last project
- [ ] `/roster` shows director names; click a name → individual director page
- [ ] Director page shows their work + bio
- [ ] `/about` shows manifesto + team
- [ ] `/contact` shows email + NEW YORK + working Typeform embed
- [ ] Mobile (DevTools responsive mode at 375px wide): nav/hero/work grid all collapse correctly
- [ ] Cloudflare Web Analytics dashboard receives traffic

---

## 8. Tag the launch

```bash
git tag -a v1.0.0 -m "v1.0.0 — initial launch"
git push --tags
```

---

## Adding work after launch (for future reference)

1. Drop assets in `/public/work/{slug}/`: `poster.jpg`, `preview.mp4`, optional `stills/`
2. Create `/content/projects/{slug}.mdx` with frontmatter
3. Optionally update `/content/site/featured.json` if it should appear in the homepage hero
4. Commit + push to `main`. Cloudflare Pages rebuilds and deploys in ~1 min.

---

## Things that are *not* in v1 but could come later

- **Vimeo Pro** instead of YouTube (cleaner embed, branded player, password-protect for unreleased work)
- **OG images per project** (auto-generated at build from poster + title)
- **RSS feed** at `/rss.xml`
- **Press / awards section** on `/about`
- **Director portraits** on `/roster` (currently typographic-only)
- **Real preview MP4s served from Cloudflare R2** if file count grows past what's comfortable in the repo

These all have notes in the design spec § 12 Roadmap.
