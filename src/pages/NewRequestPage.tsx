import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Warehouse, ArrowLeft, ArrowRight, Check, Upload, X, Image as ImageIcon,
  Package, Settings2, Truck, FileText, Camera,
  Snowflake, ShieldCheck, AlertTriangle, Shield, MapPin, Globe, Car
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

import { StorageType, ProductType, Service } from "@/lib/types";
import { ClipboardList } from "lucide-react";

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
  measurementData: Record<string, string | number>;
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
  measurementData: {},
};

const NewRequestPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t, lang, setLang, dir } = useLanguage();

  const STEPS = [
    { id: 1, title: t.nrStep1, icon: Package },
    { id: 2, title: t.nrStep2, icon: Settings2 },
    { id: 3, title: t.nrStep3, icon: Truck },
    { id: 4, title: t.nrStep4, icon: Camera },
    { id: 5, title: t.nrStep5, icon: FileText },
  ];

  const [storageNatures, setStorageNatures] = useState<StorageType[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [extraServices, setExtraServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Storage Types
      const { data: stData } = await supabase.from('storage_types').select('*');
      if (stData) {
        setStorageNatures(stData);
        if (stData.length > 0 && !form.storageType) {
          update("storageType", stData[0].id);
        }
      }

      // Fetch Product Types
      const { data: ptData } = await supabase.from('product_types').select('*').eq('is_active', true);
      if (ptData) setProductTypes(ptData);

      // Fetch Services
      const { data: sData } = await supabase.from('services').select('*').eq('is_active', true);
      if (sData) setExtraServices(sData);
    };
    fetchData();
  }, [form.storageType]);


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

  const isRtl = dir === "rtl";

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Warehouse': return Warehouse;
      case 'Snowflake':
      case 'Thermometer': return Snowflake;
      case 'ShieldCheck': return ShieldCheck;
      case 'AlertTriangle': return AlertTriangle;
      case 'Car': return Car;
      case 'ClipboardList': return ClipboardList;
      case 'MapPin': return MapPin;
      case 'Truck': return Truck;
      case 'Package': return Package;
      case 'Shield': return Shield;
      default: return Warehouse;
    }
  };

  const storageInfo = storageNatures.find((s) => s.id === form.storageType);
  const storagePrice = (storageInfo?.price_per_sqm_month || 0) * form.area * form.duration;
  const extrasPrice = form.extras.reduce((sum, id) => sum + (extraServices.find((e) => e.id === id)?.price || 0), 0) * form.duration;
  const total = storagePrice + extrasPrice;

  const canProceed = () => {
    if (step === 1) return form.productName.trim() && form.productType;
    if (step === 2) return form.area > 0 && form.duration > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Please login to submit a request");
        navigate("/auth");
        return;
      }

      // Upload images first
      const imageUrls: string[] = [];
      for (const img of form.images) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, img.file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          storage_type_id: form.storageType,
          product_name: form.productName,
          product_type: form.productType,
          quantity: form.quantity,
          weight: form.weight,
          area: form.area,
          duration_months: form.duration,
          total_price: total,
          pickup_address: form.pickupAddress,
          delivery_address: form.deliveryAddress,
          notes: form.description,
          product_images: imageUrls,
          status: 'under_review',
          measurement_data: form.measurementData
        });

      if (error) throw error;

      toast.success(t.nrSuccessMsg, { duration: 4000 });
      navigate("/dashboard");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

    if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-4">{t.appName}</h2>
        <p className="text-muted-foreground mb-6">{lang === "ar" ? "الرجاء تسجيل الدخول للمتابعة" : "Please sign in to continue"}</p>
        <Link to="/auth">
          <Button>{t.login}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Nav */}
      <nav className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="bg-gradient-gold p-2 rounded-lg">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">{t.appName}</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
          >
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "" : ""}`} />
            {t.nrBackToDashboard}
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 md:px-12 py-8 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-8">{t.nrTitle}</h1>

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
          {step === 1 && <Step1 form={form} update={update} t={t} productTypes={productTypes} lang={lang} />}
          {step === 2 && <Step2 form={form} update={update} t={t} storageNatures={storageNatures} getIcon={getIcon} lang={lang} />}
          {step === 3 && <Step3 form={form} toggleExtra={toggleExtra} update={update} t={t} extraServices={extraServices} lang={lang} />}
          {step === 4 && (
            <Step4 images={form.images} addImages={addImages} removeImage={removeImage} fileInputRef={fileInputRef} t={t} />
          )}
          {step === 5 && (
            <Step5 form={form} storageInfo={storageInfo} lang={lang} storagePrice={storagePrice} extrasPrice={extrasPrice} total={total} t={t} extraServices={extraServices} />
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
            {isRtl ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
            {t.nrPrev}
          </Button>

          {step < 5 ? (
            <Button
              className="bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              {t.nrNext}
              {isRtl ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
            </Button>
          ) : (
            <Button
              className="bg-gradient-gold text-primary-foreground font-bold glow-gold hover:opacity-90 px-8"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin me-2" />
              ) : (
                <Check className="w-4 h-4 me-2" />
              )}
              {t.nrSubmit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

type T = ReturnType<typeof useLanguage>["t"];

/* ── Step 1: Product Info ── */
const Step1 = ({ form, update, t, productTypes, lang }: { 
  form: FormData; 
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void; 
  t: T;
  productTypes: ProductType[];
  lang: string;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">{t.nrProductInfo}</h2>
    <p className="text-muted-foreground text-sm mb-6">{t.nrProductInfoDesc}</p>

    <div className="grid sm:grid-cols-2 gap-5">
      <div>
        <Label className="text-foreground mb-2 block">{t.nrProductName}</Label>
        <Input value={form.productName} onChange={(e) => update("productName", e.target.value)}
          placeholder={t.nrProductNamePlaceholder} className="bg-muted/30 border-border h-11" />
      </div>
      <div>
        <Label className="text-foreground mb-2 block">{t.nrProductType}</Label>
        <select value={form.productType} onChange={(e) => update("productType", e.target.value)}
          className="w-full h-11 rounded-md bg-muted/30 border border-border px-3 text-foreground text-sm">
          <option value="">{t.nrSelectType}</option>
          {productTypes.map((pt) => <option key={pt.id} value={lang === 'ar' ? pt.name_ar : pt.name_en}>
            {lang === 'ar' ? pt.name_ar : pt.name_en}
          </option>)}
        </select>
      </div>
      <div>
        <Label className="text-foreground mb-2 block">{t.nrQuantity}</Label>
        <Input type="number" min={1} value={form.quantity}
          onChange={(e) => update("quantity", parseInt(e.target.value) || 1)}
          className="bg-muted/30 border-border h-11" />
      </div>
      <div>
        <Label className="text-foreground mb-2 block">{t.nrWeight}</Label>
        <Input value={form.weight} onChange={(e) => update("weight", e.target.value)}
          placeholder={t.nrWeightPlaceholder} className="bg-muted/30 border-border h-11" />
      </div>
    </div>
    <div>
      <Label className="text-foreground mb-2 block">{t.nrDescription}</Label>
      <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
        placeholder={t.nrDescriptionPlaceholder} rows={3}
        className="w-full rounded-md bg-muted/30 border border-border px-3 py-2 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  </div>
);

const evaluateFormula = (formulaStr: string, data: Record<string, string | number>): number => {
  if (!formulaStr) return 0;
  let computedStr = formulaStr;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    computedStr = computedStr.replace(regex, `${Number(value) || 0}`);
  }
  try {
    if (/^[0-9+\-*/() .]+$/.test(computedStr)) {
      return new Function(`return ${computedStr}`)() || 0;
    }
  } catch {
    return 0;
  }
  return 0;
};

/* ── Step 2: Storage Config ── */
const Step2 = ({ form, update, t, storageNatures, getIcon, lang }: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  t: T;
  storageNatures: StorageType[];
  getIcon: (name: string) => React.ComponentType<{ className?: string }>;
  lang: string;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">{t.nrStorageConfig}</h2>
    <p className="text-muted-foreground text-sm mb-6">{t.nrStorageConfigDesc}</p>

    <div>
      <Label className="text-foreground mb-3 block">{t.nrStorageType}</Label>
      <div className="grid sm:grid-cols-2 gap-3">
        {storageNatures.map((type) => {
          const Icon = getIcon(type.icon_name || '');
          return (
            <button key={type.id} onClick={() => {
              update("storageType", type.id);
              update("measurementData", {});
            }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-start transition-all ${
                form.storageType === type.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/30"
              }`}>
              <div className={`p-2 rounded-lg shrink-0 ${form.storageType === type.id ? "bg-gradient-gold" : "bg-muted"}`}>
                <Icon className={`w-5 h-5 ${form.storageType === type.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">{lang === 'ar' ? type.name_ar : type.name_en}</div>
                <div className="text-xs text-muted-foreground">{lang === 'ar' ? type.description_ar : type.description_en}</div>
                <div className="text-primary font-bold text-xs mt-1">{type.price_per_sqm_month} {type.billing_unit ? (lang === 'ar' ? type.unit_name_ar : type.unit_name_en) || type.billing_unit : t.nrPriceUnit}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-6">
      {storageNatures.find(s => s.id === form.storageType)?.measurement_config?.fields ? (
        <div className="space-y-4">
          <Label className="text-foreground mb-3 block">Measurement Details</Label>
          <div className="grid grid-cols-2 gap-3">
            {(storageNatures.find(s => s.id === form.storageType)?.measurement_config.fields as string[] || []).map((field: string) => {
              if (field.includes('type')) {
                const options = storageNatures.find(s => s.id === form.storageType)?.measurement_config.types || 
                               (storageNatures.find(s => s.id === form.storageType)?.measurement_config.box_sizes ? Object.keys(storageNatures.find(s => s.id === form.storageType)?.measurement_config.box_sizes) : []);
                return (
                  <div key={field}>
                    <Label className="text-xs text-muted-foreground capitalize">{field.replace('_', ' ')}</Label>
                    <select 
                      value={form.measurementData[field] || ''}
                      onChange={(e) => {
                        const newMeasurementData = { ...form.measurementData, [field]: e.target.value };
                        update('measurementData', newMeasurementData);
                        
                        // Recalculate area
                        const config = storageNatures.find(s => s.id === form.storageType)?.measurement_config;
                        let newArea = form.area;
                        if (config?.formula) {
                          newArea = evaluateFormula(Object.values(config.formula)[0] as string, newMeasurementData);
                        } else if (newMeasurementData.quantity) {
                          newArea = Number(newMeasurementData.quantity);
                        } else if (newMeasurementData.pallet_count) {
                          newArea = Number(newMeasurementData.pallet_count);
                        }
                        if (newArea > 0) update('area', newArea);
                      }}
                      className="w-full h-11 mt-1 rounded-md bg-muted/30 border border-border px-3 text-foreground text-sm">
                      <option value="">Select...</option>
                      {(options as string[]).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                );
              }
              return (
                <div key={field}>
                  <Label className="text-xs text-muted-foreground capitalize">{field.replace('_', ' ')}</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={form.measurementData[field] || ''}
                    onChange={(e) => {
                      const newMeasurementData = { ...form.measurementData, [field]: e.target.value };
                      update('measurementData', newMeasurementData);
                      
                      // Recalculate area
                      const config = storageNatures.find(s => s.id === form.storageType)?.measurement_config;
                      let newArea = form.area;
                      if (config?.formula) {
                        newArea = evaluateFormula(Object.values(config.formula)[0] as string, newMeasurementData);
                      } else if (newMeasurementData.quantity) {
                        newArea = Number(newMeasurementData.quantity);
                      } else if (newMeasurementData.pallet_count) {
                        newArea = Number(newMeasurementData.pallet_count);
                      }
                      if (newArea > 0) update('area', newArea);
                    }}
                    placeholder={`Enter ${field}`} 
                    className="bg-muted/30 mt-1 border-border h-11" 
                  />
                </div>
              );
            })}
          </div>
          <div className="text-sm border rounded-md p-3 text-muted-foreground">
            Computed Final Unit Count: <strong className="text-primary">{form.area}</strong>
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-foreground mb-3 block">{t.nrAreaRequired}</Label>
          <div className="bg-muted/20 rounded-xl p-5">
            <input type="range" min={1} max={200} value={form.area}
              onChange={(e) => update("area", Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>1 {t.nrSqm}</span>
              <span className="text-xl font-black text-primary">{form.area} {t.nrSqm}</span>
              <span>200 {t.nrSqm}</span>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <Label className="text-foreground mb-3 block">{t.nrDuration}</Label>
        <div className="bg-muted/20 rounded-xl p-5">
          <input type="range" min={1} max={24} value={form.duration}
            onChange={(e) => update("duration", Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1 {t.nrMonth}</span>
            <span className="text-xl font-black text-primary">{form.duration} {t.nrMonth}</span>
            <span>24 {t.nrMonth}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Step 3: Extras ── */
const Step3 = ({ form, toggleExtra, update, t, extraServices, lang }: {
  form: FormData;
  toggleExtra: (id: string) => void;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  t: T;
  extraServices: Service[];
  lang: string;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">{t.nrExtras}</h2>
    <p className="text-muted-foreground text-sm mb-6">{t.nrExtrasDesc}</p>

    <div className="space-y-3">
      {extraServices.map((svc) => (
        <button key={svc.id} onClick={() => toggleExtra(svc.id)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
            form.extras.includes(svc.id) ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/30"
          }`}>
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              form.extras.includes(svc.id) ? "border-primary bg-primary" : "border-muted-foreground/40"
            }`}>
              {form.extras.includes(svc.id) && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="font-medium text-foreground text-sm">{lang === 'ar' ? svc.title_ar : svc.title_en}</span>
          </div>
          <span className="text-primary font-bold text-sm">{svc.price} {t.nrSarMonth}</span>
        </button>
      ))}
    </div>

    {form.extras.includes("pickup") && (
      <div>
        <Label className="text-foreground mb-2 block">
          <MapPin className="w-4 h-4 inline me-1" />
          {t.nrPickupAddress}
        </Label>
        <Input value={form.pickupAddress} onChange={(e) => update("pickupAddress", e.target.value)}
          placeholder={t.nrPickupPlaceholder} className="bg-muted/30 border-border h-11" />
      </div>
    )}
    {form.extras.includes("delivery") && (
      <div>
        <Label className="text-foreground mb-2 block">
          <Truck className="w-4 h-4 inline me-1" />
          {t.nrDeliveryAddress}
        </Label>
        <Input value={form.deliveryAddress} onChange={(e) => update("deliveryAddress", e.target.value)}
          placeholder={t.nrDeliveryPlaceholder} className="bg-muted/30 border-border h-11" />
      </div>
    )}
  </div>
);

/* ── Step 4: Images ── */
const Step4 = ({ images, addImages, removeImage, fileInputRef, t }: {
  images: FormData["images"];
  addImages: (files: FileList | null) => void;
  removeImage: (i: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  t: T;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">{t.nrImages}</h2>
    <p className="text-muted-foreground text-sm mb-6">{t.nrImagesDesc}</p>

    <input ref={fileInputRef} type="file" accept="image/*" multiple
      onChange={(e) => addImages(e.target.files)} className="hidden" />

    <button onClick={() => fileInputRef.current?.click()} disabled={images.length >= 6}
      className="w-full border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
        <Upload className="w-7 h-7 text-muted-foreground" />
      </div>
      <span className="text-foreground font-medium">{t.nrUploadClick}</span>
      <span className="text-xs text-muted-foreground">{t.nrUploadHint}</span>
    </button>

    {images.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-muted">
            <img src={img.preview} alt={`${t.nrImageAlt} ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => removeImage(i)}
                className="w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80">
                <X className="w-5 h-5" />
              </button>
            </div>
            <span className="absolute bottom-2 end-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
              {img.file.name.length > 15 ? img.file.name.slice(0, 12) + "..." : img.file.name}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ── Step 5: Summary ── */
