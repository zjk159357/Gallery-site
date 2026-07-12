import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Photo } from "../data/photos";
import type { PhotoMeta, PhotoStory } from "../data/stories";
import { sizedImageUrl } from "../lib/imageUrl";
import type { PhotobalconyLayout } from "../lib/photobalconyLayout";
import { photoPath } from "../lib/routes";
import { AdvancedPhotoLightbox } from "./AdvancedPhotoLightbox";

type BalconyViewProps = {
  photos: Photo[];
  layout?: PhotobalconyLayout;
  photoMeta?: Record<string, PhotoMeta>;
  photoStories?: Record<string, PhotoStory[]>;
};

type BalconyCarouselProps = {
  title: string;
  photos: Photo[];
  onOpen: (photo: Photo) => void;
};

type PhotoButtonProps = {
  photo: Photo;
  className: string;
  loading?: "eager" | "lazy";
  onOpen: (photo: Photo) => void;
};

const CAROUSEL_TRANSITION_MS = 760;

const byFilenames = (photos: Photo[], filenames: string[]) =>
  filenames.flatMap((filename) => {
    const photo = photos.find((item) => item.filename === filename);
    return photo ? [photo] : [];
  });

const configuredPhotos = (layout: PhotobalconyLayout | undefined, configured: Photo[] | undefined, fallback: Photo[]) =>
  layout ? (configured ?? []) : fallback;

