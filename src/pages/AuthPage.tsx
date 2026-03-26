import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse, User, Building2, Eye, EyeOff, ArrowLeft, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang, setLang, dir } = useLanguage();

  const [form, setForm] = useState({
    name: "", ownerName: "", commercialReg: "", phone: "",
    email: "", password: "", confirmPassword: "",
    nationality: "", gender: "", idNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return t.errPasswordMin;
    if (!/[a-zA-Z]/.test(pw)) return t.errPasswordLetters;
    if (!/[0-9]/.test(pw)) return t.errPasswordNumbers;
    return "";
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isLogin) {
      if (accountType === "company") {
        if (!form.name.trim()) errs.name = t.errCompanyNameRequired;
        if (!form.ownerName.trim()) errs.ownerName = t.errOwnerNameRequired;
        if (!form.commercialReg.trim()) errs.commercialReg = t.errCommercialRegRequired;
      } else {
        if (!form.name.trim()) errs.name = t.errFullNameRequired;
      }
      if (!form.phone.trim()) errs.phone = t.errPhoneRequired;
      if (!form.nationality) errs.nationality = t.errNationalityRequired;
      if (!form.gender) errs.gender = t.errGenderRequired;
      if (!form.idNumber.trim()) errs.idNumber = t.errIdRequired;
    }
    if (!form.email.trim()) errs.email = t.errEmailRequired;
    const pwErr = validatePassword(form.password);
    if (pwErr) errs.password = pwErr;
    if (!isLogin && form.password !== form.confirmPassword) {
      errs.confirmPassword = t.errPasswordMismatch;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: t.errFixErrors, variant: "destructive" });
      return;
    }
    navigate("/dashboard");
  };

  const fieldClass = "bg-muted/30 border-border h-12";
  const selectClass = "bg-muted/30 border-border h-12 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const eyeSide = dir === "rtl" ? "left-3" : "right-3";
  const eyePad = dir === "rtl" ? "pl-12" : "pr-12";

  return (
    <div className="min-h-screen bg-background flex" dir={dir}>
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className={`w-full py-8 ${isLogin ? "max-w-md" : "max-w-2xl"}`}>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className={`w-4 h-4 ${dir === "ltr" ? "" : "rotate-180"}`} />
              {t.backToHome}
            </Link>
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
            >
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-gold p-2.5 rounded-xl">
              <Warehouse className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{t.appName}</span>
          </div>

          <h1 className="text-3xl font-black text-foreground mb-2">
            {isLogin ? t.login : t.createAccount}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isLogin ? t.loginWelcome : t.signupWelcome}
          </p>

          {/* Account type toggle */}
          {!isLogin && (
            <div className="flex gap-3 mb-6">
              {(["individual", "company"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                    accountType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {type === "individual" ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  <span className="font-medium">{type === "individual" ? t.individual : t.company}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground mb-1.5 block text-sm">
                      {accountType === "company" ? t.companyName : t.fullName}
                    </Label>
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)}
                      placeholder={accountType === "company" ? t.placeholderCompanyName : t.placeholderFullName}
                      className={fieldClass} />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground mb-1.5 block text-sm">{t.phone}</Label>
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      placeholder={t.placeholderPhone} className={fieldClass} />
                    {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Row 2: Company-specific */}
                {accountType === "company" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground mb-1.5 block text-sm">{t.ownerName}</Label>
                      <Input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)}
                        placeholder={t.placeholderOwnerName} className={fieldClass} />
                      {errors.ownerName && <p className="text-destructive text-xs mt-1">{errors.ownerName}</p>}
                    </div>
                    <div>
                      <Label className="text-foreground mb-1.5 block text-sm">{t.commercialReg}</Label>
                      <Input value={form.commercialReg} onChange={(e) => update("commercialReg", e.target.value)}
                        placeholder={t.placeholderCommercialReg} className={fieldClass} />
                      {errors.commercialReg && <p className="text-destructive text-xs mt-1">{errors.commercialReg}</p>}
                    </div>
                  </div>
                )}

                {/* Row 3: Nationality + Gender + ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-foreground mb-1.5 block text-sm">{t.nationality}</Label>
                    <select value={form.nationality} onChange={(e) => update("nationality", e.target.value)} className={selectClass}>
                      <option value="">{t.selectNationality}</option>
                      {t.nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {errors.nationality && <p className="text-destructive text-xs mt-1">{errors.nationality}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground mb-1.5 block text-sm">{t.gender}</Label>
                    <div className="flex gap-2">
                      {[{ value: "male", label: t.male }, { value: "female", label: t.female }].map((g) => (
                        <button key={g.value} type="button" onClick={() => update("gender", g.value)}
                          className={`flex-1 h-12 rounded-xl border-2 text-center font-medium transition-all ${
                            form.gender === g.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-muted-foreground/30"
                          }`}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-destructive text-xs mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground mb-1.5 block text-sm">{t.idNumber}</Label>
                    <Input value={form.idNumber} onChange={(e) => update("idNumber", e.target.value)}
                      placeholder={t.placeholderIdNumber} className={fieldClass} />
                    {errors.idNumber && <p className="text-destructive text-xs mt-1">{errors.idNumber}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Email + Password */}
            <div className={`grid grid-cols-1 ${!isLogin ? "md:grid-cols-2" : ""} gap-4`}>
              <div>
                <Label className="text-foreground mb-1.5 block text-sm">{t.email}</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                  placeholder={t.placeholderEmail} className={fieldClass} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label className="text-foreground mb-1.5 block text-sm">{t.password}</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder={t.placeholderPassword} className={`${fieldClass} ${eyePad}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${eyeSide} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                {!isLogin && <p className="text-muted-foreground text-xs mt-1">{t.passwordHint}</p>}
              </div>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground mb-1.5 block text-sm">{t.confirmPassword}</Label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder={t.placeholderConfirmPassword} className={`${fieldClass} ${eyePad}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className={`absolute ${eyeSide} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}>
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 transition-opacity h-12">
              {isLogin ? t.submitLogin : t.submitSignup}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            {isLogin ? t.noAccount : t.hasAccount}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? t.signupNow : t.loginNow}
            </button>
          </p>
        </div>
      </div>

      {/* Visual side */}
      <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="bg-gradient-gold w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Warehouse className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">{t.smartStoragePlatform}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.visualDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
