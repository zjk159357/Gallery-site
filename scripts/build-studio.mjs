import { execSync } from "node:child_process";

// The Vercel project already has VITE_SANITY_PROJECT_ID and VITE_SANITY_DATASET
// set. Reuse them so we don't need duplicate SANITY_STUDIO_* env vars.
process.env.SANITY_STUDIO_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "yourprojectid";
process.env.SANITY_STUDIO_DATASET = process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || "production";

execSync("sanity build", {
  stdio: "inherit",
  env: process.env,
  cwd: process.cwd(),
});
