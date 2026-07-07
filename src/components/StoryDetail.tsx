import type { Photo } from "../data/photos";
import type { PhotoStory } from "../data/stories";
import { photoPath } from "../lib/routes";

type StoryDetailProps = {
  photo: Photo;
  story: PhotoStory;
};

export function StoryDetail({ photo, story }: StoryDetailProps) {
  return (
    <article className="detail-page story-detail-page">
      <header className="detail-hero">
        <p className="detail-kicker">{photo.category} / {photo.filename}</p>
        <h1>{story.title}</h1>
        {story.excerpt ? <p className="detail-lede">{story.excerpt}</p> : null}
      </header>

      <figure className="story-detail-cover">
        <img src={photo.src} alt={`${photo.category} ${photo.title}`} width={photo.width} height={photo.height} />
      </figure>

      <div className="story-detail-body">
        {story.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <footer className="detail-related">
        <h2>Related Photo</h2>
        <a className="detail-related-link" href={photoPath(photo)}>
          <span>{photo.title}</span>
          <small>{photo.category} / {photo.filename}</small>
        </a>
      </footer>
    </article>
  );
}
