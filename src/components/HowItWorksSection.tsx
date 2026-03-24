import { UserPlus, PackageSearch, ClipboardCheck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "إنشاء حساب",
    desc: "سجّل كفرد أو شركة واحصل على لوحة تحكم خاصة بك.",
    step: "01",
  },
  {
    icon: PackageSearch,
    title: "إدخال بيانات الممتلكات",
    desc: "أضف تفاصيل العناصر: النوع، الحجم، الكمية، وطبيعة التخزين.",
    step: "02",
  },
  {
    icon: ClipboardCheck,
    title: "مراجعة وتسعير",
    desc: "تتم مراجعة طلبك وتحديد المساحة والتكلفة بشفافية تامة.",
    step: "03",
  },
  {
    icon: CreditCard,
    title: "الدفع وتأكيد الحجز",
    desc: "ادفع إلكترونياً واستلم تأكيد الحجز مع تخصيص المساحة.",
    step: "04",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how" className="py-24 bg-card">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider">آلية العمل</span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mt-3">
            أربع خطوات <span className="text-gradient-gold">بسيطة</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            من التسجيل إلى التخزين، نظامنا يجعل العملية سلسة وسريعة.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative glass rounded-2xl p-8 group hover:border-primary/30 transition-all duration-300"
            >
              <span className="absolute top-4 left-4 text-6xl font-black text-muted/50">
                {step.step}
              </span>
              <div className="relative z-10">
                <div className="bg-gradient-gold w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -left-3 top-1/2 w-6 h-0.5 bg-gradient-gold" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
