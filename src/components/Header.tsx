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
        <a className="brand-lockup" href="/" aria-label="Gallery home">
          <span className="brand-mark" aria-hidden="true">
            <span>Ga</span>
            <span>ll</span>
          </span>
          <span className="brand-word">Gallery</span>
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
