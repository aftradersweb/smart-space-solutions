import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Warehouse, LayoutDashboard, ClipboardList, MapPin as Space, DollarSign,
  Users, Search, Bell, User, LogOut, ChevronLeft, Eye,
  CheckCircle, XCircle, Clock, MoreVertical, TrendingUp, Package, Globe,
  Settings, Save, Download, FileText, FileSpreadsheet,
  Twitter, Instagram, Facebook, Linkedin, MessageCircle,
  Plus, Pencil, ArrowLeft, Power
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency, currencies, type Currency } from "@/i18n/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MobileTopBar from "@/components/MobileTopBar";
import MobileBottomNav from "@/components/MobileBottomNav";

interface AdminOrder {
  id: string;
  created_at: string;
  status: string;
  area: number;
  duration_months: number;
  total_price: number;
  notes: string;
  profiles: {
    full_name: string;
    company_name: string;
    user_type: string;
  };
  storage_types: {
    name_en: string;
    name_ar: string;
  };
}

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  created_at: string;
}

interface AdminSpace {
  id: string;
  name_en: string;
  name_ar: string;
  storage_type_id: string;
  capacity: number;
  used_capacity: number;
  status: string;
  is_active: boolean;
}

type Tab = "overview" | "orders" | "spaces" | "pricing" | "users" | "settings";

type SpaceItem = {
  id: string; name: string; nameAr: string; type: string; capacity: string; used: string; percent: number; status: string; active: boolean;
};

type SpaceStoredItem = {
  id: string; item: string; owner: string; remainingDays: number; startDate: string; endDate: string;
};

