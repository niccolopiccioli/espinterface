import { NextResponse } from "next/server";
import type { HardwareAPIMessage, GPIOState, UARTMessage, I2CDevice, SPIDevice } from "@/lib/types";

// Hardware state (simulated in memory)
let gpioOutputs: GPIOState[] = [
  { pin: "04", mode: "output", state: false, label: "LED Built-in" },
  { pin: "12", mode: "output", state: false, label: "Relay 1" },
  { pin: "13", mode: "output", state: false, label: "Relay 2" },
  { pin: "14", mode: "output", state: false, label: "Buzzer" },
];

let gpioInputs: GPIOState[] = [
  { pin: "15", mode: "input", state: false, label: "Button 0" },
  { pin: "16", mode: "input", state: false, label: "Button 1" },
  { pin: "17", mode: "input", state: true, label: "Sensor A" },
  { pin: "18", mode: "input", state: false, label: "Sensor B" },
];

let uartMessages: UARTMessage[] = [
  { id: "init-1", timestamp: "2024-01-15T10:00:00.000Z", direction: "rx", data: "System initialized" },
];

let i2cDevices: I2CDevice[] = [
  { address: "3C", name: "OLED Display 0.96\"", status: "connected" },
  { address: "68", name: "MPU6050 IMU", status: "connected" },
  { address: "76", name: "BME280 Sensor", status: "connected" },
];

let spiDevices: SPIDevice[] = [
  { id: "spi-0", name: "SD Card Module", mode: "0", maxSpeed: 25, status: "connected" },
];

// Request counter for deterministic simulation
let requestCount = 0;
let messageIdCounter = 1;

// Simulate hardware changes - deterministic based on request count
function simulateHardwareChanges() {
  requestCount++;
  
  // Toggle inputs based on request count (deterministic)
  if (requestCount % 7 === 0) {
    gpioInputs = gpioInputs.map((gpio, i) => ({
      ...gpio,
      state: i === 0 ? !gpio.state : gpio.state,
    }));
  }
  
  if (requestCount % 11 === 0) {
    gpioInputs = gpioInputs.map((gpio, i) => ({
      ...gpio,
      state: i === 2 ? !gpio.state : gpio.state,
    }));
  }

  // Add UART message based on request count
  if (requestCount % 5 === 0) {
    const sampleMessages = [
      "Data packet received: 0xA5",
      "I2C write: 0x3C <- 0x00",
      "SPI transfer complete",
      "Sensor reading: 23.5C",
      "Memory check: OK",
      "Watchdog reset: OK",
    ];
    const messageIndex = (requestCount / 5) % sampleMessages.length;
    messageIdCounter++;
    const newMessage: UARTMessage = {
      id: `msg-${messageIdCounter}-${requestCount}`,
      timestamp: `2024-01-15T10:${String(requestCount % 60).padStart(2, '0')}:00.000Z`,
      direction: requestCount % 2 === 0 ? "rx" : "tx",
      data: sampleMessages[messageIndex],
    };
    uartMessages = [...uartMessages.slice(-50), newMessage];
  }

  // Change I2C status based on request count
  if (requestCount % 13 === 0) {
    const statuses: Array<"connected" | "error" | "not_found"> = ["connected", "error", "connected"];
    const statusIndex = Math.floor(requestCount / 13) % 3;
    i2cDevices = i2cDevices.map((device, i) =>
      i === 0 ? { ...device, status: statuses[statusIndex] } : device
    );
  }
}

export async function GET() {
  // Simulate hardware changes on each request
  simulateHardwareChanges();

  const response: HardwareAPIMessage = {
    status: "ok",
    timestamp: "2024-01-15T10:30:00.000Z",
    data: {
      hardware: {
        connected: true,
        deviceName: "ESP32-WROOM-32",
        firmwareVersion: "v1.2.4",
        uptime: (requestCount * 10) % 86400,
        timestamp: "2024-01-15T10:30:00.000Z",
      },
      digitalIO: {
        outputs: gpioOutputs,
        inputs: gpioInputs,
      },
      busMonitor: {
        uart: {
          messages: uartMessages,
          baudRate: 115200,
          port: "uart0",
        },
        i2c: {
          devices: i2cDevices,
          busSpeed: 400,
        },
        spi: {
          devices: spiDevices,
          mode: "0",
        },
      },
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pin, state } = body;

    if (action === "toggleOutput" && pin !== undefined && state !== undefined) {
      // Update GPIO output state
      gpioOutputs = gpioOutputs.map((gpio) =>
        gpio.pin === pin ? { ...gpio, state } : gpio
      );

      // Add UART message for the action
      messageIdCounter++;
      const actionMessage: UARTMessage = {
        id: `toggle-${messageIdCounter}`,
        timestamp: "2024-01-15T10:30:00.000Z",
        direction: "tx",
        data: `GPIO ${pin} set to ${state ? "HIGH" : "LOW"}`,
      };
      uartMessages = [...uartMessages.slice(-50), actionMessage];

      return NextResponse.json({
        status: "ok",
        message: `GPIO ${pin} set to ${state ? "HIGH" : "LOW"}`,
        timestamp: "2024-01-15T10:30:00.000Z",
      });
    }

    return NextResponse.json(
      { status: "error", message: "Invalid action" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid request body" },
      { status: 400 }
    );
  }
}
