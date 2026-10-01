"use client";

import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { ThemeVariables } from "@/components/theme-variables";
import { AuthProvider } from "@/components/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ThemeVariables />
          {children}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
