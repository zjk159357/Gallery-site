import type { Photo } from "../data/photos";
import type { PhotoStory } from "../data/stories";

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function filenameSlug(filename: string) {
  const baseName = filename.replace(/\.[^.]+$/, "");
  return slugify(baseName) || encodeURIComponent(baseName.toLowerCase());
}

export function photoSlug(photo: Pick<Photo, "filename" | "slug">) {
  return photo.slug || filenameSlug(photo.filename);
}

export function photoPath(photo: Pick<Photo, "filename" | "slug">) {
  return `/photos/${photoSlug(photo)}`;
}

function isString(value: string | undefined): value is string {
  return typeof value === "string";
}

function comparableSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-[0-9a-f]{6,12}$/i, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchesPhotoSlug(photo: Pick<Photo, "filename" | "slug">, routeSlug: string) {
  const normalizedRoute = comparableSlug(routeSlug);
  const candidates = [photo.slug, filenameSlug(photo.filename), photo.filename].filter(isString);

  return candidates.some((candidate) => comparableSlug(candidate) === normalizedRoute);
}

export function storySlug(story: Pick<PhotoStory, "title" | "slug">, fallback = "story") {
  return story.slug || slugify(story.title) || fallback;
}

export function storyPath(story: Pick<PhotoStory, "title" | "slug">, fallback?: string) {
  return `/stories/${storySlug(story, fallback)}`;
}

export function matchesStorySlug(
  story: Pick<PhotoStory, "title" | "slug">,
  routeSlug: string,
  fallbackPhoto?: Pick<Photo, "filename" | "slug">,
) {
  const normalizedRoute = comparableSlug(routeSlug);
  const candidates = [
    story.slug,
    storySlug(story, fallbackPhoto ? photoSlug(fallbackPhoto) : undefined),
    fallbackPhoto ? photoSlug(fallbackPhoto) : undefined,
    fallbackPhoto ? filenameSlug(fallbackPhoto.filename) : undefined,
    fallbackPhoto?.filename,
  ].filter(isString);

  return candidates.some((candidate) => comparableSlug(candidate) === normalizedRoute);
}
