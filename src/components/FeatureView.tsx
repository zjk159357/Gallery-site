import { MonthGallery, type SectionBlock } from "./MonthGallery";
import type { Photo } from "../data/photos";

export type FeatureViewGroup = {
  id: string;
  title: string;
  blocks: SectionBlock[];
};

type FeatureViewProps = {
  title: string;
  heroPhoto: Photo;
  groups: FeatureViewGroup[];
  onOpen: (photo: Photo) => void;
};

export function FeatureView({ title, heroPhoto, groups, onOpen }: FeatureViewProps) {
  return (
    <article className="feature-view" aria-label={title}>
      <section className="feature-view-hero" aria-label={`${title} hero`}>
        <img className="feature-view-hero-image" src={heroPhoto.src} alt="" aria-hidden="true" />
      </section>

      {groups.map((group) => (
        <MonthGallery key={group.id} title={group.title} blocks={group.blocks} onOpen={onOpen} />
      ))}
    </article>
  );
}