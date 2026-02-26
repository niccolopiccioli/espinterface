"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { Cpu, Plus, Pencil, Trash2, Save, X, Wifi, Usb, Home } from "lucide-react";

// Backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types
interface GPIOState {
  pin: string;
  mode: "output" | "input";
  state: boolean;
  label: string;
}

interface I2CDevice {
  address: string;
  name: string;
  status: "connected" | "error" | "not_found";
}

interface SPIDevice {
  id: string;
  name: string;
  mode: string;
  maxSpeed: number;
  status: "connected" | "error";
}

interface DevicesData {
  gpio: {
    outputs: GPIOState[];
    inputs: GPIOState[];
  };
  i2c: I2CDevice[];
  spi: SPIDevice[];
}

interface DevicesResponse {
  status: string;
  data: DevicesData;
}

// Form state for adding/editing devices
interface GPIOFormData {
  pin: string;
  mode: "output" | "input";
  label: string;
}

interface I2CFormData {
  address: string;
  name: string;
}

interface SPIFormData {
  name: string;
  mode: string;
  maxSpeed: number;
}

type EditingGPIO = GPIOState | null;
type EditingI2C = I2CDevice | null;
type EditingSPI = SPIDevice | null;

export default function DevicesPage() {
  const { t } = useLanguage();
  const [devices, setDevices] = useState<DevicesData | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // GPIO forms
  const [showGPIOForm, setShowGPIOForm] = useState(false);
  const [editingGPIO, setEditingGPIO] = useState<EditingGPIO>(null);
  const [gpioForm, setGpioForm] = useState<GPIOFormData>({ pin: "", mode: "output", label: "" });
  
  // I2C forms
  const [showI2CForm, setShowI2CForm] = useState(false);
  const [editingI2C, setEditingI2C] = useState<EditingI2C>(null);
  const [i2cForm, setI2cForm] = useState<I2CFormData>({ address: "", name: "" });
  
  // SPI forms
  const [showSPIForm, setShowSPIForm] = useState(false);
  const [editingSPI, setEditingSPI] = useState<EditingSPI>(null);
  const [spiForm, setSpiForm] = useState<SPIFormData>({ name: "", mode: "0", maxSpeed: 25 });

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/devices`);
      if (response.ok) {
        const data: DevicesResponse = await response.json();
        setDevices(data.data);
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // GPIO handlers
  const handleSaveGPIO = async () => {
    const action = editingGPIO ? "update" : "add";
    await fetch(`${API_BASE}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "gpio", action, device: { ...gpioForm, id: editingGPIO?.pin } }),
    });
    setShowGPIOForm(false);
    setEditingGPIO(null);
    setGpioForm({ pin: "", mode: "output", label: "" });
    fetchDevices();
  };

  const handleDeleteGPIO = async (pin: string) => {
    await fetch(`${API_BASE}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "gpio", action: "delete", device: { pin } }),
    });
    fetchDevices();
  };

  const startEditGPIO = (gpio: GPIOState) => {
    setEditingGPIO(gpio);
    setGpioForm({ pin: gpio.pin, mode: gpio.mode, label: gpio.label });
    setShowGPIOForm(true);
  };

  // I2C handlers
  const handleSaveI2C = async () => {
    const action = editingI2C ? "update" : "add";
    await fetch(`${API_BASE}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "i2c", action, device: i2cForm }),
    });
    setShowI2CForm(false);
    setEditingI2C(null);
    setI2cForm({ address: "", name: "" });
    fetchDevices();
  };

  const handleDeleteI2C = async (address: string) => {
    await fetch(`${API_BASE}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "i2c", action: "delete", device: { address } }),
    });
    fetchDevices();
  };

  const startEditI2C = (device: I2CDevice) => {
    setEditingI2C(device);
    setI2cForm({ address: device.address, name: device.name });
    setShowI2CForm(true);
  };

  // SPI handlers
  const handleSaveSPI = async () => {
    const action = editingSPI ? "update" : "add";
    await fetch(`${API_BASE}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "spi", action, device: { ...spiForm, id: editingSPI?.id } }),
    });
    setShowSPIForm(false);
    setEditingSPI(null);
    setSpiForm({ name: "", mode: "0", maxSpeed: 25 });
    fetchDevices();
  };

  const handleDeleteSPI = async (id: string) => {
    await fetch(`${API_BASE}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "spi", action: "delete", device: { id } }),
    });
    fetchDevices();
  };

  const startEditSPI = (device: SPIDevice) => {
    setEditingSPI(device);
    setSpiForm({ name: device.name, mode: device.mode, maxSpeed: device.maxSpeed });
    setShowSPIForm(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">
        {t("devices.title")}
      </h1>

        {/* GPIO Section */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Cpu className="h-5 w-5" style={{ color: 'var(--hw-warning)' }} />
                {t("devices.gpio")}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setShowGPIOForm(true); setEditingGPIO(null); setGpioForm({ pin: "", mode: "output", label: "" }); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("devices.add")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* GPIO Form */}
            {showGPIOForm && (
              <div className="mb-4 p-3 bg-secondary rounded-lg space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">{t("devices.pin")}</Label>
                    <Input 
                      value={gpioForm.pin} 
                      onChange={(e) => setGpioForm({...gpioForm, pin: e.target.value})}
                      placeholder="04"
                      disabled={!!editingGPIO}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("devices.mode")}</Label>
                    <Select 
                      value={gpioForm.mode} 
                      onValueChange={(v) => setGpioForm({...gpioForm, mode: v as "output" | "input"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="output">{t("devices.output")}</SelectItem>
                        <SelectItem value="input">{t("devices.input")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("devices.label")}</Label>
                    <Input 
                      value={gpioForm.label} 
                      onChange={(e) => setGpioForm({...gpioForm, label: e.target.value})}
                      placeholder="LED"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveGPIO}>
                    <Save className="h-4 w-4 mr-1" />
                    {t("devices.save")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowGPIOForm(false); setEditingGPIO(null); }}>
                    <X className="h-4 w-4 mr-1" />
                    {t("devices.cancel")}
                  </Button>
                </div>
              </div>
            )}

            {/* Outputs */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("devices.output")}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {devices?.gpio.outputs.map((gpio) => (
                  <div key={gpio.pin} className="flex items-center justify-between p-2 border rounded-lg bg-secondary/50">
                    <div>
                      <span className="font-mono text-sm font-bold">GPIO{gpio.pin}</span>
                      <p className="text-xs text-muted-foreground">{gpio.label}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditGPIO(gpio)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteGPIO(gpio.pin)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("devices.input")}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {devices?.gpio.inputs.map((gpio) => (
                  <div key={gpio.pin} className="flex items-center justify-between p-2 border rounded-lg bg-secondary/50">
                    <div>
                      <span className="font-mono text-sm font-bold">GPIO{gpio.pin}</span>
                      <p className="text-xs text-muted-foreground">{gpio.label}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditGPIO(gpio)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteGPIO(gpio.pin)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* I2C Section */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Wifi className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
                {t("devices.i2c")}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setShowI2CForm(true); setEditingI2C(null); setI2cForm({ address: "", name: "" }); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("devices.add")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* I2C Form */}
            {showI2CForm && (
              <div className="mb-4 p-3 bg-secondary rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">{t("devices.address")} (hex)</Label>
                    <Input 
                      value={i2cForm.address} 
                      onChange={(e) => setI2cForm({...i2cForm, address: e.target.value.toUpperCase()})}
                      placeholder="3C"
                      disabled={!!editingI2C}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("devices.name")}</Label>
                    <Input 
                      value={i2cForm.name} 
                      onChange={(e) => setI2cForm({...i2cForm, name: e.target.value})}
                      placeholder="OLED Display"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveI2C}>
                    <Save className="h-4 w-4 mr-1" />
                    {t("devices.save")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowI2CForm(false); setEditingI2C(null); }}>
                    <X className="h-4 w-4 mr-1" />
                    {t("devices.cancel")}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {devices?.i2c.map((device) => (
                <div key={device.address} className="flex items-center justify-between p-2 border rounded-lg bg-secondary/50">
                  <div>
                    <span className="font-mono text-sm font-bold">0x{device.address}</span>
                    <p className="text-xs text-muted-foreground">{device.name}</p>
                    <Badge variant={device.status === "connected" ? "success" : "destructive"} className="mt-1 text-[10px]">
                      {device.status === "connected" ? t("devices.connected") : t("devices.disconnected")}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditI2C(device)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteI2C(device.address)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SPI Section */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Usb className="h-5 w-5" style={{ color: '#3B82F6' }} />
                {t("devices.spi")}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setShowSPIForm(true); setEditingSPI(null); setSpiForm({ name: "", mode: "0", maxSpeed: 25 }); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("devices.add")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* SPI Form */}
            {showSPIForm && (
              <div className="mb-4 p-3 bg-secondary rounded-lg space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">{t("devices.name")}</Label>
                    <Input 
                      value={spiForm.name} 
                      onChange={(e) => setSpiForm({...spiForm, name: e.target.value})}
                      placeholder="SD Card"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("devices.modeSpi")}</Label>
                    <Select 
                      value={spiForm.mode} 
                      onValueChange={(v) => setSpiForm({...spiForm, mode: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Mode 0</SelectItem>
                        <SelectItem value="1">Mode 1</SelectItem>
                        <SelectItem value="2">Mode 2</SelectItem>
                        <SelectItem value="3">Mode 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("devices.speed")}</Label>
                    <Input 
                      type="number"
                      value={spiForm.maxSpeed} 
                      onChange={(e) => setSpiForm({...spiForm, maxSpeed: parseInt(e.target.value) || 25})}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveSPI}>
                    <Save className="h-4 w-4 mr-1" />
                    {t("devices.save")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowSPIForm(false); setEditingSPI(null); }}>
                    <X className="h-4 w-4 mr-1" />
                    {t("devices.cancel")}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {devices?.spi.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-2 border rounded-lg bg-secondary/50">
                  <div>
                    <span className="text-sm font-bold">{device.name}</span>
                    <p className="text-xs text-muted-foreground">Mode {device.mode} | {device.maxSpeed} MHz</p>
                    <Badge variant={device.status === "connected" ? "success" : "destructive"} className="mt-1 text-[10px]">
                      {device.status === "connected" ? t("devices.connected") : t("devices.disconnected")}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditSPI(device)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSPI(device.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
