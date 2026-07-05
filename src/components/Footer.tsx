export function Footer() {
  return (
    <footer className="site-footer" id="about">
      <p className="footer-brand">Queenstown.top</p>

      <div className="footer-grid">
        <div className="footer-about">
          <p>
            Queenstown.top is a quiet photography archive shaped around landscape, plants, city edges, and small
            travel fragments. The site keeps images large, direct, and close to the rhythm of a visual notebook.
          </p>
        </div>

        <div className="footer-column">
          <p className="footer-label">Artist</p>
          <p>Leon Li</p>
          <a href="/about">About →</a>
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

      <p className="footer-copy">© 2026 by Queenstown.top.</p>
    </footer>
  );
}
