import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft, Calculator, Snowflake, ShieldCheck, AlertTriangle, Truck, Car, Package, Shield, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ServicesPage = () => {
  const { t, lang, setLang, dir } = useLanguage();

  const storageTypes = [
    { id: "normal", name: t.normalStorage, price: 50, icon: Warehouse, desc: t.forGoodsAndFurniture },
    { id: "cold", name: t.coldStorage, price: 120, icon: Snowflake, desc: t.forFoodAndMedicine },
    { id: "secure", name: t.highSecurity, price: 200, icon: ShieldCheck, desc: t.forValuables },
    { id: "hazardous", name: t.hazardousMaterials, price: 300, icon: AlertTriangle, desc: t.forChemicals },
  ];

  const extras = [
    { id: "pickup", name: t.pickupFromLocation, price: 150, icon: Truck },
    { id: "delivery", name: t.deliveryToSpecific, price: 150, icon: Truck },
    { id: "packing", name: t.packing, price: 100, icon: Package },
    { id: "insurance", name: t.insurance, price: 80, icon: Shield },
    { id: "car", name: t.carStorageService, price: 500, icon: Car },
  ];

  const [selectedType, setSelectedType] = useState("normal");
  const [area, setArea] = useState(10);
  const [duration, setDuration] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const storagePrice = (storageTypes.find((st) => st.id === selectedType)?.price || 50) * area * duration;
  const extrasPrice = selectedExtras.reduce((sum, id) => sum + (extras.find((e) => e.id === id)?.price || 0), 0) * duration;
  const total = storagePrice + extrasPrice;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <nav className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2 rounded-lg">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">{t.appName}</span>
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5">
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className={`w-4 h-4 ${dir === "ltr" ? "" : "rotate-180"}`} />
            {t.back}
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-12 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-black text-foreground mb-3 md:mb-4">
            <Calculator className="inline w-7 h-7 md:w-10 md:h-10 text-primary mx-2 md:mx-3" />
            {t.storageCostCalculator} <span className="text-gradient-gold">{t.costCalculation}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs md:text-base">{t.calcDesc}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Storage Type */}
            <div>
              <h2 className="text-base md:text-xl font-bold text-foreground mb-3 md:mb-4">{t.storageType}</h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {storageTypes.map((type) => (
                  <button key={type.id} onClick={() => setSelectedType(type.id)}
                    className={`flex items-start gap-2 md:gap-4 p-3 md:p-5 rounded-xl border-2 transition-all ${dir === "rtl" ? "text-right" : "text-left"} ${
                      selectedType === type.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/30"
                    }`}>
                    <div className={`p-1.5 md:p-2.5 rounded-lg ${selectedType === type.id ? "bg-gradient-gold" : "bg-muted"}`}>
                      <type.icon className={`w-4 h-4 md:w-5 md:h-5 ${selectedType === type.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground text-xs md:text-base">{type.name}</div>
                      <div className="text-[10px] md:text-sm text-muted-foreground hidden md:block">{type.desc}</div>
                      <div className="text-primary font-bold mt-0.5 md:mt-1 text-[10px] md:text-sm">{type.price} {t.sarPerSqmMonth}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area & Duration */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{t.areaSqm}</h2>
                <div className="glass rounded-xl p-6">
                  <input type="range" min={1} max={200} value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>1 {t.sqm}</span>
                    <span className="text-2xl font-black text-primary">{area} {t.sqm}</span>
                    <span>200 {t.sqm}</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{t.durationMonths}</h2>
                <div className="glass rounded-xl p-6">
                  <input type="range" min={1} max={24} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>1 {t.month}</span>
                    <span className="text-2xl font-black text-primary">{duration} {t.month}</span>
                    <span>24 {t.month}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div>
              <h2 className="text-base md:text-xl font-bold text-foreground mb-3 md:mb-4">{t.extraServicesTitle}</h2>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {extras.map((extra) => (
                  <button key={extra.id} onClick={() => toggleExtra(extra.id)}
                    className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 transition-all ${
                      selectedExtras.includes(extra.id) ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/30"
                    }`}>
                    <extra.icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${selectedExtras.includes(extra.id) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`flex-1 text-foreground font-medium text-[11px] md:text-sm ${dir === "rtl" ? "text-right" : "text-left"}`}>{extra.name}</span>
                    <span className="text-[10px] md:text-sm text-primary font-bold whitespace-nowrap">{extra.price} {t.sarPerMonth}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-8 sticky top-8">
              <h2 className="text-xl font-bold text-foreground mb-6">{t.costSummary}</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.storageType}</span>
                  <span className="text-foreground font-medium">{storageTypes.find((st) => st.id === selectedType)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.area}</span>
                  <span className="text-foreground font-medium">{area} {t.sqm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.duration}</span>
                  <span className="text-foreground font-medium">{duration} {t.month}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.storageCost}</span>
                    <span className="text-foreground font-bold">{storagePrice.toLocaleString()} {t.sar}</span>
                  </div>
                </div>
                {selectedExtras.length > 0 && (
                  <div className="space-y-2">
                    {selectedExtras.map((id) => {
                      const extra = extras.find((e) => e.id === id);
                      return extra ? (
                        <div key={id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{extra.name}</span>
                          <span className="text-foreground">{(extra.price * duration).toLocaleString()} {t.sar}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-foreground">{t.total}</span>
                  <span className="text-2xl font-black text-gradient-gold">{total.toLocaleString()} {t.sar}</span>
                </div>
                <Button className="w-full bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 h-12">
                  {t.orderNow}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">{t.pricesEstimate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
