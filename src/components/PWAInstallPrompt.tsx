import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useState } from "react";

const PWAInstallPrompt = () => {
  const { t, dir } = useLanguage();
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 inset-x-4 z-50 glass rounded-2xl p-4 border border-primary/30 shadow-lg" dir={dir}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 end-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3">
        <div className="bg-gradient-gold p-2.5 rounded-xl shrink-0">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{t.installPromptTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.installPromptDesc}</p>
        </div>
        <Button
          size="sm"
          onClick={install}
          className="bg-gradient-gold text-primary-foreground font-bold shrink-0"
        >
          {t.install}
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
