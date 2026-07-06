# Deployment

## Recommended Setup

Use GitHub for source control and Vercel for hosting.

```text
GitHub  -> code and history
Vercel  -> frontend deployment
Sanity  -> CMS content and image assets
```

## Vercel Settings

Vercel should detect this as a Vite project.

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

## Vercel Environment Variables

Only add public frontend variables:

```text
VITE_SANITY_PROJECT_ID=zj2ik922
VITE_SANITY_DATASET=production
```

Do not add this to Vercel:

```text
SANITY_WRITE_TOKEN
```

`SANITY_WRITE_TOKEN` is only for local migration and asset upload scripts.

## Sanity CORS

After Vercel creates a production URL, add it to Sanity CORS:

```bash
npx sanity cors add https://your-vercel-domain.vercel.app --no-credentials
```

If a custom domain is added later, add that too:

```bash
npx sanity cors add https://your-custom-domain.com --no-credentials
```

Current local development origins:

```text
http://127.0.0.1:5174
http://localhost:5174
http://127.0.0.1:3333
http://localhost:3333
```

## Git Safety

The repo ignores:

- `.env.local`
- `dist/`
- `dist-studio/`
- `public/photos/`
- `sanity/seed/generated/`

This keeps local tokens, generated builds, synced public photos, and migration output out of Git. The source photo category folders live inside this project and should be committed when deploying only `gallery-site`.

## Production Verification

Before pushing:

```bash
npm run lint
npm run build
npm run cms:status
```

Expected CMS status:

```text
photos: 73
photosWithImages: 73
Status: ready
```

After deploy, open the Vercel URL and confirm the site loads. The local dev-only `CMS · 73` badge does not appear in production builds.
