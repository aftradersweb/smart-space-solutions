import { Globe, Warehouse } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";

const MobileTopBar = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="fixed top-0 inset-x-0 z-50 md:hidden glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-gold p-1.5 rounded-lg">
            <Warehouse className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">Smart Storage Hub</span>
        </Link>
        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg px-2.5 py-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === "ar" ? "EN" : "عربي"}
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
