"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm text-muted-foreground"
        aria-label="Đổi giao diện"
      >
        <span className="size-4 block" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-full border border-border/70 bg-background/60 hover:bg-muted/80 backdrop-blur-sm transition-colors text-foreground"
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Giao diện sáng" : "Giao diện tối"}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-300 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-stone-600 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}

