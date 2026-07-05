import { useEffect, useState } from "react";

const menuItems = [
  { label: "Home", href: "/#top" },
  { label: "Photography", href: "/#photography" },
  { label: "Landscape", href: "/#landscape" },
  { label: "City", href: "/#city" },
  { label: "Plants", href: "/#plants" },
  { label: "Contact", href: "/#about" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);

    return () => document.body.classList.remove("menu-is-open");
  }, [menuOpen]);

  return (
    <>
      <header className="site-header" aria-label="Site header">
        <a className="brand-lockup" href="/" aria-label="Queenstown home">
          <span className="brand-mark" aria-hidden="true">
            <svg className="brand-mark-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <text
                x="50"
                y="68"
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontStyle="italic"
                fontWeight="700"
                fontSize="74"
                fill="#0a0a0a"
              >
                Q
              </text>
              <path
                d="M 22 72 L 36 54 L 48 64 L 62 46 L 78 72 Z"
                fill="#0a0a0a"
                fillOpacity="0.18"
              />
              <circle cx="78" cy="78" r="3.2" fill="#0a0a0a" />
            </svg>
          </span>
          <span className="brand-word">
            Queenstown<em>.top</em>
          </span>
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <div className="menu-overlay" data-open={menuOpen} id="site-menu" aria-hidden={!menuOpen}>
        <nav className="menu-panel" aria-label="Menu navigation">
          {menuItems.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
