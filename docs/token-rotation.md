# Sanity Token Rotation

## Why

A Sanity write token (the `sk...` string in `.env.local`) was visible to an
external AI coding tool. Even though `.env.local` is git-ignored and was not
committed, the token must be considered compromised and rotated.

This is a one-time, 5-minute task. After rotation, the new token must be
pasted into `.env.local` and any place it was used (local scripts, CI).

## Rotation Steps

1. Open the Sanity project dashboard:

   ```
   https://www.sanity.io/manage
   ```

2. Select the `gallery-site` project (projectId `zj2ik922`).

3. Navigate to **API → Tokens**.

4. Find the existing token (it will be labeled something like
   "gallery-site-local-migration" or unnamed). **Revoke** it immediately.

5. Click **Add API token**:
   - Name: `gallery-site-local-migration`
   - Permissions: **Editor**
   - Leave expiry blank (or set a 90-day reminder)

6. Sanity will show the new token **once**. Copy it now.

7. Update your local `.env.local`:

   ```env
   SANITY_WRITE_TOKEN=skTHENEWTOKEN
   ```

8. Verify the new token works:

   ```bash
   npm run cms:status
   ```

   Expected output: `Status: ready` with non-zero photo/story counts.

9. If you use the token in any other environment (CI, deployment
   platform, secrets manager), update those too. For this project the
   token is **only** used by local migration scripts and is never sent
   to Vercel.

## What is and is not affected

| Item | Affected? | Action |
| --- | --- | --- |
| `SANITY_WRITE_TOKEN` in `.env.local` | Yes — must replace | Paste new value |
| `SANITY_STUDIO_PROJECT_ID` | No — public ID | Leave alone |
| `SANITY_STUDIO_DATASET` | No — public dataset name | Leave alone |
| `VITE_SANITY_PROJECT_ID` | No — public, browser-safe | Leave alone |
| `VITE_SANITY_DATASET` | No — public, browser-safe | Leave alone |
| Vercel environment variables | No — write token is not deployed | Leave alone |

## Prevention

- Never paste `.env.local` (or any token) into AI chat tools, cloud IDEs,
  shared screenshots, or public repositories.
- Treat `sk...` strings like passwords. The token in this repo was only
  exposed to one AI session; rotating once is sufficient.
- Consider using a secrets manager (1Password CLI, Bitwarden, etc.) for
  local development instead of plain `.env` files.
