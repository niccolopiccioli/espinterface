"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { FileText, AlertCircle, AlertTriangle, CheckCircle, Info, Loader2, Home } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-config";

// Get API base URL based on access method (localhost = simulation, IP = hardware)
const API_BASE = getApiBaseUrl();

// Log level types
type LogLevel = "info" | "success" | "warning" | "error";
type LogSource = "system" | "uart" | "gpio" | "i2c" | "spi";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
}

interface LogsResponse {
  status: string;
  timestamp: string;
  data: {
    logs: LogEntry[];
    total: number;
  };
}

export default function LogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/logs`);
      if (response.ok) {
        const data: LogsResponse = await response.json();
        setLogs(data.data.logs);
        setConnected(true);
      } else {
        setConnected(false);
        setLogs([]);
      }
    } catch {
      setConnected(false);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("it-IT", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
  };

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

  const getSourceBadge = (source: LogSource) => {
    const colors: Record<LogSource, string> = {
      system: "var(--hw-active)",
      uart: "#8B5CF6",
      gpio: "#F59E0B",
      i2c: "#10B981",
      spi: "#3B82F6",
    };
    return (
      <Badge variant="outline" className="text-[10px] md:text-xs shrink-0 border">
        <span className="mr-1" style={{ color: colors[source] }}>●</span>
        {source.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col px-4 md:px-8 pb-8">
      <Card className="bg-card border-border h-full flex flex-col">
        <CardHeader className="pb-3 md:pb-4 shrink-0 flex flex-row items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
            {t("logs.title")}
          </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {logs.length} {t("logs.entries") || "entries"}
              </span>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
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
                      {formatTimestamp(log.timestamp)}
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

                    {/* Source Badge */}
                    {getSourceBadge(log.source)}
                    
                    {/* Message */}
                    <span className="text-xs md:text-sm text-foreground break-words">
                      {log.message}
                    </span>
                  </div>
                ))}
                {!loading && logs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t("logs.noLogs") || "No logs available"}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
    </div>
  );
}
