import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Warehouse, LayoutDashboard, ClipboardList, MapPin as Space, DollarSign,
  Users, Search, Bell, User, LogOut, ChevronLeft, Eye,
  CheckCircle, XCircle, Clock, MoreVertical, TrendingUp, Package, Globe,
  Settings, Save, Download, FileText, FileSpreadsheet,
  Twitter, Instagram, Facebook, Linkedin, MessageCircle,
  Plus, Pencil, ArrowLeft, Power, Settings2, Image, ExternalLink
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

import { Order, Profile, StorageSpace, StorageType, Configuration, Service, ProductType, FAQ, ContentPage } from "@/lib/types";

type Tab = "overview" | "orders" | "spaces" | "pricing" | "users" | "settings" | "services" | "faqs" | "content" | "product_types";

type SpaceItem = {
  id: string; name: string; nameAr: string; type: string; capacity: string; used: string; percent: number; status: string; active: boolean;
};

interface PricingItem {
  id: string;
  storage_types: StorageType;
  price_per_sqm_month: number;
  min_area: number;
  min_duration_months: number;
}

type SpaceStoredItem = {
  id: string; item: string; owner: string; remainingDays: number; startDate: string; endDate: string;
};

const AdminPage = () => {
  const { user, profile, loading: authLoading, isAdmin, signOut } = useAuth();

  // ── Context hooks must come BEFORE any useState that uses their values ──
  const { t, lang, setLang, dir } = useLanguage();
  const isMobile = useIsMobile();
  const { currency, setCurrency, currencySymbol, formatPrice } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [spaces, setSpaces] = useState<StorageSpace[]>([]);
  const [types, setTypes] = useState<StorageType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 10;

  // Selection states
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Form states
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<StorageSpace | null>(null);
  const [spaceFormData, setSpaceFormData] = useState({
    name: "", nameAr: "", type: "", capacity: "", capacityUnits: ""
  });

  const [confirmAction, setConfirmAction] = useState<{orderId: string, type: 'approve' | 'reject'} | null>(null);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState<StorageType | null>(null);
  const [pricingFormData, setPricingFormData] = useState({
    price: "", minArea: "", minDuration: "", billingUnit: "sqm", unitEn: "", unitAr: "",
    nameEn: "", nameAr: "", slug: "", descriptionEn: "", descriptionAr: "", measurementConfig: ""
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "Smart Storage Hub",
    email: "info@smartstoragehub.com",
    phone: "+966 50 123 4567",
    address: "Riyadh, Saudi Arabia",
    description: "",
  });
  const [socialMedia, setSocialMedia] = useState({
    twitter: "", instagram: "", facebook: "", linkedin: "", whatsapp: "", snapchat: "", tiktok: "",
  });

  // New Content Forms
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    titleEn: "", titleAr: "", descEn: "", descAr: "", price: "", icon: ""
  });

  const [showFAQForm, setShowFAQForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [faqFormData, setFaqFormData] = useState({
    qEn: "", qAr: "", aEn: "", aAr: "", category: ""
  });

  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentPage | null>(null);
  const [contentFormData, setContentFormData] = useState({
    slug: "", titleEn: "", titleAr: "", contentEn: "", contentAr: ""
  });

  const [showPtForm, setShowPtForm] = useState(false);
  const [editingPt, setEditingPt] = useState<ProductType | null>(null);
  const [ptFormData, setPtFormData] = useState({
    nameEn: "", nameAr: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Fetch Orders
    const { data: oData } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name, company_name, user_type),
        storage_types (name_en, name_ar, billing_unit, unit_name_en, unit_name_ar)
      `)
      .order('created_at', { ascending: false });
    
    // Fetch Profiles
    const { data: pData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setProfiles(pData || []);
    setOrders(oData || []);



    // Fetch Spaces
    const { data: sData } = await supabase
      .from('storage_spaces')
      .select('*');

    // Fetch Types (Pricing)
    const { data: tData } = await supabase
      .from('storage_types')
      .select('*');

    if (oData) setOrders(oData as Order[]);
    if (pData) setProfiles(pData as unknown as Profile[]);
    if (sData) setSpaces(sData as unknown as StorageSpace[]);
    if (tData) setTypes(tData as StorageType[]);

    // Fetch Configurations
    const { data: configData } = await supabase.from('configurations').select('*');
    if (configData) {
      const info = (configData as Configuration[]).find(c => c.key === 'company_info')?.value;
      const social = (configData as Configuration[]).find(c => c.key === 'social_media')?.value;
      if (info) setCompanyInfo(info as typeof companyInfo);
      if (social) setSocialMedia(social as typeof socialMedia);
    }

    // Fetch New Content Tables
    const { data: svcData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    const { data: faqData } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
    const { data: ptData } = await supabase.from('product_types').select('*').order('created_at', { ascending: false });
    const { data: pgData } = await supabase.from('content_pages').select('*').order('updated_at', { ascending: false });

    if (svcData) setServices(svcData as Service[]);
    if (faqData) setFaqs(faqData as FAQ[]);
    if (ptData) setProductTypes(ptData as ProductType[]);
    if (pgData) setContentPages(pgData as ContentPage[]);
    
    setLoading(false);
  }, []);

  const PaginationControls = ({ totalItems, currentPage, setCurrentPage }: { 
    totalItems: number, 
    currentPage: number, 
    setCurrentPage: (page: number) => void 
  }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/5">
        <div className="text-xs text-muted-foreground">
          {t.adminPaginationShowing || "Showing"} {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} {t.adminPaginationOf || "of"} {totalItems}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 p-0 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
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
    { id: "services" as Tab, label: t.adminTabServices, icon: ClipboardList },
    { id: "product_types" as Tab, label: t.adminTabProductTypes, icon: Package },
    { id: "faqs" as Tab, label: t.adminTabFAQs, icon: MessageCircle },
    { id: "content" as Tab, label: t.adminTabContent, icon: FileText },
    { id: "users" as Tab, label: t.adminUsers, icon: Users },
    { id: "settings" as Tab, label: t.adminSettings, icon: Settings },
  ];

  const textAlign = dir === "rtl" ? "text-right" : "text-left";

  // Dashboard stats derived from live data
  const stats = [
    { label: t.adminTotalOrders, value: (orders || []).length.toString(), icon: ClipboardList, color: "text-blue-400", change: "+0%" },
    { label: t.adminPendingOrders, value: (orders || []).filter(o => o.status === 'under_review').length.toString(), icon: Clock, color: "text-amber-400", change: "-0" },
    { label: t.adminTotalRevenue, value: formatPrice((orders || []).reduce((sum, o) => sum + (o.total_price || 0), 0)), icon: TrendingUp, color: "text-emerald-400", change: "+0%" },
    { label: t.adminActiveClients, value: (profiles || []).length.toString(), icon: Users, color: "text-purple-400", change: "+0" },
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
            {(orders || []).slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-muted/20 cursor-pointer" onClick={() => { setSelectedOrder(o.id); setTab("orders"); }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-xs md:text-sm">{o.id.split('-')[0].toUpperCase()}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">- {o.profiles?.company_name || o.profiles?.full_name || t.unknownClient}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground">{lang === 'ar' ? o.storage_types?.name_ar : o.storage_types?.name_en} | {formatPrice(o.total_price)}</span>
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
              <div><span className="text-xs text-muted-foreground">{t.adminOrderClient}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.profiles?.company_name || selectedOrderData.profiles?.full_name || t.unknownClient}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderDate}</span><p className="text-sm font-medium text-foreground mt-1">{new Date(selectedOrderData.created_at).toLocaleDateString()}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderStorageType}</span><p className="text-sm font-medium text-foreground mt-1">{lang === 'ar' ? selectedOrderData.storage_types?.name_ar : selectedOrderData.storage_types?.name_en}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderArea}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.area} {selectedOrderData.storage_types?.billing_unit === 'sqm' ? t.sqm : (lang === 'ar' ? selectedOrderData.storage_types?.unit_name_ar : selectedOrderData.storage_types?.unit_name_en) || selectedOrderData.storage_types?.billing_unit || t.sqm}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderDuration}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.duration_months} {t.nrMonth}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderTotal}</span><p className="text-sm font-bold text-emerald-400 mt-1">{formatPrice(selectedOrderData.total_price)}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderStatus}</span><p className="mt-1"><Badge className={`${statusColor(selectedOrderData.status)} border-none text-xs`}>{selectedOrderData.status.replace('_', ' ')}</Badge></p></div>
            </div>
          </div>

          {/* Measurement Details */}
          {selectedOrderData.measurement_data && Object.keys(selectedOrderData.measurement_data).length > 0 && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" /> {lang === 'ar' ? 'تفاصيل القياسات' : 'Measurement Details'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(selectedOrderData.measurement_data).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                    <p className="text-sm font-medium text-foreground mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Photos */}
          {selectedOrderData.product_images && selectedOrderData.product_images.length > 0 && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" /> {t.adminOrderPhotos}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {selectedOrderData.product_images.map((url: string, i: number) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-muted/30 border border-border/50">
                    <img 
                      src={url} 
                      alt={`${t.adminOrderPhotos} ${i + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="text-white" onClick={() => window.open(url, '_blank')}>
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
            {ExportButtons()}
          </div>
          {orders.map((o) => (
            <div key={o.id} className="glass rounded-xl p-4 space-y-2 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedOrder(o.id)}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary text-sm">{o.id.split('-')[0].toUpperCase()}</span>
                <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThClient}</span><p className="text-foreground mt-0.5">{o.profiles?.company_name || o.profiles?.full_name || t.unknownClient}</p></div>
                <div><span className="text-muted-foreground">{t.adminThType}</span><p className="text-foreground mt-0.5">{lang === 'ar' ? o.storage_types?.name_ar : o.storage_types?.name_en}</p></div>
                <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area} {o.storage_types?.billing_unit === 'sqm' ? t.sqm : (lang === 'ar' ? o.storage_types?.unit_name_ar : o.storage_types?.unit_name_en) || o.storage_types?.billing_unit || t.sqm}</p></div>
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
    const displayOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t.adminManageOrders}</h2>
          {ExportButtons()}
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
              {displayOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setSelectedOrder(o.id)}>
                  <td className="p-4 font-medium text-primary text-sm">{o.id.split('-')[0].toUpperCase()}</td>
                  <td className="p-4 text-foreground text-sm">{o.profiles?.company_name || o.profiles?.full_name || t.unknownClient}</td>
                  <td className="p-4 text-muted-foreground text-sm">{lang === 'ar' ? o.storage_types?.name_ar : o.storage_types?.name_en}</td>
                  <td className="p-4 text-muted-foreground text-sm">{o.area} {o.storage_types?.billing_unit === 'sqm' ? t.sqm : (lang === 'ar' ? o.storage_types?.unit_name_ar : o.storage_types?.unit_name_en) || o.storage_types?.billing_unit || t.sqm}</td>
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
    setSpaceFormData({ name: "", nameAr: "", type: "", capacity: "", capacityUnits: "" });
    setShowSpaceForm(true);
  };

  const handleEditSpace = (s: StorageSpace) => {
    setEditingSpace(s);
    setSpaceFormData({ 
      name: s.name_en, 
      nameAr: s.name_ar, 
      type: s.storage_type_id, 
      capacity: s.capacity.toString(),
      capacityUnits: (s.capacity_units || 0).toString()
    });
    setShowSpaceForm(true);
  };

  const handleSaveSpace = async () => {
    if (!spaceFormData.name) return;
    
    const spaceData = {
      name_en: spaceFormData.name.trim(),
      name_ar: spaceFormData.nameAr.trim() || spaceFormData.name.trim(),
      storage_type_id: spaceFormData.type,
      capacity: Math.max(0, parseFloat(spaceFormData.capacity) || 0),
      capacity_units: Math.max(0, parseInt(spaceFormData.capacityUnits) || 0),
    };

    if (!spaceData.name_en) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    
    if (!spaceData.storage_type_id) {
      toast({ title: "Storage type is required", variant: "destructive" });
      return;
    }

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
        setSpaces(prev => [...prev, data as unknown as StorageSpace]);
        toast({ title: t.settingsSaved });
      }
    }
    setShowSpaceForm(false);
  };

  const handleAddPricing = () => {
    setEditingPricing(null);
    setPricingFormData({
      price: "", minArea: "", minDuration: "", billingUnit: "sqm", unitEn: "", unitAr: "",
      nameEn: "", nameAr: "", slug: "", descriptionEn: "", descriptionAr: "",
      measurementConfig: JSON.stringify({
        primary_unit: "unit",
        fields: ["quantity"],
        formula: { total: "quantity" }
      }, null, 2)
    });
    setShowPricingForm(true);
  };

  const handleEditPricing = (p: PricingItem) => {
    setEditingPricing(p.storage_types);
    setPricingFormData({
      price: (p.price_per_sqm_month || p.storage_types?.price_per_sqm_month || 0).toString(),
      minArea: (p.min_area || p.storage_types?.min_area || 0).toString(),
      minDuration: (p.min_duration_months || p.storage_types?.min_duration_months || 0).toString(),
      billingUnit: p.storage_types?.billing_unit || "sqm",
      unitEn: p.storage_types?.unit_name_en || "",
      unitAr: p.storage_types?.unit_name_ar || "",
      nameEn: p.storage_types?.name_en || "",
      nameAr: p.storage_types?.name_ar || "",
      slug: p.storage_types?.slug || "",
      descriptionEn: p.storage_types?.description_en || "",
      descriptionAr: p.storage_types?.description_ar || "",
      measurementConfig: p.storage_types?.measurement_config ? JSON.stringify(p.storage_types.measurement_config, null, 2) : ""
    });
    setShowPricingForm(true);
  };

  const handleSavePricing = async () => {
    let mConfig = null;
    try {
      if (pricingFormData.measurementConfig) {
        mConfig = JSON.parse(pricingFormData.measurementConfig);
      }
    } catch (e) {
      toast({ title: "Invalid JSON in Measurement Config", variant: "destructive" });
      return;
    }

    if (!pricingFormData.nameEn.trim()) {
      toast({ title: "English name is required", variant: "destructive" });
      return;
    }

    const data = {
      name_en: pricingFormData.nameEn.trim(),
      name_ar: pricingFormData.nameAr.trim() || pricingFormData.nameEn.trim(),
      slug: pricingFormData.slug.trim() || pricingFormData.nameEn.trim().toLowerCase().replace(/\s+/g, '-'),
      description_en: pricingFormData.descriptionEn.trim(),
      description_ar: pricingFormData.descriptionAr.trim(),
      price_per_sqm_month: Math.max(0, parseFloat(pricingFormData.price) || 0),
      min_area: Math.max(0, parseFloat(pricingFormData.minArea) || 0),
      min_duration_months: Math.max(1, parseInt(pricingFormData.minDuration) || 1),
      billing_unit: pricingFormData.billingUnit,
      unit_name_en: pricingFormData.unitEn.trim(),
      unit_name_ar: pricingFormData.unitAr.trim(),
      measurement_config: mConfig
    };

    if (editingPricing) {
      const { error } = await supabase
        .from('storage_types')
        .update(data)
        .eq('id', editingPricing.id);

      if (!error) {
        setTypes(prev => prev.map(t => t.id === editingPricing.id ? { ...t, ...data, billing_unit: data.billing_unit as StorageType['billing_unit'] } : t));
        toast({ title: t.settingsSaved });
        setShowPricingForm(false);
      } else {
        toast({ title: "Error saving pricing", description: error.message, variant: "destructive" });
      }
    } else {
      const { data: newType, error } = await supabase
        .from('storage_types')
        .insert([data])
        .select()
        .single();

      if (!error && newType) {
        setTypes(prev => [...prev, newType as StorageType]);
        toast({ title: t.settingsSaved });
        setShowPricingForm(false);
      } else {
        toast({ title: "Error adding storage type", description: error?.message, variant: "destructive" });
      }
    }
  };

  // ─── New Content Handlers ───
  const handleSaveService = async () => {
    const data = {
      title_en: serviceFormData.titleEn,
      title_ar: serviceFormData.titleAr,
      description_en: serviceFormData.descEn,
      description_ar: serviceFormData.descAr,
      price: parseFloat(serviceFormData.price) || 0,
      icon_name: serviceFormData.icon
    };

    if (editingService) {
      const { error } = await supabase.from('services').update(data).eq('id', editingService.id);
      if (!error) {
        setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...data } : s));
        toast({ title: t.settingsSaved });
      }
    } else {
      const { data: inserted, error } = await supabase.from('services').insert([data]).select().single();
      if (!error && inserted) {
        setServices(prev => [inserted as Service, ...prev]);
        toast({ title: t.settingsSaved });
      }
    }
    setShowServiceForm(false);
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast({ title: t.settingsSaved });
    }
  };

  const handleSaveFAQ = async () => {
    const data = {
      question_en: faqFormData.qEn,
      question_ar: faqFormData.qAr,
      answer_en: faqFormData.aEn,
      answer_ar: faqFormData.aAr,
      category: faqFormData.category
    };

    if (editingFAQ) {
      const { error } = await supabase.from('faqs').update(data).eq('id', editingFAQ.id);
      if (!error) {
        setFaqs(prev => prev.map(f => f.id === editingFAQ.id ? { ...f, ...data } : f));
        toast({ title: t.settingsSaved });
      }
    } else {
      const { data: inserted, error } = await supabase.from('faqs').insert([data]).select().single();
      if (!error && inserted) {
        setFaqs(prev => [inserted as FAQ, ...prev]);
        toast({ title: t.settingsSaved });
      }
    }
    setShowFAQForm(false);
  };

  const handleDeleteFAQ = async (id: string) => {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (!error) {
      setFaqs(prev => prev.filter(f => f.id !== id));
      toast({ title: t.settingsSaved });
    }
  };

  const handleSavePt = async () => {
    const data = {
      name_en: ptFormData.nameEn,
      name_ar: ptFormData.nameAr
    };

    if (editingPt) {
      const { error } = await supabase.from('product_types').update(data).eq('id', editingPt.id);
      if (!error) {
        setProductTypes(prev => prev.map(p => p.id === editingPt.id ? { ...p, ...data } : p));
        toast({ title: t.settingsSaved });
      }
    } else {
      const { data: inserted, error } = await supabase.from('product_types').insert([data]).select().single();
      if (!error && inserted) {
        setProductTypes(prev => [inserted as ProductType, ...prev]);
        toast({ title: t.settingsSaved });
      }
    }
    setShowPtForm(false);
  };

  const handleDeletePt = async (id: string) => {
    const { error } = await supabase.from('product_types').delete().eq('id', id);
    if (!error) {
      setProductTypes(prev => prev.filter(p => p.id !== id));
      toast({ title: t.settingsSaved });
    }
  };

  const handleSaveContent = async () => {
    const data = {
      slug: contentFormData.slug,
      title_en: contentFormData.titleEn,
      title_ar: contentFormData.titleAr,
      content_en: contentFormData.contentEn,
      content_ar: contentFormData.contentAr,
      updated_at: new Date().toISOString()
    };

    if (editingContent) {
      const { error } = await supabase.from('content_pages').update(data).eq('id', editingContent.id);
      if (!error) {
        setContentPages(prev => prev.map(p => p.id === editingContent.id ? { ...p, ...data } : p));
        toast({ title: t.settingsSaved });
      }
    } else {
      const { data: inserted, error } = await supabase.from('content_pages').insert([data]).select().single();
      if (!error && inserted) {
        setContentPages(prev => [inserted as ContentPage, ...prev]);
        toast({ title: t.settingsSaved });
      }
    }
    setShowContentForm(false);
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

        {/* Related Orders */}
        {(() => {
          const relatedOrders = orders.filter(o => o.storage_type_id === space.storage_type_id);
          return (
            <div className="glass rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-sm md:text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  {lang === "ar" ? "الطلبات المرتبطة" : "Related Orders"}
                  <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{relatedOrders.length}</span>
                </h3>
              </div>

              {relatedOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{lang === "ar" ? "لا توجد طلبات لهذا النوع من المساحات بعد" : "No orders for this space type yet"}</p>
              ) : isMobile ? (
                <div className="space-y-3">
                  {relatedOrders.map(o => (
                    <div key={o.id}
                      className="bg-muted/20 rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => { setSelectedOrder(o.id); setTab("orders"); setSelectedSpace(null); }}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">{o.id.split('-')[0].toUpperCase()}</span>
                        <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">{t.adminOrderClient}</span><p className="text-foreground mt-0.5 truncate">{o.profiles?.company_name || o.profiles?.full_name || t.unknownClient}</p></div>
                        <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area} {t.sqm}</p></div>
                        <div><span className="text-muted-foreground">{t.adminThDuration}</span><p className="text-foreground mt-0.5">{o.duration_months} {t.adminMonth}</p></div>
                        <div><span className="text-muted-foreground">{t.adminThTotal}</span><p className="text-foreground font-bold mt-0.5">{formatPrice(o.total_price)}</p></div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{t.thDate}: {new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/10">
                        {[t.adminThOrderId, t.adminOrderClient, t.adminThArea, t.adminThDuration, t.adminThTotal, t.adminThStatus, t.thDate].map(h => (
                          <th key={h} className={`${textAlign} p-3 text-xs font-semibold text-muted-foreground`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relatedOrders.map(o => (
                        <tr key={o.id}
                          className="border-b border-border/30 hover:bg-muted/10 cursor-pointer transition-colors"
                          onClick={() => { setSelectedOrder(o.id); setTab("orders"); setSelectedSpace(null); }}>
                          <td className="p-3 font-mono text-xs font-bold text-primary">{o.id.split('-')[0].toUpperCase()}</td>
                          <td className="p-3 text-sm text-foreground">{o.profiles?.company_name || o.profiles?.full_name || t.unknownClient}</td>
                          <td className="p-3 text-sm text-muted-foreground">{o.area} {t.sqm}</td>
                          <td className="p-3 text-sm text-muted-foreground">{o.duration_months} {t.adminMonth}</td>
                          <td className="p-3 text-sm font-bold text-foreground">{formatPrice(o.total_price)}</td>
                          <td className="p-3">
                            <Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status.replace('_', ' ')}</Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{t.adminCapacity} ({t.adminSqm || "Area"})</label>
                <Input type="number" value={spaceFormData.capacity} onChange={e => setSpaceFormData({ ...spaceFormData, capacity: e.target.value })} placeholder={`100 ${t.adminSqm}`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{t.adminCapacityUnits || "Units Count"}</label>
                <Input type="number" value={spaceFormData.capacityUnits} onChange={e => setSpaceFormData({ ...spaceFormData, capacityUnits: e.target.value })} placeholder="e.g. 50" />
              </div>
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
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPricingForm(false)}>
        <div className="bg-card rounded-xl p-6 w-full max-w-2xl space-y-4 border border-border my-8" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-foreground text-lg">{editingPricing ? t.adminEditPricingTitle || "Edit Storage Type" : "Add New Storage Type"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminNameEn || "Name (EN)"}</label>
              <Input value={pricingFormData.nameEn} onChange={e => setPricingFormData({ ...pricingFormData, nameEn: e.target.value })} placeholder="Floor Storage" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminNameAr || "Name (AR)"}</label>
              <Input value={pricingFormData.nameAr} onChange={e => setPricingFormData({ ...pricingFormData, nameAr: e.target.value })} placeholder="مساحة أرضية" dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminSlug || "URL Slug"}</label>
              <Input value={pricingFormData.slug} onChange={e => setPricingFormData({ ...pricingFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="floor-storage" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminThPricePerUnit || "Price / Unit"}</label>
              <Input type="number" value={pricingFormData.price} onChange={e => setPricingFormData({ ...pricingFormData, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminThMinArea || "Min Area"}</label>
              <Input type="number" value={pricingFormData.minArea} onChange={e => setPricingFormData({ ...pricingFormData, minArea: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminThMinDuration || "Min Duration (Months)"}</label>
              <Input type="number" value={pricingFormData.minDuration} onChange={e => setPricingFormData({ ...pricingFormData, minDuration: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminBillingUnit || "Billing Unit"}</label>
              <Select value={pricingFormData.billingUnit} onValueChange={v => setPricingFormData({ ...pricingFormData, billingUnit: v })}>
                <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqm">{t.unitSqm || "Square Meter (sqm)"}</SelectItem>
                  <SelectItem value="sqft">Square Foot (sqft)</SelectItem>
                  <SelectItem value="cbm">Cubic Meter (cbm)</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="shelf">Shelf</SelectItem>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="unit">Unit / Piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pricingFormData.billingUnit !== "sqm" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Unit (EN)</label>
                  <Input value={pricingFormData.unitEn} onChange={e => setPricingFormData({ ...pricingFormData, unitEn: e.target.value })} placeholder="Box" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Unit (AR)</label>
                  <Input value={pricingFormData.unitAr} onChange={e => setPricingFormData({ ...pricingFormData, unitAr: e.target.value })} placeholder="صندوق" dir="rtl" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Measurement Config (JSON)</label>
            <textarea 
              className="w-full h-48 bg-background/50 border border-border rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-primary/30 outline-none"
              value={pricingFormData.measurementConfig}
              onChange={e => setPricingFormData({ ...pricingFormData, measurementConfig: e.target.value })}
              placeholder='{"primary_unit": "m2", "fields": ["length", "width"]}'
            />
            <p className="text-[10px] text-muted-foreground">Defines inputs (fields) and calculation formulas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminDescriptionEn || "Description (EN)"}</label>
              <textarea 
                className="w-full h-24 bg-background/50 border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                value={pricingFormData.descriptionEn}
                onChange={e => setPricingFormData({ ...pricingFormData, descriptionEn: e.target.value })}
                placeholder="Brief description for English users"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminDescriptionAr || "Description (AR)"}</label>
              <textarea 
                className="w-full h-24 bg-background/50 border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                value={pricingFormData.descriptionAr}
                onChange={e => setPricingFormData({ ...pricingFormData, descriptionAr: e.target.value })}
                dir="rtl"
                placeholder="وصف مختصر للمستخدمين بالعربية"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-2">
            <Button className="flex-1 h-11" onClick={handleSavePricing}>{t.adminSave}</Button>
            <Button variant="outline" className="flex-1 h-11 text-muted-foreground" onClick={() => setShowPricingForm(false)}>{t.adminCancel}</Button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Spaces ───
  const SpacesContent = () => {
    if (selectedSpace) return SpaceDetailsContent();

    const displaySpaces = spaces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminManageSpaces}</h2>
          <Button size="sm" onClick={handleAddSpace} className="gap-1.5">
            <Plus className="w-4 h-4" />{t.adminAddSpace}
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {displaySpaces.map((s) => (
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
                <div>
                  <span className="text-muted-foreground">{t.adminSpaceCapacity}</span> 
                  <span className="text-foreground font-medium">
                    {s.capacity} {t.sqm} 
                    {s.capacity_units ? ` (${s.capacity_units} ${lang === "ar" ? types.find(t => t.id === s.storage_type_id)?.unit_name_ar || "وحدة" : types.find(t => t.id === s.storage_type_id)?.unit_name_en || "units"})` : ""}
                  </span>
                </div>
                <div><span className="text-muted-foreground">{t.adminSpaceUsed}</span> <span className="text-foreground font-medium">{s.used_capacity} {t.sqm} {s.used_units ? `(${s.used_units})` : ""}</span></div>
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
        <PaginationControls totalItems={spaces.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  };

  // ─── Pricing ───
  const PricingContent = () => {
    const pricing = types.map(type => ({
      id: type.id,
      storage_types: type,
      price_per_sqm_month: type.price_per_sqm_month || 0,
      min_area: type.min_area || 0,
      min_duration_months: type.min_duration_months || 1
    }));
    const displayPricing = pricing.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (isMobile) {
      return (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">{t.adminManagePricing}</h2>
          {displayPricing.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{lang === 'ar' ? p.storage_types.name_ar : p.storage_types.name_en}</span>
                <span className="text-primary font-bold text-sm">{formatPrice(p.price_per_sqm_month)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThMinArea}</span><p className="text-foreground mt-0.5">{p.min_area} {t.adminSqm}</p></div>
                <div><span className="text-muted-foreground">{t.adminThMinDuration}</span><p className="text-foreground mt-0.5">{p.min_duration_months} {t.adminMonth}</p></div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs w-full" onClick={() => handleEditPricing(p)}>{t.adminEdit}</Button>
            </div>
          ))}
          <PaginationControls totalItems={pricing.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t.adminManagePricing}</h2>
          <Button onClick={handleAddPricing} className="gap-1.5" size={isMobile ? "sm" : "default"}>
            <Plus className="w-4 h-4" />{t.adminAddPricing || "Add Storage Type"}
          </Button>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[t.adminThStorageType, t.adminThPricePerUnit || "Price / Unit", t.adminThBillingUnit || "Unit", t.adminThMinArea, t.adminThMinDuration, t.adminThActions].map((h) => (
                  <th key={h} className={`${textAlign} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayPricing.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium text-foreground text-sm">{lang === 'ar' ? p.storage_types.name_ar : p.storage_types.name_en}</td>
                  <td className="p-4 text-primary font-bold text-sm">
                    {formatPrice(p.price_per_sqm_month)} 
                    <span className="text-[10px] text-muted-foreground font-normal ml-1">/ {lang === "ar" ? p.storage_types.unit_name_ar || t.adminSqm : p.storage_types.unit_name_en || "sqm"}</span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm font-mono uppercase">{p.storage_types.billing_unit || "sqm"}</td>
                  <td className="p-4 text-muted-foreground text-sm">{p.min_area} {t.adminSqm}</td>
                  <td className="p-4 text-muted-foreground text-sm">{p.min_duration_months} {t.adminMonth}</td>
                  <td className="p-4"><Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => handleEditPricing(p)}>{t.adminEdit}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls totalItems={pricing.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </div>
    );
  };

  // ─── Users ───
  const UsersContent = () => {
    const selectedUserData = selectedUser ? profiles.find(u => u.id === selectedUser) : null;
    const userOrders = selectedUser ? orders.filter(o => o.user_id === selectedUser) : [];
    const displayUserOrders = userOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                {displayUserOrders.map(o => (
                  <div key={o.id} className="bg-muted/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">{o.id.split('-')[0].toUpperCase()}</span>
                      <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">{t.adminThType}</span><p className="text-foreground mt-0.5">{lang === 'ar' ? o.storage_types?.name_ar : o.storage_types?.name_en}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area} {t.sqm}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThDuration}</span><p className="text-foreground mt-0.5">{o.duration_months} {t.nrMonth}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThTotal}</span><p className="text-foreground mt-0.5">{formatPrice(o.total_price)}</p></div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{t.thDate}: {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
                <PaginationControls totalItems={userOrders.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
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
                    {displayUserOrders.map(o => (
                      <tr key={o.id} className="border-b border-border/30 hover:bg-muted/10">
                        <td className="p-3 font-mono text-xs text-primary">{o.id.split('-')[0].toUpperCase()}</td>
                        <td className="p-3 text-sm text-foreground">{lang === 'ar' ? o.storage_types?.name_ar : o.storage_types?.name_en}</td>
                        <td className="p-3 text-sm text-muted-foreground">{o.area} {t.sqm}</td>
                        <td className="p-3 text-sm text-muted-foreground">{o.duration_months} {t.nrMonth}</td>
                        <td className="p-3 text-sm font-medium text-foreground">{formatPrice(o.total_price)}</td>
                        <td className="p-3"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status.replace('_', ' ')}</Badge></td>
                        <td className="p-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls totalItems={userOrders.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Users List View
    const filteredProfiles = profiles.filter(u => !searchQuery || u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const displayUsers = filteredProfiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (isMobile) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-foreground">{t.adminManageUsers}</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={t.adminSearch} 
                className="ps-9 h-9 text-xs w-48 glass border-border/50"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          {displayUsers.map((u) => (
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
          <PaginationControls totalItems={filteredProfiles.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t.adminManageUsers}</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder={t.adminSearch} 
              className="ps-9 h-10 text-sm w-64 glass border-border/50"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
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
              {displayUsers.map((u) => (
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

  // ─── Services ───
  const ServicesContent = () => {
    const displayServices = services.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminTabServices}</h2>
          <Button onClick={() => { setEditingService(null); setServiceFormData({ titleEn: "", titleAr: "", descEn: "", descAr: "", price: "", icon: "Package" }); setShowServiceForm(true); }} className="gap-1.5" size={isMobile ? "sm" : "default"}>
            <Plus className="w-4 h-4" />{t.adminTabServices}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {displayServices.map((s) => (
            <div key={s.id} className="glass rounded-xl p-4 md:p-6 space-y-4 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingService(s); setServiceFormData({ titleEn: s.title_en, titleAr: s.title_ar, descEn: s.description_en, descAr: s.description_ar, price: s.price.toString(), icon: s.icon_name || "Package" }); setShowServiceForm(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteService(s.id)}>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm md:text-lg text-foreground mb-1 md:mb-2">{lang === "ar" ? s.title_ar : s.title_en}</h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">{lang === "ar" ? s.description_ar : s.description_en}</p>
              </div>
              <div className="pt-3 md:pt-4 border-t border-border flex items-center justify-between">
                <span className="font-bold text-sm md:text-base text-primary">{formatPrice(s.price)}</span>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-full py-12 text-center glass rounded-xl">
              <p className="text-muted-foreground">{t.adminNoData || "No services found"}</p>
            </div>
          )}
        </div>
        <PaginationControls totalItems={services.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  };

  // ─── Product Types ───
  const ProductTypesContent = () => {
    const displayPt = productTypes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminTabProductTypes}</h2>
          <Button onClick={() => { setEditingPt(null); setPtFormData({ nameEn: "", nameAr: "" }); setShowPtForm(true); }} className="gap-1.5" size={isMobile ? "sm" : "default"}>
            <Plus className="w-4 h-4" />{t.adminTabProductTypes}
          </Button>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={`${textAlign} p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground`}>{lang === "ar" ? "الاسم بالعربية" : "Name (AR)"}</th>
                <th className={`${textAlign} p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground`}>{lang === "ar" ? "الاسم بالإنجليزية" : "Name (EN)"}</th>
                <th className="p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {displayPt.map((pt) => (
                <tr key={pt.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="p-3 md:p-4 text-xs md:text-sm text-foreground font-medium">{pt.name_ar}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm text-foreground font-medium">{pt.name_en}</td>
                  <td className="p-3 md:p-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPt(pt); setPtFormData({ nameEn: pt.name_en, nameAr: pt.name_ar }); setShowPtForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePt(pt.id)}>
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {productTypes.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">{t.adminNoData}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls totalItems={productTypes.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  };

  // ─── FAQS ───
  const FAQContent = () => {
    const displayFaqs = faqs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminTabFAQs}</h2>
          <Button onClick={() => { setEditingFAQ(null); setFaqFormData({ qEn: "", qAr: "", aEn: "", aAr: "", category: "General" }); setShowFAQForm(true); }} className="gap-1.5" size={isMobile ? "sm" : "default"}>
            <Plus className="w-4 h-4" />{t.adminTabFAQs}
          </Button>
        </div>
        <div className="grid gap-4">
          {displayFaqs.map((f) => (
            <div key={f.id} className="glass rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{f.category}</Badge>
                  <h3 className="font-bold text-sm md:text-lg text-foreground">{lang === "ar" ? f.question_ar : f.question_en}</h3>
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingFAQ(f); setFaqFormData({ qEn: f.question_en, qAr: f.question_ar, aEn: f.answer_en, aAr: f.answer_ar, category: f.category }); setShowFAQForm(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteFAQ(f.id)}>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">{lang === "ar" ? f.answer_ar : f.answer_en}</p>
            </div>
          ))}
          {faqs.length === 0 && (
            <div className="py-12 text-center glass rounded-xl">
              <p className="text-muted-foreground">{t.adminNoData}</p>
            </div>
          )}
        </div>
        <PaginationControls totalItems={faqs.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  };

  // ─── Content Pages ───
  const ContentPagesContent = () => {
    const displayContent = contentPages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-xl font-bold text-foreground">{t.adminTabContent}</h2>
          <Button onClick={() => { setEditingContent(null); setContentFormData({ slug: "", titleEn: "", titleAr: "", contentEn: "", contentAr: "" }); setShowContentForm(true); }} className="gap-1.5" size={isMobile ? "sm" : "default"}>
            <Plus className="w-4 h-4" />{t.adminTabContent}
          </Button>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={`${textAlign} p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground`}>{lang === "ar" ? "الصفحة" : "Page"}</th>
                <th className={`${textAlign} p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground`}>{lang === "ar" ? "الرابط" : "Slug"}</th>
                <th className={`${textAlign} p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground`}>{lang === "ar" ? "آخر تحديث" : "Last Updated"}</th>
                <th className="p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {displayContent.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="p-3 md:p-4 text-xs md:text-sm text-foreground font-medium">{lang === "ar" ? p.title_ar : p.title_en}</td>
                  <td className="p-3 md:p-4 text-xs text-muted-foreground">/{p.slug}</td>
                  <td className="p-3 md:p-4 text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</td>
                  <td className="p-3 md:p-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingContent(p); setContentFormData({ slug: p.slug, titleEn: p.title_en, titleAr: p.title_ar, contentEn: p.content_en, contentAr: p.content_ar }); setShowContentForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {contentPages.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">{t.adminNoData}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls totalItems={contentPages.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  };

  // ─── Settings ───
  const SettingsContent = () => {
    const handleSave = async () => {
      const { error: infoErr } = await supabase
        .from('configurations')
        .update({ value: companyInfo, updated_at: new Date().toISOString() })
        .eq('key', 'company_info');

      const { error: socialErr } = await supabase
        .from('configurations')
        .update({ value: socialMedia, updated_at: new Date().toISOString() })
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
          {tab === "services" && <ServicesContent />}
          {tab === "product_types" && <ProductTypesContent />}
          {tab === "faqs" && <FAQContent />}
          {tab === "content" && <ContentPagesContent />}
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
          <button 
            onClick={async () => {
              await signOut();
              navigate("/");
            }} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{t.adminLogout}</span>}
          </button>
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
          {tab === "overview" && OverviewContent()}
          {tab === "orders" && OrdersContent()}
          {tab === "spaces" && SpacesContent()}
          {tab === "pricing" && PricingContent()}
          {tab === "services" && ServicesContent()}
          {tab === "product_types" && ProductTypesContent()}
          {tab === "faqs" && FAQContent()}
          {tab === "content" && ContentPagesContent()}
          {tab === "users" && UsersContent()}
          {tab === "settings" && SettingsContent()}
        </main>

        {SpaceFormModal()}
        {PricingFormModal()}
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

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-card rounded-xl p-6 w-full max-w-lg space-y-4 border border-border">
              <h3 className="font-bold text-foreground text-lg">{editingService ? t.adminTabServices : t.adminTabServices}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Title (EN)</label>
                  <Input value={serviceFormData.titleEn} onChange={e => setServiceFormData({...serviceFormData, titleEn: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Title (AR)</label>
                  <Input value={serviceFormData.titleAr} onChange={e => setServiceFormData({...serviceFormData, titleAr: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Description (EN)</label>
                <textarea className="w-full bg-muted/20 border border-border rounded-lg p-2 text-sm" rows={3} value={serviceFormData.descEn} onChange={e => setServiceFormData({...serviceFormData, descEn: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Description (AR)</label>
                <textarea className="w-full bg-muted/20 border border-border rounded-lg p-2 text-sm" rows={3} value={serviceFormData.descAr} onChange={e => setServiceFormData({...serviceFormData, descAr: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Price</label>
                  <Input type="number" value={serviceFormData.price} onChange={e => setServiceFormData({...serviceFormData, price: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Icon (Lucide name)</label>
                  <Input value={serviceFormData.icon} onChange={e => setServiceFormData({...serviceFormData, icon: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowServiceForm(false)}>{t.adminCancel}</Button>
                <Button onClick={handleSaveService}>{t.settingsSave}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Product Type Modal */}
        {showPtForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-sm space-y-4 border border-border">
              <h3 className="font-bold text-foreground text-lg">{t.adminTabProductTypes}</h3>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Name (EN)</label>
                <Input value={ptFormData.nameEn} onChange={e => setPtFormData({...ptFormData, nameEn: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Name (AR)</label>
                <Input value={ptFormData.nameAr} onChange={e => setPtFormData({...ptFormData, nameAr: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowPtForm(false)}>{t.adminCancel}</Button>
                <Button onClick={handleSavePt}>{t.settingsSave}</Button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Modal */}
        {showFAQForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-card rounded-xl p-6 w-full max-w-lg space-y-4 border border-border">
              <h3 className="font-bold text-foreground text-lg">{t.adminTabFAQs}</h3>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Category</label>
                <Input value={faqFormData.category} onChange={e => setFaqFormData({...faqFormData, category: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Question (EN)</label>
                <Input value={faqFormData.qEn} onChange={e => setFaqFormData({...faqFormData, qEn: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Question (AR)</label>
                <Input value={faqFormData.qAr} onChange={e => setFaqFormData({...faqFormData, qAr: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Answer (EN)</label>
                <textarea className="w-full bg-muted/20 border border-border rounded-lg p-2 text-sm" rows={3} value={faqFormData.aEn} onChange={e => setFaqFormData({...faqFormData, aEn: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Answer (AR)</label>
                <textarea className="w-full bg-muted/20 border border-border rounded-lg p-2 text-sm" rows={3} value={faqFormData.aAr} onChange={e => setFaqFormData({...faqFormData, aAr: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowFAQForm(false)}>{t.adminCancel}</Button>
                <Button onClick={handleSaveFAQ}>{t.settingsSave}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Page Modal */}
        {showContentForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-card rounded-xl p-6 w-full max-w-2xl space-y-4 border border-border">
              <h3 className="font-bold text-foreground text-lg">{t.adminTabContent}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Slug (e.g. terms)</label>
                  <Input value={contentFormData.slug} onChange={e => setContentFormData({...contentFormData, slug: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Title (EN)</label>
                  <Input value={contentFormData.titleEn} onChange={e => setContentFormData({...contentFormData, titleEn: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Title (AR)</label>
                  <Input value={contentFormData.titleAr} onChange={e => setContentFormData({...contentFormData, titleAr: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Content (EN) - Markdown supported</label>
                <textarea className="w-full bg-muted/20 border border-border rounded-lg p-2 text-sm font-mono" rows={8} value={contentFormData.contentEn} onChange={e => setContentFormData({...contentFormData, contentEn: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Content (AR) - Markdown supported</label>
                <textarea className="w-full bg-muted/20 border border-border rounded-lg p-2 text-sm font-mono text-right" dir="rtl" rows={8} value={contentFormData.contentAr} onChange={e => setContentFormData({...contentFormData, contentAr: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowContentForm(false)}>{t.adminCancel}</Button>
                <Button onClick={handleSaveContent}>{t.settingsSave}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
