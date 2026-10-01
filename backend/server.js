const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;
const WS_PORT = 3002;
const DATA_FILE = path.join(__dirname, 'devices-data.json');

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });

// WebSocket clients
let wsClients = [];

// Broadcast to all connected WebSocket clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('📡 Client WebSocket connesso');
  wsClients.push(ws);
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connesso alla scheda simulata ESP32',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (e) {
      console.error('Errore parsing messaggio:', e);
    }
  });

  ws.on('close', () => {
    console.log('📡 Client WebSocket disconnesso');
    wsClients = wsClients.filter(client => client !== ws);
  });
});

// Handle WebSocket messages (commands from user)
function handleWebSocketMessage(ws, data) {
  const { command, pin, value } = data;
  
  console.log(`📡 Comando ricevuto: ${command}`, data);

  switch (command) {
    case 'setOutput':
      // Find and update output
      const outputIndex = gpioOutputs.findIndex(g => g.pin === pin);
      if (outputIndex !== -1) {
        gpioOutputs[outputIndex].state = value;
        
        // Broadcast the change to all clients
        broadcastToClients({
          type: 'outputChanged',
          pin: pin,
          state: value,
          timestamp: new Date().toISOString()
        });
        
        // Also add UART message
        messageIdCounter++;
        const actionMessage = {
          id: `ws-${messageIdCounter}`,
          timestamp: new Date().toISOString(),
          direction: "tx",
          data: `GPIO ${pin} set to ${value ? "HIGH" : "LOW"}`,
        };
        uartMessages = [...uartMessages.slice(-50), actionMessage];
        
        // Broadcast UART message
        broadcastToClients({
          type: 'uartMessage',
          message: actionMessage,
          timestamp: new Date().toISOString()
        });
        
        // Save to file
        saveDevices();
      }
      break;
      
    case 'getStatus':
      // Send full status
      ws.send(JSON.stringify({
        type: 'status',
        hardware: {
          connected: true,
          deviceName: "ESP32-WROOM-32 (Simulato)",
          firmwareVersion: "v1.2.4-sim",
          uptime: Math.floor((Date.now() - startTime) / 1000)
        },
        digitalIO: {
          outputs: gpioOutputs,
          inputs: gpioInputs
        },
        busMonitor: {
          uart: { messages: uartMessages.slice(-10), baudRate: 115200, port: "uart0" },
          i2c: { devices: i2cDevices, busSpeed: 400 },
          spi: { devices: spiDevices, mode: "0" }
        },
        timestamp: new Date().toISOString()
      }));
      break;

    case 'readInput':
      // Simulate reading an input
      const input = gpioInputs.find(g => g.pin === pin);
      if (input) {
        ws.send(JSON.stringify({
          type: 'inputRead',
          pin: pin,
          state: input.state,
          timestamp: new Date().toISOString()
        }));
      }
      break;

    case 'scanI2C':
      // Simulate I2C scan
      ws.send(JSON.stringify({
        type: 'i2cScan',
        devices: i2cDevices,
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      console.log('Comando sconosciuto:', command);
  }
}

// Start time for uptime calculation
let startTime = Date.now();

console.log(`📡 WebSocket server avviato sulla porta ${WS_PORT}`);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Default hardware state
const defaultDevices = {
  gpioOutputs: [
    { pin: "04", mode: "output", state: false, label: "LED Built-in" },
    { pin: "12", mode: "output", state: false, label: "Relay 1" },
    { pin: "13", mode: "output", state: false, label: "Relay 2" },
    { pin: "14", mode: "output", state: false, label: "Buzzer" },
  ],
  gpioInputs: [
    { pin: "15", mode: "input", state: false, label: "Button 0" },
    { pin: "16", mode: "input", state: false, label: "Button 1" },
    { pin: "17", mode: "input", state: true, label: "Sensor A" },
    { pin: "18", mode: "input", state: false, label: "Sensor B" },
  ],
  i2cDevices: [
    { address: "3C", name: "OLED Display 0.96\"", status: "connected" },
    { address: "68", name: "MPU6050 IMU", status: "connected" },
    { address: "76", name: "BME280 Sensor", status: "connected" },
  ],
  spiDevices: [
    { id: "spi-0", name: "SD Card Module", mode: "0", maxSpeed: 25, status: "connected" },
  ],
};

// Load devices from file or use defaults
function loadDevices() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log('📂 Dispositivi caricati da file');
      return data;
    }
  } catch (error) {
    console.error('Errore nel caricamento:', error);
  }
  console.log('📂 Usando dispositivi predefiniti');
  return defaultDevices;
}

