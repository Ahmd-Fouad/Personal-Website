# Ahmed Fouad — Infrastructure BIM Engineer Portfolio

Static portfolio for Ahmed Osman Fouad, an Infrastructure BIM Engineer. The site presents professional experience, technical skills, infrastructure projects, visual work, education, and contact information.

Production: [https://ahmed-fouad.netlify.app](https://ahmed-fouad.netlify.app)

## Technology

- Astro 6 with TypeScript
- Tailwind CSS 4 through `@tailwindcss/vite`
- `astro:assets` and Sharp for responsive images
- GSAP, ScrollTrigger, and Lenis for progressive-enhancement animation
- Netlify Forms for contact submissions
- Static output; no SSR adapter or server functions

## Requirements

- Node.js 24.4.0 (`.nvmrc`; package range `>=24.4.0 <25`)
- pnpm 10.34.5 through Corepack

No environment variables are currently required. Local `.env*` files are ignored; `.env.example` may be committed if configuration is introduced later.

## Local development

```bash
corepack enable
corepack prepare pnpm@10.34.5 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Astro’s development server is available at `http://localhost:4321` by default.

## Verification and production preview

```bash
pnpm check
pnpm build
pnpm preview
```

`pnpm check` runs Astro and TypeScript diagnostics. `pnpm build` writes the fully static site to `dist/`. The GitHub Actions workflow runs the frozen install, check, and build for pushes and pull requests targeting `master`; it does not deploy.

## Project structure

```text
public/                    Static public files: CV, social image, favicon, robots
src/assets/                Source images processed by Astro
src/components/            Navigation, footer, UI, and page sections
src/data/                  Typed professional and site content
src/layouts/Layout.astro   Metadata, structured data, fonts, and shared shell
src/pages/index.astro      Main portfolio route
src/pages/success.astro    Native contact-form success route
src/scripts/               Interactions and animation entry points
src/styles/global.css      Design tokens and global component styles
.github/workflows/ci.yml   Build verification only
astro.config.mjs           Astro site URL, integrations, and image configuration
netlify.toml               Netlify build, publish, cache, and security settings
```

## Deployment

The release branch is `master`. Netlify uses:

- Build command: `pnpm build`
- Publish directory: `dist`
- Node version: `24.4.0`

The production hostname is configured in `astro.config.mjs` and `public/robots.txt`. Astro generates canonical URLs and the sitemap from that hostname.

## Contact form

The contact form is detected by Netlify at build time through its form name, POST method, hidden `form-name` field, and honeypot. With JavaScript enabled, submission uses the accessible inline status region. Without JavaScript, Netlify performs the native POST and redirects to `/success/`.

Submissions appear in the site’s **Forms** area in the Netlify dashboard. The static success page never displays submitted values.

Do not test the production form with real personal data during release verification. Confirm detection in the generated HTML and use Netlify’s deployment tooling or dashboard for any post-deployment test.

## Release checklist

```bash
corepack pnpm@10.34.5 install --frozen-lockfile
corepack pnpm@10.34.5 check
corepack pnpm@10.34.5 build
corepack pnpm@10.34.5 audit
```

Then preview `dist/` and verify both `/` and `/success/`, metadata and sitemap URLs, responsive images, initial showreel network behavior, navigation, dialogs, contact links, and no-JavaScript fallbacks. Generated directories (`dist`, `.astro`, and `node_modules`) must remain untracked.
