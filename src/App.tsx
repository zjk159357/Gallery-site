import { useMemo, useState } from "react";
import { photos } from "./data/photos";
import { Footer } from "./components/Footer";
import { GalleryLightbox } from "./components/GalleryLightbox";
import { GallerySections } from "./components/GallerySections";
import { Header } from "./components/Header";

function App() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const heroPhoto = useMemo(() => {
    return photos.find((photo) => photo.filename === "DSC_5287.JPG") ?? photos.find((photo) => photo.category === "花朵") ?? photos[0];
  }, []);

  return (
    <>
      <Header />

      <main>
        <section className="page-title-band" id="top" aria-labelledby="page-title">
          <h1 id="page-title">Photography</h1>
        </section>

        <section className="hero" aria-label="Featured photograph">
          <img className="hero-image" src={heroPhoto.src} alt="" aria-hidden="true" />
        </section>

        <GallerySections photos={photos} onOpen={setLightboxIndex} />
      </main>

      <Footer />

      <GalleryLightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onView={setLightboxIndex}
      />
    </>
  );
}

export default App;
