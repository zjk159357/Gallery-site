import type { Photo } from "../data/photos";

export type FeatureCard = {
  id: string;
  title: string;
  photo: Photo;
};

type FeatureCardsProps = {
  cards: FeatureCard[];
  onOpen: (photo: Photo) => void;
  onNavigate?: (id: string) => void;
};

export function FeatureCards({ cards, onOpen, onNavigate }: FeatureCardsProps) {
  return (
    <div className="feature-grid" aria-label="Featured photography groups">
      {cards.map(({ id, title, photo }) => (
        <button
          type="button"
          className="feature-card"
          key={id}
          onClick={() => (onNavigate ? onNavigate(id) : onOpen(photo))}
          aria-label={`Open ${title}`}
        >
          <img
            src={photo.src}
            alt={`${title} ${photo.title}`}
            loading="eager"
            decoding="async"
          />
          <span>{title}</span>
        </button>
      ))}
    </div>
  );
}