import type { Photo } from "../data/photos";

export type PhotobalconyLayout = {
  heroPhoto?: Photo;
  mayTitle?: string;
  marchTitle?: string;
  februaryTitle?: string;
  januaryTitle?: string;
  winterTitle?: string;
  summerTitle?: string;
  mayPhotos?: Photo[];
  marchPortraitPhotos?: Photo[];
  marchWidePhotos?: Photo[];
  februaryPhotos?: Photo[];
  januaryPhotos?: Photo[];
  winterPhotos?: Photo[];
  summerPhotos?: Photo[];
};
