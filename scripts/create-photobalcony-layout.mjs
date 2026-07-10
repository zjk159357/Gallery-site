import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

const layoutConfig = {
  heroPhoto: "DSC_0243.JPG",
  mayPhotos: ["DSC_0257.JPG", "DSC_0518.JPG", "DSC_0521.JPG", "DSC_0522.JPG"],
  marchPortraitPhotos: ["DSC_0264.JPG", "DSC_0335.JPG", "DSC_0396.JPG", "DSC_0470.JPG"],
  marchWidePhotos: ["DSC_0534.JPG", "DSC_0555.JPG", "DSC_0566.JPG"],
  februaryPhotos: ["DSC_0580.JPG", "DSC_0613.JPG", "DSC_0626.JPG", "DSC_0632.JPG"],
  januaryPhotos: ["DSC_0513.JPG", "DSC_0514.JPG", "DSC_0520.JPG", "DSC_0538.JPG"],
  winterPhotos: ["DSC_0546.JPG", "DSC_0551.JPG", "DSC_0552.JPG", "DSC_0571.JPG"],
  summerPhotos: ["DSC_0638.JPG", "DSC_0648.JPG", "DSC_0917.JPG", "DSC_2196.JPG"],
};

const force = process.argv.includes("--force");

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

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

  if (!projectId) {
    throw new Error("Missing SANITY_STUDIO_PROJECT_ID or VITE_SANITY_PROJECT_ID.");
  }

  if (!token) {
    throw new Error("Missing SANITY_WRITE_TOKEN or SANITY_AUTH_TOKEN.");
  }

  return { projectId, dataset, token };
}

function ref(id, keyPrefix, index = 0) {
  return {
    _key: `${keyPrefix}-${index}`,
    _type: "reference",
    _ref: id,
  };
}

async function main() {
  await loadEnv();

  const config = getConfig();
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: "2025-02-19",
    token: config.token,
    useCdn: false,
  });

  const filenames = [...new Set(Object.values(layoutConfig).flat())];
  const photos = await client.fetch(
    `*[_type == "photo" && sourceFilename in $filenames]{ _id, sourceFilename }`,
    { filenames },
  );
  const photoIdByFilename = new Map(photos.map((photo) => [photo.sourceFilename, photo._id]));
  const missing = filenames.filter((filename) => !photoIdByFilename.has(filename));

  if (missing.length) {
    throw new Error(`Missing Sanity photo documents: ${missing.join(", ")}`);
  }

  const arrayRefs = (field, filenamesForField) =>
    filenamesForField.map((filename, index) => ref(photoIdByFilename.get(filename), field, index));

  const doc = {
    _id: "photobalconyLayout-main",
    _type: "photobalconyLayout",
    title: "Photobalcony Layout",
    heroPhoto: ref(photoIdByFilename.get(layoutConfig.heroPhoto), "hero"),
    mayPhotos: arrayRefs("may", layoutConfig.mayPhotos),
    marchPortraitPhotos: arrayRefs("march-portrait", layoutConfig.marchPortraitPhotos),
    marchWidePhotos: arrayRefs("march-wide", layoutConfig.marchWidePhotos),
    februaryPhotos: arrayRefs("february", layoutConfig.februaryPhotos),
    januaryPhotos: arrayRefs("january", layoutConfig.januaryPhotos),
    winterPhotos: arrayRefs("winter", layoutConfig.winterPhotos),
    summerPhotos: arrayRefs("summer", layoutConfig.summerPhotos),
  };

  if (force) {
    await client.createOrReplace(doc);
  } else {
    await client.createIfNotExists(doc);
  }

  console.log(force ? "Photobalcony Layout created or replaced." : "Photobalcony Layout created if missing.");
  console.log(`Dataset: ${config.dataset}`);
  console.log(`Photos referenced: ${filenames.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
