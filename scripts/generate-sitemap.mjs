import { createClient } from "@sanity/client";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { transform } from "esbuild";

const projectRoot = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(projectRoot, "public");
const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://www.queenstown.top").replace(/\/$/, "");

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filenameSlug(filename) {
  const baseName = filename.replace(/\.[^.]+$/, "");
  return slugify(baseName) || encodeURIComponent(baseName.toLowerCase());
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function importTsModule(filePath) {
  const source = await readFile(filePath, "utf8");
  const result = await transform(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
    sourcemap: false,
  });
  const encoded = Buffer.from(result.code).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

async function fetchCmsEntries() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");

  const projectId = process.env.VITE_SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID;
  const dataset = process.env.VITE_SANITY_DATASET ?? process.env.SANITY_STUDIO_DATASET ?? "production";
  if (!projectId || projectId === "yourprojectid" || projectId === "your_sanity_project_id") {
    return null;
  }

  const client = createClient({ projectId, dataset, apiVersion: "2025-02-19", useCdn: true });
  const [photos, stories] = await Promise.all([
    client.fetch(`*[_type == "photo" && isHidden != true]{
      "slug": slug.current,
      "filename": sourceFilename,
      "updatedAt": _updatedAt,
      date
    }`),
    client.fetch(`*[_type == "story"]{
      title,
      "slug": slug.current,
      "updatedAt": _updatedAt,
      publishedAt
    }`),
  ]);

  return { photos, stories };
}

async function loadStaticEntries() {
  const [{ photos }, { photoStories }] = await Promise.all([
    importTsModule(path.join(projectRoot, "src", "data", "photos.ts")),
    importTsModule(path.join(projectRoot, "src", "data", "stories.ts")),
  ]);

  const stories = Object.entries(photoStories).flatMap(([filename, storyList]) =>
    storyList.map((story) => ({
      title: story.title,
      slug: story.slug || slugify(story.title) || filenameSlug(filename),
    })),
  );

  return { photos, stories };
}

function route(urlPath, lastmod, priority) {
  return {
    loc: `${siteUrl}${urlPath}`,
    lastmod: lastmod ? new Date(lastmod).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    priority,
  };
}

const entries = (await fetchCmsEntries().catch(() => null)) ?? (await loadStaticEntries());
const routes = [
  route("/", undefined, "1.0"),
  route("/journal", undefined, "0.7"),
  route("/about", undefined, "0.6"),
  route("/photobalcony", undefined, "0.6"),
  ...entries.photos.map((photo) => route(`/photos/${photo.slug || filenameSlug(photo.filename)}`, photo.updatedAt || photo.date, "0.8")),
  ...entries.stories.map((story) => route(`/stories/${story.slug || slugify(story.title)}`, story.updatedAt || story.publishedAt, "0.7")),
];

const uniqueRoutes = [...new Map(routes.map((item) => [item.loc, item])).values()];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map(
    (item) => `  <url>
    <loc>${xmlEscape(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /studio/

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(`Generated sitemap.xml with ${uniqueRoutes.length} URLs`);
