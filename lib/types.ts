// Hardware TypeScript Interfaces - NO ANY allowed

export interface GPIOState {
  pin: string;
  mode: 'output' | 'input';
  state: boolean;
  label: string;
}

export interface DigitalIOData {
  outputs: GPIOState[];
  inputs: GPIOState[];
}

export interface UARTMessage {
  id: string;
  timestamp: string;
  direction: 'rx' | 'tx';
  data: string;
}

export interface I2CDevice {
  address: string;
  name: string;
  status: 'connected' | 'error' | 'not_found';
}

export interface SPIDevice {
  id: string;
  name: string;
  mode: string;
  maxSpeed: number;
  status: 'connected' | 'error';
}

export interface BusMonitorData {
  uart: {
    messages: UARTMessage[];
    baudRate: number;
    port: string;
  };
  i2c: {
    devices: I2CDevice[];
    busSpeed: number;
  };
  spi: {
    devices: SPIDevice[];
    mode: string;
  };
}

export interface HardwareStatus {
  connected: boolean;
  deviceName: string;
  firmwareVersion: string;
  uptime: number;
  timestamp: string;
}

export interface HardwareAPIMessage {
  status: 'ok' | 'error';
  timestamp: string;
  data: {
    hardware: HardwareStatus;
    digitalIO: DigitalIOData;
    busMonitor: BusMonitorData;
  };
}
