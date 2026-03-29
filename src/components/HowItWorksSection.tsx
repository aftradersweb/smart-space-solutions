import { UserPlus, PackageSearch, ClipboardCheck, CreditCard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: UserPlus, title: t.step1Title, desc: t.step1Desc, step: "01" },
    { icon: PackageSearch, title: t.step2Title, desc: t.step2Desc, step: "02" },
    { icon: ClipboardCheck, title: t.step3Title, desc: t.step3Desc, step: "03" },
    { icon: CreditCard, title: t.step4Title, desc: t.step4Desc, step: "04" },
  ];

  return (
    <section id="how" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-12">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-primary font-bold text-xs md:text-sm tracking-wider">{t.howItWorksLabel}</span>
          <h2 className="text-2xl md:text-5xl font-black text-foreground mt-2 md:mt-3">
            {t.fourSimpleSteps} <span className="text-gradient-gold">{t.simple}</span>
          </h2>
          <p className="text-muted-foreground mt-3 md:mt-4 max-w-xl mx-auto text-xs md:text-base">{t.howItWorksDesc}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative glass rounded-xl md:rounded-2xl p-4 md:p-8 group hover:border-primary/30 transition-all duration-300">
              <span className="absolute top-2 start-2 md:top-4 md:start-4 text-3xl md:text-6xl font-black text-muted/40">{step.step}</span>
              <div className="relative z-10">
                <div className="bg-gradient-gold w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6">
                  <step.icon className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-foreground mb-1.5 md:mb-3 leading-tight">{step.title}</h3>
                <p className="text-muted-foreground text-[11px] md:text-sm leading-relaxed line-clamp-3 md:line-clamp-none">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -start-3 top-1/2 w-6 h-0.5 bg-gradient-gold" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
