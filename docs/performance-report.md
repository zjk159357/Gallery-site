# Performance Analysis Report

**Test URL:** http://localhost:5174/?fresh=1 (dev, since production URL timed out via the user proxy)
**Test tool:** Playwright + Performance API (instead of Lighthouse — Chrome 149 + Lighthouse 12 are currently incompatible on this machine)
**Device:** 1440×900 viewport, headless Chromium

## Core Web Vitals

| Metric | Value | Threshold | Verdict |
| --- | --- | --- | --- |
| **FCP** (First Contentful Paint) | 640 ms | < 1.8 s | ✅ Good |
| **LCP** (Largest Contentful Paint) | 716 ms | < 2.5 s | ✅ Good |
| **TTFB** (Time to First Byte) | 6 ms | < 800 ms | ✅ Good |
| **DOM Interactive** | 26 ms | — | ✅ Excellent |
| **Load** | 209 ms | — | ✅ Excellent |
| **LCP element** | `IMG.hero-image` | — | ✅ Correctly the LCP candidate |

## Bundle Sizes (production build, from `npm run build`)

| File | Raw | Gzip |
| --- | --- | --- |
| `index.html` | 1.49 KB | 0.74 KB |
| `index-*.css` | 39.17 KB | 8.48 KB |
| `index-*.js` | 353.92 KB | **113.18 KB** |
| `browser-*.js` (chunk) | 11.92 KB | 4.58 KB |
| `stegaEncodeSourceMap-*.js` | 6.86 KB | 2.85 KB |
| **Total** | ~413 KB | **~130 KB** |

The 113 KB gzipped JS is the main cost. Sources:
- React 19 + ReactDOM
- yet-another-react-lightbox (large image gallery lib)
- @sanity/client
- lucide-react
- bundled application code

## Resource Counts on Initial Load (dev)

| Type | Count |
| --- | --- |
| Scripts | 31 (Vite HMR + app in dev — production ships 1–2 files) |
| Stylesheets | 1 |
| Images (above-the-fold eager) | 5 |
| Images (lazy, below the fold) | 52 |
| Fonts | **6 woff2 files** (Cormorant, Playfair, Poppins × 2 weights each) |

## Issues Found

### 1. Google Fonts sometimes fail to load (proxy / network)
When the user's proxy 127.0.0.1:7890 is slow, the woff2 files at `fonts.gstatic.com` time out with `ERR_TIMED_OUT` or `ERR_CONNECTION_CLOSED`. The site falls back to system fonts (Helvetica/Arial/Georgia), which causes a re-paint and hurts the LCP.

`index.html:19-22` loads three families × multiple weights = up to 19 woff2 files.

**Fix options:**
- **Self-host the fonts** (one-time `npm run build` step, fastest result, keeps design)
- **System font stack only** (no network, but lose the design intent)
- **Drop the heaviest family** (Cormorant Garamond is a backup for Playfair Display — could be removed)

### 2. Eager-loaded hero image is 15 MB
The hero image `DSC_0257.JPG` is 6,048 × 4,032 pixels and weighs ~15 MB. Modern browsers do not downscale this before download, so the LCP image transfer alone is 15 MB. This is the largest contributor to LCP time on a real connection.

**Fix:**
- Generate a hero variant at ~1,920 px wide and < 500 KB, store in `/public/hero/`
- Use the `<picture>` element with `srcset` to serve a smaller version by default
- Sanity has built-in image transforms: append `?w=1920&auto=format` to the URL

### 3. JS bundle is 113 KB gzipped
This is acceptable for a feature-rich portfolio (Sanity client, lightbox, masonry). Splitting the lightbox into a lazy chunk would only save ~20–30 KB because it's only needed when the user opens an image. Probably not worth the complexity right now.

## Recommendations (priority order)

1. **Compress the hero image** (one-time) — biggest LCP win
2. **Self-host the Google Fonts** (or drop Cormorant) — eliminates the most common failure mode
3. (Optional) **Code-split the lightbox** — only relevant if you keep adding features

No code changes required for items 1 and 2; they are content/decisions.
