// Utility to determine the correct API base URL based on current hostname
// If accessing via localhost/127.0.0.1 -> use simulation (localhost:3001)
// If accessing via IP address -> use ESP32 hardware directly

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001'; // Default for SSR
  }
  
  const hostname = window.location.hostname;
  
  // If accessing via localhost or 127.0.0.1, use simulation
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // If accessing via IP address (e.g., from phone or other device on network)
  // Connect directly to ESP32
  return `http://${hostname}`;
}

export function getWsBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3002';
  }
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:3002';
  }
  
  // For IP access, WebSocket is on port 81 of the ESP32
  return `ws://${hostname}:81`;
}

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getConnectionMode(): 'simulation' | 'hardware' {
  return isLocalhost() ? 'simulation' : 'hardware';
}
