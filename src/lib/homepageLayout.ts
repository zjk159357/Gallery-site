import type { Photo } from "../data/photos";

export type HomepageFeatureCard = {
  title: string;
  photo: Photo;
  href?: string;
};

export type HomepageLayout = {
  featureCards?: HomepageFeatureCard[];
  landscapePhotos?: Photo[];
  quietPhotos?: Photo[];
  bannerOnePhoto?: Photo;
  cityPhotos?: Photo[];
  plantsHeroPhoto?: Photo;
  plantsCarouselPhotos?: Photo[];
  plantsFeaturePhoto?: Photo;
  plantsStackPhotos?: Photo[];
  plantsSquarePhotos?: Photo[];
};
