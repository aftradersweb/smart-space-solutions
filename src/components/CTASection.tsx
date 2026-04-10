import { Button } from "@/components/ui/button";
import { ArrowLeft, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const CTASection = () => {
  const { t, dir } = useLanguage();

  return (
    <section className="py-12 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="glass rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto">
          <div className="bg-gradient-gold w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Warehouse className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">{t.readyToStart}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">{t.ctaDesc}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold text-lg px-10 glow-gold hover:opacity-90 transition-opacity">
                {t.createFreeAccount}
                <ArrowLeft className={`w-5 h-5 ${dir === "ltr" ? "rotate-180 ml-2" : "mr-2"}`} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted font-medium text-lg px-10">
                {t.contactUs}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12">
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-gold p-1.5 rounded-lg">
              <Warehouse className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">{t.appName}</span>
          </div>
          <p>{t.allRightsReserved}</p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
