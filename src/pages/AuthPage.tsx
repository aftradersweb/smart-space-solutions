import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse, User, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NATIONALITIES = [
  "سعودي", "إماراتي", "كويتي", "بحريني", "عماني", "قطري",
  "مصري", "أردني", "سوري", "لبناني", "عراقي", "يمني",
  "سوداني", "تونسي", "مغربي", "جزائري", "ليبي", "فلسطيني",
  "أخرى",
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    commercialReg: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    gender: "",
    idNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (!/[a-zA-Z]/.test(pw)) return "يجب أن تحتوي على حروف";
    if (!/[0-9]/.test(pw)) return "يجب أن تحتوي على أرقام";
    return "";
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!isLogin) {
      if (accountType === "company") {
        if (!form.name.trim()) errs.name = "اسم الشركة مطلوب";
        if (!form.ownerName.trim()) errs.ownerName = "اسم المالك مطلوب";
        if (!form.commercialReg.trim()) errs.commercialReg = "السجل التجاري مطلوب";
      } else {
        if (!form.name.trim()) errs.name = "الاسم الكامل مطلوب";
      }
      if (!form.phone.trim()) errs.phone = "رقم الهاتف مطلوب";
      if (!form.nationality) errs.nationality = "الجنسية مطلوبة";
      if (!form.gender) errs.gender = "الجنس مطلوب";
      if (!form.idNumber.trim()) errs.idNumber = "رقم الهوية/الجواز مطلوب";
    }

    if (!form.email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    const pwErr = validatePassword(form.password);
    if (pwErr) errs.password = pwErr;
    if (!isLogin && form.password !== form.confirmPassword) {
      errs.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "يرجى تصحيح الأخطاء", variant: "destructive" });
      return;
    }
    navigate("/dashboard");
  };

  const fieldClass = "bg-muted/30 border-border h-12";
  const selectClass = "bg-muted/30 border-border h-12 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
                {/* Name */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    {accountType === "company" ? "اسم الشركة" : "الاسم الكامل"}
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder={accountType === "company" ? "مثال: شركة الأمان للتجارة" : "مثال: أحمد محمد"}
                    className={fieldClass}
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Company-specific: Owner Name */}
                {accountType === "company" && (
                  <>
                    <div>
                      <Label className="text-foreground mb-2 block">اسم المالك</Label>
                      <Input
                        value={form.ownerName}
                        onChange={(e) => update("ownerName", e.target.value)}
                        placeholder="مثال: محمد عبدالله"
                        className={fieldClass}
                      />
                      {errors.ownerName && <p className="text-destructive text-sm mt-1">{errors.ownerName}</p>}
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block">السجل التجاري</Label>
                      <Input
                        value={form.commercialReg}
                        onChange={(e) => update("commercialReg", e.target.value)}
                        placeholder="رقم السجل التجاري"
                        className={fieldClass}
                      />
                      {errors.commercialReg && <p className="text-destructive text-sm mt-1">{errors.commercialReg}</p>}
                    </div>
                  </>
                )}

                {/* Nationality */}
                <div>
                  <Label className="text-foreground mb-2 block">الجنسية</Label>
                  <select
                    value={form.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">اختر الجنسية</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {errors.nationality && <p className="text-destructive text-sm mt-1">{errors.nationality}</p>}
                </div>

                {/* Gender */}
                <div>
                  <Label className="text-foreground mb-2 block">الجنس</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "ذكر" },
                      { value: "female", label: "أنثى" },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => update("gender", g.value)}
                        className={`flex-1 p-3 rounded-xl border-2 text-center font-medium transition-all ${
                          form.gender === g.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-muted-foreground/30"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-destructive text-sm mt-1">{errors.gender}</p>}
                </div>

                {/* ID / Passport */}
                <div>
                  <Label className="text-foreground mb-2 block">رقم الهوية / الجواز</Label>
                  <Input
                    value={form.idNumber}
                    onChange={(e) => update("idNumber", e.target.value)}
                    placeholder="مثال: 1234567890"
                    className={fieldClass}
                  />
                  {errors.idNumber && <p className="text-destructive text-sm mt-1">{errors.idNumber}</p>}
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-foreground mb-2 block">رقم الهاتف</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+966 5XX XXX XXXX"
                    className={fieldClass}
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <Label className="text-foreground mb-2 block">البريد الإلكتروني</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="example@email.com"
                className={fieldClass}
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <Label className="text-foreground mb-2 block">كلمة المرور</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="8 أحرف على الأقل (حروف وأرقام)"
                  className={`${fieldClass} pl-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
              {!isLogin && (
                <p className="text-muted-foreground text-xs mt-1">يجب أن تحتوي على 8 أحرف على الأقل مع حروف وأرقام</p>
              )}
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <Label className="text-foreground mb-2 block">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className={`${fieldClass} pl-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

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
