import heroImage from "@/assets/hero-warehouse.jpg";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t, lang, setLang, dir } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" dir={dir}>
      <img
        src={heroImage}
        alt={t.smartStoragePlatform}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Nav */}
      <nav className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2.5 rounded-xl">
            <Warehouse className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{t.appName}</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-muted-foreground">
          <a href="#how" className="hover:text-primary transition-colors">{t.howItWorks}</a>
          <Link to="/services" className="hover:text-primary transition-colors">{t.services}</Link>
          <a href="#features" className="hover:text-primary transition-colors">{t.features}</a>
          <Link to="/contact" className="hover:text-primary transition-colors">{t.contactUs}</Link>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg px-3 py-1.5"
          >
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              {t.login}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">{t.heroBadge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="text-foreground">{t.heroTitle1}</span>
            <br />
            <span className="text-gradient-gold">{t.heroTitle2}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold text-lg px-8 glow-gold hover:opacity-90 transition-opacity">
                {t.startNow}
                <ArrowLeft className={`w-5 h-5 ${dir === "ltr" ? "rotate-180 ml-2" : "mr-2"}`} />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted font-medium text-lg px-8">
                {t.discoverMore}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
            {[
              { value: "+500", label: t.activeClients },
              { value: "10K+", label: t.areaUnit },
              { value: "99%", label: t.satisfaction },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
