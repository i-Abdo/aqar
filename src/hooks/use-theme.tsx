
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeSetting = "light" | "dark" | "system"; // User's preference
type EffectiveTheme = "light" | "dark";      // Actual theme applied

interface ThemeContextType {
  themeSetting: ThemeSetting;
  setThemeSetting: (theme: ThemeSetting) => void;
  effectiveTheme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with a consistent default for SSR.
  // The actual value will be loaded from localStorage on the client in useEffect.
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>("system");
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>("light");
  const [hydrated, setHydrated] = useState(false);

  // On client-side mount, determine the correct initial theme from localStorage.
  useEffect(() => {
    setHydrated(true);
    const storedSetting = localStorage.getItem("themeSetting") as ThemeSetting | null;
    if (storedSetting && ["light", "dark", "system"].includes(storedSetting)) {
      setThemeSettingState(storedSetting);
    }
  }, []);

  // Effect to apply the theme class to the HTML element.
  useEffect(() => {
    if (!hydrated) return; // Only run on client after hydration

    const root = window.document.documentElement;
    let currentEffectiveTheme: EffectiveTheme;

    if (themeSetting === "system") {
      currentEffectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      currentEffectiveTheme = themeSetting;
    }

    root.classList.remove("light", "dark");
    root.classList.add(currentEffectiveTheme);
    setEffectiveTheme(currentEffectiveTheme);

  }, [themeSetting, hydrated]);

  // Listener for system theme changes IF the user has selected "system"
  useEffect(() => {
    if (!hydrated || themeSetting !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newEffectiveTheme = mediaQuery.matches ? "dark" : "light";
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newEffectiveTheme);
      setEffectiveTheme(newEffectiveTheme);
    };

    handleChange(); // Apply initial system theme
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeSetting, hydrated]);

  // The setter function now also persists the new setting to localStorage.
  const setThemeSetting = (newThemeSetting: ThemeSetting) => {
    localStorage.setItem("themeSetting", newThemeSetting);
    setThemeSettingState(newThemeSetting);
  };

  return (
    <ThemeContext.Provider value={{ themeSetting, setThemeSetting, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
