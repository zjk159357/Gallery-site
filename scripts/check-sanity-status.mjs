import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function loadEnvFile(filename) {
  const filePath = path.join(projectRoot, filename);

  try {
    const content = await readFile(filePath, "utf8");

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
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function loadEnv() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");
}

function getConfig() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.VITE_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;

  return { projectId, dataset, token };
}

function isMissingProjectId(projectId) {
  return !projectId || projectId === "your_sanity_project_id" || projectId === "yourprojectid";
}

async function main() {
  await loadEnv();

  const { projectId, dataset, token } = getConfig();

  console.log("Sanity CMS status");
  console.log(`Dataset: ${dataset}`);
  console.log(`Project ID: ${isMissingProjectId(projectId) ? "not configured" : projectId}`);
  console.log(`Write token: ${token ? "configured" : "not configured"}`);

  if (isMissingProjectId(projectId)) {
    console.log("Status: not configured");
    console.log("Add SANITY_STUDIO_PROJECT_ID and VITE_SANITY_PROJECT_ID to .env.local before remote checks.");
    return;
  }

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2025-02-19",
    useCdn: false,
  });

  const result = await client.fetch(`{
    "categories": count(*[_type == "category"]),
    "photos": count(*[_type == "photo"]),
    "photosWithImages": count(*[_type == "photo" && defined(image.asset)]),
    "stories": count(*[_type == "story"]),
    "siteSettings": count(*[_type == "siteSettings"]),
    "heroPhotos": count(*[_type == "photo" && isHero == true])
  }`);

  console.log("Remote counts:");
  console.log(JSON.stringify(result, null, 2));

  const expected = {
    categories: 8,
    photos: 73,
    stories: 3,
    siteSettings: 1,
  };

  const mismatches = Object.entries(expected).filter(([key, value]) => result[key] !== value);

  if (mismatches.length > 0) {
    console.log("Status: connected, but content counts differ from the current seed.");
    for (const [key, value] of mismatches) {
      console.log(`- ${key}: expected ${value}, got ${result[key]}`);
    }
    return;
  }

  if (result.photosWithImages < result.photos) {
    console.log("Status: documents imported; image upload is incomplete.");
    console.log(`Images patched: ${result.photosWithImages}/${result.photos}`);
    return;
  }

  console.log("Status: ready");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
