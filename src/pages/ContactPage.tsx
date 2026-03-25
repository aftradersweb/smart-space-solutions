import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Warehouse, ArrowLeft, Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Phone, label: "الهاتف", value: "+966 50 123 4567", href: "tel:+966501234567" },
  { icon: Mail, label: "البريد الإلكتروني", value: "info@smartstoragehub.com", href: "mailto:info@smartstoragehub.com" },
  { icon: MapPin, label: "العنوان", value: "الرياض، المملكة العربية السعودية، حي العليا، شارع الأمير محمد بن عبدالعزيز", href: null },
  { icon: Clock, label: "ساعات العمل", value: "الأحد - الخميس: 8 ص - 6 م", href: null },
];

const ContactPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "الاسم مطلوب (حرفين على الأقل)";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "بريد إلكتروني غير صالح";
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = "الرسالة مطلوبة (10 أحرف على الأقل)";
    if (form.name.length > 100) errs.name = "الاسم طويل جداً";
    if (form.message.length > 1000) errs.message = "الرسالة طويلة جداً (1000 حرف كحد أقصى)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    toast({ title: "تم إرسال رسالتك بنجاح!", description: "سنتواصل معك في أقرب وقت." });
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2 rounded-xl">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Smart Storage Hub</span>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          العودة للرئيسية
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </nav>

      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Title */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">تواصل معنا</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            نحن هنا لمساعدتك. أرسل لنا رسالتك وسنرد عليك في أسرع وقت ممكن.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
          {/* Contact Info & Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-bold text-foreground mb-2">معلومات التواصل</h2>
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-foreground font-medium">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="glass rounded-2xl overflow-hidden h-64">
              <iframe
                title="موقع Smart Storage Hub"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.674690463567!2d46.6752957!3d24.7135517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sOlaya%20St%2C%20Riyadh!5e0!3m2!1sar!2ssa!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">شكراً لتواصلك!</h3>
                  <p className="text-muted-foreground mb-8">تم استلام رسالتك وسيتم الرد عليك خلال 24 ساعة.</p>
                  <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }} variant="outline">
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-6">أرسل لنا رسالة</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-foreground mb-2 block">الاسم الكامل *</Label>
                        <Input
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="أحمد محمد"
                          maxLength={100}
                          className="bg-muted/30 border-border h-12"
                        />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label className="text-foreground mb-2 block">البريد الإلكتروني *</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="example@email.com"
                          maxLength={255}
                          className="bg-muted/30 border-border h-12"
                        />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-foreground mb-2 block">رقم الهاتف</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+966 5XX XXX XXXX"
                          maxLength={20}
                          className="bg-muted/30 border-border h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground mb-2 block">الموضوع</Label>
                        <Input
                          value={form.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          placeholder="استفسار عن التخزين"
                          maxLength={150}
                          className="bg-muted/30 border-border h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block">الرسالة *</Label>
                      <Textarea
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        maxLength={1000}
                        rows={5}
                        className="bg-muted/30 border-border resize-none"
                      />
                      <div className="flex justify-between mt-1">
                        {errors.message && <p className="text-destructive text-sm">{errors.message}</p>}
                        <span className="text-xs text-muted-foreground mr-auto">{form.message.length}/1000</span>
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 transition-opacity h-12">
                      إرسال الرسالة
                      <Send className="w-5 h-5 mr-2" />
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
