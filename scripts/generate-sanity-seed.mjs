import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import { transform } from "esbuild";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(projectRoot, "sanity", "seed", "generated");
const photosModulePath = path.join(projectRoot, "src", "data", "photos.ts");
const storiesModulePath = path.join(projectRoot, "src", "data", "stories.ts");

function stableHash(value, length = 12) {
  return createHash("sha1").update(value).digest("hex").slice(0, length);
}

function sanitizeIdPart(value, fallback) {
  const ascii = value
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return ascii || `${fallback}-${stableHash(value, 8)}`;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileBase(filename) {
  return path.basename(filename, path.extname(filename));
}

function blockFromText(text) {
  return {
    _key: randomUUID().replaceAll("-", "").slice(0, 12),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: randomUUID().replaceAll("-", "").slice(0, 12),
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
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

function localPathFromPublicSrc(src) {
  const parts = decodeURI(src).replace(/^\//, "").split("/");
  return path.join(projectRoot, "public", ...parts);
}

function ref(_ref) {
  return { _type: "reference", _ref };
}

async function writeNdjson(filename, docs) {
  const body = docs.map((doc) => JSON.stringify(doc)).join("\n");
  await writeFile(path.join(outputDir, filename), `${body}\n`, "utf8");
}

const [{ photos, categories }, { photoMeta, photoStories, aboutData }] = await Promise.all([
  importTsModule(photosModulePath),
  importTsModule(storiesModulePath),
]);

const categoryDocs = categories.map((title, index) => {
  const id = `category-${String(index + 1).padStart(2, "0")}-${sanitizeIdPart(title, "category")}`;

  return {
    _id: id,
    _type: "category",
    title,
    slug: {
      _type: "slug",
      current: slugify(title) || `category-${index + 1}`,
    },
    sortOrder: (index + 1) * 10,
    isVisible: true,
  };
});

const categoryIdByTitle = new Map(categoryDocs.map((doc) => [doc.title, doc._id]));

const photoDocs = photos.map((photo, index) => {
  const meta = photoMeta[photo.filename];
  const localPath = localPathFromPublicSrc(photo.src);
  const id = `photo-${sanitizeIdPart(fileBase(photo.filename), "photo")}-${stableHash(photo.src, 8)}`;

  return {
    _id: id,
    _type: "photo",
    title: photo.title,
    slug: {
      _type: "slug",
      current: slugify(fileBase(photo.filename)) || `photo-${index + 1}`,
    },
    legacyId: photo.id,
    sourceFilename: photo.filename,
    legacyPublicPath: photo.src,
    legacyLocalPath: localPath,
    dimensions: {
      width: photo.width,
      height: photo.height,
    },
    category: ref(categoryIdByTitle.get(photo.category)),
    date: meta?.date,
    location: meta?.location,
    camera: meta?.camera,
    lens: meta?.lens,
    aperture: meta?.aperture,
    shutter: meta?.shutter,
    iso: meta?.iso,
    focalLength: meta?.focalLength,
    isFeatured: Boolean(photoStories[photo.filename]),
    isHero: photo.filename === "DSC_0257.JPG",
    isHidden: false,
    sortOrder: (index + 1) * 10,
  };
});

const photoIdByFilename = new Map(photoDocs.map((doc) => [doc.sourceFilename, doc._id]));

for (const categoryDoc of categoryDocs) {
  const cover = photoDocs.find((photo) => photo.category._ref === categoryDoc._id);
  if (cover) {
    categoryDoc.coverPhoto = ref(cover._id);
  }
}

let storyIndex = 0;
const storyDocs = Object.entries(photoStories).flatMap(([filename, stories]) => {
  return stories.map((story) => {
    storyIndex += 1;
    const relatedPhotoId = photoIdByFilename.get(filename);
    const meta = photoMeta[filename];
    const id = `story-${sanitizeIdPart(`${filename}-${story.title}`, "story")}`;

    return {
      _id: id,
      _type: "story",
      title: story.title,
      slug: {
        _type: "slug",
        current: `${slugify(fileBase(filename)) || slugify(story.title) || `story-${storyIndex}`}`,
      },
      excerpt: story.excerpt,
      publishedAt: meta?.date ? `${meta.date}T00:00:00.000Z` : undefined,
      coverPhoto: relatedPhotoId ? ref(relatedPhotoId) : undefined,
      relatedPhotos: relatedPhotoId ? [ref(relatedPhotoId)] : [],
      body: (story.body ?? []).map(blockFromText),
      sortOrder: storyIndex * 10,
    };
  });
});

const heroPhoto = photoDocs.find((photo) => photo.isHero) ?? photoDocs[0];
const siteSettingsDoc = {
  _id: "siteSettings-main",
  _type: "siteSettings",
  siteTitle: "Queenstown Gallery",
  heroPhoto: heroPhoto ? ref(heroPhoto._id) : undefined,
  aboutName: aboutData.name,
  aboutLocation: aboutData.location,
  aboutBio: aboutData.bio.map(blockFromText),
  gear: aboutData.gear,
  socialLinks: aboutData.contact,
};

const assetManifest = photoDocs.map((photo) => ({
  photoId: photo._id,
  filename: photo.sourceFilename,
  publicPath: photo.legacyPublicPath,
  localPath: photo.legacyLocalPath,
  width: photo.dimensions.width,
  height: photo.dimensions.height,
}));

const allDocs = [...categoryDocs, ...photoDocs, ...storyDocs, siteSettingsDoc].filter(Boolean);

await mkdir(outputDir, { recursive: true });
await writeNdjson("categories.ndjson", categoryDocs);
await writeNdjson("photos.ndjson", photoDocs);
await writeNdjson("stories.ndjson", storyDocs);
await writeNdjson("site-settings.ndjson", [siteSettingsDoc]);
await writeNdjson("all.ndjson", allDocs);
await writeFile(path.join(outputDir, "assets-manifest.json"), `${JSON.stringify(assetManifest, null, 2)}\n`, "utf8");
await writeFile(
  path.join(outputDir, "summary.json"),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      categories: categoryDocs.length,
      photos: photoDocs.length,
      stories: storyDocs.length,
      siteSettings: 1,
      outputDir: pathToFileURL(outputDir).href,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Generated ${allDocs.length} Sanity seed documents in ${outputDir}`);
console.log(`Categories: ${categoryDocs.length}`);
console.log(`Photos: ${photoDocs.length}`);
console.log(`Stories: ${storyDocs.length}`);
