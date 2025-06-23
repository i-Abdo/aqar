"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    // Render a placeholder during SSR and initial client render to avoid hydration mismatch,
    // as the theme depends on client-side state.
    return <Skeleton className="h-12 w-12 rounded-full" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={effectiveTheme === 'dark' ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      className="h-12 w-12" // Button size is h-12 w-12
    >
      {effectiveTheme === 'dark' ? (
        <Sun className="h-6 w-6" /> // Icon size changed to h-6 w-6
      ) : (
        <Moon className="h-6 w-6" /> // Icon size changed to h-6 w-6
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
