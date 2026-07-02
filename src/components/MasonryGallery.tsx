import type { Photo } from "../data/photos";

type MasonryGalleryProps = {
  photos: Photo[];
  onOpen: (index: number) => void;
};

export function MasonryGallery({ photos, onOpen }: MasonryGalleryProps) {
  return (
    <div className="masonry-grid" aria-live="polite">
      {photos.map((photo, index) => (
        <figure className="gallery-item" key={photo.id}>
          <button
            type="button"
            className="gallery-image-button"
            onClick={() => onOpen(index)}
            aria-label={`Open ${photo.category} ${photo.title}`}
          >
            <img
              src={photo.src}
              alt={`${photo.category} ${photo.title}`}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="gallery-caption">
              <span>{photo.category}</span>
              <span>{photo.title}</span>
            </figcaption>
          </button>
        </figure>
      ))}
    </div>
  );
}
