# SEO / GEO notes

- Canonical host: `https://auren.rest` (apex, no trailing slash). `www` 308-redirects to it (`next.config.ts`); also add the redirect in Vercel Domains.
- Per-page metadata: `pageMetadata()` in `lib/seo.ts`. The root layout sets no canonical or robots, so every page declares its own.
- `/privacy` and `/terms` are placeholders: `noindex, follow`, omitted from `app/sitemap.ts`. When real content ships, pass `index: true` and add them to the sitemap.
- JSON-LD: site-wide `Organization` + `WebSite` (stable `@id`s) in the layout; `WebPage` on home; `BreadcrumbList` on legal pages. No ratings, reviews, addresses or Zent offers are marked up because none are shown on the site.
- `FAQPage` markup is deliberately not used (Google restricts its rich results); the FAQ is plain visible HTML.
- `public/llms.txt` is an optional experiment, not a ranking factor.
- Env overrides: `NEXT_PUBLIC_AUREN_URL`, `NEXT_PUBLIC_ZENT_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`.

## Automation redesign (GEO)

- Title/description/OG image describe the workflow-automation focus; the brand title in `app/page.tsx` uses `TAGLINE` from `lib/seo.ts`.
- Home `WebPage` JSON-LD adds `about` (workflow automation) and `mentions` Zent as a `SoftwareApplication`; `Organization` gains `knowsAbout`. No offers, ratings or "live" claims are marked up.
- The FAQ explicitly states the robot demo and workflows are simulated, so answer engines don't cite them as real integrations.
- `public/llms.txt` summarises pages, key facts and the simulated-demo disclaimer.
- Server-rendered text for the hero, use cases and explorer headings is crawlable; the 3D canvas is `aria-hidden` and decorative.
