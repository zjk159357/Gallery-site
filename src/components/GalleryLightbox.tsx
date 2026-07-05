import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "../data/photos";
import { photoMeta, photoStories } from "../data/stories";

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

          const meta = photoMeta[photo.filename];
          const story = photoStories[photo.filename];
          const title = story?.title ?? photo.title;

          return (
            <div className="lightbox-meta">
              <div className="lightbox-meta-main">
                <p>{title}</p>
                <span>{meta?.location ?? photo.category}</span>
                {meta ? (
                  <dl className="lightbox-meta-list">
                    <div>
                      <dt>日期</dt>
                      <dd>{meta.date}</dd>
                    </div>
                    <div>
                      <dt>器材</dt>
                      <dd>{meta.camera}</dd>
                    </div>
                    <div>
                      <dt>镜头</dt>
                      <dd>{meta.lens}</dd>
                    </div>
                    <div>
                      <dt>参数</dt>
                      <dd>{`${meta.focalLength} · ${meta.aperture} · ${meta.shutter} · ISO ${meta.iso}`}</dd>
                    </div>
                  </dl>
                ) : null}
                {story ? (
                  <a className="lightbox-story-link" href="/journal">
                    查看手记
                  </a>
                ) : null}
              </div>
              <span className="lightbox-count">{`${photoIndex + 1} / ${photos.length}`}</span>
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
