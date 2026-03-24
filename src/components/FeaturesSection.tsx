import { Users, Building2, Settings2, TrendingUp, Clock, DollarSign, LayoutDashboard, PieChart } from "lucide-react";

const audiences = [
  {
    title: "للأفراد",
    icon: Users,
    features: [
      "سهولة الاستخدام عبر منصة إلكترونية",
      "شفافية كاملة في الأسعار",
      "مرونة في مدة التخزين",
      "خدمات متكاملة في مكان واحد",
    ],
  },
  {
    title: "للشركات",
    icon: Building2,
    features: [
      "إدارة مخزون بدون مستودعات خاصة",
      "تقليل التكاليف التشغيلية",
      "تقارير وتحليلات دقيقة",
      "خطط اشتراك مرنة",
    ],
  },
  {
    title: "للإدارة",
    icon: Settings2,
    features: [
      "نظام إدارة مركزي",
      "متابعة جميع العمليات",
      "التحكم في التسعير والخدمات",
      "إدارة المساحات بكفاءة",
    ],
  },
];

const stats = [
  { icon: TrendingUp, value: "حلول مرنة", desc: "تناسب جميع الاحتياجات" },
  { icon: Clock, value: "24/7", desc: "دعم فني متواصل" },
  { icon: DollarSign, value: "أسعار تنافسية", desc: "بدون تكاليف مخفية" },
  { icon: LayoutDashboard, value: "لوحة تحكم ذكية", desc: "إدارة سهلة ومتقدمة" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider">المميزات</span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mt-3">
            لماذا <span className="text-gradient-gold">Smart Storage Hub؟</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {audiences.map((aud) => (
            <div key={aud.title} className="glass rounded-2xl p-8 hover:border-primary/20 transition-all">
              <div className="bg-gradient-gold w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <aud.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-5">{aud.title}</h3>
              <ul className="space-y-3">
                {aud.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-muted-foreground text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center p-6 rounded-2xl bg-muted/20">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="font-bold text-foreground text-lg">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
