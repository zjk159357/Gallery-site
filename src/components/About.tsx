import type { AboutData } from "../data/stories";
import { AboutSection } from "./PhotoStory";

export function About({ aboutData }: { aboutData?: AboutData }) {
  return (
    <article className="story-page">
      <AboutSection aboutData={aboutData} />
    </article>
  );
}
