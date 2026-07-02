export function Footer() {
  return (
    <footer className="site-footer" id="about">
      <p className="footer-brand">Gallery</p>

      <div className="footer-grid">
        <div className="footer-about">
          <p>
            Gallery is a quiet photography archive shaped around landscape, plants, city edges, and small
            travel fragments. The site keeps the images large, direct, and close to the rhythm of a visual notebook.
          </p>
        </div>

        <div className="footer-column">
          <p className="footer-label">Artist</p>
          <p>Leon Li</p>
        </div>

        <div className="footer-column">
          <p className="footer-label">Contact</p>
          <a href="mailto:hello@example.com">hello@example.com</a>
          <a href="https://www.youtube.com/">Youtube Channel</a>
        </div>

        <div className="footer-column">
          <p className="footer-label">Follow</p>
          <a href="https://www.instagram.com/">Instagram</a>
          <a href="#top">Back to top</a>
        </div>
      </div>

      <p className="footer-copy">© 2035 by Gallery.</p>
    </footer>
  );
}
