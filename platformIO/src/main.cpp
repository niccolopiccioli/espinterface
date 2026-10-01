#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// ==================== CONFIGURATION ====================
// WiFi credentials
const char* ssid = "SKYWIFI_THUJP";
const char* password = "3cyAKNtcDhRB";

// Hardware configuration
#define UART_BAUD_RATE 115200

// GPIO Pins configuration
const int OUTPUT_PINS[] = {4, 12, 13, 14};
const int INPUT_PINS[] = {15, 16, 17, 18};
const int NUM_OUTPUTS = 4;
const int NUM_INPUTS = 4;

// ==================== GLOBAL STATE ====================
const char* deviceName = "ESP32-WROOM-32";
const char* firmwareVersion = "v1.2.4";
unsigned long bootTime = 0;

bool outputStates[NUM_OUTPUTS] = {false, false, false, false};
bool inputStates[NUM_INPUTS] = {false, false, true, false};

String uartRxBuffer = "";
String uartTxBuffer = "";

// I2C devices
struct I2CDevice {
  uint8_t address;
  const char* name;
  bool connected;
};
I2CDevice i2cDevices[] = {
  {0x3C, "OLED Display 0.96\"", true},
  {0x68, "MPU6050 IMU", true},
  {0x76, "BME280 Sensor", true}
};

// SPI devices
struct SPIDevice {
  const char* id;
  const char* name;
  const char* mode;
  uint32_t maxSpeed;
  bool connected;
};
SPIDevice spiDevices[] = {
  {"spi-0", "SD Card Module", "0", 25000000, true}
};

// ==================== NETWORK ====================
WebServer server(80);
WebSocketsServer webSocket(81);

// ==================== HELPER FUNCTIONS ====================
unsigned long getUptime() {
  return (millis() - bootTime) / 1000;
}

void broadcastToClients(String message) {
  webSocket.broadcastTXT(message);
}

// ==================== GPIO FUNCTIONS ====================
void initGPIO() {
  for (int i = 0; i < NUM_OUTPUTS; i++) {
    pinMode(OUTPUT_PINS[i], OUTPUT);
    digitalWrite(OUTPUT_PINS[i], LOW);
  }
  for (int i = 0; i < NUM_INPUTS; i++) {
    pinMode(INPUT_PINS[i], INPUT);
  }
}

void readInputs() {
  for (int i = 0; i < NUM_INPUTS; i++) {
    inputStates[i] = digitalRead(INPUT_PINS[i]) == HIGH;
  }
}

void setOutput(int index, bool state) {
  if (index >= 0 && index < NUM_OUTPUTS) {
    outputStates[index] = state;
    digitalWrite(OUTPUT_PINS[index], state ? HIGH : LOW);
    
    DynamicJsonDocument doc(256);
    doc["type"] = "output_change";
    doc["pin"] = OUTPUT_PINS[index];
    doc["state"] = state;
    String output;
    serializeJson(doc, output);
    broadcastToClients(output);
  }
}

