# Auren web

The company website for **Auren** (`https://www.auren.rest`). A single Next.js (App Router) app.

Zent, Auren's server-monitoring product, lives in its own repository and site (`https://zent.auren.rest`). This repo only links to it.

Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide.

## Layout

```
app/            routes (/, /privacy, /terms), metadata, sitemap, robots, OG image
app/theme.css   design tokens (black / white / neutral grays only)
components/     Auren page components (header/footer, hero art, mini dashboard)
components/ui/  reusable primitives (logos, buttons, header, footer, charts, motion)
lib/config.ts   site URLs and contact addresses
```

## Run

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run typecheck
npm run build && npm start
```

## Environment (public, read at build time)

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_AUREN_URL` | This site's origin (metadata, sitemap) | `https://www.auren.rest` |
| `NEXT_PUBLIC_ZENT_URL` | Where "Visit Zent" / "Explore Zent" go | `https://zent.auren.rest` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact address (placeholder, replace) | `auren.rest@gmail.com` |

## Design system

Only black, white and neutral grays: `#000`, `#fff`, `#F5F5F5`, `#E5E5E5`, `#777`, `#222`, `#111`. `app/theme.css` removes Tailwind's default palette so other colours cannot compile. One addition: `#595959` for small secondary text on white, because `#777` on white is 4.48:1 (just under WCAG AA). Zent's site shares these tokens.

## Content rules

- The Zent dashboard shown on the site is an illustration with demo data, labelled as such.
- Zent capabilities are described as "intended"; nothing is claimed as shipped.
- No customers, testimonials, headcount, funding or company history are claimed.
- `/privacy` and `/terms` are placeholders that say so. Replace before launch.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
