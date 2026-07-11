# Ahmed Fouad — Infrastructure BIM Engineer Portfolio

A modern rebuild of Ahmed Osman Fouad's personal portfolio: same content and brand
identity, re-engineered on **Astro + TypeScript + Tailwind CSS v4** with a premium
**neumorphic / soft-UI** design, a dark/light theme, and GSAP + Lenis animation.

---

## Tech stack & why

| Technology | Why it was chosen |
| --- | --- |
| **Astro 5** | The site is 100% static content — Astro ships **zero JS by default**, renders to static HTML, and gives the best Lighthouse scores + SEO for this kind of site. Its component model removed the 2,100-line single-file duplication. |
| **TypeScript** | All section content lives in typed data modules (`src/data`) — one source of truth, no copy-paste drift. |
| **Tailwind CSS v4** | Kept from the original stack. Brand palette is defined as `@theme` design tokens so the identity is preserved exactly and utilities stay theme-aware. |
| **`astro:assets` (Sharp)** | Automatic AVIF/WebP conversion, responsive `srcset`, lazy-loading. The 7.3 MB montage image now ships as ~24–200 KB WebP variants. |
| **astro-icon** | Inlines only the ~25 icons actually used (Font Awesome 6 sets), removing the render-blocking Font Awesome CDN. |
| **GSAP + ScrollTrigger** | Hero entrance timeline, staggered scroll-reveals, and skill-bar fills. |
| **Lenis** | Smooth scrolling, synced with the GSAP ticker. Disabled automatically under `prefers-reduced-motion`. |
| **@astrojs/sitemap** | Generates `sitemap-index.xml` at build. |

Deliberately **not** used: React/Vue/Svelte (no app state to justify hydration), Next.js
(no SSR/API/routing need), Flowbite (replaced by a ~0-dependency scroll-snap slider).

---

## Brand palette (preserved from the original)

| Token | Hex | Role |
| --- | --- | --- |
| `--brand-ink` | `#0a0908` | Base background (dark) |
| `--brand-primary` | `#c6ac8f` | Tan / gold accent |
| `--brand-secondary` | `#5e503f` | Brown (borders, gradients) |
| `--brand-cream` | `#eae0d5` | Cream body text |
| `--brand-slate` | `#22333b` | Slate section tint |

The **light theme** derives an accessible variant of the same palette (cream surfaces,
darker brown accent `#6f5636` for AA text contrast). Theme tokens live in
[`src/styles/global.css`](src/styles/global.css).

---

## Project structure

```
claude/
├─ public/              # favicon, cv.pdf, og-image.jpg, robots.txt, google verification
├─ src/
│  ├─ assets/           # source images (optimized at build)
│  ├─ data/             # typed content: site, experience, skills, projects, portfolio, education
│  ├─ components/
│  │  ├─ ui/            # SectionHeading, ThemeToggle
│  │  ├─ sections/      # Hero, About, Experience, Skills, Process, Projects, Portfolio,
│  │  │                 #   VideoShowreel, Education, Contact
│  │  ├─ Navbar.astro
│  │  └─ Footer.astro
│  ├─ layouts/Layout.astro   # <head>, SEO/OG/JSON-LD, fonts, theme init
│  ├─ scripts/          # main.ts (entry), ui.ts (interactions), animations.ts (GSAP/Lenis)
│  ├─ styles/global.css # design tokens + neumorphic component layer
│  └─ pages/index.astro
├─ astro.config.mjs · tailwind (via @tailwindcss/vite) · tsconfig.json · netlify.toml
└─ _original/           # the previous site, archived for reference (git-ignored)
```

---

## Running locally

> This machine has no global Node on PATH. A working Node 24 lives in the Codex runtime;
> prepend it to PATH for the session (or install Node 20+ globally):
>
> ```powershell
> $env:Path = "C:\Users\ahmed.osman\AppData\Local\OpenAI\Codex\runtimes\cua_node\1b23c930bdf84ed6\bin;$env:Path"
> ```

```bash
pnpm install     # first time only (sharp/esbuild builds are pre-approved in pnpm-workspace.yaml)
pnpm dev         # start dev server → http://localhost:4321
pnpm check       # TypeScript / Astro diagnostics
pnpm build       # production build → dist/
pnpm preview     # preview the production build locally
```

`npm` works too if you prefer it over `pnpm`.

---

## Deploying

Recommended: **Netlify** (keeps the existing Netlify contact form working with no code
changes). [`netlify.toml`](netlify.toml) is included:

- Build command: `npm run build`
- Publish directory: `dist`
- `_astro/*` assets are served with a 1-year immutable cache header.

Before going live, set the real domain in [`astro.config.mjs`](astro.config.mjs) (`SITE`)
so canonical URLs, Open Graph, and the sitemap point at the right host.

Vercel or Cloudflare Pages also work for the static output, but the Netlify Forms
submission would need to be swapped for their equivalent (e.g. Formspree or a function).

---

## Performance & accessibility notes

- Images: AVIF/WebP, responsive `srcset`, below-fold images lazy-loaded; hero is
  `fetchpriority="high"`. Montage went from 7.3 MB → ~24–200 KB.
- One CSS file, one ~52 KB-gzipped JS bundle (GSAP + Lenis + app).
- `prefers-reduced-motion` fully respected — Lenis and all reveals are disabled and
  content shows immediately.
- Semantic landmarks (`nav`, `main`, `footer`), skip-to-content link, visible focus
  rings, labelled form fields, ARIA on the mobile menu, dialogs with focus trap + ESC.
- Light/dark theme with an accessible (AA) contrast variant of the brand palette.
- SEO: preserved title/description/keywords + added canonical, Open Graph, Twitter
  cards, Person JSON-LD, sitemap, and robots.txt.

---

## Remaining improvements (optional, for later)

1. Self-host fonts (via `@fontsource`) to drop the Google Fonts request entirely.
2. Add a real designed `og-image.jpg` (currently derived from the montage render).
3. Consider hosting the showreel videos on a CDN with poster images for faster first paint.

(Content typos from the original site — "Consltant", "claster", "deciplines",
"Vedios", "naviswork", "utitlities" — have been corrected in `src/data`.)
