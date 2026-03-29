import {
  Warehouse, Snowflake, ShieldCheck, AlertTriangle,
  Truck, MapPin, PackageCheck,
  Car, Droplets, Wrench, Navigation,
  Package, Shield, BarChart3, FileText,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ServicesSection = () => {
  const { t } = useLanguage();

  const categories = [
    {
      title: t.storageServices,
      color: "from-blue-500 to-blue-700",
      items: [
        { icon: Warehouse, name: t.normalStorage },
        { icon: Snowflake, name: t.coldStorage },
        { icon: ShieldCheck, name: t.highSecurity },
        { icon: AlertTriangle, name: t.hazardousMaterials },
      ],
    },
    {
      title: t.shippingTransport,
      color: "from-emerald-500 to-emerald-700",
      items: [
        { icon: Truck, name: t.pickupFromSite },
        { icon: MapPin, name: t.deliveryToLocation },
        { icon: PackageCheck, name: t.interCityShipping },
      ],
    },
    {
      title: t.vehicleServices,
      color: "from-amber-500 to-amber-700",
      items: [
        { icon: Car, name: t.carStorage },
        { icon: Droplets, name: t.carWash },
        { icon: Wrench, name: t.periodicMaintenance },
        { icon: Navigation, name: t.deliveryToClient },
      ],
    },
    {
      title: t.additionalServices,
      color: "from-purple-500 to-purple-700",
      items: [
        { icon: Package, name: t.packingWrapping },
        { icon: Shield, name: t.propertyInsurance },
        { icon: BarChart3, name: t.inventoryTracking },
        { icon: FileText, name: t.periodicReports },
      ],
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-12">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-primary font-bold text-xs md:text-sm tracking-wider">{t.ourServices}</span>
          <h2 className="text-2xl md:text-5xl font-black text-foreground mt-2 md:mt-3">
            {t.allInOnePlace} <span className="text-gradient-gold">{t.onePlace}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8">
          {categories.map((cat) => (
            <div key={cat.title} className="glass rounded-xl md:rounded-2xl p-4 md:p-8">
              <h3 className="text-sm md:text-xl font-bold text-foreground mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className={`w-1 md:w-1.5 h-5 md:h-8 rounded-full bg-gradient-to-b ${cat.color}`} />
                {cat.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {cat.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg md:rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                    <span className="text-[11px] md:text-sm text-foreground font-medium leading-tight">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
