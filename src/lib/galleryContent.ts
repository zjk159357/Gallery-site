import { useEffect, useState } from "react";
import { initialHeroPhoto as staticHeroPhoto, photos as staticPhotos, type Photo } from "../data/photos";
import {
  aboutData as staticAboutData,
  photoMeta as staticPhotoMeta,
  photoStories as staticPhotoStories,
  type AboutData,
  type PhotoMeta,
  type PhotoStory,
} from "../data/stories";
import {
  cmsPhotosQuery,
  cmsSiteSettingsQuery,
  cmsStoriesQuery,
  type CmsPhoto,
  type CmsSiteSettings,
  type CmsStory,
  type PortableTextBlock,
} from "./cmsQueries";
import { getSanityClient, isSanityConfigured } from "./sanity";

export type GalleryContent = {
  photos: Photo[];
  photoMeta: Record<string, PhotoMeta>;
  photoStories: Record<string, PhotoStory[]>;
  aboutData: AboutData;
  heroPhoto?: Photo;
  source: "static" | "cms";
  isLoading: boolean;
  error?: string;
};

const staticContent: GalleryContent = {
  photos: staticPhotos,
  photoMeta: staticPhotoMeta,
  photoStories: staticPhotoStories,
  aboutData: staticAboutData,
  heroPhoto: staticHeroPhoto,
  source: "static",
  isLoading: false,
};

function blockToText(block: PortableTextBlock) {
  return block.children?.map((child) => child.text ?? "").join("") ?? "";
}

function blocksToLines(blocks: PortableTextBlock[] | undefined) {
  return blocks?.map(blockToText).filter(Boolean) ?? [];
}

function isCompleteMeta(photo: CmsPhoto) {
  return Boolean(
    photo.date &&
      photo.location &&
      photo.camera &&
      photo.lens &&
      photo.aperture &&
      photo.shutter &&
      typeof photo.iso === "number" &&
      photo.focalLength,
  );
}

function toPhoto(photo: CmsPhoto): Photo | null {
  const src = resolvePhotoSrc(photo.src, photo.legacyPublicPath);
  if (!src || !photo.title || !photo.category || !photo.filename) {
    return null;
  }

  return {
    id: photo.id,
    src,
    title: photo.title,
    slug: photo.slug,
    category: photo.category,
    filename: photo.filename,
    width: photo.width || 1,
    height: photo.height || 1,
    isHero: photo.isHero,
  };
}

const IMAGE_CDN_PARAMS = "?w=2560&q=90&auto=format&fit=max";

function resolvePhotoSrc(sanityUrl: string | undefined, legacyPublicPath: string | undefined): string | undefined {
  if (import.meta.env.DEV && legacyPublicPath) {
    return legacyPublicPath;
  }
  if (sanityUrl) {
    return `${sanityUrl}${IMAGE_CDN_PARAMS}`;
  }
  return legacyPublicPath;
}

function toPhotoMeta(photos: CmsPhoto[]) {
  return photos.reduce<Record<string, PhotoMeta>>((metaByFilename, photo) => {
    if (!isCompleteMeta(photo)) return metaByFilename;

    metaByFilename[photo.filename] = {
      date: photo.date ?? "",
      location: photo.location ?? "",
      camera: photo.camera ?? "",
      lens: photo.lens ?? "",
      aperture: photo.aperture ?? "",
      shutter: photo.shutter ?? "",
      iso: photo.iso ?? 0,
      focalLength: photo.focalLength ?? "",
    };

    return metaByFilename;
  }, {});
}

function toReferencedPhoto(photo: CmsSiteSettings["heroPhoto"]): Photo | undefined {
  const src = resolvePhotoSrc(photo?.src, photo?.legacyPublicPath);
  if (!photo?.id || !src || !photo.title || !photo.filename) {
    return undefined;
  }

  return {
    id: photo.id,
    src,
    title: photo.title,
    slug: photo.slug,
    category: "",
    filename: photo.filename,
    width: photo.width || 1,
    height: photo.height || 1,
  };
}

function toPhotoStories(stories: CmsStory[]) {
  return stories.reduce<Record<string, PhotoStory[]>>((storiesByFilename, story) => {
    const filename = story.coverPhoto?.filename ?? story.relatedPhotos?.find((photo) => photo.filename)?.filename;
    if (!filename || !story.title) return storiesByFilename;

    const entry: PhotoStory = {
      title: story.title,
      slug: story.slug,
      excerpt: story.excerpt ?? "",
      body: blocksToLines(story.body),
    };

    if (!storiesByFilename[filename]) {
      storiesByFilename[filename] = [];
    }
    storiesByFilename[filename].push(entry);

    return storiesByFilename;
  }, {});
}

function toAboutData(settings: CmsSiteSettings | null | undefined): AboutData {
  if (!settings) {
    return staticAboutData;
  }

  return {
    name: settings.aboutName || staticAboutData.name,
    location: settings.aboutLocation || staticAboutData.location,
    bio: blocksToLines(settings.aboutBio).length ? blocksToLines(settings.aboutBio) : staticAboutData.bio,
    gear: settings.gear?.flatMap((item) => (item.name && item.value ? [{ name: item.name, value: item.value }] : [])) ?? staticAboutData.gear,
    contact:
      settings.socialLinks?.flatMap((item) =>
        item.label && item.value && item.href ? [{ label: item.label, value: item.value, href: item.href }] : [],
      ) ?? staticAboutData.contact,
  };
}

async function loadCmsContent(): Promise<GalleryContent> {
  const client = getSanityClient();

  if (!client) {
    return staticContent;
  }

  const [cmsPhotos, cmsStories, cmsSiteSettings] = await Promise.all([
    client.fetch<CmsPhoto[]>(cmsPhotosQuery),
    client.fetch<CmsStory[]>(cmsStoriesQuery),
    client.fetch<CmsSiteSettings | null>(cmsSiteSettingsQuery),
  ]);

  const photos = cmsPhotos.map(toPhoto).filter((photo): photo is Photo => photo !== null);
  const heroPhoto =
    photos.find((photo) => photo.isHero) ??
    photos.find((photo) => photo.id === cmsSiteSettings?.heroPhoto?.id) ??
    toReferencedPhoto(cmsSiteSettings?.heroPhoto);

  if (photos.length === 0) {
    throw new Error("Sanity returned no publishable photos");
  }

  return {
    photos,
    photoMeta: toPhotoMeta(cmsPhotos),
    photoStories: toPhotoStories(cmsStories),
    aboutData: toAboutData(cmsSiteSettings),
    heroPhoto,
    source: "cms",
    isLoading: false,
  };
}

export function useGalleryContent() {
  const [content, setContent] = useState<GalleryContent>(() => ({
    ...staticContent,
    isLoading: isSanityConfigured(),
  }));

  useEffect(() => {
    if (!isSanityConfigured()) {
      return;
    }

    let isMounted = true;

    loadCmsContent()
      .then((cmsContent) => {
        if (isMounted) {
          setContent(cmsContent);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setContent({
            ...staticContent,
            error: error instanceof Error ? error.message : "Failed to load Sanity content",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return content;
}
