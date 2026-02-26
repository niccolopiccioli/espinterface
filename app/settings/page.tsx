"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/lib/i18n";
import { useTheme, Theme } from "@/lib/theme";
import { Moon, Sun, Sparkles, Palette, Cpu, Globe } from "lucide-react";
import { Topbar } from "@/components/hardware/topbar";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "blue", label: "Blue", icon: <Sparkles className="h-4 w-4" /> },
    { value: "amber", label: "Amber", icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <Topbar connected={true} deviceName="ESP32-WROOM-32" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Hardware Configuration - FIRST */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Cpu className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
              {t("settings.hardware")}
            </CardTitle>
            <CardDescription>
              {t("settings.hardwareDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GPIO Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">{t("settings.gpio")}</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t("settings.pullup")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.pullupDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t("settings.defaultState")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.defaultStateDesc")}</p>
                </div>
                <Switch />
              </div>
            </div>

            <Separator />

            {/* UART Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">{t("settings.uart")}</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t("settings.echo")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.echoDesc")}</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t("settings.logOutput")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.logOutputDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Separator />

            {/* I2C Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">{t("settings.i2cConfig")}</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t("settings.autoscan")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.autoscanDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Web Interface Settings - SECOND */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
              {t("settings.interface")}
            </CardTitle>
            <CardDescription>
              {t("settings.interfaceDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">{t("settings.autorefresh")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.autorefreshDesc")}</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">{t("settings.animations")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.animationsDesc")}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Altro/Other (Theme + Language) - THIRD */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5" style={{ color: 'var(--hw-success)' }} />
              {language === "it" ? "Altro" : "Other"}
            </CardTitle>
            <CardDescription>
              {language === "it" ? "Personalizza lingua e tema" : "Customize language and theme"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Selector */}
            <div className="space-y-3">
              <Label className="text-sm">{t("settings.theme")}</Label>
              <div className="grid grid-cols-4 gap-2">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      theme === themeOption.value
                        ? "border-[var(--hw-success)] bg-[var(--hw-success-dim)]"
                        : "border-border hover:border-[var(--hw-success)]"
                    }`}
                  >
                    <span style={{ color: theme === themeOption.value ? 'var(--hw-success)' : 'inherit' }}>
                      {themeOption.icon}
                    </span>
                    <span className="text-xs">{themeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">{t("settings.language")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.languageDesc")}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                    language === "en"
                      ? "border-[var(--hw-success)] bg-[var(--hw-success-dim)] text-[var(--hw-success)]"
                      : "border-border hover:border-[var(--hw-success)]"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("it")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                    language === "it"
                      ? "border-[var(--hw-success)] bg-[var(--hw-success-dim)] text-[var(--hw-success)]"
                      : "border-border hover:border-[var(--hw-success)]"
                  }`}
                >
                  Italiano
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
