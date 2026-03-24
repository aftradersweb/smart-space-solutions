import {
  Warehouse, Snowflake, ShieldCheck, AlertTriangle,
  Truck, MapPin, PackageCheck,
  Car, Droplets, Wrench, Navigation,
  Package, Shield, BarChart3, FileText,
} from "lucide-react";

const categories = [
  {
    title: "خدمات التخزين",
    color: "from-blue-500 to-blue-700",
    items: [
      { icon: Warehouse, name: "تخزين عادي" },
      { icon: Snowflake, name: "تخزين مبرد" },
      { icon: ShieldCheck, name: "تخزين عالي الأمان" },
      { icon: AlertTriangle, name: "مواد حساسة" },
    ],
  },
  {
    title: "الشحن والنقل",
    color: "from-emerald-500 to-emerald-700",
    items: [
      { icon: Truck, name: "استلام من الموقع" },
      { icon: MapPin, name: "توصيل لموقع محدد" },
      { icon: PackageCheck, name: "شحن بين المدن" },
    ],
  },
  {
    title: "خدمات المركبات",
    color: "from-amber-500 to-amber-700",
    items: [
      { icon: Car, name: "تخزين السيارات" },
      { icon: Droplets, name: "غسيل السيارات" },
      { icon: Wrench, name: "صيانة دورية" },
      { icon: Navigation, name: "توصيل للعميل" },
    ],
  },
  {
    title: "خدمات إضافية",
    color: "from-purple-500 to-purple-700",
    items: [
      { icon: Package, name: "تغليف وتعبئة" },
      { icon: Shield, name: "تأمين الممتلكات" },
      { icon: BarChart3, name: "جرد وتتبع" },
      { icon: FileText, name: "تقارير دورية" },
    ],
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider">خدماتنا</span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mt-3">
            كل ما تحتاجه في <span className="text-gradient-gold">مكان واحد</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <div key={cat.title} className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${cat.color}`} />
                {cat.title}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">{item.name}</span>
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
