import type { Photo } from "../data/photos";

type GallerySectionsProps = {
  photos: Photo[];
  onOpen: (index: number) => void;
};

type PhotoGroup = {
  id: string;
  title: string;
  photos: Photo[];
  variant?: "square" | "cinema" | "mixed";
};

const byCategory = (photos: Photo[], category: string, count: number, offset = 0) =>
  photos.filter((photo) => photo.category === category).slice(offset, offset + count);

const byAspect = (photos: Photo[], kind: "landscape" | "portrait" | "square") =>
  photos.filter((photo) => {
    const ratio = photo.width / photo.height;
    if (kind === "landscape") return ratio > 1.2;
    if (kind === "portrait") return ratio < 0.82;
    return ratio >= 0.82 && ratio <= 1.2;
  });

const landscapeOnly = (items: Photo[]) => items.filter((photo) => photo.width / photo.height > 1.2);

const photoIndex = (photos: Photo[], photo: Photo) => photos.findIndex((item) => item.id === photo.id);

function uniquePhotos(...groups: Photo[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((photo) => {
    if (seen.has(photo.id)) return false;
    seen.add(photo.id);
    return true;
  });
}

function GalleryRail({
  group,
  allPhotos,
  onOpen,
  showTitle = true,
}: {
  group: PhotoGroup;
  allPhotos: Photo[];
  onOpen: (index: number) => void;
  showTitle?: boolean;
}) {
  return (
    <section
      className="collection-section"
      id={group.id}
      aria-label={showTitle ? undefined : `${group.title} gallery`}
      aria-labelledby={showTitle ? `${group.id}-title` : undefined}
    >
      {showTitle ? (
        <div className="section-title-row">
          <h2 id={`${group.id}-title`}>{group.title}</h2>
        </div>
      ) : null}

      <div className={`gallery-rail gallery-rail--${group.variant ?? "cinema"}`}>
        {group.photos.map((photo) => (
          <button
            type="button"
            className="rail-photo"
            key={`${group.id}-${photo.id}`}
            onClick={() => onOpen(photoIndex(allPhotos, photo))}
            aria-label={`Open ${group.title} ${photo.title}`}
          >
            <img src={photo.src} alt={`${photo.category} ${photo.title}`} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </section>
  );
}

function BannerImage({ photo, allPhotos, onOpen }: { photo: Photo | undefined; allPhotos: Photo[]; onOpen: (index: number) => void }) {
  if (!photo) return null;

  return (
    <button type="button" className="wide-banner" onClick={() => onOpen(photoIndex(allPhotos, photo))} aria-label={`Open ${photo.title}`}>
      <img src={photo.src} alt={`${photo.category} ${photo.title}`} loading="lazy" decoding="async" />
    </button>
  );
}

export function GallerySections({ photos, onOpen }: GallerySectionsProps) {
  const landscapeCandidates = uniquePhotos(
    byCategory(photos, "山野", 9),
    byCategory(photos, "日出日落", 8),
    byCategory(photos, "河流", 2),
    byCategory(photos, "海洋", 3),
  );
  const landscape = uniquePhotos(landscapeOnly(landscapeCandidates), landscapeCandidates);
  const cityCandidates = uniquePhotos(byCategory(photos, "石塘度假区", 18), byCategory(photos, "建筑", 2));
  const city = uniquePhotos(landscapeOnly(cityCandidates), cityCandidates);
  const plantCandidates = uniquePhotos(byCategory(photos, "花朵", 9), byCategory(photos, "森林", 5));
  const plants = uniquePhotos(landscapeOnly(plantCandidates), plantCandidates);
  const squareSet = byAspect(photos, "square").slice(0, 8);
  const mixedArchive = uniquePhotos(byAspect(photos, "portrait"), byAspect(photos, "landscape"), photos).slice(0, 30);

  const featureCards = [
    { id: "balcony-view", title: "Balcony View", photo: city[0] ?? photos[0] },
    { id: "auckland", title: "Auckland", photo: byCategory(photos, "海洋", 1)[0] ?? landscape[0] },
    { id: "australia", title: "Australia", photo: landscape[1] ?? landscape[0] },
  ];

  const groups: PhotoGroup[] = [
    { id: "landscape", title: "Landscape", photos: landscape.slice(0, 24), variant: "cinema" },
    { id: "quiet", title: "----", photos: squareSet.length ? squareSet : plants.slice(0, 8), variant: "square" },
    { id: "city", title: "City", photos: city.slice(0, 22), variant: "cinema" },
    { id: "plants", title: "Plants", photos: plants.slice(0, 18), variant: "cinema" },
  ];

  const bannerOne = byCategory(photos, "石塘度假区", 1, 8)[0] ?? city[0];
  const bannerTwo = plants.find((photo) => photo.width > photo.height) ?? plants[0];

  return (
    <section className="reference-content" id="photography" aria-label="Photography archive">
      <div className="feature-grid" aria-label="Featured photography groups">
        {featureCards.map(({ id, title, photo }) => (
          <button
            type="button"
            className="feature-card"
            key={id}
            onClick={() => onOpen(photoIndex(photos, photo))}
            aria-label={`Open ${title}`}
          >
            <img src={photo.src} alt={`${title} ${photo.title}`} loading="eager" decoding="async" />
            <span>{title}</span>
          </button>
        ))}
      </div>

      <GalleryRail group={groups[0]} allPhotos={photos} onOpen={onOpen} />
      <GalleryRail group={groups[1]} allPhotos={photos} onOpen={onOpen} />
      <BannerImage photo={bannerOne} allPhotos={photos} onOpen={onOpen} />
      <GalleryRail group={groups[2]} allPhotos={photos} onOpen={onOpen} />
      <div className="section-title-row section-title-row--compact">
        <h2>Plants</h2>
      </div>
      <BannerImage photo={bannerTwo} allPhotos={photos} onOpen={onOpen} />
      <GalleryRail group={groups[3]} allPhotos={photos} onOpen={onOpen} showTitle={false} />

      <section className="archive-wall" aria-label="Extended photography wall">
        {mixedArchive.map((photo) => (
          <button
            type="button"
            className="archive-photo"
            key={`archive-${photo.id}`}
            onClick={() => onOpen(photoIndex(photos, photo))}
            aria-label={`Open archive ${photo.title}`}
          >
            <img src={photo.src} alt={`${photo.category} ${photo.title}`} loading="eager" decoding="async" />
          </button>
        ))}
      </section>
    </section>
  );
}
