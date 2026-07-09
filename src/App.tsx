import { useEffect, useMemo, useState } from "react";
import { About } from "./components/About";
import { AdvancedPhotoLightbox } from "./components/AdvancedPhotoLightbox";
import { BalconyView } from "./components/BalconyView";
import { CmsSourceBadge } from "./components/CmsSourceBadge";
import { Footer } from "./components/Footer";
import { GallerySections } from "./components/GallerySections";
import { Header } from "./components/Header";
import { Journal } from "./components/Journal";
import { PhotoStory } from "./components/PhotoStory";
import { StoryDetail } from "./components/StoryDetail";
import { useGalleryContent } from "./lib/galleryContent";
import { matchesPhotoSlug, matchesStorySlug, photoPath } from "./lib/routes";

const SITE_TITLE = "Queenstown.top | Photography";
const DEFAULT_DESCRIPTION =
  "Queenstown.top 是 JiaKaiZhong 的摄影档案，记录山野、海岸、森林、花朵、城市边缘与旅行片段。";

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.append(tag);
  }
  tag.content = content;
}

function App() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/$/, "") || "/");
  const content = useGalleryContent();
  const { photos, photoMeta, photoStories, aboutData } = content;
  const pathname = currentPath;
  const isBalconyPage = pathname === "/photobalcony";
  const isStoryPage = pathname === "/photostory";
  const isAboutPage = pathname === "/about";
  const isJournalPage = pathname === "/journal";
  const isFooterPreviewPage = pathname === "/footer-preview";
  const photoRouteSlug = pathname.startsWith("/photos/") ? decodeURIComponent(pathname.slice("/photos/".length)) : "";
  const storyRouteSlug = pathname.startsWith("/stories/") ? decodeURIComponent(pathname.slice("/stories/".length)) : "";
  const showPreview = new URLSearchParams(window.location.search).has("preview");

  const heroPhoto = useMemo(() => {
    if (content.isLoading && content.source === "static") {
      return content.heroPhoto;
    }

    return content.heroPhoto
      ?? photos.find((photo) => photo.isHero)
      ?? photos.find((photo) => photo.filename === "DSC_0257.JPG")
      ?? photos[0];
  }, [content.heroPhoto, content.isLoading, content.source, photos]);

  const activePhoto = useMemo(() => {
    if (!photoRouteSlug) return undefined;
    return photos.find((photo) => matchesPhotoSlug(photo, photoRouteSlug));
  }, [photoRouteSlug, photos]);

  const activePhotoIndex = useMemo(() => {
    if (!photoRouteSlug) return -1;
    return photos.findIndex((photo) => matchesPhotoSlug(photo, photoRouteSlug));
  }, [photoRouteSlug, photos]);

  const activeStory = useMemo(() => {
    if (!storyRouteSlug) return undefined;

    for (const [filename, stories] of Object.entries(photoStories)) {
      const photo = photos.find((item) => item.filename === filename);
      if (!photo) continue;

      const story = stories.find((item) => matchesStorySlug(item, storyRouteSlug, photo));
      if (story) {
        return { photo, story };
      }
    }

    return undefined;
  }, [photoStories, photos, storyRouteSlug]);

  const advancedLightboxIndex = activePhotoIndex >= 0 ? activePhotoIndex : lightboxIndex;

  const setBrowserPath = (path: string, mode: "push" | "replace" = "push") => {
    if (window.location.pathname === path) {
      setCurrentPath(path.replace(/\/$/, "") || "/");
      return;
    }

    window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", path);
    setCurrentPath(path.replace(/\/$/, "") || "/");
  };

  useEffect(() => {
    if (!photoRouteSlug || !activePhoto) return;

    const canonicalPath = photoPath(activePhoto);
    if (pathname !== canonicalPath) {
      setBrowserPath(canonicalPath, "replace");
    }
  }, [activePhoto, photoRouteSlug, pathname]);

  const openPhoto = (index: number) => {
    const photo = photos[index];
    if (!photo) return;

    setLightboxIndex(index);
    setBrowserPath(photoPath(photo), "push");
  };

  const navigatePhoto = (index: number) => {
    const photo = photos[index];
    if (!photo) return;

    setLightboxIndex(index);
    setBrowserPath(photoPath(photo), "replace");
  };

  const closePhoto = () => {
    setLightboxIndex(-1);
    if (photoRouteSlug) {
      setBrowserPath("/", "replace");
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname.replace(/\/$/, "") || "/";
      setCurrentPath(nextPath);
      if (!nextPath.startsWith("/photos/")) {
        setLightboxIndex(-1);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const title = activePhoto?.title ?? activeStory?.story.title;
    const description =
      activeStory?.story.excerpt ??
      (activePhoto ? `${activePhoto.category} / ${activePhoto.filename}` : DEFAULT_DESCRIPTION);
    const image = activePhoto?.src ?? activeStory?.photo.src ?? heroPhoto?.src;

    document.title = title ? `${title} | Queenstown.top` : SITE_TITLE;
    setMeta("description", description);
    setMeta("og:title", title ? `${title} | Queenstown.top` : SITE_TITLE, "property");
    setMeta("og:description", description, "property");
    if (image) setMeta("og:image", image, "property");
  }, [activePhoto, activeStory, heroPhoto]);

  return (
    <>
      <Header />

      <CmsSourceBadge content={content} />

      <main>
        {activeStory ? (
          <StoryDetail photo={activeStory.photo} story={activeStory.story} />
        ) : photoRouteSlug && activePhoto ? (
          <>
            <section className="page-title-band" id="top" aria-labelledby="page-title">
              <h1 id="page-title">Photography</h1>
            </section>

            <section className="hero" aria-label="Featured photograph">
              {heroPhoto ? (
                <img
                  className="hero-image"
                  src={heroPhoto.src}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : null}
            </section>

            <GallerySections photos={photos} onOpen={openPhoto} />
          </>
        ) : (photoRouteSlug || storyRouteSlug) && content.isLoading ? (
          <section className="detail-page detail-empty" aria-labelledby="detail-loading-title">
            <p className="detail-kicker">Loading</p>
            <h1 id="detail-loading-title">Loading this entry.</h1>
          </section>
        ) : photoRouteSlug || storyRouteSlug ? (
          <section className="detail-page detail-empty" aria-labelledby="detail-empty-title">
            <p className="detail-kicker">Not Found</p>
            <h1 id="detail-empty-title">This entry is not available.</h1>
            <a className="detail-related-link" href="/">
              <span>Back to Queenstown.top</span>
              <small>Return to the photography archive</small>
            </a>
          </section>
        ) : isBalconyPage ? (
          <BalconyView photos={photos} photoMeta={photoMeta} photoStories={photoStories} />
        ) : isStoryPage ? (
          <PhotoStory photos={photos} photoMeta={photoMeta} photoStories={photoStories} aboutData={aboutData} />
        ) : isAboutPage ? (
          <About aboutData={aboutData} />
        ) : isJournalPage ? (
          <Journal photos={photos} photoStories={photoStories} />
        ) : isFooterPreviewPage ? (
          <section className="footer-preview-stage" aria-labelledby="footer-preview-title">
            <p className="footer-preview-kicker">Design study</p>
            <h1 id="footer-preview-title">Footer Background</h1>
          </section>
        ) : (
          <>
            <section className="page-title-band" id="top" aria-labelledby="page-title">
              <h1 id="page-title">Photography</h1>
            </section>

            <section className="hero" aria-label="Featured photograph">
              {heroPhoto ? (
                <img
                  className="hero-image"
                  src={heroPhoto.src}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : null}
            </section>

            {showPreview && (
              <a className="story-test-cta" href="/photostory" aria-label="Open photo notes and stories">
                <span className="story-test-cta-tag">Photo Notes</span>
                <span className="story-test-cta-text">
                  Read locations, camera settings, and field notes behind selected photographs.
                </span>
                <span className="story-test-cta-arrow" aria-hidden="true">-&gt;</span>
              </a>
            )}

            <GallerySections photos={photos} onOpen={openPhoto} />
          </>
        )}
      </main>

      <Footer aboutData={aboutData} showPreview={showPreview} variant="photo" />

      {advancedLightboxIndex >= 0 && (
        <AdvancedPhotoLightbox
          photos={photos}
          index={advancedLightboxIndex}
          onClose={closePhoto}
          onNavigate={navigatePhoto}
          photoMeta={photoMeta}
          photoStories={photoStories}
        />
      )}
    </>
  );
}

export default App;
