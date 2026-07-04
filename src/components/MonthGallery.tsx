import type { Photo } from "../data/photos";
import { MarchTestGallery } from "./MarchTestGallery";
import { SectionCarousel } from "./SectionCarousel";
import { SectionGrid } from "./SectionGrid";
import { SectionStack } from "./SectionStack";
import { TestCarousel } from "./TestCarousel";

export type SectionBlock =
  | { kind: "carousel"; photos: Photo[] }
  | { kind: "stack"; photos: Photo[] }
  | { kind: "grid"; photos: Photo[]; columns?: number }
  | { kind: "march-test"; photos: Photo[] }
  | { kind: "test-carousel"; photos: Photo[] };

type MonthGalleryProps = {
  title: string;
  blocks: SectionBlock[];
  onOpen: (photo: Photo) => void;
};

export function MonthGallery({ title, blocks, onOpen }: MonthGalleryProps) {
  const visible = blocks.filter((block) => block.photos.length > 0 || block.kind === "march-test");
  if (visible.length === 0) return null;

  return (
    <section className="month-gallery" aria-label={title}>
      <div className="month-title-bar">
        <h2>{title}</h2>
      </div>

      {visible.map((block, index) => {
        const key = `${title}-${block.kind}-${index}`;
        if (block.kind === "carousel") {
          return <SectionCarousel key={key} photos={block.photos} onOpen={onOpen} />;
        }
        if (block.kind === "stack") {
          return <SectionStack key={key} photos={block.photos} onOpen={onOpen} />;
        }
        if (block.kind === "march-test") {
          return <MarchTestGallery key={key} title={title} photos={block.photos} onOpen={onOpen} showTitleBar={false} />;
        }
        if (block.kind === "test-carousel") {
          return <TestCarousel key={key} title={title} photos={block.photos} showTitleBar={false} />;
        }
        return <SectionGrid key={key} photos={block.photos} columns={block.columns} onOpen={onOpen} />;
      })}
    </section>
  );
}