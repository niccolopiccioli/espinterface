"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { Wifi, WifiOff, Send, Terminal, Cpu, Play, Square, RefreshCw } from "lucide-react";

// WebSocket URL - configure here
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3002";

interface LogEntry {
  id: number;
  type: "sent" | "received" | "error" | "info";
  message: string;
  timestamp: string;
}

interface WSStatus {
  connected: boolean;
  lastMessage: string;
}

export function WebSocketPanel() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<WSStatus>({ connected: false, lastMessage: "" });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState("");
  const [outputs, setOutputs] = useState<{ pin: string; label: string; state: boolean }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const logIdRef = useRef(0);

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const newLog: LogEntry = {
      id: logIdRef.current++,
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [...prev.slice(-50), newLog]); // Keep last 50 logs
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus({ connected: true, lastMessage: "Connesso!" });
      addLog("info", "Connesso al simulatore ESP32");

      // Request initial status
      ws.send(JSON.stringify({ command: "getStatus" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatus(prev => ({ ...prev, lastMessage: JSON.stringify(data).slice(0, 50) }));

        switch (data.type) {
          case "connected":
            addLog("received", data.message);
            break;
          case "status":
            addLog("received", "Status ricevuto");
            setOutputs(data.digitalIO.outputs);
            break;
          case "outputChanged":
            addLog("received", `GPIO ${data.pin} → ${data.state ? "ON" : "OFF"}`);
            setOutputs(prev => prev.map(o =>
              o.pin === data.pin ? { ...o, state: data.state } : o
            ));
            break;
          case "uartMessage":
            addLog("info", `UART: ${data.message.data}`);
            break;
          default:
            addLog("received", event.data);
        }
      } catch (e) {
        addLog("received", event.data);
      }
    };

    ws.onerror = (error) => {
      addLog("error", "Errore WebSocket");
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      setStatus({ connected: false, lastMessage: "Disconnesso" });
      addLog("info", "Disconnesso dal simulatore");
      wsRef.current = null;
    };
  }, [addLog]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendCommand = useCallback((cmd: string, data: object = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ command: cmd, ...data });
      wsRef.current.send(message);
      addLog("sent", `${cmd} ${JSON.stringify(data)}`);
    } else {
      addLog("error", "Non connesso!");
    }
  }, [addLog]);

  const handleToggleOutput = (pin: string, state: boolean) => {
    sendCommand("setOutput", { pin, value: state });
  };

  const handleRefresh = () => {
    sendCommand("getStatus");
  };

  const handleScanI2C = () => {
    sendCommand("scanI2C");
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Auto-reconnect if disconnected
  useEffect(() => {
    const interval = setInterval(() => {
      if (!status.connected && wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status.connected, connect]);

  return (
    <Card className="bg-card border-border rounded-2xl shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5" style={{ color: 'var(--hw-active)' }} />
            Simulatore ESP32
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={status.connected ? "success" : "destructive"} className="flex items-center gap-1">
              {status.connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {status.connected ? "Online" : "Offline"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={status.connected ? disconnect : connect}
            >
              {status.connected ? "Disconnetti" : "Connetti"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Output Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Controllo Uscite</h4>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleScanI2C}>
                Scan I2C
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {outputs.map((output) => (
              <div
                key={output.pin}
                className="flex items-center justify-between p-2 rounded-md border"
                style={{ backgroundColor: 'var(--hw-surface-light)', borderColor: 'var(--border)' }}
              >
                <div>
                  <p className="text-xs font-mono font-semibold">GPIO {output.pin}</p>
                  <p className="text-[10px] text-muted-foreground">{output.label}</p>
                </div>
                <Switch
                  checked={output.state}
                  onCheckedChange={(checked) => handleToggleOutput(output.pin, checked)}
                  disabled={!status.connected}
                />
              </div>
            ))}
          </div>

          {outputs.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              {status.connected ? "Nessun output configurato" : "Connettiti per vedere le uscite"}
            </p>
          )}
        </div>

        {/* Console */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            Console
          </h4>

          <div
            className="h-32 overflow-y-auto rounded-md border p-2 font-mono text-xs space-y-1"
            style={{ backgroundColor: '#0d1117', borderColor: 'var(--border)' }}
          >
            {logs.map((log) => (
              <div
                key={log.id}
                className={
                  log.type === "sent" ? "text-green-400" :
                    log.type === "received" ? "text-blue-400" :
                      log.type === "error" ? "text-red-400" :
                        "text-yellow-400"
                }
              >
                <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                {log.type === "sent" ? "→" : log.type === "received" ? "←" : "⚠"}{" "}
                {log.message}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Comando personalizzato (JSON)..."
              className="font-mono text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && command) {
                  try {
                    const data = JSON.parse(command);
                    sendCommand(data.command || data.cmd, data);
                    setCommand("");
                  } catch {
                    addLog("error", "JSON non valido");
                  }
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (command) {
                  try {
                    const data = JSON.parse(command);
                    sendCommand(data.command || data.cmd, data);
                    setCommand("");
                  } catch {
                    addLog("error", "JSON non valido");
                  }
                }
              }}
              disabled={!status.connected}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
