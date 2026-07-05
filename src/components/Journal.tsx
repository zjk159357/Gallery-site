import type { Photo } from "../data/photos";
import { JournalSection } from "./PhotoStory";

type JournalProps = {
  photos: Photo[];
};

export function Journal({ photos }: JournalProps) {
  return (
    <article className="story-page">
      <JournalSection photos={photos} />
    </article>
  );
}