"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="font-mono text-xs border border-border px-2 py-0.5 rounded-none hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors cursor-pointer select-none"
      title="Toggle color theme"
      aria-label="Toggle color theme"
    >
      <Sun className="size-3 text-amber-500 hidden dark:inline-block shrink-0" />
      <Moon className="size-3 text-muted-foreground inline-block dark:hidden shrink-0" />
      <span className="hidden sm:inline-block dark:hidden text-[11px] text-muted-foreground">
        mode:paper
      </span>
      <span className="hidden sm:dark:inline-block text-[11px] text-muted-foreground">
        mode:dark
      </span>
    </Button>
  );
}
