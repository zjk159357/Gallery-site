import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imageSizeFromFile } from "image-size/fromFile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = projectRoot;
const publicPhotoRoot = path.join(projectRoot, "public", "photos");
const dataFile = path.join(projectRoot, "src", "data", "photos.ts");

const categories = ["山野", "建筑", "日出日落", "森林", "河流", "海洋", "石塘度假区", "花朵"];

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const toPosix = (value) => value.split(path.sep).join("/");

const titleFromFilename = (filename) => path.basename(filename, path.extname(filename));

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function copyIfChanged(source, target) {
  const sourceStats = await stat(source);

  try {
    const targetStats = await stat(target);
    if (
      targetStats.size === sourceStats.size &&
      Math.floor(targetStats.mtimeMs) >= Math.floor(sourceStats.mtimeMs)
    ) {
      return;
    }
  } catch {
    // Missing target: copy below.
  }

  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function removeStaleFiles(root, expected) {
  let entries = [];

  try {
    entries = await readdir(root, { recursive: true, withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const fullPath = path.resolve(entry.parentPath, entry.name);
    if (!expected.has(fullPath)) {
      await rm(fullPath, { force: true });
    }
  }
}

async function collectPhotos() {
  const photos = [];
  const expectedFiles = new Set();

  await mkdir(publicPhotoRoot, { recursive: true });

  for (const category of categories) {
    const sourceCategoryDir = path.join(sourceRoot, category);
    const targetCategoryDir = path.join(publicPhotoRoot, category);

    await mkdir(targetCategoryDir, { recursive: true });

    const entries = await readdir(sourceCategoryDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" }));

    for (const filename of files) {
      const sourcePath = path.join(sourceCategoryDir, filename);
      const targetPath = path.join(targetCategoryDir, filename);
      expectedFiles.add(path.resolve(targetPath));

      await copyIfChanged(sourcePath, targetPath);

      const dimensions = await imageSizeFromFile(sourcePath);
      const rawWidth = dimensions.width ?? 1;
      const rawHeight = dimensions.height ?? 1;
      const shouldSwap = dimensions.orientation && dimensions.orientation >= 5 && dimensions.orientation <= 8;

      photos.push({
        id: `photo-${String(photos.length + 1).padStart(3, "0")}`,
        src: `/${toPosix(path.relative(path.join(projectRoot, "public"), targetPath))}`,
        title: titleFromFilename(filename),
        slug: slugify(titleFromFilename(filename)) || `photo-${String(photos.length + 1).padStart(3, "0")}`,
        category,
        filename,
        width: shouldSwap ? rawHeight : rawWidth,
        height: shouldSwap ? rawWidth : rawHeight,
        isHero: filename === "DSC_0257.JPG",
      });
    }
  }

  await removeStaleFiles(publicPhotoRoot, expectedFiles);

  return photos;
}

function serializeData(photos) {
  return `export type Photo = {
  id: string;
  src: string;
  title: string;
  slug?: string;
  category: string;
  filename: string;
  width: number;
  height: number;
  isHero?: boolean;
};

export const categories = ${JSON.stringify(categories, null, 2)} as const;

export const photos: Photo[] = ${JSON.stringify(photos, null, 2)};
`;
}

const photos = await collectPhotos();
await mkdir(path.dirname(dataFile), { recursive: true });
await writeFile(dataFile, serializeData(photos), "utf8");

console.log(`Synced ${photos.length} photos into public/photos and generated src/data/photos.ts`);
