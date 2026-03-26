import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import ar from "./ar";
import en from "./en";

type Lang = "ar" | "en";
type Translations = typeof ar;

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  dir: "rtl" | "ltr";
}

const translations: Record<Lang, Translations> = { ar, en };

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  t: ar,
  setLang: () => {},
  dir: "rtl",
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("lang") as Lang) || "ar"
  );

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
