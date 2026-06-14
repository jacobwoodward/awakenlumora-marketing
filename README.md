# Lumora Sales Page — self-hosted mirror

A pixel-for-pixel, fully self-contained static recreation of the Lumora sales
page originally built on Kajabi (`colleen-aloian.mykajabi.com/lumora-sales-page`),
ready to host on Lumora's own infrastructure.

## What's here

```
site/                 ← the deployable static site (this is the web root)
  index.html          ← the page
  Dockerfile          ← nginx static-serve image (for Coolify)
  assets/
    css/   styles.css, overrides.css, core.css, kajabi_products.css, fonts.css
    js/    jquery.min.js, scripts.js (theme interactions)
    img/   14 content images (hero, banners, icons, logos)
    fonts/ Cormorant Garamond + all Open Sans / Fira Sans subsets (self-hosted)
build.py              ← reproducible build: rewrites kajabi-raw.html → site/index.html
kajabi-raw.html       ← original captured source (build input)
reference/            ← screenshots used to verify fidelity (live vs local)
```

## Fidelity / independence

- **Zero external dependencies.** Every asset (images, all fonts, all CSS/JS) is
  downloaded and served locally. No calls to kajabi-cdn, Google Fonts, gstatic,
  FontAwesome, or jsdelivr at runtime.
- **Zero console errors.** jQuery + a tiny compatibility shim (`isFramed()`,
  `Kajabi.theme.*`) replace the Kajabi app bundle so the theme's `scripts.js`
  (mobile nav, exit popup, animations) runs unchanged.
- **Tracking removed.** Kajabi/RudderStack analytics, product-analytics, the
  app runtime, the health-check ping, and the "Powered by Kajabi" badge are stripped.
- **Verified** pixel-for-pixel against the live page at 1440px (desktop) and
  390px (mobile) — see `reference/`.

## CTAs / links

- Primary buttons already point to Lumora's app:
  `https://app.awakenlumora.com/signup?play=founding-member-course` and
  `...founding-member-group` (unchanged from the original).
- Header/footer member links (`/login`, `/library`, `/store`) were repointed
  from `colleen-aloian.mykajabi.com` to `https://app.awakenlumora.com`.

## Rebuild

```
python build.py        # regenerates site/index.html from kajabi-raw.html
```

## Run locally

```
cd site && python -m http.server 8099
# → http://127.0.0.1:8099/index.html
```

## Deploy (Coolify)

The `site/` folder builds as an nginx static image via `site/Dockerfile`.
Point a Coolify application at this repo with build context `site/`.
