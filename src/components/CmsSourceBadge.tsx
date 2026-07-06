import type { GalleryContent } from "../lib/galleryContent";

type CmsSourceBadgeProps = {
  content: GalleryContent;
};

export function CmsSourceBadge({ content }: CmsSourceBadgeProps) {
  if (!import.meta.env.DEV) {
    return null;
  }

  const { source, photos, isLoading, error } = content;
  const count = photos.length;
  const stateClass = error ? "is-error" : isLoading ? "is-loading" : `is-${source}`;

  return (
    <div className="cms-source-badge" data-state={stateClass} role="status" aria-live="polite">
      <span className="cms-source-badge__dot" aria-hidden="true" />
      <span className="cms-source-badge__label">
        CMS: <strong>{source}</strong>
      </span>
      <span className="cms-source-badge__count">{count} photos</span>
      {isLoading && <span className="cms-source-badge__hint">loading…</span>}
      {error && <span className="cms-source-badge__hint">error: {error}</span>}
    </div>
  );
}
