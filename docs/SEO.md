# SEO / GEO notes

- Canonical host: `https://www.auren.rest` (set by `AUREN_URL` in `lib/config.ts`). In Vercel Domains, `www.auren.rest` is the primary domain and the apex `auren.rest` 308-redirects to it. Keep the two in sync: canonicals, sitemap, robots, OG URLs and JSON-LD `@id`s all derive from `AUREN_URL`.
- Sitemap `lastModified` is the fixed `CONTENT_UPDATED` date in `lib/seo.ts`. Bump it only when page content meaningfully changes; do not use `new Date()`.
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
