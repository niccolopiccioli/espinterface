"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DigitalIOPanel } from "@/components/hardware/digital-io-panel";
import { BusMonitor } from "@/components/hardware/bus-monitor";
import { Topbar } from "@/components/hardware/topbar";
import { Separator } from "@/components/ui/separator";
import type { HardwareAPIMessage } from "@/lib/types";
import { Activity, Clock, Zap, Cpu, Settings } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Backend URL - configure here
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function DashboardPage() {
  const [hardwareData, setHardwareData] = useState<HardwareAPIMessage["data"] | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const fetchHardwareStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/hardware`);
      if (response.ok) {
        const data: HardwareAPIMessage = await response.json();
        setHardwareData(data.data);
        setConnected(data.data.hardware.connected);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHardwareStatus();
    const interval = setInterval(fetchHardwareStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchHardwareStatus]);

  const handlePing = () => {
    fetchHardwareStatus();
  };

  const handleOutputToggle = async (pin: string, state: boolean) => {
    try {
      await fetch(`${API_BASE}/api/hardware`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleOutput", pin, state }),
      });
      fetchHardwareStatus();
    } catch (error) {
      console.error("Failed to toggle output:", error);
    }
  };

  const hardware = hardwareData?.hardware;
  const digitalIO = hardwareData?.digitalIO;
  const busMonitor = hardwareData?.busMonitor;

  return (
    <div className="flex flex-col gap-3 md:gap-4 lg:gap-6 pb-8">
      
      {/* Topbar with connection status and ping - FULL WIDTH */}
      <Topbar 
        connected={connected} 
        deviceName={hardware?.deviceName || "ESP32"} 
        onPing={fetchHardwareStatus}
      />
      
      {/* Content with side margins */}
      <div className="px-4 md:px-8">
        {/* Status Cards - responsive: 2x2 su mobile, 4 in riga su desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-6 mb-4 md:mb-6">
          <StatusCard
            icon={Cpu}
            label={t("status.device")}
            value={hardware?.deviceName?.replace("ESP32-WROOM-32", "ESP32") || (loading ? "..." : "N/A")}
            color="var(--hw-success)"
          />
          <StatusCard
            icon={Zap}
            label={t("status.firmware")}
            value={hardware?.firmwareVersion || (loading ? "..." : "N/A")}
            color="var(--hw-active)"
          />
          <StatusCard
            icon={Clock}
            label={t("status.uptime")}
            value={hardware?.uptime ? `${Math.floor(hardware.uptime / 3600)}h` : (loading ? "..." : "N/A")}
            color="var(--hw-warning)"
          />
          <StatusCard
            icon={Activity}
            label={t("status.status")}
            value={connected ? t("status.online") : (loading ? "..." : t("status.offline"))}
            color={connected ? "var(--hw-success)" : "var(--hw-danger)"}
          />
        </div>

        {/* Pannelli Hardware - stacked su mobile, affiancati su desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <div className="overflow-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center rounded-2xl bg-card border shadow-lg min-h-[300px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 rounded-full"
                  style={{ borderColor: 'var(--hw-success)', borderTopColor: 'transparent' }}
                />
              </div>
            ) : (
              <DigitalIOPanel
                outputs={digitalIO?.outputs || []}
                inputs={digitalIO?.inputs || []}
                onOutputToggle={handleOutputToggle}
              />
            )}
          </div>

          <div className="overflow-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center rounded-2xl bg-card border shadow-lg min-h-[300px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 rounded-full"
                  style={{ borderColor: 'var(--hw-success)', borderTopColor: 'transparent' }}
                />
              </div>
            ) : (
              <BusMonitor
                data={busMonitor || { uart: { messages: [], baudRate: 115200, port: "uart0" }, i2c: { devices: [], busSpeed: 400 }, spi: { devices: [], mode: "0" } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

function StatusCard({ icon: Icon, label, value, color }: StatusCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-2 md:p-3 rounded-2xl bg-card border shadow-lg"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 md:p-2 rounded-md shrink-0" style={{ backgroundColor: 'var(--hw-surface-light)', color }}>
          <Icon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-[10px] md:text-xs lg:text-sm font-semibold text-foreground font-mono truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
