"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Cpu, FileText, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

const navItems = [
  {
    href: "/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/devices",
    labelKey: "nav.devices",
    icon: Cpu,
  },
  {
    href: "/logs",
    labelKey: "nav.logs",
    icon: FileText,
  },
  {
    href: "/settings",
    labelKey: "nav.settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button - left side, small */}
      <button
        onClick={toggleSidebar}
        className="fixed top-3.5 left-4 z-50 p-1.5 rounded-md bg-card border border-border md:hidden"
        aria-label="Toggle menu"
      >
        {mounted && isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mounted && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-40 h-screen border-r border-border bg-card transition-transform duration-300 md:translate-x-0",
          mounted && isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - visible on both, left on desktop, right on mobile */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6 md:justify-start justify-end">
            <div className="flex h-9 w-9 items-center justify-center rounded-md" 
              style={{ backgroundColor: 'var(--hw-success-dim)' }}
            >
              <Cpu className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
            </div>
            <div className="text-right md:text-left">
              <h1 className="text-sm font-bold text-foreground">ESP-Control</h1>
              <p className="text-xs text-muted-foreground">Interface v1.0</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--hw-success-dim)]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  style={isActive ? { color: 'var(--hw-success)' } : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ 
                        backgroundColor: 'var(--hw-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                  )}
                  <Icon className="h-4 w-4 z-10 shrink-0" />
                  <span className="z-10 truncate">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground text-center">
              ESP32 Hardware Interface
            </p>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden md:block md:ml-64" />
    </>
  );
}

// Mobile-aware main content wrapper
export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:ml-64">
      {children}
    </div>
  );
}
