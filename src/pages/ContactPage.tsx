import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Warehouse, ArrowLeft, Phone, Mail, MapPin, Clock, Send, CheckCircle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const ContactPage = () => {
  const { toast } = useToast();
  const { t, lang, setLang, dir } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactInfo = [
    { icon: Phone, label: t.phoneLabel, value: "+966 50 123 4567", href: "tel:+966501234567" },
    { icon: Mail, label: t.emailLabel, value: "info@smartstoragehub.com", href: "mailto:info@smartstoragehub.com" },
    { icon: MapPin, label: t.addressLabel, value: t.addressValue, href: null },
    { icon: Clock, label: t.workingHoursLabel, value: t.workingHoursValue, href: null },
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = t.errNameRequired;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.errInvalidEmail;
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = t.errMessageRequired;
    if (form.name.length > 100) errs.name = t.errNameTooLong;
    if (form.message.length > 1000) errs.message = t.errMessageTooLong;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    toast({ title: t.messageSentTitle, description: t.messageSentDesc });
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2 rounded-xl">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">{t.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5">
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            {t.backToHome}
            <ArrowLeft className={`w-4 h-4 ${dir === "ltr" ? "" : "rotate-180"}`} />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">{t.contactTitle}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t.contactDesc}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-bold text-foreground mb-2">{t.contactInfoTitle}</h2>
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <div className="text-foreground font-medium">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl overflow-hidden h-64">
              <iframe
                title={t.appName}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.674690463567!2d46.6752957!3d24.7135517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sOlaya%20St%2C%20Riyadh!5e0!3m2!1sar!2ssa!4v1700000000000"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{t.thankYou}</h3>
                  <p className="text-muted-foreground mb-8">{t.replyWithin24h}</p>
                  <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }} variant="outline">
                    {t.sendAnother}
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-6">{t.sendMessage}</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-foreground mb-2 block">{t.fullNameRequired}</Label>
                        <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)}
                          placeholder={t.placeholderName} maxLength={100} className="bg-muted/30 border-border h-12" />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label className="text-foreground mb-2 block">{t.emailRequired}</Label>
                        <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                          placeholder={t.placeholderEmail} maxLength={255} className="bg-muted/30 border-border h-12" />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-foreground mb-2 block">{t.phoneOptional}</Label>
                        <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder={t.placeholderPhone} maxLength={20} className="bg-muted/30 border-border h-12" />
                      </div>
                      <div>
                        <Label className="text-foreground mb-2 block">{t.subject}</Label>
                        <Input value={form.subject} onChange={(e) => handleChange("subject", e.target.value)}
                          placeholder={t.placeholderSubject} maxLength={150} className="bg-muted/30 border-border h-12" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block">{t.messageRequired}</Label>
                      <Textarea value={form.message} onChange={(e) => handleChange("message", e.target.value)}
                        placeholder={t.placeholderMessage} maxLength={1000} rows={5} className="bg-muted/30 border-border resize-none" />
                      <div className="flex justify-between mt-1">
                        {errors.message && <p className="text-destructive text-sm">{errors.message}</p>}
                        <span className={`text-xs text-muted-foreground ${dir === "rtl" ? "mr-auto" : "ml-auto"}`}>{form.message.length}/1000</span>
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 transition-opacity h-12">
                      {t.submitMessage}
                      <Send className={`w-5 h-5 ${dir === "rtl" ? "mr-2" : "ml-2"}`} />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
