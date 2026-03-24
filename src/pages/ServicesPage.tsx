import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft, Calculator, Snowflake, ShieldCheck, AlertTriangle, Truck, Car, Package, Shield } from "lucide-react";

const storageTypes = [
  { id: "normal", name: "تخزين عادي", price: 50, icon: Warehouse, desc: "للبضائع والأثاث العادي" },
  { id: "cold", name: "تخزين مبرد", price: 120, icon: Snowflake, desc: "للمواد الغذائية والأدوية" },
  { id: "secure", name: "تخزين عالي الأمان", price: 200, icon: ShieldCheck, desc: "للمقتنيات الثمينة والمستندات" },
  { id: "hazardous", name: "مواد حساسة", price: 300, icon: AlertTriangle, desc: "للمواد الكيميائية والخطرة" },
];

const extras = [
  { id: "pickup", name: "استلام من الموقع", price: 150, icon: Truck },
  { id: "delivery", name: "توصيل لموقع محدد", price: 150, icon: Truck },
  { id: "packing", name: "تغليف وتعبئة", price: 100, icon: Package },
  { id: "insurance", name: "تأمين الممتلكات", price: 80, icon: Shield },
  { id: "car", name: "تخزين سيارة", price: 500, icon: Car },
];

const ServicesPage = () => {
  const [selectedType, setSelectedType] = useState("normal");
  const [area, setArea] = useState(10);
  const [duration, setDuration] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const storagePrice = (storageTypes.find((t) => t.id === selectedType)?.price || 50) * area * duration;
  const extrasPrice = selectedExtras.reduce((sum, id) => sum + (extras.find((e) => e.id === id)?.price || 0), 0) * duration;
  const total = storagePrice + extrasPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2 rounded-lg">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Smart Storage Hub</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" />
          العودة
        </Link>
      </nav>

      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            <Calculator className="inline w-10 h-10 text-primary ml-3" />
            حاسبة <span className="text-gradient-gold">تكلفة التخزين</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">حدد نوع التخزين والمساحة والمدة للحصول على تقدير فوري للتكلفة.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Storage Type */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">نوع التخزين</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {storageTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-right transition-all ${
                      selectedType === type.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${selectedType === type.id ? "bg-gradient-gold" : "bg-muted"}`}>
                      <type.icon className={`w-5 h-5 ${selectedType === type.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.desc}</div>
                      <div className="text-primary font-bold mt-1">{type.price} ر.س / م² / شهر</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area & Duration */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">المساحة (م²)</h2>
                <div className="glass rounded-xl p-6">
                  <input
                    type="range"
                    min={1}
                    max={200}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>1 م²</span>
                    <span className="text-2xl font-black text-primary">{area} م²</span>
                    <span>200 م²</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">مدة التخزين (أشهر)</h2>
                <div className="glass rounded-xl p-6">
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>1 شهر</span>
                    <span className="text-2xl font-black text-primary">{duration} شهر</span>
                    <span>24 شهر</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">خدمات إضافية</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {extras.map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedExtras.includes(extra.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <extra.icon className={`w-5 h-5 ${selectedExtras.includes(extra.id) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="flex-1 text-foreground font-medium text-right">{extra.name}</span>
                    <span className="text-sm text-primary font-bold">{extra.price} ر.س/شهر</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-8 sticky top-8">
              <h2 className="text-xl font-bold text-foreground mb-6">ملخص التكلفة</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">نوع التخزين</span>
                  <span className="text-foreground font-medium">{storageTypes.find((t) => t.id === selectedType)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المساحة</span>
                  <span className="text-foreground font-medium">{area} م²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المدة</span>
                  <span className="text-foreground font-medium">{duration} شهر</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">تكلفة التخزين</span>
                    <span className="text-foreground font-bold">{storagePrice.toLocaleString()} ر.س</span>
                  </div>
                </div>
                {selectedExtras.length > 0 && (
                  <div className="space-y-2">
                    {selectedExtras.map((id) => {
                      const extra = extras.find((e) => e.id === id);
                      return extra ? (
                        <div key={id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{extra.name}</span>
                          <span className="text-foreground">{(extra.price * duration).toLocaleString()} ر.س</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-foreground">الإجمالي</span>
                  <span className="text-2xl font-black text-gradient-gold">{total.toLocaleString()} ر.س</span>
                </div>
                <Button className="w-full bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 h-12">
                  اطلب الآن
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">* الأسعار تقديرية وقد تختلف حسب المتطلبات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
