export type CmsPhoto = {
  id: string;
  src: string;
  legacyPublicPath?: string;
  title: string;
  slug?: string;
  category: string;
  filename: string;
  width: number;
  height: number;
  isHero?: boolean;
  date?: string;
  location?: string;
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  focalLength?: string;
};

export type CmsStory = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  body?: PortableTextBlock[];
  coverPhoto?: CmsStoryPhoto;
  relatedPhotos?: CmsStoryPhoto[];
};

export type CmsSiteSettings = {
  siteTitle?: string;
  heroPhoto?: CmsStoryPhoto;
  aboutName?: string;
  aboutLocation?: string;
  aboutBio?: PortableTextBlock[];
  gear?: { name?: string; value?: string }[];
  socialLinks?: { label?: string; value?: string; href?: string }[];
};

export type PortableTextBlock = {
  _type?: string;
  children?: { text?: string }[];
};

type CmsStoryPhoto = {
  id?: string;
  title?: string;
  slug?: string;
  src?: string;
  legacyPublicPath?: string;
  filename?: string;
  width?: number;
  height?: number;
};

export const cmsPhotosQuery = `*[_type == "photo" && isHidden != true] | order(sortOrder asc, date desc) {
  "id": _id,
  "src": image.asset->url,
  "legacyPublicPath": legacyPublicPath,
  title,
  "slug": slug.current,
  "category": category->title,
  "filename": sourceFilename,
  "width": coalesce(image.asset->metadata.dimensions.width, dimensions.width),
  "height": coalesce(image.asset->metadata.dimensions.height, dimensions.height),
  isHero,
  date,
  location,
  camera,
  lens,
  aperture,
  shutter,
  iso,
  focalLength
}`;

export const cmsCategoriesQuery = `*[_type == "category" && isVisible != false] | order(sortOrder asc, title asc) {
  "id": _id,
  title,
  "slug": slug.current,
  description,
  "coverPhotoId": coverPhoto->_id
}`;

export const cmsStoriesQuery = `*[_type == "story"] | order(publishedAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  body,
  "coverPhoto": coverPhoto->{
    "id": _id,
    title,
    "slug": slug.current,
    "src": image.asset->url,
    "legacyPublicPath": legacyPublicPath,
    "filename": sourceFilename,
    "width": coalesce(image.asset->metadata.dimensions.width, dimensions.width),
    "height": coalesce(image.asset->metadata.dimensions.height, dimensions.height)
  },
  "relatedPhotos": relatedPhotos[]->{
    "id": _id,
    title,
    "slug": slug.current,
    "src": image.asset->url,
    "legacyPublicPath": legacyPublicPath,
    "filename": sourceFilename,
    "width": coalesce(image.asset->metadata.dimensions.width, dimensions.width),
    "height": coalesce(image.asset->metadata.dimensions.height, dimensions.height)
  }
}`;

export const cmsSiteSettingsQuery = `*[_type == "siteSettings"][0] {
  siteTitle,
  "heroPhoto": heroPhoto->{
    "id": _id,
    title,
    "slug": slug.current,
    "src": image.asset->url,
    "legacyPublicPath": legacyPublicPath,
    "filename": sourceFilename,
    "width": coalesce(image.asset->metadata.dimensions.width, dimensions.width),
    "height": coalesce(image.asset->metadata.dimensions.height, dimensions.height)
  },
  aboutName,
  aboutLocation,
  aboutBio,
  gear,
  socialLinks
}`;
