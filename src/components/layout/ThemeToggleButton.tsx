
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export function ThemeToggleButton() {
  const { themeSetting, setThemeSetting, effectiveTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Simple toggle between light and dark, ignoring 'system' for this button.
    // If current effective theme is dark, switch to light, otherwise switch to dark.
    setThemeSetting(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    // Render a placeholder or null during SSR to avoid hydration mismatch,
    // as theme depends on localStorage/system preference.
    return <Button variant="ghost" size="icon" disabled className="h-10 w-10 opacity-0" aria-hidden="true" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={effectiveTheme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
      className="h-10 w-10"
    >
      {effectiveTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
