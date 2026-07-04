import type { Photo } from "../data/photos";

type MarchTestGalleryProps = {
  title: string;
  photos: Photo[];
  onOpen: (photo: Photo) => void;
  showTitleBar?: boolean;
};

export function MarchTestGallery({ title, photos, onOpen, showTitleBar = true }: MarchTestGalleryProps) {
  if (photos.length === 0) return null;

  return (
    <section className="march-test-gallery" aria-label={title}>
      {showTitleBar && (
        <div className="march-test-title-bar">
          <h2>{title}</h2>
        </div>
      )}

      <div className="march-test-rail" role="list">
        {photos.map((photo) => (
          <button
            type="button"
            key={photo.id}
            role="listitem"
            className="march-test-photo"
            onClick={() => onOpen(photo)}
            aria-label={`Open ${photo.title}`}
          >
            <img
              src={photo.src}
              alt={`${photo.category} ${photo.title}`}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