const AdminPage = () => {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [spaces, setSpaces] = useState<AdminSpace[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Form states
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<any | null>(null);
  const [spaceFormData, setSpaceFormData] = useState({
    name: "", nameAr: "", type: "", capacity: ""
  });

  const [confirmAction, setConfirmAction] = useState<{orderId: string, type: 'approve' | 'reject'} | null>(null);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState<any | null>(null);
  const [pricingFormData, setPricingFormData] = useState({
    price: "", minArea: "", minDuration: ""
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "Smart Storage Hub",
    email: "info@smartstoragehub.com",
    phone: "+966 50 123 4567",
    address: lang === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
    description: "",
  });
  const [socialMedia, setSocialMedia] = useState({
    twitter: "", instagram: "", facebook: "", linkedin: "", whatsapp: "", snapchat: "", tiktok: "",
  });

  const { t, lang, setLang, dir } = useLanguage();
  const isMobile = useIsMobile();
  const { currency, setCurrency, currencySymbol, formatPrice } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Orders
    const { data: oData } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name, company_name, user_type),
        storage_types (name_en, name_ar)
      `)
      .order('created_at', { ascending: false });
    
    // Fetch Profiles
    const { data: pData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch Spaces
    const { data: sData } = await supabase
      .from('storage_spaces')
      .select('*');

    // Fetch Types (Pricing)
    const { data: tData } = await supabase
      .from('storage_types')
      .select('*');

    if (oData) setOrders(oData as any);
    if (pData) setProfiles(pData as any);
    if (sData) setSpaces(sData as any);
    if (tData) setTypes(tData as any);

    // Fetch Configurations
    const { data: configData } = await supabase.from('configurations').select('*');
    if (configData) {
      const info = configData.find(c => c.key === 'company_info')?.value;
      const social = configData.find(c => c.key === 'social_media')?.value;
      if (info) setCompanyInfo(info);
      if (social) setSocialMedia(social);
    }
    
    setLoading(false);
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setConfirmAction(null);
      toast({ title: t.settingsSaved });
    }
  };

  // Helper for status colors using database values
  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      'under_review': "bg-amber-500/20 text-amber-400",
      'approved': "bg-emerald-500/20 text-emerald-400",
      'active': "bg-emerald-500/20 text-emerald-400",
      'completed': "bg-secondary/20 text-secondary",
      'rejected': "bg-red-500/20 text-red-400",
      'available': "bg-emerald-500/20 text-emerald-400",
      'almost_full': "bg-amber-500/20 text-amber-400",
      'full': "bg-red-500/20 text-red-400",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  const sidebarItems = [
    { id: "overview" as Tab, label: t.adminOverview, icon: LayoutDashboard },
    { id: "orders" as Tab, label: t.adminOrders, icon: ClipboardList },
    { id: "spaces" as Tab, label: t.adminSpaces, icon: Space },
    { id: "pricing" as Tab, label: t.adminPricing, icon: DollarSign },
    { id: "users" as Tab, label: t.adminUsers, icon: Users },
    { id: "settings" as Tab, label: t.adminSettings, icon: Settings },
  ];

  const textAlign = dir === "rtl" ? "text-right" : "text-left";

  // Dashboard stats derived from live data
  const stats = [
    { label: t.adminTotalOrders, value: orders.length.toString(), icon: ClipboardList, color: "text-blue-400", change: "+0%" },
    { label: t.adminPendingOrders, value: orders.filter(o => o.status === 'under_review').length.toString(), icon: Clock, color: "text-amber-400", change: "-0" },
    { label: t.adminTotalRevenue, value: formatPrice(orders.reduce((sum, o) => sum + o.total_price, 0)), icon: TrendingUp, color: "text-emerald-400", change: "+0%" },
    { label: t.adminActiveClients, value: profiles.length.toString(), icon: Users, color: "text-purple-400", change: "+0" },
  ];

  // ─── Export helpers ───
  const exportToCSV = (data: Record<string, string>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h] || ""}"`).join(","))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (title: string, headers: string[], rows: string[][]) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const html = `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;direction:${dir}}
    h1{color:#333;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{border:1px solid #ddd;padding:10px;text-align:${dir === "rtl" ? "right" : "left"}}
    th{background:#f5f5f5;font-weight:bold}
    tr:nth-child(even){background:#fafafa}
    .footer{margin-top:30px;text-align:center;color:#999;font-size:12px}</style></head>
    <body><h1>${title}</h1>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <div class="footer">Smart Storage Hub - ${new Date().toLocaleDateString()}</div>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const handleExportOrdersCSV = () => {
    exportToCSV(orders.map(o => ({
      [t.adminThOrderId]: o.id.split('-')[0].toUpperCase(),
      [t.adminThClient]: o.profiles.company_name || o.profiles.full_name,
      [t.adminThType]: lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en,
      [t.adminThArea]: `${o.area} ${t.sqm}`,
      [t.adminThDuration]: `${o.duration_months} ${t.nrMonth}`,
      [t.adminThTotal]: formatPrice(o.total_price),
      [t.adminThStatus]: o.status,
      [t.thDate]: new Date(o.created_at).toLocaleDateString(),
    })), "orders");
  };

  const handleExportOrdersPDF = () => {
    exportToPDF(t.adminManageOrders,
      [t.adminThOrderId, t.adminThClient, t.adminThType, t.adminThArea, t.adminThDuration, t.adminThTotal, t.adminThStatus],
      orders.map(o => [
        o.id.split('-')[0].toUpperCase(),
        o.profiles.company_name || o.profiles.full_name,
        lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en,
        `${o.area} ${t.sqm}`,
        `${o.duration_months} ${t.nrMonth}`,
        formatPrice(o.total_price),
        o.status
      ])
    );
  };

  const handleExportInvoicesCSV = () => {
    exportToCSV(orders.map(o => ({
      [t.thInvoiceId]: `INV-${o.id.split("-")[0].toUpperCase()}`,
      [t.adminThClient]: o.profiles.company_name || o.profiles.full_name,
      [t.thAmount]: formatPrice(o.total_price),
      [t.adminThStatus]: o.status,
      [t.thDate]: new Date(o.created_at).toLocaleDateString(),
    })), "invoices");
  };

  const handleExportInvoicesPDF = () => {
    exportToPDF(t.invoicesAndPayments || "Invoices",
      [t.thInvoiceId, t.adminThClient, t.thAmount, t.adminThStatus, t.thDate],
      orders.map(o => [`INV-${o.id.split("-")[0].toUpperCase()}`, o.profiles.company_name || o.profiles.full_name, formatPrice(o.total_price), o.status, new Date(o.created_at).toLocaleDateString()])
    );
  };

  // Mobile tab bar
  const MobileTabBar = () => (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {sidebarItems.map((item) => (
        <button key={item.id} onClick={() => setTab(item.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
            tab === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground bg-muted/20"
          }`}>
          <item.icon className="w-3.5 h-3.5" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  // ─── Overview ───
  const OverviewContent = () => (
    <div className="space-y-4 md:space-y-6">
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4`}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-3 md:p-5">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              <span className="text-[10px] md:text-xs text-emerald-400 font-medium">{stat.change}</span>
            </div>
            <div className="text-lg md:text-2xl font-black text-foreground">{stat.value}</div>
            <div className="text-[11px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="font-bold text-foreground text-sm md:text-base mb-3 md:mb-4">{t.adminLatestOrders}</h3>
          <div className="space-y-2 md:space-y-3">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-muted/20 cursor-pointer" onClick={() => { setSelectedOrder(o.id); setTab("orders"); }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-xs md:text-sm">{o.id.split('-')[0].toUpperCase()}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">- {o.profiles.company_name || o.profiles.full_name}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en} | {formatPrice(o.total_price)}</span>
                </div>
                <Badge className={`${statusColor(o.status)} border-none text-[10px] md:text-xs`}>{o.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="font-bold text-foreground text-sm md:text-base mb-3 md:mb-4">{t.adminSpaceStatus}</h3>
          <div className="space-y-3 md:space-y-4">
            {spaces.slice(0, 4).map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span className="text-foreground font-medium">{lang === "ar" ? s.name_ar : s.name_en}</span>
                  <span className="text-muted-foreground">{Math.round((s.used_capacity / s.capacity) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(s.used_capacity / s.capacity) > 0.85 ? "bg-red-500" : (s.used_capacity / s.capacity) > 0.6 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${(s.used_capacity / s.capacity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Orders ───
  const OrdersContent = () => {
    const selectedOrderData = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;

    const ExportButtons = () => (
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleExportOrdersPDF} className="gap-1.5 text-xs">
          <FileText className="w-3.5 h-3.5" />{t.exportPDF}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportOrdersCSV} className="gap-1.5 text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5" />{t.exportExcel}
        </Button>
      </div>
    );

    // Order Details View
    if (selectedOrderData) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="gap-2 text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" /> {t.adminBackToOrders}
          </Button>
          <h2 className={`text-xl font-bold text-foreground ${isMobile ? "text-base" : ""}`}>{t.adminOrderDetails}</h2>

          {/* Order Info Card */}
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> {t.adminOrderInfo}
            </h3>
            <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 lg:grid-cols-3 gap-4"}`}>
              <div><span className="text-xs text-muted-foreground">{t.adminThOrderId}</span><p className="text-sm font-mono font-medium text-primary mt-1">{selectedOrderData.id.split('-')[0].toUpperCase()}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderClient}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.profiles.company_name || selectedOrderData.profiles.full_name}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderDate}</span><p className="text-sm font-medium text-foreground mt-1">{new Date(selectedOrderData.created_at).toLocaleDateString()}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderStorageType}</span><p className="text-sm font-medium text-foreground mt-1">{lang === 'ar' ? selectedOrderData.storage_types.name_ar : selectedOrderData.storage_types.name_en}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderArea}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.area} {t.sqm}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderDuration}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.duration_months} {t.nrMonth}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderTotal}</span><p className="text-sm font-bold text-emerald-400 mt-1">{formatPrice(selectedOrderData.total_price)}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderStatus}</span><p className="mt-1"><Badge className={`${statusColor(selectedOrderData.status)} border-none text-xs`}>{selectedOrderData.status.replace('_', ' ')}</Badge></p></div>
            </div>
          </div>

          {/* Additional Services */}
          {selectedOrderData.extras && selectedOrderData.extras.length > 0 && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> {t.adminOrderExtras}
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedOrderData.extras.map((extra: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-sm px-3 py-1">{extra}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedOrderData.notes && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> {t.adminOrderNotes}
              </h3>
              <p className="text-sm text-muted-foreground">{selectedOrderData.notes}</p>
            </div>
          )}

          {/* Actions for pending orders */}
          {selectedOrderData.status === 'under_review' && (
            <div className="flex gap-3">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleOrderStatusChange(selectedOrderData.id, 'approved')}>
                <CheckCircle className="w-4 h-4" /> {t.adminApproved}
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => handleOrderStatusChange(selectedOrderData.id, 'rejected')}>
                <XCircle className="w-4 h-4" /> {t.adminRejected}
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Orders List View
    if (isMobile) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">{t.adminManageOrders}</h2>
            <ExportButtons />
          </div>
          {orders.map((o) => (
            <div key={o.id} className="glass rounded-xl p-4 space-y-2 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedOrder(o.id)}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary text-sm">{o.id.split('-')[0].toUpperCase()}</span>
                <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThClient}</span><p className="text-foreground mt-0.5">{o.profiles.company_name || o.profiles.full_name}</p></div>
                <div><span className="text-muted-foreground">{t.adminThType}</span><p className="text-foreground mt-0.5">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en}</p></div>
                <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area} {t.sqm}</p></div>
                <div><span className="text-muted-foreground">{t.adminThDuration}</span><p className="text-foreground mt-0.5">{o.duration_months} {t.nrMonth}</p></div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-sm font-bold text-foreground">{formatPrice(o.total_price)}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t.adminManageOrders}</h2>
          <ExportButtons />
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[t.adminThOrderId, t.adminThClient, t.adminThType, t.adminThArea, t.adminThDuration, t.adminThTotal, t.adminThStatus].map((h) => (
                  <th key={h} className={`${textAlign} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setSelectedOrder(o.id)}>
                  <td className="p-4 font-medium text-primary text-sm">{o.id.split('-')[0].toUpperCase()}</td>
                  <td className="p-4 text-foreground text-sm">{o.profiles.company_name || o.profiles.full_name}</td>
                  <td className="p-4 text-muted-foreground text-sm">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en}</td>
                  <td className="p-4 text-muted-foreground text-sm">{o.area} {t.sqm}</td>
                  <td className="p-4 text-muted-foreground text-sm">{o.duration_months} {t.nrMonth}</td>
                  <td className="p-4 text-foreground font-bold text-sm">{formatPrice(o.total_price)}</td>
                  <td className="p-4"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status.replace('_', ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const toggleSpaceActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('storage_spaces')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setSpaces(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast({ title: t.settingsSaved });
    }
  };

  const handleAddSpace = () => {
    setEditingSpace(null);
    setSpaceFormData({ name: "", nameAr: "", type: "", capacity: "" });
    setShowSpaceForm(true);
  };

  const handleEditSpace = (s: any) => {
    setEditingSpace(s);
    setSpaceFormData({ name: s.name_en, nameAr: s.name_ar, type: s.storage_type_id, capacity: s.capacity.toString() });
    setShowSpaceForm(true);
  };

  const handleSaveSpace = async () => {
    if (!spaceFormData.name) return;
    
    const spaceData = {
      name_en: spaceFormData.name,
      name_ar: spaceFormData.nameAr,
      storage_type_id: spaceFormData.type,
      capacity: parseInt(spaceFormData.capacity),
    };

    if (editingSpace) {
      const { error } = await supabase
        .from('storage_spaces')
        .update(spaceData)
        .eq('id', editingSpace.id);

      if (!error) {
        setSpaces(prev => prev.map(s => s.id === editingSpace.id ? { ...s, ...spaceData } : s));
        toast({ title: t.settingsSaved });
      }
    } else {
      const { data, error } = await supabase
        .from('storage_spaces')
        .insert([{ ...spaceData, used_capacity: 0, status: 'available', is_active: true }])
        .select()
        .single();

      if (!error && data) {
        setSpaces(prev => [...prev, data as any]);
        toast({ title: t.settingsSaved });
      }
    }
    setShowSpaceForm(false);
  };

  const handleEditPricing = (p: any) => {
    setEditingPricing(p);
    setPricingFormData({
      price: p.price_per_sqm.toString(),
      minArea: p.min_area.toString(),
      minDuration: p.min_duration_months.toString()
    });
    setShowPricingForm(true);
  };

  const handleSavePricing = async () => {
    if (!editingPricing) return;
    
    const { error } = await supabase
      .from('storage_types')
      .update({
        price_per_sqm_month: parseFloat(pricingFormData.price),
        min_area: parseFloat(pricingFormData.minArea),
        min_duration_months: parseInt(pricingFormData.minDuration)
      })
      .eq('id', editingPricing.id);

    if (!error) {
      setTypes(prev => prev.map(t => t.id === editingPricing.id ? { ...t, price_per_sqm_month: parseFloat(pricingFormData.price), min_area: parseFloat(pricingFormData.minArea), min_duration_months: parseInt(pricingFormData.minDuration) } : t));
      toast({ title: t.settingsSaved });
      setShowPricingForm(false);
    }
  };

  // ─── Space Details View ───
  const SpaceDetailsContent = () => {
    const space = spaces.find(s => s.id === selectedSpace);
    if (!space) return null;

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedSpace(null)} className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base md:text-xl font-bold text-foreground">{lang === "ar" ? space.name_ar : space.name_en}</h2>
            <p className="text-xs text-muted-foreground">{t.adminSpaceDetails}</p>
          </div>
        </div>

        {/* Space Info Card */}
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="font-bold text-foreground text-sm md:text-base mb-4">{t.adminSpaceInfo}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
            <div><span className="text-muted-foreground block">{t.adminSpaceName}</span><span className="text-foreground font-medium">{lang === "ar" ? space.name_ar : space.name_en}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceType}</span><span className="text-foreground font-medium">{types.find(t => t.id === space.storage_type_id)?.name_en || '...'}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceCapacity}</span><span className="text-foreground font-medium">{space.capacity} {t.sqm}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceUsed}</span><span className="text-foreground font-medium">{space.used_capacity} {t.sqm}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceOccupancy}</span><span className="text-primary font-bold">{Math.round((space.used_capacity / space.capacity) * 100)}%</span></div>
            <div><span className="text-muted-foreground block">{t.adminThStatus}</span>
              <Badge className={`${statusColor(space.status)} border-none text-[10px] md:text-xs mt-1`}>{space.status}</Badge>
            </div>
            <div><span className="text-muted-foreground block">{t.adminActivateSpace}</span>
              <Badge className={`${space.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"} border-none text-[10px] md:text-xs mt-1`}>
                {space.is_active ? t.adminSpaceActive : t.adminSpaceInactive}
              </Badge>
            </div>
          </div>
          <div className="mt-4 h-2 md:h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${(space.used_capacity / space.capacity) > 0.85 ? "bg-red-500" : (space.used_capacity / space.capacity) > 0.6 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${(space.used_capacity / space.capacity) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ─── Space Form Modal ───
  const SpaceFormModal = () => {
    if (!showSpaceForm) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowSpaceForm(false)}>
        <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 border border-border" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-foreground text-base">{editingSpace ? t.adminEditSpaceTitle : t.adminAddSpaceTitle}</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminSpaceName} ({lang === "ar" ? "English" : "EN"})</label>
              <Input value={spaceFormData.name} onChange={e => setSpaceFormData({ ...spaceFormData, name: e.target.value })} placeholder={lang === "ar" ? "e.g. Warehouse A" : "e.g. Warehouse A"} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminSpaceName} ({lang === "ar" ? "عربي" : "AR"})</label>
              <Input value={spaceFormData.nameAr} onChange={e => setSpaceFormData({ ...spaceFormData, nameAr: e.target.value })} placeholder={lang === "ar" ? "مثال: المستودع أ" : "e.g. المستودع أ"} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminSpaceType}</label>
              <Select value={spaceFormData.type} onValueChange={v => setSpaceFormData({ ...spaceFormData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t.id} value={t.id}>{t.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminCapacity}</label>
              <Input value={spaceFormData.capacity} onChange={e => setSpaceFormData({ ...spaceFormData, capacity: e.target.value })} placeholder={`100 ${t.adminSqm}`} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowSpaceForm(false)}>{t.adminCancel}</Button>
            <Button onClick={handleSaveSpace}>{t.adminSave}</Button>
          </div>
        </div>
      </div>
    );
  };

  const PricingFormModal = () => {
    if (!showPricingForm) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPricingForm(false)}>
        <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 border border-border" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-foreground text-base">{t.adminEditPricingTitle || "Edit Pricing"}</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminThPricePerSqm}</label>
              <Input type="number" value={pricingFormData.price} onChange={e => setPricingFormData({ ...pricingFormData, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminThMinArea}</label>
              <Input type="number" value={pricingFormData.minArea} onChange={e => setPricingFormData({ ...pricingFormData, minArea: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminThMinDuration}</label>
              <Input type="number" value={pricingFormData.minDuration} onChange={e => setPricingFormData({ ...pricingFormData, minDuration: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowPricingForm(false)}>{t.adminCancel}</Button>
            <Button onClick={handleSavePricing}>{t.adminSave}</Button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Spaces ───
  const SpacesContent = () => {
    if (selectedSpace) return <SpaceDetailsContent />;

    return (
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminManageSpaces}</h2>
          <Button size="sm" onClick={handleAddSpace} className="gap-1.5">
            <Plus className="w-4 h-4" />{t.adminAddSpace}
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {spaces.map((s) => (
            <div key={s.id} className={`glass rounded-xl p-4 md:p-6 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all ${!s.is_active ? "opacity-60" : ""}`}
              onClick={() => setSelectedSpace(s.id)}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-bold text-foreground text-sm md:text-base">{lang === "ar" ? s.name_ar : s.name_en}</h3>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Badge className={`${statusColor(s.status)} border-none text-[10px] md:text-xs`}>{s.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm mb-3 md:mb-4">
                <div><span className="text-muted-foreground">{t.adminSpaceType}</span> <span className="text-foreground font-medium">{types.find(t => t.id === s.storage_type_id)?.name_en || '...'}</span></div>
                <div><span className="text-muted-foreground">{t.adminSpaceCapacity}</span> <span className="text-foreground font-medium">{s.capacity} {t.sqm}</span></div>
                <div><span className="text-muted-foreground">{t.adminSpaceUsed}</span> <span className="text-foreground font-medium">{s.used_capacity} {t.sqm}</span></div>
                <div><span className="text-muted-foreground">{t.adminSpaceOccupancy}</span> <span className="text-primary font-bold">{Math.round((s.used_capacity / s.capacity) * 100)}%</span></div>
              </div>
              <div className="h-2 md:h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full transition-all ${(s.used_capacity / s.capacity) > 0.85 ? "bg-red-500" : (s.used_capacity / s.capacity) > 0.6 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${(s.used_capacity / s.capacity) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Switch checked={s.is_active} onCheckedChange={() => toggleSpaceActive(s.id, s.is_active)} />
                  <span className={`text-xs ${s.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {s.is_active ? t.adminSpaceActive : t.adminSpaceInactive}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditSpace(s)} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedSpace(s.id)} className="p-1.5 rounded-lg hover:bg-muted/30 text-primary">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <SpaceFormModal />
        <PricingFormModal />
      </div>
    );
  };

  // ─── Pricing ───
  const PricingContent = () => {
    const pricing = types.map(type => ({
      id: type.id,
      storage_types: type,
      price_per_sqm: type.price_per_sqm || 0,
      min_area: type.min_area || 0,
      min_duration_months: type.min_duration_months || 1
    }));
    if (isMobile) {
      return (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">{t.adminManagePricing}</h2>
          {pricing.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{lang === 'ar' ? p.storage_types.name_ar : p.storage_types.name_en}</span>
                <span className="text-primary font-bold text-sm">{formatPrice(p.price_per_sqm)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThMinArea}</span><p className="text-foreground mt-0.5">{p.min_area} {t.adminSqm}</p></div>
                <div><span className="text-muted-foreground">{t.adminThMinDuration}</span><p className="text-foreground mt-0.5">{p.min_duration_months} {t.adminMonth}</p></div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs w-full" onClick={() => handleEditPricing(p)}>{t.adminEdit}</Button>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">{t.adminManagePricing}</h2>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[t.adminThStorageType, t.adminThPricePerSqm, t.adminThMinArea, t.adminThMinDuration, t.adminThActions].map((h) => (
                  <th key={h} className={`${textAlign} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium text-foreground text-sm">{lang === 'ar' ? p.storage_types.name_ar : p.storage_types.name_en}</td>
                  <td className="p-4 text-primary font-bold text-sm">{formatPrice(p.price_per_sqm)}</td>
                  <td className="p-4 text-muted-foreground text-sm">{p.min_area} {t.adminSqm}</td>
                  <td className="p-4 text-muted-foreground text-sm">{p.min_duration_months} {t.adminMonth}</td>
                  <td className="p-4"><Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => handleEditPricing(p)}>{t.adminEdit}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── Users ───
  const UsersContent = () => {
    const selectedUserData = selectedUser ? profiles.find(u => u.id === selectedUser) : null;

    // User Details View
    if (selectedUserData) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="gap-2 text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" /> {t.adminBackToUsers}
          </Button>
          <h2 className={`text-xl font-bold text-foreground ${isMobile ? "text-base" : ""}`}>{t.adminUserDetails}</h2>

          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> {t.adminUserInfo}
            </h3>
            <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 lg:grid-cols-3 gap-4"}`}>
              <div><span className="text-xs text-muted-foreground">{t.adminThName}</span><p className="text-sm font-medium text-foreground mt-1">{selectedUserData.full_name}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminThEmail}</span><p className="text-sm font-medium text-foreground mt-1">{selectedUserData.email}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminThPhone}</span><p className="text-sm font-medium text-foreground mt-1" dir="ltr">{selectedUserData.phone || '-'}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminThUserType}</span><p className="mt-1"><Badge className={`${selectedUserData.user_type === 'company' ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-xs`}>{selectedUserData.user_type}</Badge></p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminUserSince}</span><p className="text-sm font-medium text-foreground mt-1">{new Date(selectedUserData.created_at).toLocaleDateString()}</p></div>
            </div>
          </div>

          {/* User Orders Table */}
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> {t.adminUserOrders}
            </h3>
            {isMobile ? (
              <div className="space-y-3">
                {orders.filter(o => o.user_id === selectedUser).map(o => (
                  <div key={o.id} className="bg-muted/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">{o.id.split('-')[0].toUpperCase()}</span>
                      <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">{t.adminThType}</span><p className="text-foreground mt-0.5">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area} {t.sqm}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThDuration}</span><p className="text-foreground mt-0.5">{o.duration_months} {t.nrMonth}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThTotal}</span><p className="text-foreground mt-0.5">{formatPrice(o.total_price)}</p></div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{t.thDate}: {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[t.adminThOrderId, t.adminThType, t.adminThArea, t.adminThDuration, t.adminThTotal, t.adminThStatus, t.thDate].map(h => (
                        <th key={h} className={`${textAlign} p-3 text-xs font-medium text-muted-foreground`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.user_id === selectedUser).map(o => (
                      <tr key={o.id} className="border-b border-border/30 hover:bg-muted/10">
                        <td className="p-3 font-mono text-xs text-primary">{o.id.split('-')[0].toUpperCase()}</td>
                        <td className="p-3 text-sm text-foreground">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en}</td>
                        <td className="p-3 text-sm text-muted-foreground">{o.area} {t.sqm}</td>
                        <td className="p-3 text-sm text-muted-foreground">{o.duration_months} {t.nrMonth}</td>
                        <td className="p-3 text-sm font-medium text-foreground">{formatPrice(o.total_price)}</td>
                        <td className="p-3"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status.replace('_', ' ')}</Badge></td>
                        <td className="p-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Users List View
    if (isMobile) {
      return (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">{t.adminManageUsers}</h2>
          {profiles.map((u) => (
            <div key={u.id} className="glass rounded-xl p-4 space-y-2 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedUser(u.id)}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{u.full_name}</span>
                <Badge className={`${u.user_type === 'company' ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-[10px]`}>{u.user_type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThEmail}</span><p className="text-foreground mt-0.5 truncate">{u.email}</p></div>
                <div><span className="text-muted-foreground">{t.adminThOrderCount}</span><p className="text-foreground mt-0.5">{orders.filter(o => o.user_id === u.id).length}</p></div>
              </div>
              <div className="text-[10px] text-muted-foreground">{t.adminThJoinDate}: {new Date(u.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">{t.adminManageUsers}</h2>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[t.adminThName, t.adminThEmail, t.adminThUserType, t.adminThOrderCount, t.adminThJoinDate].map((h) => (
                  <th key={h} className={`${textAlign} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setSelectedUser(u.id)}>
                  <td className="p-4 font-medium text-foreground text-sm">{u.full_name}</td>
                  <td className="p-4 text-muted-foreground text-sm">{u.email}</td>
                  <td className="p-4"><Badge className={`${u.user_type === 'company' ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-xs`}>{u.user_type}</Badge></td>
                  <td className="p-4 text-muted-foreground text-sm">{orders.filter(o => o.user_id === u.id).length}</td>
                  <td className="p-4 text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── Settings ───
  const SettingsContent = () => {
    const handleSave = async () => {
      const { error: infoErr } = await supabase
        .from('configurations')
        .update({ value: companyInfo, updated_at: new Date() })
        .eq('key', 'company_info');

      const { error: socialErr } = await supabase
        .from('configurations')
        .update({ value: socialMedia, updated_at: new Date() })
        .eq('key', 'social_media');

      if (!infoErr && !socialErr) {
        toast({ title: t.settingsSaved });
      }
    };

    const socialFields = [
      { key: "twitter", label: t.settingsTwitter, icon: Twitter },
      { key: "instagram", label: t.settingsInstagram, icon: Instagram },
      { key: "facebook", label: t.settingsFacebook, icon: Facebook },
      { key: "linkedin", label: t.settingsLinkedin, icon: Linkedin },
      { key: "whatsapp", label: t.settingsWhatsapp, icon: MessageCircle },
      { key: "snapchat", label: t.settingsSnapchat, icon: Globe },
      { key: "tiktok", label: t.settingsTiktok, icon: Globe },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminSettings}</h2>
          <Button onClick={handleSave} className="gap-1.5" size={isMobile ? "sm" : "default"}>
            <Save className="w-4 h-4" />{t.settingsSave}
          </Button>
        </div>

        {/* Company Info */}
        <div className="glass rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="font-bold text-foreground text-sm md:text-base">{t.settingsCompanyInfo}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.settingsCompanyName}</label>
              <Input value={companyInfo.name} onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.settingsCompanyEmail}</label>
              <Input value={companyInfo.email} onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.settingsCompanyPhone}</label>
              <Input value={companyInfo.phone} onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.settingsCompanyAddress}</label>
              <Input value={companyInfo.address} onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t.settingsCompanyDesc}</label>
            <textarea
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
            />
          </div>
        </div>

        {/* Currency */}
        <div className="glass rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="font-bold text-foreground text-sm md:text-base">{t.settingsCurrency}</h3>
          <div className="max-w-sm space-y-1.5">
            <label className="text-xs text-muted-foreground">{t.settingsDefaultCurrency}</label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue placeholder={t.settingsSelectCurrency} />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} — {lang === "ar" ? c.nameAr : c.nameEn} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social Media */}
        <div className="glass rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="font-bold text-foreground text-sm md:text-base">{t.settingsSocialMedia}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {socialFields.map((sf) => (
              <div key={sf.key} className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <sf.icon className="w-3.5 h-3.5" />{sf.label}
                </label>
                <Input
                  placeholder={`https://...`}
                  value={socialMedia[sf.key as keyof typeof socialMedia]}
                  onChange={(e) => setSocialMedia({ ...socialMedia, [sf.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div className="glass rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="font-bold text-foreground text-sm md:text-base">{t.settingsExport}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t.settingsExportOrders}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportOrdersPDF} className="gap-1.5">
                  <FileText className="w-4 h-4" />PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportOrdersCSV} className="gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />Excel/CSV
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t.settingsExportInvoices}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportInvoicesPDF} className="gap-1.5">
                  <FileText className="w-4 h-4" />PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportInvoicesCSV} className="gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />Excel/CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Loading & Auth Access Control ───
  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Clock className="w-8 h-8 text-primary animate-spin" />
    </div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <XCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{lang === "ar" ? "وصول مرفوض" : "Access Denied"}</h2>
        <p className="text-muted-foreground mb-6">{lang === "ar" ? "ليس لديك صلاحيات للوصول إلى هذه الصفحة." : "You do not have the necessary permissions to access this page."}</p>
        <Link to="/auth">
          <Button>{t.adminLogout}</Button>
        </Link>
      </div>
    );
  }

  // ─── Mobile Layout ───
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-14" dir={dir}>
        <MobileTopBar />
        <main className="p-4 space-y-4">
          <h1 className="text-lg font-bold text-foreground">{t.adminPanel}</h1>
          <MobileTabBar />
          {tab === "overview" && <OverviewContent />}
          {tab === "orders" && <OrdersContent />}
          {tab === "spaces" && <SpacesContent />}
          {tab === "pricing" && <PricingContent />}
          {tab === "users" && <UsersContent />}
          {tab === "settings" && <SettingsContent />}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // ─── Desktop Layout ───
  return (
    <div className="min-h-screen bg-background flex" dir={dir}>
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card ${dir === "rtl" ? "border-l" : "border-r"} border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="bg-gradient-gold p-2 rounded-lg shrink-0">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="font-bold text-foreground text-sm block">Smart Storage</span>
              <span className="text-xs text-primary">{t.adminPanel}</span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}>
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{t.adminLogout}</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
            <h1 className="text-lg font-bold text-foreground">{t.adminPanel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input placeholder={t.adminSearch} className={`bg-muted/30 border-border ${dir === "rtl" ? "pr-10" : "pl-10"} w-64 h-9`} />
            </div>
            <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2 py-1.5">
              <Globe className="w-3.5 h-3.5" />
              {lang === "ar" ? "EN" : "عربي"}
            </button>
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className={`absolute -top-1 ${dir === "rtl" ? "-right-1" : "-left-1"} w-2 h-2 bg-primary rounded-full`} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {tab === "overview" && <OverviewContent />}
          {tab === "orders" && <OrdersContent />}
          {tab === "spaces" && <SpacesContent />}
          {tab === "pricing" && <PricingContent />}
          {tab === "users" && <UsersContent />}
          {tab === "settings" && <SettingsContent />}
        </main>
        {/* Confirmation Dialog */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
            <div className="bg-card rounded-xl p-6 w-full max-w-sm space-y-4 border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-foreground text-base">{t.adminConfirmTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {confirmAction.type === "approve" ? t.adminConfirmApprove : t.adminConfirmReject}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>{t.adminCancel}</Button>
                <Button
                  size="sm"
                  className={confirmAction.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                  variant={confirmAction.type === "reject" ? "destructive" : "default"}
                  onClick={() => handleOrderStatusChange(confirmAction.orderId, confirmAction.type)}
                >
                  {t.adminConfirm}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
