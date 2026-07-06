import { useEffect, useState } from "react";

const navLinks = [
  { label: "Photography", href: "/#photography" },
  { label: "Balcony View", href: "/photobalcony" },
  { label: "Photo Notes", href: "/photostory" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    path: "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52 0-4.76.07-.96.04-1.48.2-1.83.34-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.14.35-.3.87-.34 1.83C3.13 8.48 3.13 8.85 3.13 12s0 3.52.07 4.76c.04.96.2 1.48.34 1.83.18.46.4.79.74 1.13.34.34.67.56 1.13.74.35.14.87.3 1.83.34 1.24.06 1.61.07 4.76.07s3.52 0 4.76-.07c.96-.04 1.48-.2 1.83-.34.46-.18.79-.4 1.13-.74.34-.34.56-.67.74-1.13.14-.35.3-.87.34-1.83.06-1.24.07-1.61.07-4.76s0-3.52-.07-4.76c-.04-.96-.2-1.48-.34-1.83a3.04 3.04 0 0 0-.74-1.13 3.04 3.04 0 0 0-1.13-.74c-.35-.14-.87-.3-1.83-.34-1.24-.06-1.61-.07-4.76-.07Zm0 3.06A4.94 4.94 0 1 1 7.06 12 4.94 4.94 0 0 1 12 7.06Zm0 1.8A3.14 3.14 0 1 0 15.14 12 3.14 3.14 0 0 0 12 8.86Zm5.13-2.05a1.15 1.15 0 1 1-1.15 1.15 1.15 1.15 0 0 1 1.15-1.15Z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.27 26.27 0 0 0 2 12a26.27 26.27 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.27 26.27 0 0 0 22 12a26.27 26.27 0 0 0-.4-4.8ZM10 15V9l5.2 3Z",
  },
];

const tools = [
  {
    label: "Codex GPT-5.5",
    icon: (
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <path
          fill="currentColor"
          d="M75.91 73.628V62.232c0-.96.36-1.68 1.199-2.16l22.912-13.194c3.119-1.8 6.838-2.639 10.676-2.639 14.394 0 23.511 11.157 23.511 23.032 0 .839 0 1.799-.12 2.758l-23.752-13.914c-1.439-.84-2.879-.84-4.318 0L75.91 73.627Zm53.499 44.383v-27.23c0-1.68-.72-2.88-2.159-3.719L97.142 69.55l9.836-5.638c.839-.48 1.559-.48 2.399 0l22.912 13.195c6.598 3.839 11.035 11.995 11.035 19.912 0 9.116-5.397 17.513-13.915 20.992v.001Zm-60.577-23.99-9.836-5.758c-.84-.48-1.2-1.2-1.2-2.16v-26.39c0-12.834 9.837-22.55 23.152-22.55 5.039 0 9.716 1.679 13.676 4.678L70.993 55.516c-1.44.84-2.16 2.039-2.16 3.719v34.787-.002Zm21.173 12.234L75.91 98.339V81.546l14.095-7.917 14.094 7.917v16.793l-14.094 7.916Zm9.056 36.467c-5.038 0-9.716-1.68-13.675-4.678l23.631-13.676c1.439-.839 2.159-2.038 2.159-3.718V85.863l9.956 5.757c.84.48 1.2 1.2 1.2 2.16v26.389c0 12.835-9.957 22.552-23.27 22.552v.001Zm-28.43-26.75L47.72 102.778c-6.599-3.84-11.036-11.996-11.036-19.913 0-9.236 5.518-17.513 14.034-20.992v27.35c0 1.68.72 2.879 2.16 3.718l29.989 17.393-9.837 5.638c-.84.48-1.56.48-2.399 0Zm-1.318 19.673c-13.555 0-23.512-10.196-23.512-22.792 0-.959.12-1.919.24-2.879l23.63 13.675c1.44.84 2.88.84 4.32 0l30.108-17.392v11.395c0 .96-.361 1.68-1.2 2.16l-22.912 13.194c-3.119 1.8-6.837 2.639-10.675 2.639Zm29.748 14.274c14.515 0 26.63-10.316 29.39-23.991 13.434-3.479 22.071-16.074 22.071-28.91 0-8.396-3.598-16.553-10.076-22.43.6-2.52.96-5.039.96-7.557 0-17.153-13.915-29.99-29.989-29.99-3.239 0-6.358.48-9.477 1.56-5.398-5.278-12.835-8.637-20.992-8.637-14.515 0-26.63 10.316-29.39 23.991-13.434 3.48-22.07 16.074-22.07 28.91 0 8.396 3.598 16.553 10.075 22.431-.6 2.519-.96 5.038-.96 7.556 0 17.154 13.915 29.989 29.99 29.989 3.238 0 6.357-.479 9.476-1.559 5.397 5.278 12.835 8.637 20.992 8.637Z"
        />
      </svg>
    ),
  },
  {
    label: "OpenCode",
    icon: (
      <svg viewBox="0 0 512 512" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M384 416H128V96H384V416ZM320 160H192V352H320V160Z"
          fill="currentColor"
        />
        <path d="M320 224V352H192V224H320Z" fill="currentColor" opacity="0.55" />
      </svg>
    ),
  },
  {
    label: "MiniMax-M3",
    icon: (
      <img
        src="/minimax-logo.png"
        alt="MiniMax"
        width="18"
        height="18"
        style={{ borderRadius: "4px" }}
      />
    ),
  },
];

