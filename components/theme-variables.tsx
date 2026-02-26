"use client";

import { useEffect, useState } from "react";
import { useTheme, Theme } from "@/lib/theme";

export function ThemeVariables() {
  const { theme, colors } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'light', 'blue', 'amber');
    // Add current theme class
    document.documentElement.classList.add(theme);
    
    // Set CSS variables
    const root = document.documentElement;
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.cardForeground);
    root.style.setProperty('--popover', colors.card);
    root.style.setProperty('--popover-foreground', colors.cardForeground);
    root.style.setProperty('--secondary', colors.muted);
    root.style.setProperty('--secondary-foreground', colors.mutedForeground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    root.style.setProperty('--destructive', colors.destructive);
    root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.border);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--hw-success', colors.success);
    root.style.setProperty('--hw-success-dim', colors.successDim);
    root.style.setProperty('--hw-success-glow', colors.successGlow);
    root.style.setProperty('--hw-danger', colors.danger);
    root.style.setProperty('--hw-danger-dim', colors.dangerDim);
    root.style.setProperty('--hw-warning', colors.warning);
    root.style.setProperty('--hw-warning-dim', colors.warningDim);
    root.style.setProperty('--hw-surface', colors.surface);
    root.style.setProperty('--hw-surface-light', colors.surfaceLight);
    root.style.setProperty('--hw-surface-elevated', colors.surfaceElevated);
    root.style.setProperty('--hw-terminal', colors.terminal);
    root.style.setProperty('--hw-active', colors.active);
  }, [theme, colors, mounted]);

  return null;
}
