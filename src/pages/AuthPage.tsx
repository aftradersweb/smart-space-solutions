import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse, User, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-gold p-2.5 rounded-xl">
              <Warehouse className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Smart Storage Hub</span>
          </div>

          <h1 className="text-3xl font-black text-foreground mb-2">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? "مرحباً بعودتك! أدخل بياناتك للمتابعة." : "أنشئ حسابك للبدء في استخدام المنصة."}
          </p>

          {!isLogin && (
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  accountType === "individual"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">فرد</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("company")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  accountType === "company"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">شركة</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <Label className="text-foreground mb-2 block">
                    {accountType === "company" ? "اسم الشركة" : "الاسم الكامل"}
                  </Label>
                  <Input
                    placeholder={accountType === "company" ? "مثال: شركة الأمان للتجارة" : "مثال: أحمد محمد"}
                    className="bg-muted/30 border-border h-12"
                  />
                </div>
                {accountType === "company" && (
                  <div>
                    <Label className="text-foreground mb-2 block">السجل التجاري</Label>
                    <Input placeholder="رقم السجل التجاري" className="bg-muted/30 border-border h-12" />
                  </div>
                )}
                <div>
                  <Label className="text-foreground mb-2 block">رقم الهاتف</Label>
                  <Input placeholder="+966 5XX XXX XXXX" className="bg-muted/30 border-border h-12" />
                </div>
              </>
            )}
            <div>
              <Label className="text-foreground mb-2 block">البريد الإلكتروني</Label>
              <Input type="email" placeholder="example@email.com" className="bg-muted/30 border-border h-12" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">كلمة المرور</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-muted/30 border-border h-12 pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 transition-opacity h-12">
              {isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? "سجّل الآن" : "تسجيل الدخول"}
            </button>
          </p>
        </div>
      </div>

      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="bg-gradient-gold w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Warehouse className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">منصة التخزين الذكي</h2>
          <p className="text-muted-foreground leading-relaxed">
            أدِر مساحات التخزين بكفاءة، تابع طلباتك، واحصل على خدمات لوجستية متكاملة من مكان واحد.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
