"use client";

import { Topbar } from "@/components/hardware/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { FileText, AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function LogsPage() {
  const { t } = useLanguage();

  const logs = [
    { id: 1, timestamp: "10:23:45", level: "info", message: "System boot completed" },
    { id: 2, timestamp: "10:23:46", level: "info", message: "WiFi initialized" },
    { id: 3, timestamp: "10:23:47", level: "info", message: "I2C bus scanning..." },
    { id: 4, timestamp: "10:23:48", level: "success", message: "Found 3 I2C devices" },
    { id: 5, timestamp: "10:23:49", level: "info", message: "SPI initialized" },
    { id: 6, timestamp: "10:24:00", level: "info", message: "Web server started on port 80" },
    { id: 7, timestamp: "10:25:12", level: "warning", message: "High temperature: 45°C" },
    { id: 8, timestamp: "10:26:30", level: "info", message: "GPIO state changed: GPIO04 -> HIGH" },
    { id: 9, timestamp: "10:27:15", level: "error", message: "I2C device 0x76 not responding" },
    { id: 10, timestamp: "10:28:00", level: "info", message: "Watchdog reset prevented" },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success": return <CheckCircle className="h-3 w-3" />;
      case "warning": return <AlertTriangle className="h-3 w-3" />;
      case "error": return <AlertCircle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getLevelVariant = (level: string) => {
    switch (level) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "destructive";
      default: return "secondary";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "success": return t("logs.success");
      case "warning": return t("logs.warning");
      case "error": return t("logs.error");
      default: return t("logs.info");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success": return "var(--hw-success)";
      case "warning": return "var(--hw-warning)";
      case "error": return "var(--hw-danger)";
      default: return "var(--hw-active)";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar connected={true} deviceName="ESP32-WROOM-32" />

      <div className="flex-1 p-3 md:p-4 lg:p-6">
        <Card className="bg-card border-border h-full flex flex-col">
          <CardHeader className="pb-3 md:pb-4 shrink-0">
            <CardTitle className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
              {t("logs.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-0">
            <ScrollArea className="h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)]">
              <div className="space-y-2 pr-2 md:pr-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 md:p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--hw-surface-light)', 
                      borderColor: 'var(--border)' 
                    }}
                  >
                    {/* Timestamp */}
                    <span className="text-[10px] md:text-xs text-muted-foreground font-mono shrink-0">
                      {log.timestamp}
                    </span>
                    
                    {/* Level Badge */}
                    <Badge 
                      variant={getLevelVariant(log.level) as any}
                      className="shrink-0 text-[10px] md:text-xs w-fit"
                    >
                      <span className="mr-1" style={{ color: getLevelColor(log.level) }}>
                        {getLevelIcon(log.level)}
                      </span>
                      {getLevelLabel(log.level)}
                    </Badge>
                    
                    {/* Message */}
                    <span className="text-xs md:text-sm text-foreground break-words">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
