import heroImage from "@/assets/hero-warehouse.jpg";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <img
        src={heroImage}
        alt="مستودع ذكي حديث"
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
          <span className="text-xl font-bold text-foreground">Smart Storage Hub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-muted-foreground">
          <a href="#how" className="hover:text-primary transition-colors">آلية العمل</a>
          <Link to="/services" className="hover:text-primary transition-colors">الخدمات</Link>
          <a href="#features" className="hover:text-primary transition-colors">المميزات</a>
          <Link to="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">منصة التخزين الذكي الأولى من نوعها</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="text-foreground">خزّن بذكاء.</span>
            <br />
            <span className="text-gradient-gold">أدِر بسهولة.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
            منصة رقمية متكاملة لتأجير وإدارة مساحات التخزين للأفراد والشركات مع خدمات لوجستية متقدمة ولوحة تحكم ذكية.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold text-lg px-8 glow-gold hover:opacity-90 transition-opacity">
              ابدأ الآن
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted font-medium text-lg px-8">
                اكتشف المزيد
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
            {[
              { value: "+500", label: "عميل نشط" },
              { value: "10K+", label: "م² مساحة" },
              { value: "99%", label: "رضا العملاء" },
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
