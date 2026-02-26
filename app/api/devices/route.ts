import { NextResponse } from "next/server";
import type { GPIOState, I2CDevice, SPIDevice } from "@/lib/types";

// In-memory storage for devices
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

let i2cDevices: I2CDevice[] = [
  { address: "3C", name: "OLED Display 0.96\"", status: "connected" },
  { address: "68", name: "MPU6050 IMU", status: "connected" },
  { address: "76", name: "BME280 Sensor", status: "connected" },
];

let spiDevices: SPIDevice[] = [
  { id: "spi-0", name: "SD Card Module", mode: "0", maxSpeed: 25, status: "connected" },
];

export async function GET() {
  return NextResponse.json({
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
  }, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, action, device } = body;

    if (type === "gpio") {
      if (action === "add") {
        const newPin: GPIOState = {
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
        return NextResponse.json({ status: "ok", message: "GPIO device added" });
      }
      
      if (action === "update" && device.id !== undefined) {
        const isOutput = device.mode === "output";
        const list = isOutput ? gpioOutputs : gpioInputs;
        const index = list.findIndex(g => g.pin === device.pin);
        if (index !== -1) {
          list[index] = { ...list[index], label: device.label, mode: device.mode };
          return NextResponse.json({ status: "ok", message: "GPIO device updated" });
        }
        return NextResponse.json({ status: "error", message: "Device not found" }, { status: 404 });
      }
      
      if (action === "delete" && device.pin) {
        gpioOutputs = gpioOutputs.filter(g => g.pin !== device.pin);
        gpioInputs = gpioInputs.filter(g => g.pin !== device.pin);
        return NextResponse.json({ status: "ok", message: "GPIO device deleted" });
      }
    }

    if (type === "i2c") {
      if (action === "add") {
        const newDevice: I2CDevice = {
          address: device.address,
          name: device.name,
          status: "connected",
        };
        i2cDevices.push(newDevice);
        return NextResponse.json({ status: "ok", message: "I2C device added" });
      }
      
      if (action === "update" && device.address) {
        const index = i2cDevices.findIndex(d => d.address === device.address);
        if (index !== -1) {
          i2cDevices[index] = { ...i2cDevices[index], name: device.name };
          return NextResponse.json({ status: "ok", message: "I2C device updated" });
        }
        return NextResponse.json({ status: "error", message: "Device not found" }, { status: 404 });
      }
      
      if (action === "delete" && device.address) {
        i2cDevices = i2cDevices.filter(d => d.address !== device.address);
        return NextResponse.json({ status: "ok", message: "I2C device deleted" });
      }
    }

    if (type === "spi") {
      if (action === "add") {
        const newDevice: SPIDevice = {
          id: `spi-${Date.now()}`,
          name: device.name,
          mode: device.mode || "0",
          maxSpeed: device.maxSpeed || 25,
          status: "connected",
        };
        spiDevices.push(newDevice);
        return NextResponse.json({ status: "ok", message: "SPI device added" });
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
          return NextResponse.json({ status: "ok", message: "SPI device updated" });
        }
        return NextResponse.json({ status: "error", message: "Device not found" }, { status: 404 });
      }
      
      if (action === "delete" && device.id) {
        spiDevices = spiDevices.filter(d => d.id !== device.id);
        return NextResponse.json({ status: "ok", message: "SPI device deleted" });
      }
    }

    return NextResponse.json({ status: "error", message: "Invalid request" }, { status: 400 });
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 });
  }
}
