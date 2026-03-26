import { Users, Building2, Settings2, TrendingUp, Clock, DollarSign, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const audiences = [
    { title: t.forIndividuals, icon: Users, features: t.individualFeatures },
    { title: t.forCompanies, icon: Building2, features: t.companyFeatures },
    { title: t.forManagement, icon: Settings2, features: t.managementFeatures },
  ];

  const stats = [
    { icon: TrendingUp, value: t.flexibleSolutions, desc: t.suitAllNeeds },
    { icon: Clock, value: t.support247, desc: t.continuousSupport },
    { icon: DollarSign, value: t.competitivePricing, desc: t.noHiddenCosts },
    { icon: LayoutDashboard, value: t.smartDashboard, desc: t.easyAdvancedMgmt },
  ];

  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider">{t.featuresLabel}</span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mt-3">
            {t.whySmartStorage} <span className="text-gradient-gold">Smart Storage Hub؟</span>
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
