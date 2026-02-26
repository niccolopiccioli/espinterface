const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Hardware state (simulated in memory)
let gpioOutputs = [
  { pin: "04", mode: "output", state: false, label: "LED Built-in" },
  { pin: "12", mode: "output", state: false, label: "Relay 1" },
  { pin: "13", mode: "output", state: false, label: "Relay 2" },
  { pin: "14", mode: "output", state: false, label: "Buzzer" },
];

let gpioInputs = [
  { pin: "15", mode: "input", state: false, label: "Button 0" },
  { pin: "16", mode: "input", state: false, label: "Button 1" },
  { pin: "17", mode: "input", state: true, label: "Sensor A" },
  { pin: "18", mode: "input", state: false, label: "Sensor B" },
];

let uartMessages = [
  { id: "init-1", timestamp: "2024-01-15T10:00:00.000Z", direction: "rx", data: "System initialized" },
];

let i2cDevices = [
  { address: "3C", name: "OLED Display 0.96\"", status: "connected" },
  { address: "68", name: "MPU6050 IMU", status: "connected" },
  { address: "76", name: "BME280 Sensor", status: "connected" },
];

let spiDevices = [
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
    const messageIndex = Math.floor(requestCount / 5) % sampleMessages.length;
    messageIdCounter++;
    const newMessage = {
      id: `msg-${messageIdCounter}-${requestCount}`,
      timestamp: `2024-01-15T10:${String(requestCount % 60).padStart(2, '0')}:00.000Z`,
      direction: requestCount % 2 === 0 ? "rx" : "tx",
      data: sampleMessages[messageIndex],
    };
    uartMessages = [...uartMessages.slice(-50), newMessage];
  }

  // Change I2C status based on request count
  if (requestCount % 13 === 0) {
    const statuses = ["connected", "error", "connected"];
    const statusIndex = Math.floor(requestCount / 13) % 3;
    i2cDevices = i2cDevices.map((device, i) =>
      i === 0 ? { ...device, status: statuses[statusIndex] } : device
    );
  }
}

// GET /api/hardware - Get all hardware data
app.get('/api/hardware', (req, res) => {
  simulateHardwareChanges();

  const response = {
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

  res.json(response);
});

// POST /api/hardware - Toggle GPIO output
app.post('/api/hardware', (req, res) => {
  const { action, pin, state } = req.body;

  if (action === "toggleOutput" && pin !== undefined && state !== undefined) {
    // Update GPIO output state
    gpioOutputs = gpioOutputs.map((gpio) =>
      gpio.pin === pin ? { ...gpio, state } : gpio
    );

    // Add UART message for the action
    messageIdCounter++;
    const actionMessage = {
      id: `toggle-${messageIdCounter}`,
      timestamp: "2024-01-15T10:30:00.000Z",
      direction: "tx",
      data: `GPIO ${pin} set to ${state ? "HIGH" : "LOW"}`,
    };
    uartMessages = [...uartMessages.slice(-50), actionMessage];

    res.json({
      status: "ok",
      message: `GPIO ${pin} set to ${state ? "HIGH" : "LOW"}`,
      timestamp: "2024-01-15T10:30:00.000Z",
    });
  } else {
    res.status(400).json({ status: "error", message: "Invalid action" });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ESP-Control Backend running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/hardware`);
});
