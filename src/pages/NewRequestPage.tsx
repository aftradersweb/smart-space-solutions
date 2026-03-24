import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Warehouse, ArrowLeft, ArrowRight, Check, Upload, X, Image as ImageIcon,
  Package, Settings2, Truck, FileText, Camera,
  Snowflake, ShieldCheck, AlertTriangle, Shield, MapPin
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "بيانات المنتج", icon: Package },
  { id: 2, title: "إعدادات التخزين", icon: Settings2 },
  { id: 3, title: "الخدمات الإضافية", icon: Truck },
  { id: 4, title: "صور المنتج", icon: Camera },
  { id: 5, title: "المراجعة والتأكيد", icon: FileText },
];

const productTypes = ["بضائع", "أثاث", "سيارة", "معدات", "مواد غذائية", "إلكترونيات", "مستندات", "أخرى"];
const storageNatures = [
  { id: "normal", name: "تخزين عادي", icon: Warehouse, price: 50, desc: "للبضائع والأثاث العادي" },
  { id: "cold", name: "تخزين مبرد", icon: Snowflake, price: 120, desc: "للمواد الغذائية والأدوية" },
  { id: "secure", name: "عالي الأمان", icon: ShieldCheck, price: 200, desc: "للمقتنيات الثمينة" },
  { id: "hazardous", name: "مواد حساسة", icon: AlertTriangle, price: 300, desc: "للمواد الكيميائية" },
];
const extraServices = [
  { id: "pickup", name: "استلام من موقعك", price: 150 },
  { id: "delivery", name: "توصيل لموقع محدد", price: 150 },
  { id: "packing", name: "تغليف وتعبئة", price: 100 },
  { id: "insurance", name: "تأمين الممتلكات", price: 80 },
  { id: "inventory", name: "جرد وتتبع", price: 60 },
];

interface FormData {
  productName: string;
  productType: string;
  quantity: number;
  weight: string;
  description: string;
  storageType: string;
  area: number;
  duration: number;
  extras: string[];
  pickupAddress: string;
  deliveryAddress: string;
  images: { file: File; preview: string }[];
}

const initialForm: FormData = {
  productName: "",
  productType: "",
  quantity: 1,
  weight: "",
  description: "",
  storageType: "normal",
  area: 10,
  duration: 1,
  extras: [],
  pickupAddress: "",
  deliveryAddress: "",
  images: [],
};

const NewRequestPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleExtra = (id: string) =>
    update("extras", form.extras.includes(id) ? form.extras.filter((e) => e !== id) : [...form.extras, id]);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).slice(0, 6 - form.images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    update("images", [...form.images, ...newImages]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(form.images[index].preview);
    update("images", form.images.filter((_, i) => i !== index));
  };

  const storageInfo = storageNatures.find((s) => s.id === form.storageType)!;
  const storagePrice = storageInfo.price * form.area * form.duration;
  const extrasPrice = form.extras.reduce((sum, id) => sum + (extraServices.find((e) => e.id === id)?.price || 0), 0) * form.duration;
  const total = storagePrice + extrasPrice;

  const canProceed = () => {
    if (step === 1) return form.productName.trim() && form.productType;
    if (step === 2) return form.area > 0 && form.duration > 0;
    return true;
  };

  const handleSubmit = () => {
    toast.success("تم إرسال طلب التخزين بنجاح! سيتم مراجعته من الإدارة.", { duration: 4000 });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2 rounded-lg">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Smart Storage Hub</span>
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>
      </nav>

      <div className="container mx-auto px-6 md:px-12 py-8 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-8">طلب تخزين جديد</h1>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step > s.id
                      ? "bg-gradient-gold text-primary-foreground"
                      : step === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium text-center ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 md:w-16 mx-1 ${step > s.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass rounded-2xl p-6 md:p-10 mb-8">
          {step === 1 && <Step1 form={form} update={update} />}
          {step === 2 && <Step2 form={form} update={update} />}
          {step === 3 && <Step3 form={form} toggleExtra={toggleExtra} update={update} />}
          {step === 4 && (
            <Step4
              images={form.images}
              addImages={addImages}
              removeImage={removeImage}
              fileInputRef={fileInputRef}
            />
          )}
          {step === 5 && (
            <Step5 form={form} storageInfo={storageInfo} storagePrice={storagePrice} extrasPrice={extrasPrice} total={total} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="border-border text-foreground"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            السابق
          </Button>

          {step < 5 ? (
            <Button
              className="bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              التالي
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          ) : (
            <Button
              className="bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 px-8"
              onClick={handleSubmit}
            >
              <Check className="w-4 h-4 ml-2" />
              إرسال الطلب
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Step 1: Product Info ── */
const Step1 = ({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">بيانات المنتج</h2>
    <p className="text-muted-foreground text-sm mb-6">أدخل تفاصيل العنصر المراد تخزينه.</p>

    <div className="grid sm:grid-cols-2 gap-5">
      <div>
        <Label className="text-foreground mb-2 block">اسم المنتج *</Label>
        <Input
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
          placeholder="مثال: أثاث مكتبي"
          className="bg-muted/30 border-border h-11"
        />
      </div>
      <div>
        <Label className="text-foreground mb-2 block">نوع المنتج *</Label>
        <select
          value={form.productType}
          onChange={(e) => update("productType", e.target.value)}
          className="w-full h-11 rounded-md bg-muted/30 border border-border px-3 text-foreground text-sm"
        >
          <option value="">اختر النوع</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-foreground mb-2 block">الكمية</Label>
        <Input
          type="number"
          min={1}
          value={form.quantity}
          onChange={(e) => update("quantity", parseInt(e.target.value) || 1)}
          className="bg-muted/30 border-border h-11"
        />
      </div>
      <div>
        <Label className="text-foreground mb-2 block">الوزن التقريبي</Label>
        <Input
          value={form.weight}
          onChange={(e) => update("weight", e.target.value)}
          placeholder="مثال: 500 كجم"
          className="bg-muted/30 border-border h-11"
        />
      </div>
    </div>
    <div>
      <Label className="text-foreground mb-2 block">وصف إضافي</Label>
      <textarea
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="أي تفاصيل إضافية عن المنتج..."
        rows={3}
        className="w-full rounded-md bg-muted/30 border border-border px-3 py-2 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  </div>
);

/* ── Step 2: Storage Config ── */
const Step2 = ({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">إعدادات التخزين</h2>
    <p className="text-muted-foreground text-sm mb-6">اختر نوع التخزين والمساحة والمدة.</p>

    <div>
      <Label className="text-foreground mb-3 block">نوع التخزين</Label>
      <div className="grid sm:grid-cols-2 gap-3">
        {storageNatures.map((type) => (
          <button
            key={type.id}
            onClick={() => update("storageType", type.id)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${
              form.storageType === type.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${form.storageType === type.id ? "bg-gradient-gold" : "bg-muted"}`}>
              <type.icon className={`w-5 h-5 ${form.storageType === type.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">{type.name}</div>
              <div className="text-xs text-muted-foreground">{type.desc}</div>
              <div className="text-primary font-bold text-xs mt-1">{type.price} ر.س / م² / شهر</div>
            </div>
          </button>
        ))}
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <Label className="text-foreground mb-3 block">المساحة المطلوبة (م²)</Label>
        <div className="bg-muted/20 rounded-xl p-5">
          <input
            type="range"
            min={1}
            max={200}
            value={form.area}
            onChange={(e) => update("area", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1 م²</span>
            <span className="text-xl font-black text-primary">{form.area} م²</span>
            <span>200 م²</span>
          </div>
        </div>
      </div>
      <div>
        <Label className="text-foreground mb-3 block">مدة التخزين (أشهر)</Label>
        <div className="bg-muted/20 rounded-xl p-5">
          <input
            type="range"
            min={1}
            max={24}
            value={form.duration}
            onChange={(e) => update("duration", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1 شهر</span>
            <span className="text-xl font-black text-primary">{form.duration} شهر</span>
            <span>24 شهر</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Step 3: Extras ── */
const Step3 = ({
  form,
  toggleExtra,
  update,
}: {
  form: FormData;
  toggleExtra: (id: string) => void;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">الخدمات الإضافية</h2>
    <p className="text-muted-foreground text-sm mb-6">اختر الخدمات التي تحتاجها (اختياري).</p>

    <div className="space-y-3">
      {extraServices.map((svc) => (
        <button
          key={svc.id}
          onClick={() => toggleExtra(svc.id)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
            form.extras.includes(svc.id)
              ? "border-primary bg-primary/10"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              form.extras.includes(svc.id) ? "border-primary bg-primary" : "border-muted-foreground/40"
            }`}>
              {form.extras.includes(svc.id) && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="font-medium text-foreground text-sm">{svc.name}</span>
          </div>
          <span className="text-primary font-bold text-sm">{svc.price} ر.س/شهر</span>
        </button>
      ))}
    </div>

    {form.extras.includes("pickup") && (
      <div>
        <Label className="text-foreground mb-2 block">
          <MapPin className="w-4 h-4 inline ml-1" />
          عنوان الاستلام
        </Label>
        <Input
          value={form.pickupAddress}
          onChange={(e) => update("pickupAddress", e.target.value)}
          placeholder="أدخل عنوان الاستلام..."
          className="bg-muted/30 border-border h-11"
        />
      </div>
    )}
    {form.extras.includes("delivery") && (
      <div>
        <Label className="text-foreground mb-2 block">
          <MapPin className="w-4 h-4 inline ml-1" />
          عنوان التوصيل
        </Label>
        <Input
          value={form.deliveryAddress}
          onChange={(e) => update("deliveryAddress", e.target.value)}
          placeholder="أدخل عنوان التوصيل..."
          className="bg-muted/30 border-border h-11"
        />
      </div>
    )}
  </div>
);

/* ── Step 4: Images ── */
const Step4 = ({
  images,
  addImages,
  removeImage,
  fileInputRef,
}: {
  images: FormData["images"];
  addImages: (files: FileList | null) => void;
  removeImage: (i: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">صور المنتج</h2>
    <p className="text-muted-foreground text-sm mb-6">أضف صوراً توضيحية للمنتج (حتى 6 صور).</p>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => addImages(e.target.files)}
      className="hidden"
    />

    {/* Upload area */}
    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={images.length >= 6}
      className="w-full border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
        <Upload className="w-7 h-7 text-muted-foreground" />
      </div>
      <span className="text-foreground font-medium">اضغط لرفع الصور</span>
      <span className="text-xs text-muted-foreground">PNG, JPG, WEBP — حتى 6 صور</span>
    </button>

    {/* Preview grid */}
    {images.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-muted">
            <img src={img.preview} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => removeImage(i)}
                className="w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <span className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
              {img.file.name.length > 15 ? img.file.name.slice(0, 12) + "..." : img.file.name}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ── Step 5: Summary ── */
const Step5 = ({
  form,
  storageInfo,
  storagePrice,
  extrasPrice,
  total,
}: {
  form: FormData;
  storageInfo: typeof storageNatures[0];
  storagePrice: number;
  extrasPrice: number;
  total: number;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">مراجعة الطلب</h2>
    <p className="text-muted-foreground text-sm mb-6">راجع تفاصيل طلبك قبل الإرسال.</p>

    <div className="space-y-6">
      {/* Product info */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> بيانات المنتج
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">الاسم:</span> <span className="text-foreground font-medium mr-1">{form.productName}</span></div>
          <div><span className="text-muted-foreground">النوع:</span> <span className="text-foreground font-medium mr-1">{form.productType}</span></div>
          <div><span className="text-muted-foreground">الكمية:</span> <span className="text-foreground font-medium mr-1">{form.quantity}</span></div>
          {form.weight && <div><span className="text-muted-foreground">الوزن:</span> <span className="text-foreground font-medium mr-1">{form.weight}</span></div>}
        </div>
        {form.description && <p className="text-sm text-muted-foreground mt-2">{form.description}</p>}
      </div>

      {/* Storage config */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" /> إعدادات التخزين
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">نوع التخزين:</span> <span className="text-foreground font-medium mr-1">{storageInfo.name}</span></div>
          <div><span className="text-muted-foreground">المساحة:</span> <span className="text-foreground font-medium mr-1">{form.area} م²</span></div>
          <div><span className="text-muted-foreground">المدة:</span> <span className="text-foreground font-medium mr-1">{form.duration} شهر</span></div>
          <div><span className="text-muted-foreground">السعر:</span> <span className="text-primary font-bold mr-1">{storageInfo.price} ر.س/م²/شهر</span></div>
        </div>
      </div>

      {/* Extras */}
      {form.extras.length > 0 && (
        <div className="bg-muted/20 rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" /> الخدمات الإضافية
          </h3>
          <ul className="space-y-2">
            {form.extras.map((id) => {
              const svc = extraServices.find((e) => e.id === id);
              return svc ? (
                <li key={id} className="flex justify-between text-sm">
                  <span className="text-foreground">{svc.name}</span>
                  <span className="text-primary font-bold">{svc.price} ر.س/شهر</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}

      {/* Images */}
      {form.images.length > 0 && (
        <div className="bg-muted/20 rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> الصور ({form.images.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {form.images.map((img, i) => (
              <img key={i} src={img.preview} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5">
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">تكلفة التخزين</span>
            <span className="text-foreground font-bold">{storagePrice.toLocaleString()} ر.س</span>
          </div>
          {extrasPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">الخدمات الإضافية</span>
              <span className="text-foreground font-bold">{extrasPrice.toLocaleString()} ر.س</span>
            </div>
          )}
        </div>
        <div className="border-t border-primary/20 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-foreground">الإجمالي</span>
          <span className="text-2xl font-black text-gradient-gold">{total.toLocaleString()} ر.س</span>
        </div>
      </div>
    </div>
  </div>
);

export default NewRequestPage;