function NikonMark() {
  return (
    <svg className="nikon-mark" viewBox="0 0 400 400" aria-label="Nikon">
      <defs>
        <linearGradient id="nikonG1" gradientUnits="userSpaceOnUse" x1="481.77" y1="-363.72" x2="488.83" y2="-365.81" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE419" />
          <stop offset="0.34" stopColor="#FFFFFF" />
          <stop offset="0.66" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG2" gradientUnits="userSpaceOnUse" x1="482.38" y1="-364.36" x2="489.16" y2="-366.57" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE419" />
          <stop offset="0.355" stopColor="#FFFFFF" />
          <stop offset="0.645" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG3" gradientUnits="userSpaceOnUse" x1="482.95" y1="-364.97" x2="489.47" y2="-367.30" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE419" />
          <stop offset="0.37" stopColor="#FFFFFF" />
          <stop offset="0.63" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG4" gradientUnits="userSpaceOnUse" x1="483.49" y1="-365.55" x2="489.77" y2="-368" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE419" />
          <stop offset="0.385" stopColor="#FFFFFF" />
          <stop offset="0.615" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG5" gradientUnits="userSpaceOnUse" x1="484" y1="-366.10" x2="490.05" y2="-368.68" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE419" />
          <stop offset="0.4" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG6" gradientUnits="userSpaceOnUse" x1="484.50" y1="-366.63" x2="490.33" y2="-369.33" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE626" />
          <stop offset="0.415" stopColor="#FFFFFF" />
          <stop offset="0.585" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG7" gradientUnits="userSpaceOnUse" x1="484.97" y1="-367.13" x2="490.61" y2="-369.97" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE733" />
          <stop offset="0.43" stopColor="#FFFFFF" />
          <stop offset="0.57" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG8" gradientUnits="userSpaceOnUse" x1="485.44" y1="-367.62" x2="490.87" y2="-370.60" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFE940" />
          <stop offset="0.445" stopColor="#FFFFFF" />
          <stop offset="0.555" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG9" gradientUnits="userSpaceOnUse" x1="485.89" y1="-368.10" x2="491.13" y2="-371.22" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFEA4C" />
          <stop offset="0.46" stopColor="#FFFFFF" />
          <stop offset="0.54" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
        <linearGradient id="nikonG10" gradientUnits="userSpaceOnUse" x1="486.35" y1="-368.59" x2="491.40" y2="-371.85" gradientTransform="matrix(77.36 0 0 77.36 -37500.66 28577.68)">
          <stop offset="0" stopColor="#FFEC59" />
          <stop offset="0.475" stopColor="#FFFFFF" />
          <stop offset="0.525" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE419" />
        </linearGradient>
      </defs>
      <rect fill="#FFE100" width="400" height="400" />
      <path fill="url(#nikonG1)" d="M303.055,283.241c-88.936,15.696-177.988,36.567-266.773,62.811C24.138,349.643,12.042,353.323,0,357.088 v31.352c15.009-4.127,30.018-8.408,45.018-12.84C133.797,349.347,219.883,318.437,303.055,283.241z" />
      <path fill="url(#nikonG2)" d="M328.305,224.411c-85.362,18.158-170.783,40.988-255.911,68.666C48.045,300.992,23.91,309.243,0,317.822 v26.398c27.002-7.795,53.987-16.072,80.944-24.836C166.069,291.706,248.589,259.927,328.305,224.411z" />
      <path fill="url(#nikonG3)" d="M352.505,168.243c-82.116,20.282-164.225,44.924-245.993,74.075C70.501,255.156,34.991,268.711,0,282.959 V304.5c38.423-11.694,76.809-24.36,115.12-38.015C196.888,237.331,276.073,204.477,352.505,168.243z" />
      <path fill="url(#nikonG4)" d="M375.6,114.373c-79.037,22.419-158.02,48.891-236.619,79.533C91.72,212.332,45.383,231.964,0,252.73v15.81 c49.29-15.909,98.515-33.415,147.6-52.548C226.19,185.347,302.257,151.368,375.6,114.373z" />
      <path fill="url(#nikonG5)" d="M397.862,62.404c-76.136,24.571-152.172,52.898-227.795,85.076C111.877,172.242,55.165,198.754,0,226.894 v9.334c59.685-20.549,119.273-43.419,178.613-68.665C254.23,135.384,327.37,100.228,397.862,62.404z" />
      <path fill="url(#nikonG6)" d="M400,23.069V19.19c-66.824,24.93-133.52,52.75-199.866,83.501C131.206,134.646,64.45,168.936,0,205.332 v2.218c69.723-25.748,139.323-54.632,208.545-86.716C274.383,90.312,338.232,57.655,400,23.069z" />
      <path fill="url(#nikonG7)" d="M25.517,172.214c70.84-28.989,141.541-61.179,211.831-96.617C285.268,51.431,332.101,26.198,377.795,0 h-23.881c-41.695,18.654-83.307,38.428-124.771,59.334C158.864,94.773,90.939,132.491,25.517,172.214z" />
      <path fill="url(#nikonG8)" d="M60.879,134.162c68.341-31.261,136.559-65.454,204.378-102.608C284.179,21.185,302.921,10.665,321.49,0 h-32.454c-10.568,5.635-21.131,11.346-31.682,17.13C189.537,54.286,124.001,93.382,60.879,134.162z" />
      <path fill="url(#nikonG9)" d="M272.151,0h-27.883C193.448,31.192,143.995,63.353,95.987,96.363C154.851,66.382,213.641,34.264,272.151,0z " />
      <path fill="url(#nikonG10)" d="M231.041,0h-17.579c-27.88,19.273-55.307,38.793-82.272,58.539C164.504,39.694,197.803,20.182,231.041,0z" />
      <path
        fill="#150301"
        d="M144.981,385.399l21.598-97.315l26.617,0.003l-11.603,51.759l21.499-25.953h29.761l-26.706,32.446 l11.01,39.061H190.6l-10.976-37.009l-8.693,37.009H144.981z M48.872,336.484l18.754,48.914h25.509l21.983-97.315l-26.273,0.003 l-11.121,49.501L59.32,288.055H32.683l-21.718,97.344h26.788C40.794,369.802,44.864,353.329,48.872,336.484z M132.235,385.399 l15.935-71.467h-26.144l-15.932,71.467H132.235z M123.366,298.275c0,2.243,0.527,10.172,14.835,10.172 c11.885,0,16.468-7.616,16.468-13.302c0-3.828-3.129-10.471-14.841-10.471C129.04,284.675,123.366,291.888,123.366,298.275z M374.819,312.968c-11.178-3.329-25.03,2.194-31.867,11.657c0.664-2.933,1.374-6.344,2.177-10.272H318.6l-15.525,71.046h26.401 l8.807-40.296c1.619-7.416,7.582-10.585,12.863-9.22c2.277,0.616,5.409,2.337,4.372,8.516l-8.961,40.999h26.09l11.959-54.717 C387.14,318.622,377.236,313.692,374.819,312.968z M286.046,378.954c11.461-9.372,17.129-25.218,16.947-40.127 c-0.194-14.33-12.33-27.923-33.443-27.923c-40.247,0-46.101,31.371-47.264,37.097c-2.947,14.484,0.331,33.284,19.236,38.266 C253.996,389.56,273.502,389.203,286.046,378.954z M256.521,337.533c1.892-5.213,7.043-6.367,9.371-6.39 c5.769-0.049,7.348,3.372,6.846,6.595c-1.388,8.935-4.483,20.273-5.626,23.887c-0.014,0.048-0.023,0.094-0.037,0.134 c-1.257,3.947-4.976,6.245-9.354,6.245c-4.432,0-7.111-2.787-6.729-6.339C251.642,355.669,255.438,340.512,256.521,337.533z"
      />
    </svg>
  );
}

