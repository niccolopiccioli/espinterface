"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "it";

interface Translations {
  [key: string]: {
    en: string;
    it: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.dashboard": { en: "Monitor & Control", it: "Monitor & Controllo" },
  "nav.logs": { en: "Communication Logs", it: "Log Comunicazione" },
  "nav.settings": { en: "Configuration", it: "Configurazione" },
  
  // Header
  "header.title": { en: "Hardware Dashboard", it: "Dashboard Hardware" },
  "header.connected": { en: "Connected", it: "Connesso" },
  "header.disconnected": { en: "Disconnected", it: "Disconnesso" },
  "header.ping": { en: "Ping", it: "Ping" },
  
  // Status Cards
  "status.device": { en: "Device", it: "Dispositivo" },
  "status.firmware": { en: "Firmware", it: "Firmware" },
  "status.uptime": { en: "Uptime", it: "Tempo di attività" },
  "status.status": { en: "Status", it: "Stato" },
  "status.online": { en: "Online", it: "Online" },
  "status.offline": { en: "Offline", it: "Offline" },
  
  // Digital I/O
  "io.title": { en: "Digital I/O", it: "I/O Digitale" },
  "io.outputs": { en: "Outputs (GPIO)", it: "Uscite (GPIO)" },
  "io.inputs": { en: "Inputs (GPIO)", it: "Ingressi (GPIO)" },
  "io.high": { en: "ON", it: "ACCESO" },
  "io.low": { en: "OFF", it: "SPENTO" },
  "io.on": { en: "ON", it: "ACCESO" },
  "io.off": { en: "OFF", it: "SPENTO" },
  "io.toggle": { en: "Toggle", it: "Cambia" },
  
  // Bus Monitor
  "bus.title": { en: "Bus Monitor", it: "Monitor Bus" },
  "bus.uart": { en: "UART", it: "UART" },
  "bus.i2c": { en: "I2C", it: "I2C" },
  "bus.spi": { en: "SPI", it: "SPI" },
  "bus.baud": { en: "Baud", it: "Baud" },
  "bus.port": { en: "Port", it: "Porta" },
  "bus.speed": { en: "Speed", it: "Velocità" },
  "bus.waiting": { en: "Waiting for data...", it: "In attesa di dati..." },
  "bus.noDevices": { en: "No devices detected", it: "Nessun dispositivo rilevato" },
  "bus.connected": { en: "connected", it: "connesso" },
  "bus.error": { en: "error", it: "errore" },
  "bus.notFound": { en: "not found", it: "non trovato" },
  
  // Settings
  "settings.title": { en: "Settings", it: "Impostazioni" },
  "settings.other": { en: "Other", it: "Altro" },
  "settings.otherDesc": { en: "Customize language and theme", it: "Personalizza lingua e tema" },
  "settings.hardware": { en: "Hardware Configuration", it: "Configurazione Hardware" },
  "settings.hardwareDesc": { en: "Configure ESP32 hardware parameters", it: "Configura i parametri hardware ESP32" },
  "settings.gpio": { en: "GPIO Settings", it: "Impostazioni GPIO" },
  "settings.pullup": { en: "Pull-up Resistors", it: "Resistori Pull-up" },
  "settings.pullupDesc": { en: "Enable internal pull-ups for input pins", it: "Abilita pull-up interni per i pin di input" },
  "settings.defaultState": { en: "Default Output State", it: "Stato Uscita Predefinito" },
  "settings.defaultStateDesc": { en: "Restore outputs to last known state on boot", it: "Ripristina le uscite all'ultimo stato noto all'avvio" },
  "settings.uart": { en: "UART Configuration", it: "Configurazione UART" },
  "settings.echo": { en: "Echo Mode", it: "Modalità Echo" },
  "settings.echoDesc": { en: "Echo received characters back", it: "Echo dei caratteri ricevuti" },
  "settings.logOutput": { en: "Log Output", it: "Output Log" },
  "settings.logOutputDesc": { en: "Print debug messages to UART", it: "Stampa messaggi di debug su UART" },
  "settings.i2cConfig": { en: "I2C Configuration", it: "Configurazione I2C" },
  "settings.autoscan": { en: "Auto-scan Devices", it: "Scansione Automatica" },
  "settings.autoscanDesc": { en: "Automatically detect I2C devices on startup", it: "Rileva automaticamente i dispositivi I2C all'avvio" },
  "settings.interface": { en: "Web Interface", it: "Interfaccia Web" },
  "settings.interfaceDesc": { en: "Dashboard display preferences", it: "Preferenze di visualizzazione dashboard" },
  "settings.autorefresh": { en: "Auto-refresh", it: "Aggiornamento Auto" },
  "settings.autorefreshDesc": { en: "Automatically poll hardware status", it: "Interroga automaticamente lo stato hardware" },
  "settings.animations": { en: "Animations", it: "Animazioni" },
  "settings.animationsDesc": { en: "Enable UI motion effects", it: "Abilita effetti di animazione UI" },
  "settings.language": { en: "Language", it: "Lingua" },
  "settings.languageDesc": { en: "Select interface language", it: "Seleziona la lingua dell'interfaccia" },
  "settings.theme": { en: "Theme", it: "Tema" },
  "settings.themeDesc": { en: "Choose color theme", it: "Scegli il tema dei colori" },
  
  // Logs
  "logs.title": { en: "System Logs", it: "Log di Sistema" },
  "logs.info": { en: "INFO", it: "INFO" },
  "logs.warning": { en: "WARNING", it: "AVVISO" },
  "logs.error": { en: "ERROR", it: "ERRORE" },
  "logs.success": { en: "SUCCESS", it: "SUCCESSO" },
  
  // Errors
  "error.title": { en: "Something went wrong!", it: "Qualcosa è andato storto!" },
  "error.desc": { en: "An error occurred while loading the hardware data.", it: "Si è verificato un errore durante il caricamento dei dati hardware." },
  "error.retry": { en: "Try again", it: "Riprova" },
  
  // Not Found
  "notfound.title": { en: "404", it: "404" },
  "notfound.page": { en: "Page Not Found", it: "Pagina Non Trovata" },
  "notfound.desc": { en: "The requested hardware page does not exist.", it: "La pagina hardware richiesta non esiste." },
  "notfound.return": { en: "Return to Dashboard", it: "Torna alla Dashboard" },
  
  // Loading
  "loading.wait": { en: "Loading...", it: "Caricamento..." },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("esp-control-language") as Language;
    if (saved && (saved === "en" || saved === "it")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("esp-control-language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  // Return default values if context is not available (during SSR/build)
  if (!context) {
    const defaultT = (key: string): string => {
      const translation = translations[key];
      if (!translation) return key;
      return translation.en || key;
    };
    return { 
      language: "en" as Language, 
      setLanguage: () => {}, 
      t: defaultT 
    };
  }
  return context;
}
