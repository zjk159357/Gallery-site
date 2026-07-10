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
  heroSubtitle?: string;
  aboutName?: string;
  aboutLocation?: string;
  aboutBio?: PortableTextBlock[];
  gear?: { name?: string; value?: string }[];
  socialLinks?: { label?: string; value?: string; href?: string }[];
};

export type CmsHomepageLayout = {
  featureCards?: { title?: string; href?: string; photoId?: string }[];
  landscapePhotoIds?: string[];
  quietPhotoIds?: string[];
  bannerOnePhotoId?: string;
  cityPhotoIds?: string[];
  plantsHeroPhotoId?: string;
  plantsCarouselPhotoIds?: string[];
  plantsFeaturePhotoId?: string;
  plantsStackPhotoIds?: string[];
  plantsSquarePhotoIds?: string[];
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
  isHidden?: boolean;
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

export const cmsStoriesQuery = `*[
  _type == "story" &&
  isHidden != true &&
  (!defined(publishedAt) || dateTime(publishedAt) <= dateTime(now()))
] | order(publishedAt desc) {
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
    isHidden,
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
    isHidden,
    "legacyPublicPath": legacyPublicPath,
    "filename": sourceFilename,
    "width": coalesce(image.asset->metadata.dimensions.width, dimensions.width),
    "height": coalesce(image.asset->metadata.dimensions.height, dimensions.height)
  },
  heroSubtitle,
  aboutName,
  aboutLocation,
  aboutBio,
  gear,
  socialLinks
}`;

export const cmsHomepageLayoutQuery = `*[_type == "homepageLayout"][0] {
  featureCards[]{
    title,
    href,
    "photoId": photo->_id
  },
  "landscapePhotoIds": landscapePhotos[]->_id,
  "quietPhotoIds": quietPhotos[]->_id,
  "bannerOnePhotoId": bannerOnePhoto->_id,
  "cityPhotoIds": cityPhotos[]->_id,
  "plantsHeroPhotoId": plantsHeroPhoto->_id,
  "plantsCarouselPhotoIds": plantsCarouselPhotos[]->_id,
  "plantsFeaturePhotoId": plantsFeaturePhoto->_id,
  "plantsStackPhotoIds": plantsStackPhotos[]->_id,
  "plantsSquarePhotoIds": plantsSquarePhotos[]->_id
}`;
