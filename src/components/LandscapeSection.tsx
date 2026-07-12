import { useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "../data/photos";
import { imageSrcSet, sizedImageUrl } from "../lib/imageUrl";

const ARROW_PATH_NEXT = "m9 18 6-6-6-6";
const ARROW_PATH_PREV = "m15 18-6-6 6-6";

const AUTOPLAY_MS = 3000;

type LandscapeSectionProps = {
  id: string;
  title: string;
  photos: Photo[];
  onOpen: (photo: Photo, carouselPhotos: Photo[]) => void;
  className?: string;
  showTitle?: boolean;
  filterLandscape?: boolean;
};

export function LandscapeSection({
  id,
  title,
  photos,
  onOpen,
  className,
  showTitle = true,
  filterLandscape = true,
}: LandscapeSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const landscapePhotos = useMemo(
    () => (filterLandscape ? photos.filter((photo) => photo.width > photo.height) : photos),
    [filterLandscape, photos],
  );

  const total = landscapePhotos.length;
  const isFirst = total > 0 && activeIndex === 0;
  const isLast = total > 0 && activeIndex === total - 1;
  const active = total > 0 ? landscapePhotos[activeIndex] : undefined;
  const previous =
    previousIndex !== null && previousIndex !== activeIndex
      ? landscapePhotos[previousIndex]
      : undefined;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || isPaused || total === 0 || activeIndex >= total - 1) return undefined;
    const timer = window.setTimeout(() => {
      if (mainRef.current?.matches(":hover, :focus-visible")) {
        setIsPaused(true);
        return;
      }
      setActiveIndex((index) => {
        const nextIndex = Math.min(total - 1, index + 1);
        if (nextIndex !== index) {
          setTransitionDirection("next");
          setPreviousIndex(index);
        }
        return nextIndex;
      });
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isPaused, total]);

  useEffect(() => {
    if (previousIndex === null) return undefined;
    const timer = window.setTimeout(() => setPreviousIndex(null), 760);
    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children.item(activeIndex) as HTMLElement | undefined;
    if (!child) return;
    const container = track.parentElement;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const trackWidth = track.scrollWidth;
    const maxScroll = Math.max(0, trackWidth - containerWidth);
    const desiredScroll = child.offsetLeft - (containerWidth - child.offsetWidth) / 2;
    const scroll = Math.max(0, Math.min(maxScroll, desiredScroll));
    track.style.transform = `translate3d(${-scroll}px, 0, 0)`;
  }, [activeIndex, total]);

  if (!active) return null;

  const changeActiveIndex = (getNextIndex: (index: number) => number) => {
    setActiveIndex((index) => {
      const nextIndex = getNextIndex(index);
      if (nextIndex !== index) {
        setTransitionDirection(nextIndex > index ? "next" : "prev");
        setPreviousIndex(index);
      }
      return nextIndex;
    });
  };
  const goPrev = () => changeActiveIndex((index) => Math.max(0, index - 1));
  const goNext = () => changeActiveIndex((index) => Math.min(total - 1, index + 1));
  const caption = active.title
    .replace(/^[A-Z]+_/i, "")
    .replace(/[_-]+/g, " ")
    .trim();

  return (
    <section
      ref={sectionRef}
      className={`landscape-section${className ? ` ${className}` : ""}`}
      id={id}
      aria-label={showTitle ? undefined : `${title} gallery`}
      aria-labelledby={showTitle ? `${id}-title` : undefined}
    >
      {showTitle ? (
        <div className="featured-title-bar">
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
      ) : null}

      <div className="landscape-stage">
        {!isFirst && (
          <button
            type="button"
            className="landscape-arrow landscape-arrow--prev"
            aria-label={`Previous ${title} photo`}
            onClick={goPrev}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={ARROW_PATH_PREV} />
            </svg>
          </button>
        )}

        <button
          ref={mainRef}
          type="button"
          className={`landscape-main${active.width < active.height ? " landscape-main--portrait" : ""}`}
          style={{ aspectRatio: `${active.width} / ${active.height}` }}
          onClick={() => onOpen(active, landscapePhotos)}
          onBlur={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
          aria-label={`Open ${caption}`}
        >
          {previous ? (
            <img
              className={`landscape-image landscape-image--previous landscape-image--${transitionDirection}`}
              src={sizedImageUrl(previous.src, 1800, 84)}
              srcSet={imageSrcSet(previous.src, [900, 1400, 2000], 84)}
              sizes="100vw"
              alt=""
              decoding="async"
            />
          ) : null}
          <img
            className={`landscape-image landscape-image--active${previous ? ` landscape-image--${transitionDirection}` : ""}`}
            src={sizedImageUrl(active.src, 1800, 84)}
            srcSet={imageSrcSet(active.src, [900, 1400, 2000], 84)}
            sizes="100vw"
            alt={caption}
            loading="lazy"
            decoding="async"
          />
          <span className="landscape-caption">{caption}</span>
        </button>

        {!isLast && (
          <button
            type="button"
            className="landscape-arrow landscape-arrow--next"
            aria-label={`Next ${title} photo`}
            onClick={goNext}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={ARROW_PATH_NEXT} />
            </svg>
          </button>
        )}
      </div>

      <div className="landscape-thumbs" role="tablist" aria-label={`${title} thumbnails`}>
        <div ref={trackRef} className="landscape-thumbs-track">
          {landscapePhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              className={`landscape-thumb ${index === activeIndex ? "is-active" : ""}`}
              aria-selected={index === activeIndex}
              aria-label={`Select ${photo.title}`}
              onClick={() => changeActiveIndex(() => index)}
            >
              <img
                src={sizedImageUrl(photo.src, 420, 76)}
                srcSet={imageSrcSet(photo.src, [280, 420, 560], 76)}
                sizes="140px"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
