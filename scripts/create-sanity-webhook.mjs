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

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.VITE_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;
const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

const webhookName = "Vercel production rebuild";
const webhookDescription =
  "Triggers a Vercel production rebuild whenever a photo, story, or siteSettings document is created, updated, or deleted. Refreshing sitemap.xml / static fallback data only.";

if (!projectId) {
  console.error("SANITY_STUDIO_PROJECT_ID (or VITE_SANITY_PROJECT_ID) is not set.");
  process.exit(1);
}
if (!token) {
  console.error("SANITY_WRITE_TOKEN is not set. Cannot create webhooks.");
  process.exit(1);
}
if (!deployHookUrl) {
  console.error("VERCEL_DEPLOY_HOOK_URL is not set. Nothing for the webhook to call.");
  process.exit(1);
}

const apiBase = "https://api.sanity.io/v2021-10-04";

async function listExistingWebhooks() {
  const response = await fetch(`${apiBase}/hooks/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`list hooks failed: ${response.status} ${response.statusText}: ${await response.text()}`);
  }
  return response.json();
}

const existing = await listExistingWebhooks();
const match = existing.find((hook) => hook.name === webhookName);

const body = {
  name: webhookName,
  description: webhookDescription,
  dataset,
  url: deployHookUrl,
  filter: '_type in ["photo", "story", "siteSettings"]',
  httpMethod: "POST",
  apiVersion: "v2025-02-19",
  type: "document",
};

let response;
let mode;
if (match) {
  console.log(`Existing webhook "${webhookName}" found (id ${match.id}). Updating...`);
  mode = "update";
  response = await fetch(`${apiBase}/hooks/projects/${projectId}/${match.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
} else {
  console.log(`No existing webhook named "${webhookName}". Creating...`);
  mode = "create";
  response = await fetch(`${apiBase}/hooks/projects/${projectId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

if (!response.ok) {
  console.error(`Sanity webhook ${mode} failed (${response.status} ${response.statusText}):`);
  console.error(await response.text());
  process.exit(1);
}

const result = await response.json();
console.log(`Webhook ${mode}d successfully.`);
console.log(`  id: ${result.id}`);
console.log(`  name: ${result.name}`);
console.log(`  dataset: ${result.dataset}`);
console.log(`  url: ${result.url}`);
console.log(`  filter: ${result.filter}`);
console.log("Verify deliveries at: https://www.sanity.io/manage/project/" + projectId + "/api/hooks");
