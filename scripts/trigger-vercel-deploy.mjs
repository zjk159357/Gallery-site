import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function loadEnvFile(filename) {
  try {
    const content = await readFile(path.join(projectRoot, filename), "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator === -1) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

if (!hookUrl) {
  console.error(
    [
      "VERCEL_DEPLOY_HOOK_URL is not set.",
      "",
      "Set it in .env.local:",
      "  VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy",
      "",
      "Create the hook at:",
      "  Vercel Dashboard -> gallery-site -> Settings -> Git -> Deploy Hooks",
      "  (see docs/auto-deploy.md for step-by-step instructions)",
    ].join("\n"),
  );
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(hookUrl);
} catch {
  console.error("VERCEL_DEPLOY_HOOK_URL is not a valid URL.");
  process.exit(1);
}

if (parsed.host !== "api.vercel.com" || !parsed.pathname.startsWith("/v1/integrations/deploy/")) {
  console.error(
    "VERCEL_DEPLOY_HOOK_URL must point to https://api.vercel.com/v1/integrations/deploy/<id>",
  );
  process.exit(1);
}

console.log("Triggering Vercel production deploy...");
const response = await fetch(hookUrl, { method: "POST" });
const body = await response.text();

if (!response.ok) {
  console.error(`Deploy hook failed (${response.status} ${response.statusText}):`);
  console.error(body);
  process.exit(1);
}

let job;
try {
  job = JSON.parse(body);
} catch {
  job = { raw: body };
}

console.log("Deploy triggered successfully.");
if (job.job) {
  console.log(`  job id: ${job.job.id}`);
  console.log(`  created at: ${job.job.createdAt}`);
}
console.log("Watch progress: https://vercel.com/dashboard -> gallery-site -> Deployments");