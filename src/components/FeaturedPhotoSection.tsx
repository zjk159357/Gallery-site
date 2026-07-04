import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Photo } from "../data/photos";

type FeaturedPhotoSectionProps = {
  id: string;
  title: string;
  photos: Photo[];
  onOpen: (photo: Photo) => void;
  showTitle?: boolean;
};

export function FeaturedPhotoSection({ id, title, photos, onOpen, showTitle = true }: FeaturedPhotoSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverMain, setHoverMain] = useState(false);

  const landscapePhotos = useMemo(
    () => photos.filter((photo) => photo.width > photo.height),
    [photos],
  );

  if (landscapePhotos.length === 0) return null;

  const active = landscapePhotos[activeIndex];
  const goPrev = () =>
    setActiveIndex((index) => (index - 1 + landscapePhotos.length) % landscapePhotos.length);
  const goNext = () =>
    setActiveIndex((index) => (index + 1) % landscapePhotos.length);

  const caption = active.title;

  return (
    <section className="featured-section" id={id} aria-label={title}>
      {showTitle && (
        <div className="featured-title-bar">
          <h2>{title}</h2>
        </div>
      )}

      <div className="featured-stage">
        <button
          type="button"
          className="featured-arrow featured-arrow--prev"
          aria-label="Previous photo"
          onClick={goPrev}
        >
          <ChevronLeft size={36} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="featured-main"
          onClick={() => onOpen(active)}
          onMouseEnter={() => setHoverMain(true)}
          onMouseLeave={() => setHoverMain(false)}
          onFocus={() => setHoverMain(true)}
          onBlur={() => setHoverMain(false)}
          aria-label={`Open ${caption}`}
        >
          <img
            src={active.src}
            alt={caption}
            width={active.width}
            height={active.height}
            decoding="async"
          />
          <span className={`featured-caption ${hoverMain ? "is-visible" : ""}`}>{caption}</span>
        </button>

        <button
          type="button"
          className="featured-arrow featured-arrow--next"
          aria-label="Next photo"
          onClick={goNext}
        >
          <ChevronRight size={36} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="featured-thumbs" role="tablist" aria-label={`${title} thumbnails`}>
        {landscapePhotos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            role="tab"
            className={`featured-thumb ${index === activeIndex ? "is-active" : ""}`}
            aria-selected={index === activeIndex}
            aria-label={`Select ${photo.title}`}
            onClick={() => setActiveIndex(index)}
          >
            <img
              src={photo.src}
              alt=""
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