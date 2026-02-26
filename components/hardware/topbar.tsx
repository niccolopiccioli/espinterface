"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  connected: boolean;
  deviceName: string;
  onPing?: () => void;
}

export function Topbar({ connected, deviceName, onPing }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-full items-center justify-between px-3 md:px-6">
        {/* Page Title */}
        <div className="ml-10 md:ml-0">
          <h2 className="text-sm md:text-lg font-semibold text-foreground">Hardware Dashboard</h2>
          <p className="text-xs text-muted-foreground font-mono hidden md:block">
            {deviceName}
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 md:gap-4">
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
