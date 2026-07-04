import type { Photo } from "../data/photos";

type ArchiveWallProps = {
  photos: Photo[];
  onOpen: (photo: Photo) => void;
};

type Tile = {
  photo: Photo;
  className: string;
  label: string;
  priority?: "eager" | "lazy";
};

const pick = (photos: Photo[], filename: string): Photo | undefined =>
  photos.find((photo) => photo.filename === filename);

const FEATURE_FILENAME = "DSC_3343.JPG";
const TALL_FILENAME = "DSC_3247.JPG";
const TILE_A_FILENAME = "DSC_2952.JPG";
const TILE_B_FILENAME = "DSC_0243.JPG";
const BANNER_FILENAME = "DSC_0257.JPG";

function buildTiles(photos: Photo[]): Tile[] {
  const feature = pick(photos, FEATURE_FILENAME);
  const tall = pick(photos, TALL_FILENAME);
  const tileA = pick(photos, TILE_A_FILENAME);
  const tileB = pick(photos, TILE_B_FILENAME);
  const banner = pick(photos, BANNER_FILENAME);

  const tiles: Tile[] = [];

  if (feature) {
    tiles.push({ photo: feature, className: "archive-tile-feature", label: "Forest", priority: "eager" });
  }
  if (tileA) {
    tiles.push({ photo: tileA, className: "archive-tile-square", label: "Forest" });
  }
  if (tall) {
    tiles.push({ photo: tall, className: "archive-tile-tall", label: "Forest" });
  }
  if (tileB) {
    tiles.push({ photo: tileB, className: "archive-tile-square", label: "Stone Pool" });
  }
  if (banner) {
    tiles.push({ photo: banner, className: "archive-tile-cinema", label: "Stone Pool", priority: "eager" });
  }

  return tiles;
}

export function ArchiveWall({ photos, onOpen }: ArchiveWallProps) {
  const tiles = buildTiles(photos);

  return (
    <section className="archive-wall" id="archive" aria-label="Extended photography wall">
      <div className="archive-wall-head">
        <span className="archive-eyebrow">Extended</span>
        <h2 className="archive-title">Photography Wall</h2>
        <span className="archive-divider" aria-hidden="true">----</span>
        <p className="archive-subtitle">Selected frames from forest light and coastal stays.</p>
      </div>

      <div className="archive-grid" role="list">
        {tiles.map(({ photo, className, label, priority }) => (
          <button
            type="button"
            key={`${className}-${photo.id}`}
            className={`archive-photo ${className}`}
            role="listitem"
            onClick={() => onOpen(photo)}
            aria-label={`Open ${label} ${photo.title}`}
          >
            <img
              src={photo.src}
              alt={`${label} ${photo.title}`}
              width={photo.width}
              height={photo.height}
              loading={priority === "eager" ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority === "eager" ? "high" : "auto"}
            />
            <span className="archive-photo-tag">
              <span className="archive-photo-tag-dot" aria-hidden="true" />
              {label}
              <span className="archive-photo-tag-sep" aria-hidden="true" />
              {photo.title}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}