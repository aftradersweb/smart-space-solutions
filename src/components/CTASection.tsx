import { Button } from "@/components/ui/button";
import { ArrowLeft, Warehouse } from "lucide-react";
import { Twitter, Instagram, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const CTASection = () => {
  const { t, dir } = useLanguage();

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: MessageCircle, href: "#", label: "WhatsApp" },
  ];

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

      {/* Footer */}
      <div className="container mx-auto px-6 md:px-12 mt-16">
        <div className="border-t border-border pt-8 space-y-6">
          {/* Top row: Links + Social */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t.navServices}</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">{t.navContact}</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.footerFAQ}</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.footerPrivacyPolicy}</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.footerTerms}</Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Bottom row: Brand + Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-gold p-1.5 rounded-lg">
                <Warehouse className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">{t.appName}</span>
            </div>
            <p>{t.allRightsReserved}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
