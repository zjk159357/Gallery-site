# Sanity Migration

This guide migrates the current static gallery content into Sanity documents.

## Current Migration Output

Run:

```bash
npm run cms:seed
```

Generated files are written to:

```text
sanity/seed/generated/
```

The generated folder is ignored by Git because it can be rebuilt from the current source data.

| File | Purpose |
| --- | --- |
| `all.ndjson` | All importable Sanity documents |
| `categories.ndjson` | Category documents only |
| `photos.ndjson` | Photo documents with legacy image paths and metadata |
| `stories.ndjson` | Journal/story documents |
| `site-settings.ndjson` | Site settings document |
| `assets-manifest.json` | Local image path manifest for the later upload step |
| `summary.json` | Generation counts and timestamp |

## Import Documents

After creating the Sanity project and filling `.env.local`, log in:

```bash
npm run cms:login
```

Generate seed data:

```bash
npm run cms:seed
```

Import into the configured dataset:

```bash
npx sanity dataset import sanity/seed/generated/all.ndjson production --replace
```

Use the dataset name from `SANITY_STUDIO_DATASET` if it is not `production`.

Check the remote document counts:

```bash
npm run cms:status
```

Alternatively, run the import, upload, and status checks together:

```bash
npm run cms:sync -- --limit 2
```

Remove `--limit 2` after confirming the first two uploaded images look correct.

## Image Asset Status

The seed import does not upload image binaries yet. Photo documents include:

- `legacyPublicPath`
- `legacyLocalPath`
- `dimensions`
- `sourceFilename`

This lets the frontend and Studio keep a stable migration reference before Sanity image assets are attached.

The next migration step should upload the files listed in `assets-manifest.json`, then patch each `photo.image` field with the uploaded Sanity asset reference.

## Upload Image Assets

Create a Sanity API token with write access, then add it to `.env.local`:

```bash
SANITY_WRITE_TOKEN=your_sanity_write_token
```

Validate the local files first:

```bash
npm run cms:upload-assets -- --dry-run
```

Run a small real upload first:

```bash
npm run cms:upload-assets -- --limit 2
```

If the first two photos look correct in Studio, upload the rest:

```bash
npm run cms:upload-assets
```

Check status again:

```bash
npm run cms:status
```

The script skips photos that already have `image.asset` unless `--force` is passed:

```bash
npm run cms:upload-assets -- --force
```

After each real run, a local report is written to:

```text
sanity/seed/generated/asset-upload-report.json
```

## Verification

After import:

```bash
npm run cms:dev
```

Check that the Studio contains:

- 8 categories
- 73 photos
- 3 stories
- 1 site settings document

The exact counts are also available in `sanity/seed/generated/summary.json`.

The Studio navigation pins `Site Settings` to a single document with `_id = siteSettings-main`, then groups Photos, Stories, and Categories into top-level sections.
