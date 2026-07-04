import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Photo } from "../data/photos";
import { GalleryLightbox } from "./GalleryLightbox";

type TestCarouselProps = {
  title: string;
  photos: Photo[];
  showTitleBar?: boolean;
};

export function TestCarousel({ title, photos, showTitleBar = true }: TestCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(0);
  }, [photos]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (lightboxIndex >= 0) return;
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + photos.length) % photos.length);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % photos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length, lightboxIndex]);

  if (photos.length === 0) {
    if (!showTitleBar) return null;
    return (
      <section className="test-carousel-page" aria-label={title}>
        <header className="test-carousel-title-bar">
          <h1>{title}</h1>
        </header>
        <p className="test-carousel-empty">No photos available.</p>
      </section>
    );
  }

  const active = photos[activeIndex];
  const goPrev = () => setActiveIndex((index) => (index - 1 + photos.length) % photos.length);
  const goNext = () => setActiveIndex((index) => (index + 1) % photos.length);

  const lightboxIndexInAll = lightboxIndex >= 0 ? activeIndex : -1;

  return (
    <section className={showTitleBar ? "test-carousel-page" : "test-carousel-embed"} aria-label={title}>
      {showTitleBar && (
        <header className="test-carousel-title-bar">
          <h1>{title}</h1>
        </header>
      )}

      <div className="test-carousel-stage">
        <button
          type="button"
          className="test-carousel-arrow test-carousel-arrow--prev"
          aria-label="Previous photo"
          onClick={goPrev}
        >
          <ChevronLeft size={44} strokeWidth={1.4} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="test-carousel-main"
          onClick={() => setLightboxIndex(activeIndex)}
          aria-label={`Open ${active.title}`}
        >
          <img
            src={active.src}
            alt={`${active.category} ${active.title}`}
            width={active.width}
            height={active.height}
            decoding="async"
          />
        </button>

        <button
          type="button"
          className="test-carousel-arrow test-carousel-arrow--next"
          aria-label="Next photo"
          onClick={goNext}
        >
          <ChevronRight size={44} strokeWidth={1.4} aria-hidden="true" />
        </button>
      </div>

      <GalleryLightbox
        photos={photos}
        index={lightboxIndexInAll}
        onClose={() => setLightboxIndex(-1)}
        onView={(index) => {
          setActiveIndex(index);
          setLightboxIndex(index);
        }}
      />
    </section>
  );
}