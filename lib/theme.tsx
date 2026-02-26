"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "light" | "blue" | "amber";

interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successDim: string;
  successGlow: string;
  danger: string;
  dangerDim: string;
  warning: string;
  warningDim: string;
  surface: string;
  surfaceLight: string;
  surfaceElevated: string;
  terminal: string;
  active: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

const themeConfigs: Record<Theme, ThemeColors> = {
  dark: {
    background: "0 0% 10%",
    foreground: "0 0% 95%",
    primary: "212 100% 45%",
    primaryForeground: "0 0% 100%",
    card: "0 0% 14%",
    cardForeground: "0 0% 95%",
    border: "0 0% 22%",
    muted: "0 0% 18%",
    mutedForeground: "0 0% 55%",
    accent: "0 0% 18%",
    accentForeground: "0 0% 85%",
    destructive: "0 72% 50%",
    destructiveForeground: "0 0% 100%",
    success: "#6ccb5f",
    successDim: "rgba(108, 203, 95, 0.15)",
    successGlow: "rgba(108, 203, 95, 0.3)",
    danger: "#f1707a",
    dangerDim: "rgba(241, 112, 122, 0.15)",
    warning: "#f8d247",
    warningDim: "rgba(248, 210, 71, 0.15)",
    surface: "#1a1a1a",
    surfaceLight: "#2d2d2d",
    surfaceElevated: "#3a3a3a",
    terminal: "#6ccb5f",
    active: "#4cc2ff",
  },
  light: {
    background: "0 0% 100%",
    foreground: "0 0% 15%",
    primary: "212 100% 40%",
    primaryForeground: "0 0% 100%",
    card: "0 0% 98%",
    cardForeground: "0 0% 15%",
    border: "0 0% 90%",
    muted: "0 0% 96%",
    mutedForeground: "0 0% 50%",
    accent: "0 0% 96%",
    accentForeground: "0 0% 25%",
    destructive: "0 84% 50%",
    destructiveForeground: "0 0% 100%",
    success: "#107c10",
    successDim: "rgba(16, 124, 16, 0.1)",
    successGlow: "rgba(16, 124, 16, 0.3)",
    danger: "#d13438",
    dangerDim: "rgba(209, 52, 56, 0.1)",
    warning: "#ca5010",
    warningDim: "rgba(202, 80, 16, 0.1)",
    surface: "#f3f3f3",
    surfaceLight: "#e9e9e9",
    surfaceElevated: "#ffffff",
    terminal: "#107c10",
    active: "#0078d4",
  },
  blue: {
    background: "215 30% 12%",
    foreground: "0 0% 95%",
    primary: "210 100% 50%",
    primaryForeground: "0 0% 100%",
    card: "215 25% 16%",
    cardForeground: "0 0% 95%",
    border: "215 25% 28%",
    muted: "215 25% 22%",
    mutedForeground: "0 0% 60%",
    accent: "215 25% 22%",
    accentForeground: "0 0% 85%",
    destructive: "0 72% 55%",
    destructiveForeground: "0 0% 100%",
    success: "#4cc2ff",
    successDim: "rgba(76, 194, 255, 0.15)",
    successGlow: "rgba(76, 194, 255, 0.3)",
    danger: "#f1707a",
    dangerDim: "rgba(241, 112, 122, 0.15)",
    warning: "#f8d247",
    warningDim: "rgba(248, 210, 71, 0.15)",
    surface: "#16212d",
    surfaceLight: "#1e3044",
    surfaceElevated: "#28405c",
    terminal: "#4cc2ff",
    active: "#7dcea0",
  },
  amber: {
    background: "35 40% 12%",
    foreground: "0 0% 95%",
    primary: "35 90% 50%",
    primaryForeground: "0 0% 10%",
    card: "35 35% 16%",
    cardForeground: "0 0% 95%",
    border: "35 35% 28%",
    muted: "35 35% 22%",
    mutedForeground: "0 0% 60%",
    accent: "35 35% 22%",
    accentForeground: "0 0% 85%",
    destructive: "0 72% 55%",
    destructiveForeground: "0 0% 100%",
    success: "#f8d247",
    successDim: "rgba(248, 210, 71, 0.15)",
    successGlow: "rgba(248, 210, 71, 0.3)",
    danger: "#f1707a",
    dangerDim: "rgba(241, 112, 122, 0.15)",
    warning: "#ffb900",
    warningDim: "rgba(255, 185, 0, 0.15)",
    surface: "#1f1812",
    surfaceLight: "#2e241a",
    surfaceElevated: "#3d3022",
    terminal: "#f8d247",
    active: "#ffb900",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("esp-control-theme") as Theme;
    if (saved && themeConfigs[saved]) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("esp-control-theme", newTheme);
  };

  const colors = themeConfigs[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default values if context is not available (during SSR/build)
  if (!context) {
    return { 
      theme: "dark" as Theme, 
      setTheme: () => {}, 
      colors: themeConfigs.dark 
    };
  }
  return context;
}