// ==================== HTML PAGES ====================
String getStatusHTML() {
  String html = R"(
    <!DOCTYPE html>
    <html>
    <head>
      <title>ESP32 Hardware Controller</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
        h1 { color: #00d4ff; }
        .card { background: #16213e; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .status { color: #00ff88; }
        a { color: #00d4ff; }
      </style>
    </head>
    <body>
      <h1>ESP32 Hardware Controller</h1>
      <div class="card">
        <p><strong>Device:</strong> ESP32-WROOM-32</p>
        <p><strong>Firmware:</strong> v1.2.4</p>
        <p><strong>Uptime:</strong> <span id="uptime">)" + String(getUptime()) + R"(</span> seconds</p>
        <p><strong>Status:</strong> <span class="status">Online</span></p>
      </div>
      <div class="card">
        <h2>API Endpoints</h2>
        <ul>
          <li><a href="/api/hardware">/api/hardware</a> - Full hardware status (GET)</li>
          <li>/api/hardware - Toggle outputs (POST)</li>
          <li><a href="/api/inputs">/api/inputs</a> - Read inputs (GET)</li>
          <li><a href="/api/outputs">/api/outputs</a> - Read outputs (GET)</li>
        </ul>
      </div>
      <script>
        setInterval(() => {
          fetch('/api/hardware').then(r => r.json()).then(data => {
            document.getElementById('uptime').textContent = data.data.hardware.uptime;
          });
        }, 1000);
      </script>
    </body>
    </html>
  )";
  return html;
}

// ==================== HTTP HANDLERS ====================
void handleRoot() {
  server.send(200, "text/html", getStatusHTML());
}

void handleHardware() {
  readInputs();
  
  DynamicJsonDocument doc(2048);
  doc["status"] = "ok";
  doc["timestamp"] = millis();
  
  JsonObject data = doc.createNestedObject("data");
  JsonObject hardware = data.createNestedObject("hardware");
  hardware["connected"] = true;
  hardware["deviceName"] = deviceName;
  hardware["firmwareVersion"] = firmwareVersion;
  hardware["uptime"] = getUptime();
  hardware["timestamp"] = millis();
  
  JsonObject digitalIO = data.createNestedObject("digitalIO");
  JsonArray outputs = digitalIO.createNestedArray("outputs");
  for (int i = 0; i < NUM_OUTPUTS; i++) {
    JsonObject output = outputs.createNestedObject();
    output["pin"] = String(OUTPUT_PINS[i]);
    output["mode"] = "output";
    output["state"] = outputStates[i];
    output["label"] = (i == 0) ? "LED Built-in" : (i == 1) ? "Relay 1" : (i == 2) ? "Relay 2" : "Buzzer";
  }
  
  JsonArray inputs = digitalIO.createNestedArray("inputs");
  for (int i = 0; i < NUM_INPUTS; i++) {
    JsonObject input = inputs.createNestedObject();
    input["pin"] = String(INPUT_PINS[i]);
    input["mode"] = "input";
    input["state"] = inputStates[i];
    input["label"] = (i == 0) ? "Button 0" : (i == 1) ? "Button 1" : (i == 2) ? "Sensor A" : "Sensor B";
  }
  
  JsonObject busMonitor = data.createNestedObject("busMonitor");
  JsonObject uart = busMonitor.createNestedObject("uart");
  uart["baudRate"] = UART_BAUD_RATE;
  uart["port"] = "uart0";
  JsonArray uartMessages = uart.createNestedArray("messages");
  if (uartRxBuffer.length() > 0) {
    JsonObject msg = uartMessages.createNestedObject();
    msg["id"] = "rx-1";
    msg["timestamp"] = millis();
    msg["direction"] = "rx";
    msg["data"] = uartRxBuffer;
  }
  
  JsonObject i2c = busMonitor.createNestedObject("i2c");
  JsonArray i2cDevs = i2c.createNestedArray("devices");
  for (int i = 0; i < 3; i++) {
    JsonObject dev = i2cDevs.createNestedObject();
    dev["address"] = String(i2cDevices[i].address, HEX);
    dev["name"] = i2cDevices[i].name;
    dev["status"] = i2cDevices[i].connected ? "connected" : "error";
  }
  i2c["busSpeed"] = 400;
  
  JsonObject spi = busMonitor.createNestedObject("spi");
  JsonArray spiDevs = spi.createNestedArray("devices");
  for (int i = 0; i < 1; i++) {
    JsonObject dev = spiDevs.createNestedObject();
    dev["id"] = spiDevices[i].id;
    dev["name"] = spiDevices[i].name;
    dev["mode"] = spiDevices[i].mode;
    dev["maxSpeed"] = spiDevices[i].maxSpeed;
    dev["status"] = spiDevices[i].connected ? "connected" : "error";
  }
  spi["mode"] = "0";
  
  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

void handleHardwarePost() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    DynamicJsonDocument doc(256);
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      const char* action = doc["action"];
      if (action && strcmp(action, "toggleOutput") == 0) {
        int pin = doc["pin"];
        bool state = doc["state"];
        
        for (int i = 0; i < NUM_OUTPUTS; i++) {
          if (OUTPUT_PINS[i] == pin) {
            setOutput(i, state);
            
            DynamicJsonDocument responseDoc(256);
            responseDoc["status"] = "ok";
            responseDoc["message"] = "GPIO " + String(pin) + " set to " + String(state ? "HIGH" : "LOW");
            responseDoc["timestamp"] = millis();
            String output;
            serializeJson(responseDoc, output);
            server.send(200, "application/json", output);
            return;
          }
        }
      }
    }
  }
  server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid request\"}");
}

