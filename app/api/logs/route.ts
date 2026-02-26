import { NextResponse } from "next/server";

// Log levels
type LogLevel = "info" | "success" | "warning" | "error";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: "system" | "uart" | "gpio" | "i2c" | "spi";
  message: string;
}

// In-memory log storage
const systemLogs: LogEntry[] = [
  { id: "init-1", timestamp: new Date(Date.now() - 300000).toISOString(), level: "info", source: "system", message: "System boot initiated" },
  { id: "init-2", timestamp: new Date(Date.now() - 290000).toISOString(), level: "info", source: "system", message: "CPU frequency set to 240 MHz" },
  { id: "init-3", timestamp: new Date(Date.now() - 280000).toISOString(), level: "info", source: "system", message: "Memory initialization: 320 KB DRAM available" },
  { id: "init-4", timestamp: new Date(Date.now() - 270000).toISOString(), level: "success", source: "system", message: "WiFi initialization completed" },
  { id: "init-5", timestamp: new Date(Date.now() - 260000).toISOString(), level: "info", source: "system", message: "Connecting to WiFi network..." },
  { id: "init-6", timestamp: new Date(Date.now() - 250000).toISOString(), level: "success", source: "system", message: "WiFi connected: SSID=HomeNetwork" },
  { id: "init-7", timestamp: new Date(Date.now() - 240000).toISOString(), level: "info", source: "system", message: "IP address assigned: 192.168.1.100" },
  { id: "init-8", timestamp: new Date(Date.now() - 230000).toISOString(), level: "info", source: "i2c", message: "I2C bus scanning..." },
  { id: "init-9", timestamp: new Date(Date.now() - 220000).toISOString(), level: "success", source: "i2c", message: "I2C device found at address 0x3C (OLED Display)" },
  { id: "init-10", timestamp: new Date(Date.now() - 210000).toISOString(), level: "success", source: "i2c", message: "I2C device found at address 0x68 (MPU6050 IMU)" },
  { id: "init-11", timestamp: new Date(Date.now() - 200000).toISOString(), level: "success", source: "i2c", message: "I2C device found at address 0x76 (BME280 Sensor)" },
  { id: "init-12", timestamp: new Date(Date.now() - 190000).toISOString(), level: "info", source: "spi", message: "SPI bus initialized (MOSI=23, MISO=19, CLK=18)" },
  { id: "init-13", timestamp: new Date(Date.now() - 180000).toISOString(), level: "success", source: "spi", message: "SD Card module detected" },
  { id: "init-14", timestamp: new Date(Date.now() - 170000).toISOString(), level: "info", source: "system", message: "GPIO pins configured" },
  { id: "init-15", timestamp: new Date(Date.now() - 160000).toISOString(), level: "success", source: "system", message: "Web server started on port 80" },
  { id: "init-16", timestamp: new Date(Date.now() - 150000).toISOString(), level: "info", source: "system", message: "NTP time synchronized" },
  { id: "init-17", timestamp: new Date(Date.now() - 140000).toISOString(), level: "info", source: "system", message: "OTA update service enabled" },
  { id: "init-18", timestamp: new Date(Date.now() - 130000).toISOString(), level: "success", source: "system", message: "All services initialized successfully" },
];

// Request counter for deterministic simulation
let requestCount = 0;
let logIdCounter = 18;

// Generate deterministic log entries based on request count
function generateLogEntry(requestNum: number): LogEntry | null {
  const messages: Array<{ level: LogLevel; source: LogEntry["source"]; getMessage: (n: number) => string }> = [
    { 
      level: "info", 
      source: "gpio", 
      getMessage: (n) => n % 2 === 0 ? `GPIO state changed: GPIO04 -> ${n % 4 === 0 ? "HIGH" : "LOW"}` : `GPIO state changed: GPIO12 -> ${n % 3 === 0 ? "HIGH" : "LOW"}`
    },
    { 
      level: "info", 
      source: "uart", 
      getMessage: (n) => {
        const uartMsgs = [
          "Data packet received: 0xA5",
          "UART RX: 64 bytes",
          "Frame check: OK",
          "CRC validation: passed",
        ];
        return uartMsgs[n % uartMsgs.length];
      }
    },
    { 
      level: "success", 
      source: "i2c", 
      getMessage: (n) => {
        const i2cMsgs = [
          "I2C write: 0x3C <- 0x00 (command)",
          "I2C read: 0x68 = 0x1F",
          "I2C burst read: 8 bytes",
        ];
        return i2cMsgs[n % i2cMsgs.length];
      }
    },
    { 
      level: "info", 
      source: "spi", 
      getMessage: (n) => {
        const spiMsgs = [
          "SPI transfer complete",
          "SD Card: read block 0x0000",
          "SPI DMA transfer: 512 bytes",
        ];
        return spiMsgs[n % spiMsgs.length];
      }
    },
    { 
      level: "warning", 
      source: "system", 
      getMessage: (n) => {
        const warnMsgs = [
          "High temperature: 45°C",
          "Low memory warning: < 10KB free",
          "WiFi signal weak: -75 dBm",
        ];
        return warnMsgs[n % warnMsgs.length];
      }
    },
    { 
      level: "info", 
      source: "system", 
      getMessage: (n) => {
        const sysMsgs = [
          "Heartbeat: system alive",
          "Watchdog timer reset",
          "Task: sensor_read running",
          "Heap free: 125KB",
        ];
        return sysMsgs[n % sysMsgs.length];
      }
    },
  ];

  // Select message type based on request number (deterministic)
  const msgIndex = requestNum % messages.length;
  const selected = messages[msgIndex];
  
  return {
    id: `log-${++logIdCounter}`,
    timestamp: new Date().toISOString(),
    level: selected.level,
    source: selected.source,
    message: selected.getMessage(requestNum),
  };
}

export async function GET() {
  requestCount++;

  // Generate new log entry occasionally
  if (requestCount % 3 === 0) {
    const newLog = generateLogEntry(requestCount);
    if (newLog) {
      systemLogs.push(newLog);
      // Keep only last 200 logs
      if (systemLogs.length > 200) {
        systemLogs.shift();
      }
    }
  }

  // Occasionally generate error logs
  if (requestCount % 17 === 0) {
    const errorLogs = [
      { level: "error" as LogLevel, source: "i2c" as const, message: "I2C device 0x76 not responding" },
      { level: "error" as LogLevel, source: "uart" as const, message: "UART frame error: malformed packet" },
      { level: "error" as LogLevel, source: "spi" as const, message: "SD Card: write failed (timeout)" },
    ];
    const errorIndex = (requestCount / 17) % errorLogs.length;
    const errorLog = errorLogs[errorIndex];
    systemLogs.push({
      id: `error-${logIdCounter}`,
      timestamp: new Date().toISOString(),
      ...errorLog,
    });
  }

  // Return logs in reverse order (newest first)
  const logs = [...systemLogs].reverse();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    data: {
      logs,
      total: logs.length,
    },
  }, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}
