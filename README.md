# ESP-Control Interface - Documentazione Tecnica

## Indice

1. [Panoramica del Progetto](#1-panoramica-del-progetto)
2. [Architettura Generale](#2-architettura-generale)
3. [Stack Tecnologico](#3-stack-tecnologico)
4. [Struttura dei File](#4-struttura-dei-file)
5. [Componenti Principali](#5-componenti-principali)
6. [Sistema Backend (Simulatore)](#6-sistema-backend-simulatore)
7. [Sistema di Internazionalizzazione (i18n)](#7-sistema-di-internazionalizzazione-i18n)
8. [Sistema Temi](#8-sistema-temi)
9. [Flusso dei Dati](#9-flusso-dei-dati)
10. [TypeScript Interfaces](#10-typescript-interfaces)
11. [Animazioni e Interazioni](#11-animazioni-e-interazioni)
12. [Gestione degli Stati](#12-gestione-degli-stati)

---

## 1. Panoramica del Progetto

**ESP-Control Interface** è un'applicazione web Next.js che funge da dashboard per il monitoraggio e controllo di una scheda ESP32. L'applicazione permette di:

- Visualizzare lo stato dei pin GPIO (ingressi e uscite)
- Monitorare i bus di comunicazione (UART, I2C, SPI)
- Controllare le uscite digitali tramite switch
- Cambiare lingua (italiano/inglese)
- Scegliere tra 4 temi visivi (Dark, Light, Blue, Amber)

---

## 2. Architettura Generale

L'applicazione utilizza l'**App Router** di Next.js (versione 14+), che significa:

- **Server Components**: Pagine prerenderizzate per performance ottimali
- **Client Components**: Componenti interattivi con stato React ("use client")
- **API Routes**: Endpoint integrati nel backend Next.js

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Dashboard │  │   Logs   │  │ Settings │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │            │            │                         │
│       └────────────┼────────────┘                         │
│                    ▼                                      │
│         ┌─────────────────────┐                           │
│         │   Backend Server    │  ◄── Node.js/Express      │
│         │   (Port 3001)       │  ◄── SIMULATORE           │
│         └─────────┬───────────┘                           │
└──────────────────┼────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   ESP32 (Simulato) │  ◄── Logica hardware
         └─────────────────────┘
```

---

## 3. Stack Tecnologico

| Tecnologia | Versione | Utilizzo |
|------------|----------|----------|
| **Next.js** | 15.x | Framework React con App Router |
| **React** | 19.x | Libreria UI |
| **TypeScript** | 5.x | Tipizzazione statica |
| **Tailwind CSS** | 3.x | Styling utility-first |
| **Framer Motion** | 11.x | Animazioni React |
| **shadcn/ui** | Latest | Componenti UI base (Radix) |
| **Lucide React** | Latest | Icone |

---

## 4. Struttura dei File

```
esp-control-interface/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Redirect a /dashboard
│   ├── dashboard/                # Nuova area Dashboard
│   │   └── page.tsx              # Monitor & Control principale
│   ├── api/
│   │   └── hardware/
│   │       └── route.ts          # API Route (Fallback/Legacy)
│   ├── globals.css               # Variabili CSS globali
│   ├── layout.tsx                # Layout root della app
│   ├── loading.tsx               # Loading skeleton (i18n)
│   ├── error.tsx                 # Pagina errore (i18n)
│   ├── not-found.tsx             # Pagina 404 (i18n)
│   ├── logs/
│   │   └── page.tsx              # Pagina log di sistema
│   └── settings/
│       └── page.tsx              # Pagina impostazioni
│
├── backend/                      # Backend standalone
│   ├── server.js                 # Express server (Port 3001)
│   └── package.json              # Dipendenze backend
│
├── components/
│   ├── hardware/                 # Componenti specifici hardware
│   │   ├── sidebar.tsx           # Navigazione laterale
│   │   ├── topbar.tsx            # Barra superiore con status
│   │   ├── digital-io-panel.tsx  # Pannello GPIO
│   │   └── bus-monitor.tsx       # Monitor bus UART/I2C/SPI
│   ├── ui/                       # Componenti shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── switch.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── label.tsx
│   │   └── skeleton.tsx
│   ├── providers.tsx             # Context providers (tema/lingua)
│   └── theme-variables.tsx       # Applicazione variabili tema
│
├── lib/
│   ├── types.ts                  # Interfacce TypeScript
│   ├── utils.ts                  # Funzioni utility (cn)
│   ├── i18n.tsx                  # Sistema internazionalizzazione
│   └── theme.tsx                 # Sistema temi
│
├── tailwind.config.ts            # Configurazione Tailwind
├── tsconfig.json                 # Configurazione TypeScript
└── package.json                  # Dipendenze npm
```

---

## 5. Componenti Principali

### 5.1 Sidebar (`components/hardware/sidebar.tsx`)

**Funzione**: Navigazione principale dell'applicazione

**Caratteristiche**:
- 3 voci di menu: Dashboard, Logs, Settings
- Highlight della voce attiva con animazione Framer Motion
- Logo ESP-Control con icona CPU
- Links con `next/link` per navigazione client-side

```tsx
// Struttura dati navigazione
const navItems = [
  { href: "/dashboard", label: "Monitor & Control", icon: LayoutDashboard },
  { href: "/logs", label: "Communication Logs", icon: FileText },
  { href: "/settings", label: "Configuration", icon: Settings },
];
```

### 5.2 Topbar (`components/hardware/topbar.tsx`)

**Funzione**: Barra superiore con stato connessione e pulsante ping

**Caratteristiche**:
- Indicatore visivo di connessione (pulsante verde/rosso)
- Animazione "ping" con effetto glow
- Pulsante per ricaricare i dati hardware

### 5.3 DigitalIOPanel (`components/hardware/digital-io-panel.tsx`)

**Funzione**: Controllo e visualizzazione GPIO

**Caratteristiche**:
- **Uscite (Output)**: Switch shadcn/ui per accendere/spegnere
- **Ingressi (Input)**: Badge che mostra stato HIGH/LOW
- LED indicatori visivi (verde = ON, rosso = OFF)
- Animazioni Framer Motion al hover

### 5.4 BusMonitor (`components/hardware/bus-monitor.tsx`)

**Funzione**: Monitoraggio protocolli UART, I2C, SPI

**Caratteristiche**:
- Tabs per cambiare visualizzazione protocollo
- **UART**: Terminale con auto-scroll, colori diversi per RX/TX
- **I2C**: Lista dispositivi con indirizzo HEX e stato
- **SPI**: Lista dispositivi con ID e velocità

---

## 6. Sistema Backend (Simulatore)

L'applicazione comunica con un backend Express standalone (di default sulla porta 3001) che simula l'hardware dell'ESP32.

### 6.1 Endpoint GET

**URL**: `http://localhost:3001/api/hardware`

**Risposta**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hardware": {
      "connected": true,
      "deviceName": "ESP32-WROOM-32",
      "firmwareVersion": "v1.2.4",
      "uptime": 3600
    },
    // ... digitalIO e busMonitor
  }
}
```

### 6.2 Endpoint POST

**URL**: `http://localhost:3001/api/hardware`

**Body richiesta**:
```json
{
  "action": "toggleOutput",
  "pin": "04",
  "state": true
}
```

### 6.3 Simulazione Deterministica

Il server (`backend/server.js`) implementa una simulazione deterministica basata su un contatore di richieste per simulare:
- Toggle degli input GPIO.
- Generazione di messaggi UART dinamici.
- Cambiamenti di stato dei dispositivi I2C.

---

## 7. Sistema di Internazionalizzazione (i18n)

### 7.1 Struttura

Il sistema i18n è implementato in `lib/i18n.tsx` usando React Context.

**Caratteristiche**:
- **Supporto Pagine Speciali**: Traduzioni per Error Page, 404 Not Found e Loading skeletons.
- **Persistenza**: La lingua viene salvata in `localStorage` e recuperata all'avvio.
- **SSR-Ready**: Gestione del context non disponibile durante il rendering lato server.

**Chiavi di traduzione** (esempi):
```typescript
const translations = {
  "error.title": { en: "Something went wrong!", it: "Qualcosa è andato storto!" },
  "notfound.page": { en: "Page Not Found", it: "Pagina Non Trovata" },
  "loading.wait": { en: "Loading...", it: "Caricamento..." },
  // ... oltre 100 chiavi
};
```

### 7.2 LanguageProvider

Il `LanguageProvider` avvolge l'intera applicazione in `layout.tsx`.

```tsx
// Salvataggio in localStorage
localStorage.setItem("esp-control-language", "it");

// Hook per accedere alle traduzioni
const { t, language, setLanguage } = useLanguage();
```

### 7.3 Utilizzo nei Componenti

Ogni componente che usa testi visibili utilizza `useLanguage()`:

```tsx
function MyComponent() {
  const { t } = useLanguage();
  return <h1>{t("header.title")}</h1>;
}
```

---

## 8. Sistema Temi

### 8.1 Configurazione Temi

4 temi definiti in `lib/theme.tsx`:

| Tema | Colore Primary | Colore Success | Background |
|------|---------------|----------------|------------|
| **Dark** | #10b981 (smeraldo) | #10b981 | #1a1a1a |
| **Light** | #10b981 | #10b981 | #f5f5f5 |
| **Blue** | #3b82f6 (blu) | #3b82f6 | #1e3a5f |
| **Amber** | #f59e0b (ambra) | #f59e0b | #292524 |

### 8.2 Applicazione Tema

Il componente `ThemeVariables` (`components/theme-variables.tsx`) applica i colori:

```tsx
useEffect(() => {
  // 1. Rimuovi classi tema esistenti
  document.documentElement.classList.remove('dark', 'light', 'blue', 'amber');
  
  // 2. Aggiungi classe tema corrente
  document.documentElement.classList.add(theme);
  
  // 3. Imposta variabili CSS
  document.documentElement.style.setProperty('--hw-success', colors.success);
  // ... altre variabili
}, [theme, colors]);
```

### 83. Variabili CSS

I colori sono definiti come variabili CSS in `app/globals.css`:

```css
:root {
  --hw-success: #10b981;
  --hw-success-dim: rgba(16, 185, 129, 0.15);
  --hw-surface: #1a1a1a;
  /* ... */
}

.light {
  --hw-success: #10b981;
  --hw-surface: #f5f5f5;
  /* ... */
}
```

---

## 9. Flusso dei Dati

### 9.1 Fetching Dati Hardware

```tsx
// In app/page.tsx (Dashboard)
useEffect(() => {
  // 1. Fetch iniziale
  fetchHardwareStatus();
  
  // 2. Polling ogni 2 secondi
  const interval = setInterval(fetchHardwareStatus, 2000);
  
  // 3. Cleanup
  return () => clearInterval(interval);
}, []);

async function fetchHardwareStatus() {
  // Nota: API_BASE è configurato per puntare a http://localhost:3001
  const response = await fetch(`${API_BASE}/api/hardware`);
  const data = await response.json();
  setHardwareData(data.data);
}
```

### 9.2 Toggle GPIO Output

```tsx
async function handleOutputToggle(pin: string, state: boolean) {
  await fetch(`${API_BASE}/api/hardware`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggleOutput", pin, state })
  });
  // Ricarica dati
  fetchHardwareStatus();
}
```

---

## 10. TypeScript Interfaces

Tutte le interfacce sono definite in `lib/types.ts`:

```typescript
// Stato di un pin GPIO
interface GPIOState {
  pin: string;           // es. "04"
  mode: 'output' | 'input';
  state: boolean;        // true = HIGH, false = LOW
  label: string;         // es. "LED Built-in"
}

// Messaggio UART
interface UARTMessage {
  id: string;
  timestamp: string;     // ISO 8601
  direction: 'rx' | 'tx';
  data: string;
}

// Dispositivo I2C
interface I2CDevice {
  address: string;        // es. "3C" (esadecimale)
  name: string;
  status: 'connected' | 'error' | 'not_found';
}

// Risposta API completa
interface HardwareAPIMessage {
  status: 'ok' | 'error';
  timestamp: string;
  data: {
    hardware: HardwareStatus;
    digitalIO: DigitalIOData;
    busMonitor: BusMonitorData;
  };
}
```

---

## 11. Animazioni e Interazioni

### 11.1 Framer Motion

L'applicazione usa Framer Motion per:

1. **Card Hover Lift**: Effetto sollevamento al passaggio mouse
   ```tsx
   <motion.div whileHover={{ scale: 1.02 }}>
   ```

2. **Fade-in on Mount**: Entrata animata dei componenti
   ```tsx
   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
   ```

3. **Active Nav Indicator**: Barra laterale animata
   ```tsx
   <motion.div layoutId="activeNav" />
   ```

4. **Loading Spinner**: Rotazione infinita
   ```tsx
   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}>
   ```

### 11.2 Preferenze Accessibilità

Il sistema rispetta `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Gestione degli Stati

### 12.1 Stati Locali (useState)

| Componente | Stato | Descrizione |
|------------|-------|-------------|
| Dashboard | `hardwareData` | Dati hardware ricevuti dall'API |
| Dashboard | `connected` | Boolean stato connessione |
| Dashboard | `loading` | Loading iniziale |
| Settings | `language` | Lingua selezionata (en/it) |
| Settings | `theme` | Tema selezionato (dark/light/blue/amber) |

### 12.2 Stati Globali (Context)

| Context | Provider | Dati condivisi |
|---------|----------|-----------------|
| `LanguageContext` | LanguageProvider | lingua corrente, funzione t(), setLanguage |
| `ThemeContext` | ThemeProvider | tema corrente, colors, setTheme |

### 12.3 Persistenza

Le preferenze utente sono salvate in `localStorage`:

```typescript
// Tema
localStorage.setItem("esp-control-theme", "blue");

// Lingua
localStorage.setItem("esp-control-language", "it");

// Recupero al caricamento
const saved = localStorage.getItem("esp-control-theme");
```

---

## Summary / Riepilogo

This documentation explains how ESP-Control Interface works:

- **Next.js App Router** with Server/Client Components
- **API Route** at `/api/hardware` simulates ESP32 hardware
- **4 Themes** (Dark/Light/Blue/Amber) with CSS variables
- **i18n** with Italian and English translations
- **Real-time polling** every 2 seconds for live data
- **Framer Motion** animations for interactions
- **TypeScript** strict typing for all data structures

The application is fully functional as a simulation - no physical ESP32 required for testing.

---

# ESP-Control Interface - Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [General Architecture](#2-general-architecture)
3. [Tech Stack](#3-tech-stack)
4. [File Structure](#4-file-structure)
5. [Main Components](#5-main-components)
6. [Backend System (Simulator)](#6-backend-system-simulator)
7. [Internationalization System (i18n)](#7-internationalization-system-i18n)
8. [Theme System](#8-theme-system)
9. [Data Flow](#9-data-flow)
10. [TypeScript Interfaces](#10-typescript-interfaces)
11. [Animations and Interactions](#11-animations-and-interactions)
12. [State Management](#12-state-management)

---

## 1. Project Overview

**ESP-Control Interface** is a Next.js web application that serves as a dashboard for monitoring and controlling an ESP32 board. The application allows:

- Viewing GPIO pin states (inputs and outputs)
- Monitoring communication buses (UART, I2C, SPI)
- Controlling digital outputs via switches
- Changing language (Italian/English)
- Choosing from 4 visual themes (Dark, Light, Blue, Amber)

---

## 2. General Architecture

The application uses **Next.js App Router** (version 14+), which means:

- **Server Components**: Prerendered pages for optimal performance
- **Client Components**: Interactive React components with state ("use client")
- **API Routes**: Integrated backend endpoints in Next.js

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Dashboard │  │   Logs   │  │ Settings │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │            │            │                         │
│       └────────────┼────────────┘                         │
│                    ▼                                      │
│         ┌─────────────────────┐                           │
│         │   Backend Server    │  ◄── Node.js/Express      │
│         │   (Port 3001)       │  ◄── SIMULATOR            │
│         └─────────┬───────────┘                           │
└──────────────────┼────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   ESP32 (Simulated) │  ◄── Hardware logic
         └─────────────────────┘
```

---

## 3. Tech Stack

| Technology | Version | Use |
|------------|---------|-----|
| **Next.js** | 15.x | React framework with App Router |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Static typing |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Framer Motion** | 11.x | React animations |
| **shadcn/ui** | Latest | Base UI components (Radix) |
| **Lucide React** | Latest | Icons |

---

## 4. File Structure

```
esp-control-interface/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Redirect to /dashboard
│   ├── dashboard/                # New Dashboard area
│   │   └── page.tsx              # Main Monitor & Control
│   ├── api/
│   │   └── hardware/
│   │       └── route.ts          # API Route (Fallback/Legacy)
│   ├── globals.css               # Global CSS variables
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Loading skeleton (i18n)
│   ├── error.tsx                 # Error page (i18n)
│   ├── not-found.tsx             # 404 page (i18n)
│   ├── logs/
│   │   └── page.tsx              # System logs page
│   └── settings/
│       └── page.tsx              # Settings page
│
├── backend/                      # Standalone Backend
│   ├── server.js                 # Express server (Port 3001)
│   └── package.json              # Backend dependencies
│
├── components/
│   ├── hardware/                 # Hardware-specific components
│   │   ├── sidebar.tsx           # Side navigation
│   │   ├── topbar.tsx           # Top bar with status
│   │   ├── digital-io-panel.tsx # GPIO panel
│   │   └── bus-monitor.tsx      # UART/I2C/SPI monitor
│   ├── ui/                       # shadcn/ui components
│   └── ...
```

---

## 5. Main Components

### 5.1 Sidebar (`components/hardware/sidebar.tsx`)

**Function**: Main navigation of the application

**Features**:
- 3 menu items: Dashboard, Logs, Settings
- Active item highlight with Framer Motion animation
- ESP-Control logo with CPU icon
- Links with `next/link` for client-side navigation

```tsx
// Navigation data structure
const navItems = [
  { href: "/dashboard", label: "Monitor & Control", icon: LayoutDashboard },
  { href: "/logs", label: "Communication Logs", icon: FileText },
  { href: "/settings", label: "Configuration", icon: Settings },
];
```

### 5.2 Topbar (`components/hardware/topbar.tsx`)

**Function**: Top bar with connection status and ping button

**Features**:
- Visual connection indicator (green/red button)
- "Ping" animation with glow effect
- Button to reload hardware data

### 5.3 DigitalIOPanel (`components/hardware/digital-io-panel.tsx`)

**Function**: GPIO control and display

**Features**:
- **Outputs**: shadcn/ui switches to turn on/off
- **Inputs**: Badge showing HIGH/LOW state
- Visual LED indicators (green = ON, red = OFF)
- Framer Motion hover animations

### 5.4 BusMonitor (`components/hardware/bus-monitor.tsx`)

**Function**: UART, I2C, SPI protocol monitoring

**Features**:
- Tabs to switch protocol view
- **UART**: Terminal with auto-scroll, different colors for RX/TX
- **I2C**: Device list with HEX address and status
- **SPI**: Device list with ID and speed

---

## 6. Backend System (Simulator)

The application communicates with a standalone Express backend (defaulting to port 3001) that simulates ESP32 hardware.

### 6.1 GET Endpoint

**URL**: `http://localhost:3001/api/hardware`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hardware": {
      "connected": true,
      "deviceName": "ESP32-WROOM-32",
      "firmwareVersion": "v1.2.4",
      "uptime": 3600
    },
    // ... digitalIO and busMonitor
  }
}
```

### 6.2 POST Endpoint

**URL**: `http://localhost:3001/api/hardware`

**Request body**:
```json
{
  "action": "toggleOutput",
  "pin": "04",
  "state": true
}
```

### 6.3 Deterministic Simulation

The server (`backend/server.js`) implements a deterministic simulation based on a request counter to simulate:
- GPIO input toggles.
- Dynamic UART message generation.
- I2C device status changes.

---

## 7. Internationalization System (i18n)

### 7.1 Structure

The i18n system is implemented in `lib/i18n.tsx` using React Context.

**Features**:
- **Special Page Support**: Translations for Error Page, 404 Not Found, and Loading skeletons.
- **Persistence**: Language is saved in `localStorage` and retrieved on startup.
- **SSR-Ready**: Handles missing context during server-side rendering.

**Translation keys** (examples):
```typescript
const translations = {
  "error.title": { en: "Something went wrong!", it: "Qualcosa è andato storto!" },
  "notfound.page": { en: "Page Not Found", it: "Pagina Non Trovata" },
  "loading.wait": { en: "Loading...", it: "Caricamento..." },
  // ... over 100 keys
};
```

### 7.2 LanguageProvider

The `LanguageProvider` wraps the entire application in `layout.tsx`.

```typescript
// Save to localStorage
localStorage.setItem("esp-control-language", "it");

// Hook to access translations
const { t, language, setLanguage } = useLanguage();
```

### 7.3 Component Usage

Every component with visible text uses `useLanguage()`:

```tsx
function MyComponent() {
  const { t } = useLanguage();
  return <h1>{t("header.title")}</h1>;
}
```

---

## 8. Theme System

### 8.1 Theme Configuration

4 themes defined in `lib/theme.tsx`:

| Theme | Primary Color | Success Color | Background |
|-------|---------------|---------------|------------|
| **Dark** | #10b981 (emerald) | #10b981 | #1a1a1a |
| **Light** | #10b981 | #10b981 | #f5f5f5 |
| **Blue** | #3b82f6 (blue) | #3b82f6 | #1e3a5f |
| **Amber** | #f59e0b (amber) | #f59e0b | #292524 |

### 8.2 Theme Application

The `ThemeVariables` component (`components/theme-variables.tsx`) applies colors:

```tsx
useEffect(() => {
  // 1. Remove existing theme classes
  document.documentElement.classList.remove('dark', 'light', 'blue', 'amber');
  
  // 2. Add current theme class
  document.documentElement.classList.add(theme);
  
  // 3. Set CSS variables
  document.documentElement.style.setProperty('--hw-success', colors.success);
  // ... other variables
}, [theme, colors]);
```

### 8.3 CSS Variables

Colors are defined as CSS variables in `app/globals.css`:

```css
:root {
  --hw-success: #10b981;
  --hw-success-dim: rgba(16, 185, 129, 0.15);
  --hw-surface: #1a1a1a;
  /* ... */
}

.light {
  --hw-success: #10b981;
  --hw-surface: #f5f5f5;
  /* ... */
}
```

---

## 9. Data Flow

### 9.1 Hardware Data Fetching

```tsx
// In app/page.tsx (Dashboard)
useEffect(() => {
  // 1. Initial fetch
  fetchHardwareStatus();
  
  // 2. Poll every 2 seconds
  const interval = setInterval(fetchHardwareStatus, 2000);
  
  // 3. Cleanup
  return () => clearInterval(interval);
}, []);

async function fetchHardwareStatus() {
  // Note: API_BASE is configured to point to http://localhost:3001
  const response = await fetch(`${API_BASE}/api/hardware`);
  const data = await response.json();
  setHardwareData(data.data);
}
```

### 9.2 GPIO Output Toggle

```tsx
async function handleOutputToggle(pin: string, state: boolean) {
  await fetch(`${API_BASE}/api/hardware`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggleOutput", pin, state })
  });
  // Reload data
  fetchHardwareStatus();
}
```

---

## 10. TypeScript Interfaces

All interfaces are defined in `lib/types.ts`:

```typescript
// GPIO pin state
interface GPIOState {
  pin: string;           // e.g., "04"
  mode: 'output' | 'input';
  state: boolean;        // true = HIGH, false = LOW
  label: string;         // e.g., "LED Built-in"
}

// UART message
interface UARTMessage {
  id: string;
  timestamp: string;     // ISO 8601
  direction: 'rx' | 'tx';
  data: string;
}

// I2C device
interface I2CDevice {
  address: string;       // e.g., "3C" (hexadecimal)
  name: string;
  status: 'connected' | 'error' | 'not_found';
}

// Complete API response
interface HardwareAPIMessage {
  status: 'ok' | 'error';
  timestamp: string;
  data: {
    hardware: HardwareStatus;
    digitalIO: DigitalIOData;
    busMonitor: BusMonitorData;
  };
}
```

---

## 11. Animations and Interactions

### 11.1 Framer Motion

The application uses Framer Motion for:

1. **Card Hover Lift**: Lift effect on mouse hover
   ```tsx
   <motion.div whileHover={{ scale: 1.02 }}>
   ```

2. **Fade-in on Mount**: Animated component entry
   ```tsx
   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
   ```

3. **Active Nav Indicator**: Animated side bar
   ```tsx
   <motion.div layoutId="activeNav" />
   ```

4. **Loading Spinner**: Infinite rotation
   ```tsx
   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}>
   ```

### 11.2 Accessibility Preferences

The system respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. State Management

### 12.1 Local States (useState)

| Component | State | Description |
|-----------|-------|-------------|
| Dashboard | `hardwareData` | Hardware data from API |
| Dashboard | `connected` | Connection boolean status |
| Dashboard | `loading` | Initial loading |
| Settings | `language` | Selected language (en/it) |
| Settings | `theme` | Selected theme (dark/light/blue/amber) |

### 12.2 Global States (Context)

| Context | Provider | Shared Data |
|---------|----------|-------------|
| `LanguageContext` | LanguageProvider | current language, t() function, setLanguage |
| `ThemeContext` | ThemeProvider | current theme, colors, setTheme |

### 12.3 Persistence

User preferences are saved to `localStorage`:

```typescript
// Theme
localStorage.setItem("esp-control-theme", "blue");

// Language
localStorage.setItem("esp-control-language", "it");

// Retrieve on load
const saved = localStorage.getItem("esp-control-theme");
```

---

## Summary

This documentation explains how ESP-Control Interface works in detail:

- **Next.js App Router** with Server/Client Components
- **API Route** at `/api/hardware` simulates ESP32 hardware
- **4 Themes** (Dark/Light/Blue/Amber) with CSS variables
- **i18n** with Italian and English translations
- **Real-time polling** every 2 seconds for live data
- **Framer Motion** animations for interactions
- **TypeScript** strict typing for all data structures

The application is fully functional as a simulation - no physical ESP32 is required for testing.

---

## Quick Start / Avvio Rapido

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```
