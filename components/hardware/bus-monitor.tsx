"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BusMonitorData, UARTMessage, I2CDevice, SPIDevice } from "@/lib/types";
import { Terminal, Usb, Cpu, ArrowDownLeft, ArrowUpRight, CircuitBoard } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface BusMonitorProps {
  data: BusMonitorData;
}

export function BusMonitor({ data }: BusMonitorProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-card border-border rounded-2xl shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg lg:text-xl font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--hw-active)' }} />
          {t("bus.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="uart" className="w-full">
          <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: 'var(--hw-surface-light)' }}>
            <TabsTrigger value="uart" className="gap-2 text-xs lg:text-sm">
              <Terminal className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              {t("bus.uart")}
            </TabsTrigger>
            <TabsTrigger value="i2c" className="gap-2 text-xs lg:text-sm">
              <Usb className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              {t("bus.i2c")}
            </TabsTrigger>
            <TabsTrigger value="spi" className="gap-2 text-xs lg:text-sm">
              <Cpu className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              {t("bus.spi")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uart" className="mt-4">
            <UARTTerminal messages={data.uart.messages} baudRate={data.uart.baudRate} port={data.uart.port} />
          </TabsContent>

          <TabsContent value="i2c" className="mt-4">
            <I2CDeviceList devices={data.i2c.devices} busSpeed={data.i2c.busSpeed} />
          </TabsContent>

          <TabsContent value="spi" className="mt-4">
            <SPIDeviceList devices={data.spi.devices} mode={data.spi.mode} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface UARTTerminalProps {
  messages: UARTMessage[];
  baudRate: number;
  port: string;
}

function UARTTerminal({ messages, baudRate, port }: UARTTerminalProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">{t("bus.port")}: {port}</span>
        <span className="font-mono">{t("bus.baud")}: {baudRate}</span>
      </div>
      
      <div className="relative rounded-md border overflow-hidden" style={{ backgroundColor: 'var(--hw-surface)', borderColor: 'var(--border)' }}>
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: 'var(--hw-surface-light)', borderColor: 'var(--border)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.6)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(245, 158, 11, 0.6)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.6)' }} />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">
            /dev/{port}
          </span>
        </div>

        {/* Terminal content */}
        <ScrollArea className="h-64">
          <div ref={scrollRef} className="p-3 space-y-1">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-sm font-mono">
                {t("bus.waiting")}
              </p>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.direction === 'rx' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 font-mono text-sm"
                >
                  <span className="text-muted-foreground text-xs shrink-0">
                    [{msg.timestamp.split('T')[1].split('.')[0]}]
                  </span>
                  {msg.direction === 'rx' ? (
                    <ArrowDownLeft className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--hw-success)' }} />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--hw-active)' }} />
                  )}
                  <span style={{ color: msg.direction === 'rx' ? 'var(--hw-terminal)' : 'var(--hw-active)' }}>
                    {msg.data}
                  </span>
                </motion.div>
              ))
            )}
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-4"
              style={{ backgroundColor: 'var(--hw-terminal)' }}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface I2CDeviceListProps {
  devices: I2CDevice[];
  busSpeed: number;
}

function I2CDeviceList({ devices, busSpeed }: I2CDeviceListProps) {
  const { t } = useLanguage();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'danger';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return t("bus.connected");
      case 'error': return t("bus.error");
      default: return t("bus.notFound");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">Bus: I2C0</span>
        <span className="font-mono">{t("bus.speed")}: {busSpeed}kHz</span>
      </div>

      <div className="space-y-2">
        {devices.map((device, index) => (
          <motion.div
            key={device.address}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-md border"
            style={{ backgroundColor: 'var(--hw-surface-light)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--hw-surface)' }}>
                <CircuitBoard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {device.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  0x{device.address}
                </p>
              </div>
            </div>
            <Badge variant={getStatusVariant(device.status) as any}>
              {getStatusLabel(device.status)}
            </Badge>
          </motion.div>
        ))}
      </div>

      {devices.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          {t("bus.noDevices")}
        </p>
      )}
    </div>
  );
}

interface SPIDeviceListProps {
  devices: SPIDevice[];
  mode: string;
}

function SPIDeviceList({ devices, mode }: SPIDeviceListProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">Bus: SPI0</span>
        <span className="font-mono">Mode: {mode}</span>
      </div>

      <div className="space-y-2">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-md border"
            style={{ backgroundColor: 'var(--hw-surface-light)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--hw-surface)' }}>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {device.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {device.id} | {device.maxSpeed}MHz
                </p>
              </div>
            </div>
            <Badge variant={device.status === 'connected' ? 'success' : 'danger'}>
              {device.status === 'connected' ? t("bus.connected") : t("bus.error")}
            </Badge>
          </motion.div>
        ))}
      </div>

      {devices.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          {t("bus.noDevices")}
        </p>
      )}
    </div>
  );
}