function uniquePhotos(...groups: Photo[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((photo) => {
    if (seen.has(photo.src)) return false;
    seen.add(photo.src);
    return true;
  });
}

function PhotoButton({ photo, className, loading = "lazy", onOpen }: PhotoButtonProps) {
  return (
    <button type="button" className={className} onClick={() => onOpen(photo)} aria-label={`Open ${photo.title}`}>
      <img
        src={sizedImageUrl(photo.src, 900)}
        srcSet={`${sizedImageUrl(photo.src, 700)} 700w, ${sizedImageUrl(photo.src, 1100)} 1100w`}
        sizes="(max-width: 700px) 92vw, 32vw"
        alt={`${photo.category} ${photo.title}`}
        width={photo.width}
        height={photo.height}
        loading={loading}
        decoding="async"
      />
    </button>
  );
}

function MonthTitle({ title }: { title: string }) {
  return (
    <header className="balcony-month-title">
      <h2>{title}</h2>
    </header>
  );
}

function BalconyCarousel({ title, photos, onOpen }: BalconyCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev">("next");
  const active = photos[activeIndex];
  const previous = previousIndex === null ? undefined : photos[previousIndex];

  useEffect(() => {
    if (previousIndex === null) return undefined;
    const timer = window.setTimeout(() => setPreviousIndex(null), CAROUSEL_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  const changeSlide = (direction: "next" | "prev") => {
    setTransitionDirection(direction);
    setActiveIndex((index) => {
      setPreviousIndex(index);
      return direction === "next" ? (index + 1) % photos.length : (index - 1 + photos.length) % photos.length;
    });
  };
  const goPrev = () => changeSlide("prev");
  const goNext = () => changeSlide("next");

  if (photos.length === 0) return null;

  return (
    <section className="balcony-carousel" aria-label={`${title} slideshow`}>
      <button
        type="button"
        className="balcony-carousel-arrow balcony-carousel-arrow--prev"
        aria-label={`Previous ${title} photo`}
        onClick={goPrev}
      >
        <ChevronLeft size={42} strokeWidth={1.3} aria-hidden="true" />
      </button>

      <button
        type="button"
        className="balcony-carousel-main"
        onClick={() => onOpen(active)}
        aria-label={`Open ${active.title}`}
      >
        {previous ? (
          <img
            key={`previous-${previous.id}`}
            className={`balcony-carousel-image balcony-carousel-image--previous balcony-carousel-image--${transitionDirection}`}
            src={sizedImageUrl(previous.src, 1500, 86)}
            srcSet={`${sizedImageUrl(previous.src, 1100)} 1100w, ${sizedImageUrl(previous.src, 1700, 86)} 1700w`}
            sizes="(max-width: 900px) 100vw, 76vw"
            alt=""
            decoding="async"
          />
        ) : null}
        <img
          key={`active-${active.id}`}
          className={`balcony-carousel-image${previous ? ` balcony-carousel-image--active balcony-carousel-image--${transitionDirection}` : ""}`}
          src={sizedImageUrl(active.src, 1500, 86)}
          srcSet={`${sizedImageUrl(active.src, 1100)} 1100w, ${sizedImageUrl(active.src, 1700, 86)} 1700w`}
          sizes="(max-width: 900px) 92vw, 76vw"
          alt={`${active.category} ${active.title}`}
          width={active.width}
          height={active.height}
          loading="eager"
          decoding="async"
        />
      </button>

      <button
        type="button"
        className="balcony-carousel-arrow balcony-carousel-arrow--next"
        aria-label={`Next ${title} photo`}
        onClick={goNext}
      >
        <ChevronRight size={42} strokeWidth={1.3} aria-hidden="true" />
      </button>
    </section>
  );
}

export function BalconyView({ photos, layout, photoMeta, photoStories }: BalconyViewProps) {
  const [lightboxState, setLightboxState] = useState<{ photos: Photo[]; index: number } | null>(null);

  const content = useMemo(() => {
    const fallbackHero =
      photos.find((photo) => photo.filename === "DSC_0243.JPG") ??
      photos.find((photo) => photo.category === "石塘度假区") ??
      photos[0];

    const fallbackMay = byFilenames(photos, ["DSC_0257.JPG", "DSC_0518.JPG", "DSC_0521.JPG", "DSC_0522.JPG"]);
    const fallbackMarchPortraits = byFilenames(photos, ["DSC_0264.JPG", "DSC_0335.JPG", "DSC_0396.JPG", "DSC_0470.JPG"]);
    const fallbackMarchWide = byFilenames(photos, ["DSC_0534.JPG", "DSC_0555.JPG", "DSC_0566.JPG"]);
    const fallbackFebruary = byFilenames(photos, ["DSC_0580.JPG", "DSC_0613.JPG", "DSC_0626.JPG", "DSC_0632.JPG"]);
    const fallbackJanuary = byFilenames(photos, ["DSC_0513.JPG", "DSC_0514.JPG", "DSC_0520.JPG", "DSC_0538.JPG"]);
    const fallbackWinter = byFilenames(photos, ["DSC_0546.JPG", "DSC_0551.JPG", "DSC_0552.JPG", "DSC_0571.JPG"]);
    const fallbackSummer = byFilenames(photos, ["DSC_0638.JPG", "DSC_0648.JPG", "DSC_0917.JPG", "DSC_2196.JPG"]);

    const may = configuredPhotos(layout, layout?.mayPhotos, fallbackMay);
    const marchPortraits = configuredPhotos(layout, layout?.marchPortraitPhotos, fallbackMarchPortraits);
    const marchWide = configuredPhotos(layout, layout?.marchWidePhotos, fallbackMarchWide);
    const february = configuredPhotos(layout, layout?.februaryPhotos, fallbackFebruary);
    const january = configuredPhotos(layout, layout?.januaryPhotos, fallbackJanuary);
    const winter = configuredPhotos(layout, layout?.winterPhotos, fallbackWinter);
    const summer = configuredPhotos(layout, layout?.summerPhotos, fallbackSummer);

    return {
      hero: layout?.heroPhoto ?? fallbackHero,
      may,
      marchPortraits,
      marchWide,
      february,
      january,
      winter,
      summer,
      lightboxPhotos: uniquePhotos(may, marchPortraits, marchWide, february, january, winter, summer),
    };
  }, [layout, photos]);

  if (!content.hero) return null;

  const openPhoto = (photo: Photo, lightboxPhotos: Photo[]) => {
    const index = lightboxPhotos.findIndex((item) => item.src === photo.src);
    if (index >= 0) {
      setLightboxState({ photos: lightboxPhotos, index });
    }
  };

  return (
    <article className="balcony-page" aria-labelledby="balcony-title">
      <h1 id="balcony-title" className="sr-only">
        Balcony View
      </h1>

      <section className="balcony-hero" aria-label="Balcony View hero">
        <img
          src={sizedImageUrl(content.hero.src, 1800, 88)}
          srcSet={`${sizedImageUrl(content.hero.src, 1200)} 1200w, ${sizedImageUrl(content.hero.src, 2200, 88)} 2200w`}
          sizes="100vw"
          alt={`${content.hero.category} ${content.hero.title}`}
          width={content.hero.width}
          height={content.hero.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </section>

      <MonthTitle title="May 2025" />
      <BalconyCarousel title="May 2025" photos={content.may} onOpen={(photo) => openPhoto(photo, content.may)} />

      <MonthTitle title="March 2025" />
      <section className="balcony-portrait-row" aria-label="March 2025 portrait photos">
        {content.marchPortraits.map((photo) => (
          <PhotoButton key={photo.id} photo={photo} className="balcony-portrait-photo" onOpen={(item) => openPhoto(item, content.marchPortraits)} />
        ))}
      </section>
      <BalconyCarousel title="March 2025" photos={content.marchWide} onOpen={(photo) => openPhoto(photo, content.marchWide)} />

      <MonthTitle title="Feb 2025" />
      <BalconyCarousel title="Feb 2025" photos={content.february} onOpen={(photo) => openPhoto(photo, content.february)} />

      <MonthTitle title="Jan 2025" />
      <section className="balcony-grid" aria-label="Jan 2025 photo grid">
        {content.january.map((photo) => (
          <PhotoButton key={photo.id} photo={photo} className="balcony-grid-photo" onOpen={(item) => openPhoto(item, content.january)} />
        ))}
      </section>

      <MonthTitle title="Nov - Dec 2024" />
      <section className="balcony-grid balcony-grid--wide" aria-label="Nov - Dec 2024 photo grid">
        {content.winter.map((photo) => (
          <PhotoButton key={photo.id} photo={photo} className="balcony-grid-photo" onOpen={(item) => openPhoto(item, content.winter)} />
        ))}
      </section>

      <MonthTitle title="July - Aug 2024" />
      <section className="balcony-final-stack" aria-label="July - Aug 2024 photo stack">
        {content.summer.map((photo, index) => (
          <PhotoButton
            key={photo.id}
            photo={photo}
            className={index === 0 ? "balcony-final-photo balcony-final-photo--large" : "balcony-final-photo"}
            onOpen={(item) => openPhoto(item, content.summer)}
          />
        ))}
      </section>

      <AdvancedPhotoLightbox
        photos={lightboxState?.photos ?? []}
        index={lightboxState?.index ?? -1}
        onClose={() => setLightboxState(null)}
        onNavigate={(index) => {
          if (!lightboxState) return;
          setLightboxState({ photos: lightboxState.photos, index });
        }}
        photoMeta={photoMeta}
        photoStories={photoStories}
        shareUrl={
          lightboxState
            ? `${window.location.origin}${photoPath(lightboxState.photos[lightboxState.index])}`
            : undefined
        }
      />
    </article>
  );
}
