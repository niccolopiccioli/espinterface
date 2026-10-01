"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, Settings, Home, LogOut, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { signOut, useSession } from "next-auth/react";

interface HeaderProps {
  deviceName?: string;
}

export function Header({ deviceName = "ESP32" }: HeaderProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  // Don't show header on login page
  if (pathname === "/login") {
    return null;
  }

  const isAuthenticated = status === "authenticated";
  const userName = session?.user?.name || session?.user?.email || "User";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur border-b border-border">
        <div className="h-full px-4 flex items-center justify-between">
          
          {/* Home/Settings e Logout a sinistra */}
          <div className="flex items-center gap-2">
            {pathname === "/dashboard" ? (
              <Link href="/settings">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--hw-surface-light)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    height: '2rem',
                  }}
                >
                  <Settings className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: 'var(--hw-success)' }} />
                  <span className="text-[10px] md:text-xs lg:text-sm text-foreground">
                    {t("nav.settings")}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/dashboard">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--hw-surface-light)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    height: '2rem',
                  }}
                >
                  <Home className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: 'var(--hw-success)' }} />
                  <span className="text-[10px] md:text-xs lg:text-sm text-foreground">
                    Home
                  </span>
                </div>
              </Link>
            )}

            {/* Logout button */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--hw-danger-dim)',
                  border: '1px solid var(--hw-danger)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  height: '2rem',
                }}
                title="Sign out"
              >
                <LogOut className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: 'var(--hw-danger)' }} />
                <span className="text-[10px] md:text-xs lg:text-sm" style={{ color: 'var(--hw-danger)' }}>
                  Logout
                </span>
              </button>
            )}
          </div>

          {/* Hardware Dashboard - al centro */}
          <div className="absolute right-4 md:static md:absolute md:left-1/2 md:-translate-x-1/2 md:text-center flex flex-col items-end md:items-center">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-foreground">Hardware Dashboard</h2>
            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground hidden md:block">{deviceName}</p>
          </div>

          {/* Logo e User info a destra */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-2 px-3 py-1.5" style={{ 
                backgroundColor: 'var(--hw-surface-light)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
              }}>
                <User className="h-4 w-4" style={{ color: 'var(--hw-success)' }} />
                <span className="text-xs text-foreground">{userName}</span>
              </div>
            )}
            <div>
              <h1 className="text-sm lg:text-base font-bold text-foreground">ESP-Control</h1>
              <p className="text-[10px] lg:text-xs text-muted-foreground">Interface v1.0</p>
            </div>
            <div 
              className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--hw-success-dim)' }}
            >
              <Cpu className="h-6 w-6 lg:h-7 lg:w-7" style={{ color: 'var(--hw-success)' }} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