const Step5 = ({ form, storageInfo, storagePrice, extrasPrice, total, t, extraServices, lang }: {
  form: FormData;
  storageInfo: StorageType | undefined;
  storagePrice: number;
  extrasPrice: number;
  total: number;
  t: T;
  extraServices: Service[];
  lang: string;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground mb-2">{t.nrReview}</h2>
    <p className="text-muted-foreground text-sm mb-6">{t.nrReviewDesc}</p>

    <div className="space-y-6">
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> {t.nrProductData}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">{t.nrName}</span> <span className="text-foreground font-medium ms-1">{form.productName}</span></div>
          <div><span className="text-muted-foreground">{t.nrType}</span> <span className="text-foreground font-medium ms-1">{form.productType}</span></div>
          <div><span className="text-muted-foreground">{t.nrQty}</span> <span className="text-foreground font-medium ms-1">{form.quantity}</span></div>
          {form.weight && <div><span className="text-muted-foreground">{t.nrWeightLabel}</span> <span className="text-foreground font-medium ms-1">{form.weight}</span></div>}
        </div>
        {form.description && <p className="text-sm text-muted-foreground mt-2">{form.description}</p>}
      </div>

      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" /> {t.nrStorageSettings}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">{t.nrStorageTypeLabel}</span> <span className="text-foreground font-medium ms-1">{storageInfo ? (lang === 'ar' ? storageInfo.name_ar : storageInfo.name_en) : ''}</span></div>
          <div><span className="text-muted-foreground">{t.nrAreaLabel}</span> <span className="text-foreground font-medium ms-1">{form.area} {t.nrSqm}</span></div>
          <div><span className="text-muted-foreground">{t.nrDurationLabel}</span> <span className="text-foreground font-medium ms-1">{form.duration} {t.nrMonth}</span></div>
          <div><span className="text-muted-foreground">{t.nrPriceLabel}</span> <span className="text-primary font-bold ms-1">{storageInfo?.price_per_sqm_month} {t.nrSarSqmMonth}</span></div>
        </div>
      </div>

      {form.extras.length > 0 && (
        <div className="bg-muted/20 rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" /> {t.nrExtraServices}
          </h3>
          <ul className="space-y-2">
            {form.extras.map((id) => {
              const svc = extraServices.find((e) => e.id === id);
              return svc ? (
                <li key={id} className="flex justify-between text-sm">
                  <span className="text-foreground">{lang === 'ar' ? svc.title_ar : svc.title_en}</span>
                  <span className="text-primary font-bold">{svc.price} {t.nrSarMonth}</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}

      {form.images.length > 0 && (
        <div className="bg-muted/20 rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> {t.nrPhotos} ({form.images.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {form.images.map((img, i) => (
              <img key={i} src={img.preview} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
            ))}
          </div>
        </div>
      )}

      <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5">
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.nrStorageCost}</span>
            <span className="text-foreground font-bold">{storagePrice.toLocaleString()} {t.nrSar}</span>
          </div>
          {extrasPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.nrExtrasCost}</span>
              <span className="text-foreground font-bold">{extrasPrice.toLocaleString()} {t.nrSar}</span>
            </div>
          )}
          <div className="pt-2 border-t border-primary/20 flex justify-between text-base">
            <span className="text-foreground font-bold">{t.nrTotal}</span>
            <span className="text-primary font-black">{total.toLocaleString()} {t.nrSar}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NewRequestPage;
