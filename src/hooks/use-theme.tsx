
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
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>(() => {
    if (typeof window !== 'undefined') {
      // If there's a stored setting, use it. Otherwise, default to "light".
      return (localStorage.getItem("themeSetting") as ThemeSetting) || "light";
    }
    // For SSR, default to "light". It will be corrected on client if localStorage has a value.
    return "light";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>("light"); // Default to light for SSR
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);


  useEffect(() => {
    if (!hydrated) return; // Wait for client-side hydration

    const root = window.document.documentElement;
    let currentEffectiveTheme: EffectiveTheme;

    if (themeSetting === "system") {
      currentEffectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      currentEffectiveTheme = themeSetting; // "light" or "dark"
    }

    root.classList.remove("light", "dark");
    root.classList.add(currentEffectiveTheme);
    setEffectiveTheme(currentEffectiveTheme);
    localStorage.setItem("themeSetting", themeSetting); // Save the actual setting ("light", "dark", or "system")

  }, [themeSetting, hydrated]);

  // Listener for system theme changes IF themeSetting is "system"
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

    handleChange(); 
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeSetting, hydrated]);


  const setThemeSetting = (newThemeSetting: ThemeSetting) => {
    setThemeSettingState(newThemeSetting);
  };
  
  if (!hydrated) {
    // To prevent flash of unstyled content or incorrect theme during SSR->client transition
  }

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

