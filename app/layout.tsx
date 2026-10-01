import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/hardware/header";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Theme color configurations - must match lib/theme.tsx
const themeColors: Record<string, Record<string, string>> = {
  dark: {
    "--background": "0 0% 10%",
    "--foreground": "0 0% 95%",
    "--hw-success": "#6ccb5f",
    "--hw-success-dim": "rgba(108, 203, 95, 0.15)",
    "--hw-surface": "#1a1a1a",
    "--hw-surface-light": "#2d2d2d",
    "--card": "0 0% 14%",
    "--border": "0 0% 22%",
  },
  light: {
    "--background": "0 0% 100%",
    "--foreground": "0 0% 15%",
    "--hw-success": "#107c10",
    "--hw-success-dim": "rgba(16, 124, 16, 0.1)",
    "--hw-surface": "#f3f3f3",
    "--hw-surface-light": "#e9e9e9",
    "--card": "0 0% 98%",
    "--border": "0 0% 90%",
  },
  blue: {
    "--background": "215 30% 12%",
    "--foreground": "0 0% 95%",
    "--hw-success": "#4cc2ff",
    "--hw-success-dim": "rgba(76, 194, 255, 0.15)",
    "--hw-surface": "#16212d",
    "--hw-surface-light": "#1e3044",
    "--card": "215 25% 16%",
    "--border": "215 25% 28%",
  },
  amber: {
    "--background": "35 40% 12%",
    "--foreground": "0 0% 95%",
    "--hw-success": "#f8d247",
    "--hw-success-dim": "rgba(248, 210, 71, 0.15)",
    "--hw-surface": "#1f1812",
    "--hw-surface-light": "#2e241a",
    "--card": "35 35% 16%",
    "--border": "35 35% 28%",
  },
};

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('esp-control-theme') || 'dark';
    var colors = ${JSON.stringify(themeColors)};
    var lang = localStorage.getItem('esp-control-language') || 'en';
    
    document.documentElement.classList.add(theme);
    document.documentElement.classList.add(lang === 'it' ? 'it' : 'en');
    
    // Apply theme colors immediately
    if (colors[theme]) {
      Object.keys(colors[theme]).forEach(function(key) {
        document.documentElement.style.setProperty(key, colors[theme][key]);
      });
    }
  } catch (e) {
    console.log('Theme init error:', e);
  }
})();
`;

export const metadata: Metadata = {
  title: "ESP-Control Interface",
  description: "Hardware monitoring dashboard for ESP32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${jetbrainsMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