export function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="footer-brand-row">
          <p className="footer-brand">Queenstown.top</p>
          <button
            type="button"
            className={`footer-top-btn ${showTop ? "is-visible" : ""}`}
            onClick={scrollTop}
            aria-label="Back to top"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M12 4 L4 12 L6 14 L11 9 L11 20 L13 20 L13 9 L18 14 L20 12 Z"
                fill="currentColor"
              />
            </svg>
            <span>Top</span>
          </button>
        </div>

        <p className="footer-tagline">
          A quiet photography archive — landscape, plants, city edges, and small travel fragments.
        </p>

        <div className="footer-grid">
          <div className="footer-about">
            <h2 className="footer-label">About</h2>
            <p>
              Queenstown.top is a quiet photography archive shaped around landscape, plants, city edges, and small
              travel fragments. The site keeps images large, direct, and close to the rhythm of a visual notebook.
            </p>
          </div>

          <nav className="footer-column" aria-label="Site navigation">
            <h2 className="footer-label">Explore</h2>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-column">
            <h2 className="footer-label">Contact</h2>
            <a href="mailto:hello@queenstown.top">hello@queenstown.top</a>
            <p className="footer-sub">Based in Shanghai</p>
          </div>

          <div className="footer-column">
            <h2 className="footer-label">Follow</h2>
            <ul className="footer-socials">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d={s.path} fill="currentColor" />
                    </svg>
                    <span>{s.label}</span>
                    <svg
                      className="footer-socials__arrow"
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 17 L17 7 M9 7 L17 7 L17 15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {year} Queenstown.top · All rights reserved</p>

          <div className="footer-colophon">
            <div className="footer-colophon__camera-block">
              <NikonMark />
              <span className="footer-colophon__model">Z 6III · Z 24-120mm f/4 S</span>
            </div>

            <div className="footer-colophon__line">
              <span className="footer-colophon__label">Designed with</span>
              <span className="footer-colophon__tools">
                {tools.map((t) => (
                  <span key={t.label} className="footer-colophon__tool">
                    <span className="footer-colophon__icon">{t.icon}</span>
                    <span>{t.label}</span>
                  </span>
                ))}
              </span>
            </div>

            <p className="footer-colophon__meta">Built with React + Vite</p>
          </div>
        </div>
      </div>
    </footer>
  );
}