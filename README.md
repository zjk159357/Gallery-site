# Queenstown.top Photography Archive

Personal photography archive built with React, TypeScript, and Vite. The site presents large-format galleries, a Balcony View series, an About page, a Journal page, and a preserved `/photostory` preview module for testing richer photo notes.

## Local Development

```bash
npm run dev
```

The dev script runs `sync:photos` first, then starts Vite.

## Build

```bash
npm run build
```

The build script syncs photos, runs TypeScript, and creates the production output in `dist/`.

## Photo Sync

Source photos live one level above this app in category folders such as:

- `山野`
- `建筑`
- `日出日落`
- `森林`
- `河流`
- `海洋`
- `石塘度假区`
- `花朵`

Run this when photos are added, removed, or replaced:

```bash
npm run sync:photos
```

The sync script copies image files into `public/photos/` and regenerates `src/data/photos.ts` with dimensions, filenames, categories, and public URLs.

## Photo Notes

Narrative and EXIF-like sample content lives in `src/data/stories.ts`.

- `photoMeta` adds date, location, camera, lens, aperture, shutter, ISO, and focal length.
- `photoStories` adds a title, excerpt, and body paragraphs.
- `/journal` shows story entries.
- `/photostory` is intentionally kept as a preview/test module for evaluating About, metadata, and story layouts together.

## Main Pages

- `/` home gallery
- `/photobalcony` Balcony View series
- `/journal` photo stories
- `/about` photographer profile
- `/photostory` preserved content preview module

## Verification Checklist

Before handing off changes:

```bash
npm run build
```

Then spot-check:

- Home page has no horizontal overflow on mobile.
- Gallery images open in the lightbox.
- Lightbox shows metadata for photos listed in `photoMeta`.
- `/photobalcony`, `/journal`, `/about`, and `/photostory` load correctly.
