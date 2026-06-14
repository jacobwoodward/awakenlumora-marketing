# Lumora — marketing site (awakenlumora.com)

The standalone marketing/sales page for the **Lumora** community (Colleen Aloian),
self-hosted on Lumora's own infrastructure. Originally migrated off Kajabi, then
rebuilt as a conversion-focused page that matches the visual system of the member
app at `app.awakenlumora.com`.

> `app.awakenlumora.com` (the actual community app) is a custom domain on the shared
> **Kitchanga production** app. This marketing page is a **separate static site** at
> the apex `awakenlumora.com` (apex 301-redirects to `www`).

## The live page

Hand-authored static site — no build step, no framework.

```
site/
  index.html              ← the page (semantic HTML + conversion copy)
  default.conf            ← nginx: apex→www redirect + static serving
  Dockerfile              ← nginx:alpine static image (Coolify)
  assets/
    css/  lumora.css       ← design system (matches the app: cream / plum / gold)
          fonts2.css       ← self-hosted Cormorant Garamond + Inter (latin)
    js/   site.js          ← mobile nav, Soul Keys accordion, scroll reveals, countdown
    fonts/v2/              ← woff2 (Cormorant Garamond display, Inter body)
    img/                   ← Lumora logo, favicon, Colleen's brand photography
```

### Design system (sourced from app.awakenlumora.com)
- Surfaces: cream `#FDFBF8` / `#F7F1E8`, warm-sand borders `#E5DDD0`
- Ink (plum scale): `#1A1225` · `#2D2438` · `#5C4F6A` · `#8A7E96`
- Primary CTA: antique gold `#9B7B3C`
- Type: Cormorant Garamond (display) + Inter (body, matches the app)
- Fully self-contained — zero external CDN/font/analytics calls.

### Conversion architecture
Sticky header → image hero w/ primary CTA → 3 pillars → "why nothing worked"
contrast → daily-shift timeline → founder credibility → 13 Soul Keys (accordion)
→ qualifier band → two-tier pricing ($7 Awakening / $111 Activation, featured)
→ live founding-deadline countdown (June 21) → emotional close → footer.
All CTAs point to `app.awakenlumora.com/signup?play=founding-member-{course,group}`.

## Run locally
```
cd site && python -m http.server 8099   →  http://127.0.0.1:8099/index.html
```

## Deploy (Coolify)
- App: `awakenlumora-marketing` (UUID `y49gi81nxsc9jfgvrvzb9hrn`), Kitchanga project / production.
- `git push` to `main`, then `GET {COOLIFY}/api/v1/deploy?uuid=y49gi81nxsc9jfgvrvzb9hrn`.
- DNS: Cloudflare `A @` and `A www` → `178.156.184.83`.

## archive/
`archive/original-mirror/` holds the original pixel-for-pixel Kajabi capture
(`kajabi-raw.html`), its `build.py`, and the now-unused theme CSS/JS/fonts —
kept for provenance. Not served.
