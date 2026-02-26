"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { GPIOState } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface DigitalIOPanelProps {
  outputs: GPIOState[];
  inputs: GPIOState[];
  onOutputToggle?: (pin: string, state: boolean) => void;
}

export function DigitalIOPanel({ outputs, inputs, onOutputToggle }: DigitalIOPanelProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-card border-border card-lift">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: 'var(--hw-success)' }} />
          {t("io.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outputs Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("io.outputs")}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {outputs.map((gpio) => (
              <OutputPin key={gpio.pin} gpio={gpio} onToggle={onOutputToggle} />
            ))}
          </div>
        </div>

        {/* Inputs Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("io.inputs")}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {inputs.map((gpio) => (
              <InputPin key={gpio.pin} gpio={gpio} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OutputPinProps {
  gpio: GPIOState;
  onToggle?: (pin: string, state: boolean) => void;
}

function OutputPin({ gpio, onToggle }: OutputPinProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-3 rounded-md border"
      style={{ backgroundColor: 'var(--hw-surface-light)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`led ${gpio.state ? "led-on" : "led-off"}`}
          aria-label={`GPIO ${gpio.pin} ${gpio.state ? "ON" : "OFF"}`}
        />
        <div>
          <Label className="text-sm font-mono text-foreground">
            {gpio.label}
          </Label>
          <p className="text-xs text-muted-foreground font-mono">
            GPIO {gpio.pin}
          </p>
        </div>
      </div>
      <Switch
        checked={gpio.state}
        onCheckedChange={(checked) => onToggle?.(gpio.pin, checked)}
        aria-label={`Toggle GPIO ${gpio.pin}`}
      />
    </motion.div>
  );
}

function InputPin({ gpio }: { gpio: GPIOState }) {
  const { t } = useLanguage();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-3 rounded-md border"
      style={{ backgroundColor: 'var(--hw-surface-light)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`led ${gpio.state ? "led-on" : "led-off"}`}
          aria-label={`Input GPIO ${gpio.pin} ${gpio.state ? "HIGH" : "LOW"}`}
        />
        <div>
          <Label className="text-sm font-mono text-foreground">
            {gpio.label}
          </Label>
          <p className="text-xs text-muted-foreground font-mono">
            GPIO {gpio.pin}
          </p>
        </div>
      </div>
      <Badge variant={gpio.state ? "success" : "danger"}>
        {gpio.state ? t("io.high") : t("io.low")}
      </Badge>
    </motion.div>
  );
}
