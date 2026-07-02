import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "../data/photos";

type GalleryLightboxProps = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onView: (index: number) => void;
};

export function GalleryLightbox({ photos, index, onClose, onView }: GalleryLightboxProps) {
  const slides = photos.map((photo) => ({
    src: photo.src,
    alt: `${photo.category} ${photo.title}`,
    width: photo.width,
    height: photo.height,
  }));

  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index >= 0 ? index : 0}
      slides={slides}
      carousel={{ finite: false, preload: 2 }}
      controller={{ closeOnBackdropClick: true }}
      on={{
        view: ({ index: nextIndex }) => onView(nextIndex),
      }}
      render={{
        slideFooter: ({ slide }) => {
          const photoIndex = photos.findIndex((photo) => photo.src === slide.src);
          const photo = photoIndex >= 0 ? photos[photoIndex] : photos[index];

          if (!photo) {
            return null;
          }

          return (
            <div className="lightbox-meta">
              <div>
                <p>{photo.title}</p>
                <span>{photo.category}</span>
              </div>
              <span>{`${photoIndex + 1} / ${photos.length}`}</span>
            </div>
          );
        },
      }}
      styles={{
        root: {
          "--yarl__color_backdrop": "#050505",
        },
      }}
    />
  );
}
