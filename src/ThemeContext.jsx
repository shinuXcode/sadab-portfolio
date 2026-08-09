import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  { id: "neon-cyber", label: "Neon Cyber", dot: "#00ffc2" },
  { id: "sunset-glitch", label: "Sunset Glitch", dot: "#ff6b4a" },
  { id: "matrix-terminal", label: "Matrix Terminal", dot: "#00ff5e" },
  { id: "pastel-y2k", label: "Pastel Y2K", dot: "#ff7ac6" },
  { id: "holo-glass", label: "Holo Glass", dot: "#8ab4ff" },
  { id: "midnight-mono", label: "Midnight Mono", dot: "#ffffff" },
  { id: "retro-arcade", label: "Retro Arcade", dot: "#ffd600" },
  { id: "solar-flare", label: "Solar Flare", dot: "#ff9900" },
  { id: "iron-hud", label: "Iron HUD", dot: "#5ec8ff" },
  { id: "arctic-frost", label: "Arctic Frost", dot: "#3a7bd5" },
  { id: "vapor-grid", label: "Vapor Grid", dot: "#ff5ec8" },
  { id: "blueprint-draft", label: "Blueprint Draft", dot: "#1e5cff" },
  { id: "deep-nebula", label: "Deep Nebula", dot: "#b48cff" },
  { id: "paper-mono", label: "Paper Mono", dot: "#191815" },
];

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("portfolio-theme") || "neon-cyber";
    } catch {
      return "neon-cyber";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch {
      /* private-browsing fallback: theme just won't persist */
    }
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
