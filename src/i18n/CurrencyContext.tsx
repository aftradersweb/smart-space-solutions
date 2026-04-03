import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Currency = "SAR" | "USD" | "EUR" | "AED" | "KWD" | "BHD" | "OMR" | "QAR" | "EGP";

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  nameAr: string;
  nameEn: string;
  rate: number; // relative to SAR
}

export const currencies: CurrencyInfo[] = [
  { code: "SAR", symbol: "ر.س", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", rate: 1 },
  { code: "USD", symbol: "$", nameAr: "دولار أمريكي", nameEn: "US Dollar", rate: 0.2667 },
  { code: "EUR", symbol: "€", nameAr: "يورو", nameEn: "Euro", rate: 0.2445 },
  { code: "AED", symbol: "د.إ", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", rate: 0.9793 },
  { code: "KWD", symbol: "د.ك", nameAr: "دينار كويتي", nameEn: "Kuwaiti Dinar", rate: 0.0818 },
  { code: "BHD", symbol: "د.ب", nameAr: "دينار بحريني", nameEn: "Bahraini Dinar", rate: 0.1005 },
  { code: "OMR", symbol: "ر.ع", nameAr: "ريال عماني", nameEn: "Omani Rial", rate: 0.1027 },
  { code: "QAR", symbol: "ر.ق", nameAr: "ريال قطري", nameEn: "Qatari Riyal", rate: 0.9707 },
  { code: "EGP", symbol: "ج.م", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", rate: 13.16 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencySymbol: string;
  formatPrice: (sarAmount: number) => string;
  getCurrencyInfo: () => CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "SAR",
  setCurrency: () => {},
  currencySymbol: "ر.س",
  formatPrice: (n) => `${n} ر.س`,
  getCurrencyInfo: () => currencies[0],
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(
    () => (localStorage.getItem("currency") as Currency) || "SAR"
  );

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  }, []);

  const getCurrencyInfo = useCallback(() => {
    return currencies.find((c) => c.code === currency) || currencies[0];
  }, [currency]);

  const currencySymbol = getCurrencyInfo().symbol;

  const formatPrice = useCallback(
    (sarAmount: number) => {
      const info = currencies.find((c) => c.code === currency) || currencies[0];
      const converted = Math.round(sarAmount * info.rate);
      return `${converted.toLocaleString()} ${info.symbol}`;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencySymbol, formatPrice, getCurrencyInfo }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
