import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTheme, THEMES } from "../ThemeContext";
import { useSiteContent } from "../SiteContentContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/skills", label: "Skills" },
  { to: "/lab", label: "Lab" },
  { to: "/now", label: "Now" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { content } = useSiteContent();
  const profile = content.profile || {};
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="logo">
          <span className="logo-dot" />
          {profile.name.split(" ")[0].toLowerCase()}.dev
        </div>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          <div className="theme-switcher" ref={panelRef}>
            <button className="theme-btn" onClick={() => setOpen((o) => !o)} aria-label="Switch theme">
              <span className="theme-swatch" />
              Theme
            </button>
            {open && (
              <div className="theme-panel">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={"theme-opt" + (theme === t.id ? " active" : "")}
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                  >
                    <span className="dot" style={{ background: t.dot }} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="theme-btn mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="nav-links"
          style={{ display: "flex", flexDirection: "column", padding: "8px 24px 18px", gap: 6 }}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              style={{ width: "100%" }}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