void handleNotFound() {
  server.send(404, "application/json", "{\"status\":\"error\",\"message\":\"Not found\"}");
}

// ==================== WEBSOCKET HANDLER ====================
void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      
      DynamicJsonDocument doc(512);
      doc["type"] = "connected";
      doc["device"] = deviceName;
      doc["firmware"] = firmwareVersion;
      String output;
      serializeJson(doc, output);
      webSocket.sendTXT(num, output);
      break;
    }
    case WStype_TEXT: {
      Serial.printf("[%u] Received: %s\n", num, payload);
      DynamicJsonDocument doc(256);
      DeserializationError error = deserializeJson(doc, (char*)payload);
      
      if (!error) {
        const char* cmd = doc["command"];
        
        if (cmd && strcmp(cmd, "toggle") == 0) {
          int pin = doc["pin"];
          bool state = doc["state"];
          for (int i = 0; i < NUM_OUTPUTS; i++) {
            if (OUTPUT_PINS[i] == pin) {
              setOutput(i, state);
              break;
            }
          }
        }
        else if (cmd && strcmp(cmd, "getStatus") == 0) {
          readInputs();
          DynamicJsonDocument responseDoc(2048);
          responseDoc["type"] = "status";
          responseDoc["uptime"] = getUptime();
          
          JsonArray outputs = responseDoc.createNestedArray("outputs");
          for (int i = 0; i < NUM_OUTPUTS; i++) {
            JsonObject output = outputs.createNestedObject();
            output["pin"] = OUTPUT_PINS[i];
            output["state"] = outputStates[i];
          }
          
          JsonArray inputs = responseDoc.createNestedArray("inputs");
          for (int i = 0; i < NUM_INPUTS; i++) {
            JsonObject input = inputs.createNestedObject();
            input["pin"] = INPUT_PINS[i];
            input["state"] = inputStates[i];
          }
          
          String output;
          serializeJson(responseDoc, output);
          webSocket.sendTXT(num, output);
        }
      }
      break;
    }
    default:
      break;
  }
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n=== ESP32 Hardware Controller ===");
  Serial.println("Starting...");
  
  initGPIO();
  bootTime = millis();
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Failed! Starting AP...");
    WiFi.softAP("ESP32-Controller", "12345678");
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());
  }
  
  // Start WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket on port 81");
  
  // Setup HTTP routes
  server.on("/", handleRoot);
  server.on("/api/hardware", HTTP_GET, handleHardware);
  server.on("/api/hardware", HTTP_POST, handleHardwarePost);
  server.onNotFound(handleNotFound);
  
  server.begin();
  Serial.println("HTTP server started");
  
  Serial.print("Access: http://");
  Serial.println(WiFi.localIP());
}

// ==================== LOOP ====================
void loop() {
  webSocket.loop();
  server.handleClient();
  
  static unsigned long lastInputRead = 0;
  if (millis() - lastInputRead > 100) {
    readInputs();
    lastInputRead = millis();
  }
  
  if (Serial.available()) {
    String data = Serial.readString();
    if (data.length() > 0) {
      uartRxBuffer = data;
      uartRxBuffer.trim();
      
      DynamicJsonDocument doc(256);
      doc["type"] = "uart_rx";
      doc["data"] = uartRxBuffer;
      String output;
      serializeJson(doc, output);
      broadcastToClients(output);
    }
  }
  
  delay(1);
}
