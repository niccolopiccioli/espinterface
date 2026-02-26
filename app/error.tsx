"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("error.title")}</h2>
        <p className="text-muted-foreground">
          {t("error.desc")}
        </p>
        <Button onClick={reset} variant="outline">
          {t("error.retry")}
        </Button>
      </div>
    </div>
  );
}
