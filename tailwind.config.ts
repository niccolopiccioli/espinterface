import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Hardware-specific status colors - Microsoft style
        hw: {
          // Green for HIGH/ON states - Microsoft green
          success: "var(--hw-success)",
          "success-dim": "var(--hw-success-dim)",
          "success-glow": "var(--hw-success-glow)",
          // Red for LOW/OFF/Error states - Microsoft red
          danger: "var(--hw-danger)",
          "danger-dim": "var(--hw-danger-dim)",
          // Orange for warning/idle - Microsoft orange
          warning: "var(--hw-warning)",
          "warning-dim": "var(--hw-warning-dim)",
          // Surface colors
          surface: "var(--hw-surface)",
          "surface-light": "var(--hw-surface-light)",
          "surface-elevated": "var(--hw-surface-elevated)",
          // Terminal green
          terminal: "var(--hw-terminal)",
          // Active blue - Microsoft blue
          active: "var(--hw-active)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Hardware-style sharp corners for technical feel
        hw: "4px",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Subtle glow for active states
        "glow-success": "0 0 12px rgba(16, 185, 129, 0.4)",
        "glow-danger": "0 0 12px rgba(239, 68, 68, 0.4)",
        "glow-active": "0 0 12px rgba(59, 130, 246, 0.4)",
        // Card elevation
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(16, 185, 129, 0.4)" },
          "50%": { boxShadow: "0 0 16px rgba(16, 185, 129, 0.7)" },
        },
        "terminal-cursor": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "terminal-cursor": "terminal-cursor 1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
