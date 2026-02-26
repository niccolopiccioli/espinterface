"use client";

import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { ThemeVariables } from "@/components/theme-variables";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemeVariables />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
