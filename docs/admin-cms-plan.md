# Gallery Admin CMS Plan

## Decision

Use Sanity Studio as the content CMS, keep the current Vite + React site as the public frontend, and deploy the frontend through the existing GitHub/Vercel style workflow. Dynamic interaction features will be added separately instead of forcing them into Sanity.

## Execution Table

| Phase | Goal | Work Items | Output | Done When |
| --- | --- | --- | --- | --- |
| 1 | CMS foundation | Install Sanity, add Studio config, define content schemas | `sanity.config.ts`, `sanity/schemaTypes/*`, CMS npm scripts | `npm run cms:dev` can start after Sanity project env vars are set |
| 2 | Content model fit | Map current photo/category/story/about fields to Sanity | Photo, Category, Story, Site Settings models | Existing frontend fields have CMS equivalents |
| 3 | Migration path | Export current `photos.ts` and `stories.ts` content into importable JSON/NDJSON | `scripts/generate-sanity-seed.mjs` and generated seed data | Current local content can be imported without hand entry |
| 4 | Frontend bridge | Add optional Sanity client and data loader with static fallback | `src/lib/sanity.ts`, CMS queries, adapter types | Site builds even without Sanity env vars |
| 5 | Admin workflow | Add clear commands for sync/import/build/deploy | README updates and scripts | New photos can be added, edited in CMS, and published |
| 6 | Dynamic features | Add comments, likes, views, and search | Giscus/Supabase/Vercel KV decision and integration | Interaction data works independently from content CMS |
| 7 | Hardening | Validate content, image workflow, preview, deployment env | QA checklist and production settings | Production build and CMS workflow are repeatable |

## Phase 1 Scope

- Keep the public site behavior unchanged.
- Add Sanity Studio as a parallel admin surface.
- Model the fields needed by the current frontend before changing data flow.
- Use environment variables for Sanity project settings.

## Content Models

| Model | Purpose | Important Fields |
| --- | --- | --- |
| Category | Gallery grouping and navigation | title, slug, description, cover photo, sort order, visible |
| Photo | Main image archive item | image, source filename, title, category, date, location, camera metadata, featured flags, sort order |
| Story | Journal/photo essay content | title, slug, excerpt, published date, cover photo, related photos, rich text body |
| Site Settings | Singleton-style global content | site title, hero photo, about copy, gear list, social links |

## Dynamic Feature Direction

| Feature | Recommended Tool | Reason |
| --- | --- | --- |
| Comments | Giscus first | Fast GitHub-based setup, low maintenance |
| Likes | Supabase or Vercel KV | Simple write API, not content editorial data |
| Views | Supabase, Vercel Analytics, or KV | Append/update interaction data separately |
| Search | Frontend index first | Current archive size is small; upgrade later if needed |

## Current Constraint

The current frontend selects many photos by `filename` and `category`, so migration must preserve `sourceFilename` and stable category slugs/titles until layout logic is refactored.

## Phase 2 Output

`npm run cms:seed` generates Sanity seed files in `sanity/seed/generated/`. These files include categories, photos, stories, site settings, and an image asset manifest for the later upload step.

## Phase 4 Output

The frontend now starts with local static data, then loads Sanity content in the browser when `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` are available. If Sanity is not configured or returns an error, the existing static gallery remains visible.

## Phase 5 Output

`npm run cms:status` checks the configured Sanity dataset and reports document counts, image patch progress, and whether the dataset matches the current seed. Sanity Studio also uses a custom structure with a single Site Settings entry plus grouped Photos, Stories, and Categories sections.

## Phase 6 Output

`npm run cms:sync` orchestrates the remote migration workflow: generate seed data, import documents into the configured dataset, upload image assets, and run the CMS status check. Use `--limit 2` for the first real upload and remove it after visual QA in Studio.
