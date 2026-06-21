"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Wraps next-themes so theme state (system / light / dark) is available app-wide.
// Must be a Client Component because it relies on browser APIs and context.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