// Save devices to file
function saveDevices() {
  try {
    const data = {
      gpioOutputs,
      gpioInputs,
      i2cDevices,
      spiDevices,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Dispositivi salvati su file');
  } catch (error) {
    console.error('Errore nel salvataggio:', error);
  }
}

// Initialize devices
let { gpioOutputs, gpioInputs, i2cDevices, spiDevices } = loadDevices();

let uartMessages = [
  { id: "init-1", timestamp: "2024-01-15T10:00:00.000Z", direction: "rx", data: "System initialized" },
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

// GET /api/hardware - Get all hardware data (for dashboard)
app.get('/api/hardware', (req, res) => {
  simulateHardwareChanges();

  const response = {
    status: "ok",
    timestamp: new Date().toISOString(),
    data: {
      hardware: {
        connected: true,
        deviceName: "ESP32-WROOM-32",
        firmwareVersion: "v1.2.4",
        uptime: (requestCount * 10) % 86400,
        timestamp: new Date().toISOString(),
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

// GET /api/devices - Get all devices
app.get('/api/devices', (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    data: {
      gpio: {
        outputs: gpioOutputs,
        inputs: gpioInputs,
      },
      i2c: i2cDevices,
      spi: spiDevices,
    },
  });
});

// POST /api/devices - Add/Update/Delete devices
app.post('/api/devices', (req, res) => {
  const { type, action, device } = req.body;

  if (type === "gpio") {
    if (action === "add") {
      const newPin = {
        pin: device.pin,
        mode: device.mode,
        state: false,
        label: device.label,
      };
      if (device.mode === "output") {
        gpioOutputs.push(newPin);
      } else {
        gpioInputs.push(newPin);
      }
      saveDevices();
      return res.json({ status: "ok", message: "GPIO device added" });
    }
    
    if (action === "update" && device.pin) {
      const isOutput = device.mode === "output";
      const list = isOutput ? gpioOutputs : gpioInputs;
      const index = list.findIndex(g => g.pin === device.pin);
      if (index !== -1) {
        list[index] = { ...list[index], label: device.label, mode: device.mode };
        saveDevices();
        return res.json({ status: "ok", message: "GPIO device updated" });
      }
      return res.status(404).json({ status: "error", message: "Device not found" });
    }
    
    if (action === "delete" && device.pin) {
      gpioOutputs = gpioOutputs.filter(g => g.pin !== device.pin);
      gpioInputs = gpioInputs.filter(g => g.pin !== device.pin);
      saveDevices();
      return res.json({ status: "ok", message: "GPIO device deleted" });
    }
  }

  if (type === "i2c") {
    if (action === "add") {
      const newDevice = {
        address: device.address,
        name: device.name,
        status: "connected",
      };
      i2cDevices.push(newDevice);
      saveDevices();
      return res.json({ status: "ok", message: "I2C device added" });
    }
    
    if (action === "update" && device.address) {
      const index = i2cDevices.findIndex(d => d.address === device.address);
      if (index !== -1) {
        i2cDevices[index] = { ...i2cDevices[index], name: device.name };
        saveDevices();
        return res.json({ status: "ok", message: "I2C device updated" });
      }
      return res.status(404).json({ status: "error", message: "Device not found" });
    }
    
    if (action === "delete" && device.address) {
      i2cDevices = i2cDevices.filter(d => d.address !== device.address);
      saveDevices();
      return res.json({ status: "ok", message: "I2C device deleted" });
    }
  }

  if (type === "spi") {
    if (action === "add") {
      const newDevice = {
        id: `spi-${Date.now()}`,
        name: device.name,
        mode: device.mode || "0",
        maxSpeed: device.maxSpeed || 25,
        status: "connected",
      };
      spiDevices.push(newDevice);
      saveDevices();
      return res.json({ status: "ok", message: "SPI device added" });
    }
    
    if (action === "update" && device.id) {
      const index = spiDevices.findIndex(d => d.id === device.id);
      if (index !== -1) {
        spiDevices[index] = { 
          ...spiDevices[index], 
          name: device.name,
          mode: device.mode,
          maxSpeed: device.maxSpeed,
        };
        saveDevices();
        return res.json({ status: "ok", message: "SPI device updated" });
      }
      return res.status(404).json({ status: "error", message: "Device not found" });
    }
    
    if (action === "delete" && device.id) {
      spiDevices = spiDevices.filter(d => d.id !== device.id);
      saveDevices();
      return res.json({ status: "ok", message: "SPI device deleted" });
    }
  }

  res.status(400).json({ status: "error", message: "Invalid request" });
});

server.listen(PORT, () => {
  console.log(`ESP-Control Backend running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/hardware`);
  console.log(`WebSocket available at ws://localhost:${WS_PORT}`);
});
