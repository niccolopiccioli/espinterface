# ESP-Control Interface

Real-time dashboard for monitoring and controlling an **ESP32** board. Simulates GPIO, UART, I2C, and SPI interfaces with a standalone Express backend.

Built with **Next.js 15** (App Router), **React 19**, and **TypeScript**.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 3, shadcn/ui |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Backend | Express (standalone, port 3001) |

## Features

- **Dashboard** — real-time GPIO pin monitoring (input/output), LED indicators, digital output switches
- **Bus Monitor** — UART terminal (RX/TX with auto-scroll), I2C device scanner, SPI device list
- **4 Themes** — Dark, Light, Blue, Amber (CSS custom properties)
- **i18n** — Italian and English (React Context + localStorage)
- **Simulated Backend** — deterministic ESP32 hardware simulation, 2s polling interval

## Quick Start

```bash
# Install frontend dependencies
npm install

# Install and start backend simulator
cd backend
npm install
node server.js &

# Start frontend dev server
cd ..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (dashboard at `/dashboard`).

## Project Structure

```
app/              # Next.js App Router pages
  dashboard/      # Main monitoring interface
  logs/           # System communication logs
  settings/       # Language and theme configuration
  api/hardware/   # Legacy API route
backend/          # Standalone Express simulator (port 3001)
  server.js       # Deterministic hardware simulation
components/
  hardware/       # Sidebar, topbar, GPIO panel, bus monitor
  ui/             # shadcn/ui primitives
lib/              # Types, i18n, theme system, utilities
```
