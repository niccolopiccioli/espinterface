"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wifi, WifiOff, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  connected: boolean;
  deviceName: string;
  onPing?: () => void;
}

export function Topbar({ connected, deviceName, onPing }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-20 md:h-24 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 relative">
      <div className="flex h-full items-center justify-between w-full px-4 md:px-8">
        
        {/* Settings Button - Left */}
        <div className="flex-shrink-0">
          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          </Link>
        </div>

        {/* Center - Title and Device Name - FULL PAGE CENTERED */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">
            Hardware Dashboard
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-mono">
            {deviceName}
          </p>
        </div>

        {/* Right - Connection Status */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onPing}
            className="gap-1 md:gap-2 border-border hover:bg-secondary px-2 md:px-3"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Ping</span>
          </Button>

          <motion.div
            initial={false}
            animate={{ scale: connected ? 1 : 1 }}
            className="flex items-center gap-1 md:gap-2 rounded-md px-2 md:px-3 py-1"
          >
            {connected ? (
              <>
                <motion.div
                  animate={{ 
                    boxShadow: ["0 0 4px var(--hw-success)", "0 0 12px var(--hw-success)", "0 0 4px var(--hw-success)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative flex h-2.5 w-2.5"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: 'var(--hw-success)' }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: 'var(--hw-success)' }} />
                </motion.div>
                <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--hw-success)' }}>
                  <span className="md:hidden">●</span>
                  <span className="hidden md:inline">Connected</span>
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" style={{ color: 'var(--hw-danger)' }} />
                <span className="text-xs md:text-sm font-medium hidden md:inline" style={{ color: 'var(--hw-danger)' }}>
                  Disconnected
                </span>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
