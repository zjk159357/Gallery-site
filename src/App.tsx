import { useMemo, useState } from "react";
import { About } from "./components/About";
import { BalconyView } from "./components/BalconyView";
import { CmsSourceBadge } from "./components/CmsSourceBadge";
import { Footer } from "./components/Footer";
import { GalleryLightbox } from "./components/GalleryLightbox";
import { GallerySections } from "./components/GallerySections";
import { Header } from "./components/Header";
import { Journal } from "./components/Journal";
import { PhotoStory } from "./components/PhotoStory";
import { useGalleryContent } from "./lib/galleryContent";

function App() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const content = useGalleryContent();
  const { photos, photoMeta, photoStories, aboutData } = content;
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const isBalconyPage = pathname === "/photobalcony";
  const isStoryPage = pathname === "/photostory";
  const isAboutPage = pathname === "/about";
  const isJournalPage = pathname === "/journal";
  const isStaticPage = isBalconyPage || isStoryPage || isAboutPage || isJournalPage;

  const heroPhoto = useMemo(() => {
    return photos.find((photo) => photo.isHero)
      ?? photos.find((photo) => photo.filename === "DSC_0257.JPG")
      ?? photos.find((photo) => photo.category === "石塘度假区")
      ?? photos[0];
  }, [photos]);

  return (
    <>
      <Header />

      <CmsSourceBadge content={content} />

      <main>
        {isBalconyPage ? (
          <BalconyView photos={photos} photoMeta={photoMeta} photoStories={photoStories} />
        ) : isStoryPage ? (
          <PhotoStory photos={photos} photoMeta={photoMeta} photoStories={photoStories} aboutData={aboutData} />
        ) : isAboutPage ? (
          <About aboutData={aboutData} />
        ) : isJournalPage ? (
          <Journal photos={photos} photoStories={photoStories} />
        ) : (
          <>
            <section className="page-title-band" id="top" aria-labelledby="page-title">
              <h1 id="page-title">Photography</h1>
            </section>

            <section className="hero" aria-label="Featured photograph">
              <img
                className="hero-image"
                src={heroPhoto.src}
                alt=""
                aria-hidden="true"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </section>

            <a className="story-test-cta" href="/photostory" aria-label="Open photo notes and stories">
              <span className="story-test-cta-tag">摄影手记</span>
              <span className="story-test-cta-text">
                阅读照片背后的地点、参数与创作记录
              </span>
              <span className="story-test-cta-arrow" aria-hidden="true">→</span>
            </a>

            <GallerySections photos={photos} onOpen={setLightboxIndex} />
          </>
        )}
      </main>

      <Footer />

      {!isStaticPage && (
        <GalleryLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onView={setLightboxIndex}
          photoMeta={photoMeta}
          photoStories={photoStories}
        />
      )}
    </>
  );
}

export default App;
