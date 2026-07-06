import { createReadStream } from "node:fs";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

const projectRoot = path.resolve(import.meta.dirname, "..");
const generatedDir = path.join(projectRoot, "sanity", "seed", "generated");
const defaultManifestPath = path.join(generatedDir, "assets-manifest.json");
const defaultReportPath = path.join(generatedDir, "asset-upload-report.json");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    limit: undefined,
    manifestPath: defaultManifestPath,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--limit") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--limit must be a positive integer");
      }
      args.limit = value;
      index += 1;
    } else if (arg === "--manifest") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--manifest requires a path");
      }
      args.manifestPath = path.resolve(projectRoot, value);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

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

async function loadManifest(manifestPath) {
  const content = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(content);

  if (!Array.isArray(manifest)) {
    throw new Error(`Asset manifest must be an array: ${manifestPath}`);
  }

  return manifest;
}

async function validateManifest(manifest) {
  const seen = new Set();
  const missing = [];
  let totalBytes = 0;

  for (const item of manifest) {
    if (!item.photoId || !item.localPath || !item.filename) {
      throw new Error(`Invalid manifest item: ${JSON.stringify(item)}`);
    }

    if (seen.has(item.photoId)) {
      throw new Error(`Duplicate photoId in manifest: ${item.photoId}`);
    }
    seen.add(item.photoId);

    try {
      await access(item.localPath);
      const fileStats = await stat(item.localPath);
      totalBytes += fileStats.size;
    } catch {
      missing.push(item);
    }
  }

  return { missing, totalBytes };
}

function formatBytes(bytes) {
  const mib = bytes / 1024 / 1024;
  return `${mib.toFixed(1)} MiB`;
}

function createSanityClient({ projectId, dataset, token }) {
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2025-02-19",
    useCdn: false,
  });
}

async function getExistingImage(client, photoId) {
  return client.fetch(
    `*[_id == $photoId][0]{
      _id,
      "assetId": image.asset->_id
    }`,
    { photoId },
  );
}

async function uploadAndPatch(client, item) {
  const asset = await client.assets.upload("image", createReadStream(item.localPath), {
    filename: item.filename,
    title: item.filename,
  });

  await client
    .patch(item.photoId)
    .set({
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    })
    .commit({ autoGenerateArrayKeys: true });

  return asset;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await loadEnv();

  const manifest = await loadManifest(args.manifestPath);
  const selectedItems = args.limit ? manifest.slice(0, args.limit) : manifest;
  const { missing, totalBytes } = await validateManifest(selectedItems);

  if (missing.length > 0) {
    throw new Error(`Missing ${missing.length} local files. First missing file: ${missing[0].localPath}`);
  }

  console.log(`Asset manifest: ${args.manifestPath}`);
  console.log(`Images selected: ${selectedItems.length}`);
  console.log(`Total selected size: ${formatBytes(totalBytes)}`);

  if (args.dryRun) {
    console.log("Dry run complete. No Sanity API calls were made.");
    return;
  }

  const config = getConfig();
  if (!config.projectId || config.projectId === "your_sanity_project_id") {
    throw new Error("Missing SANITY_STUDIO_PROJECT_ID or VITE_SANITY_PROJECT_ID");
  }
  if (!config.token) {
    throw new Error("Missing SANITY_WRITE_TOKEN or SANITY_AUTH_TOKEN");
  }

  const client = createSanityClient(config);
  const report = [];

  await mkdir(generatedDir, { recursive: true });

  for (const [index, item] of selectedItems.entries()) {
    const prefix = `[${index + 1}/${selectedItems.length}]`;
    const existing = await getExistingImage(client, item.photoId);

    if (!existing?._id) {
      console.log(`${prefix} Missing Sanity photo document, skipped: ${item.photoId}`);
      report.push({ ...item, status: "missing-document" });
      continue;
    }

    if (existing.assetId && !args.force) {
      console.log(`${prefix} Already has image, skipped: ${item.photoId}`);
      report.push({ ...item, status: "skipped-existing", assetId: existing.assetId });
      continue;
    }

    console.log(`${prefix} Uploading ${item.filename}`);
    const asset = await uploadAndPatch(client, item);
    report.push({ ...item, status: "uploaded", assetId: asset._id });
  }

  await writeFile(
    defaultReportPath,
    `${JSON.stringify(
      {
        uploadedAt: new Date().toISOString(),
        projectId: config.projectId,
        dataset: config.dataset,
        force: args.force,
        limit: args.limit ?? null,
        items: report,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const uploaded = report.filter((item) => item.status === "uploaded").length;
  const skipped = report.filter((item) => item.status === "skipped-existing").length;
  const missingDocuments = report.filter((item) => item.status === "missing-document").length;

  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped existing: ${skipped}`);
  console.log(`Missing documents: ${missingDocuments}`);
  console.log(`Report: ${defaultReportPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
