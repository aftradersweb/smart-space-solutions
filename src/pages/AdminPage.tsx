import { useState } from "react";
import { Link } from "react-router-dom";
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
import MobileTopBar from "@/components/MobileTopBar";
import MobileBottomNav from "@/components/MobileBottomNav";

type Tab = "overview" | "orders" | "spaces" | "pricing" | "users" | "settings";

type SpaceItem = {
  id: string; name: string; nameAr: string; type: string; capacity: string; used: string; percent: number; status: string; active: boolean;
};

type SpaceStoredItem = {
  id: string; item: string; owner: string; remainingDays: number; startDate: string; endDate: string;
};

const AdminPage = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t, lang, setLang, dir } = useLanguage();
  const isMobile = useIsMobile();
  const { currency, setCurrency, currencySymbol, formatPrice } = useCurrency();
  const { toast } = useToast();

  // Spaces state
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SpaceItem | null>(null);
  const [spaceFormData, setSpaceFormData] = useState({ name: "", nameAr: "", type: "", capacity: "" });

  // Orders state
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "reject"; orderId: string } | null>(null);
  const [orderStatusOverrides, setOrderStatusOverrides] = useState<Record<string, string>>({});

  const [spaces, setSpaces] = useState<SpaceItem[]>([
    { id: "S-01", name: "Warehouse A - Section 1", nameAr: "المستودع A - القسم 1", type: t.adminNormal, capacity: `500 ${t.adminSqm}`, used: `380 ${t.adminSqm}`, percent: 76, status: t.adminAvailable, active: true },
    { id: "S-02", name: "Warehouse A - Cold", nameAr: "المستودع A - التبريد", type: t.adminCold, capacity: `200 ${t.adminSqm}`, used: `180 ${t.adminSqm}`, percent: 90, status: t.adminAlmostFull, active: true },
    { id: "S-03", name: "Warehouse B - Security", nameAr: "المستودع B - الأمان", type: t.adminHighSecurityType, capacity: `100 ${t.adminSqm}`, used: `45 ${t.adminSqm}`, percent: 45, status: t.adminAvailable, active: true },
    { id: "S-04", name: "Parking Lot", nameAr: "موقف السيارات", type: t.adminCars, capacity: `50 ${t.adminCar}`, used: `32 ${t.adminCar}`, percent: 64, status: t.adminAvailable, active: false },
  ]);

  const mockStoredItems: Record<string, SpaceStoredItem[]> = {
    "S-01": [
      { id: "ITM-001", item: lang === "ar" ? "أثاث مكتبي" : "Office Furniture", owner: t.adminCompanyAlaman, remainingDays: 45, startDate: "2026-01-15", endDate: "2026-04-15" },
      { id: "ITM-002", item: lang === "ar" ? "معدات إلكترونية" : "Electronics Equipment", owner: t.adminAhmedMohammed, remainingDays: 20, startDate: "2026-02-01", endDate: "2026-05-01" },
      { id: "ITM-003", item: lang === "ar" ? "بضائع تجارية" : "Commercial Goods", owner: t.adminCompanyNokhba, remainingDays: 90, startDate: "2026-03-01", endDate: "2026-09-01" },
    ],
    "S-02": [
      { id: "ITM-004", item: lang === "ar" ? "مواد غذائية" : "Food Products", owner: t.adminCompanyAlaman, remainingDays: 10, startDate: "2026-03-15", endDate: "2026-04-15" },
      { id: "ITM-005", item: lang === "ar" ? "أدوية" : "Medicines", owner: t.adminSaraAhmed, remainingDays: 60, startDate: "2026-02-20", endDate: "2026-06-20" },
    ],
    "S-03": [
      { id: "ITM-006", item: lang === "ar" ? "مستندات سرية" : "Confidential Documents", owner: t.adminCompanyNokhba, remainingDays: 120, startDate: "2026-01-01", endDate: "2026-08-01" },
    ],
    "S-04": [
      { id: "ITM-007", item: lang === "ar" ? "سيارة تويوتا كامري" : "Toyota Camry", owner: t.adminAhmedMohammed, remainingDays: 30, startDate: "2026-03-01", endDate: "2026-06-01" },
      { id: "ITM-008", item: lang === "ar" ? "سيارة هونداي سوناتا" : "Hyundai Sonata", owner: t.adminSaraAhmed, remainingDays: 55, startDate: "2026-02-10", endDate: "2026-06-10" },
    ],
  };

  // Settings state
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

  const mockAdminOrders = [
    { id: "ORD-001", client: t.adminCompanyAlaman, type: t.adminNormalStorage, area: `20 ${t.adminSqm}`, duration: `3 ${t.adminMonths}`, totalSar: 4500, status: t.adminUnderReview, date: "2026-03-20", extras: [t.nrPickup, t.nrInsurance], notes: lang === "ar" ? "أثاث مكتبي - يحتاج مساحة جافة" : "Office furniture - needs dry space" },
    { id: "ORD-002", client: t.adminAhmedMohammed, type: t.adminColdStorage, area: `30 ${t.adminSqm}`, duration: `1 ${t.adminMonth}`, totalSar: 3600, status: t.adminApproved, date: "2026-03-18", extras: [t.nrDelivery], notes: lang === "ar" ? "مواد غذائية - تحتاج تبريد مستمر" : "Food items - requires continuous cooling" },
    { id: "ORD-003", client: t.adminCompanyNokhba, type: t.adminCarStorage, area: "-", duration: `6 ${t.adminMonths}`, totalSar: 3000, status: t.adminCompleted, date: "2026-03-10", extras: [], notes: lang === "ar" ? "سيارة تويوتا كامري 2025" : "Toyota Camry 2025" },
    { id: "ORD-004", client: t.adminSaraAhmed, type: t.adminHazardous, area: `5 ${t.adminSqm}`, duration: `2 ${t.adminMonths}`, totalSar: 3000, status: t.adminRejected, date: "2026-03-05", extras: [t.nrPacking, t.nrInsurance], notes: lang === "ar" ? "مواد كيميائية - مرفوض لعدم استيفاء الشروط" : "Chemicals - rejected due to unmet requirements" },
  ].map(o => ({ ...o, status: orderStatusOverrides[o.id] || o.status }));

  const handleOrderStatusChange = (orderId: string, newStatus: "approve" | "reject") => {
    const statusValue = newStatus === "approve" ? t.adminApproved : t.adminRejected;
    setOrderStatusOverrides(prev => ({ ...prev, [orderId]: statusValue }));
    setConfirmAction(null);
    toast({ title: newStatus === "approve" ? t.adminOrderApprovedSuccess : t.adminOrderRejectedSuccess });
  };

  const mockSpaces = spaces;

  const mockPricing = [
    { type: t.adminNormalStorage, pricePerM2: 50, minArea: 5, minDuration: 1 },
    { type: t.adminColdStorage, pricePerM2: 120, minArea: 5, minDuration: 1 },
    { type: t.adminHighSecurity, pricePerM2: 200, minArea: 2, minDuration: 1 },
    { type: t.adminHazardous, pricePerM2: 300, minArea: 2, minDuration: 3 },
    { type: t.adminCarStorageType, pricePerM2: 500, minArea: 1, minDuration: 1 },
  ];

  const mockUsers = [
    { id: "U-01", name: t.adminAhmedMohammed, email: "ahmed@email.com", phone: "+966 55 123 4567", type: t.adminIndividual, orders: 3, joined: "2026-01-15", totalSpent: 12500 },
    { id: "U-02", name: t.adminCompanyAlaman, email: "info@alaman.com", phone: "+966 50 987 6543", type: t.adminCompany, orders: 12, joined: "2025-11-20", totalSpent: 85000 },
    { id: "U-03", name: t.adminSaraAhmed, email: "sara@email.com", phone: "+966 54 456 7890", type: t.adminIndividual, orders: 1, joined: "2026-03-01", totalSpent: 3000 },
    { id: "U-04", name: t.adminCompanyNokhba, email: "info@nokhba.com", phone: "+966 50 111 2222", type: t.adminCompany, orders: 8, joined: "2025-12-10", totalSpent: 64000 },
  ];

  const mockUserOrders: Record<string, { id: string; type: string; area: string; duration: string; total: number; status: string; date: string }[]> = {
    "U-01": [
      { id: "ORD-002", type: t.adminColdStorage, area: `30 ${t.adminSqm}`, duration: `1 ${t.adminMonth}`, total: 3600, status: t.adminApproved, date: "2026-03-18" },
      { id: "ORD-005", type: t.adminNormalStorage, area: `10 ${t.adminSqm}`, duration: `2 ${t.adminMonths}`, total: 1000, status: t.adminCompleted, date: "2026-02-10" },
      { id: "ORD-008", type: t.adminCarStorage, area: "-", duration: `3 ${t.adminMonths}`, total: 1500, status: t.adminUnderReview, date: "2026-03-25" },
    ],
    "U-02": [
      { id: "ORD-001", type: t.adminNormalStorage, area: `20 ${t.adminSqm}`, duration: `3 ${t.adminMonths}`, total: 4500, status: t.adminUnderReview, date: "2026-03-20" },
      { id: "ORD-006", type: t.adminColdStorage, area: `50 ${t.adminSqm}`, duration: `6 ${t.adminMonths}`, total: 36000, status: t.adminApproved, date: "2026-01-15" },
    ],
    "U-03": [
      { id: "ORD-004", type: t.adminHazardous, area: `5 ${t.adminSqm}`, duration: `2 ${t.adminMonths}`, total: 3000, status: t.adminRejected, date: "2026-03-05" },
    ],
    "U-04": [
      { id: "ORD-003", type: t.adminCarStorage, area: "-", duration: `6 ${t.adminMonths}`, total: 3000, status: t.adminCompleted, date: "2026-03-10" },
      { id: "ORD-007", type: t.adminHighSecurity, area: `15 ${t.adminSqm}`, duration: `4 ${t.adminMonths}`, total: 12000, status: t.adminApproved, date: "2026-02-01" },
    ],
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      [t.adminUnderReview]: "bg-amber-500/20 text-amber-400",
      [t.adminApproved]: "bg-emerald-500/20 text-emerald-400",
      [t.adminCompleted]: "bg-secondary/20 text-secondary",
      [t.adminRejected]: "bg-red-500/20 text-red-400",
      [t.adminAvailable]: "bg-emerald-500/20 text-emerald-400",
      [t.adminAlmostFull]: "bg-amber-500/20 text-amber-400",
      [t.adminFull]: "bg-red-500/20 text-red-400",
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

  const stats = [
    { label: t.adminTotalOrders, value: "156", icon: ClipboardList, color: "text-blue-400", change: "+12%" },
    { label: t.adminPendingOrders, value: "8", icon: Clock, color: "text-amber-400", change: "-3" },
    { label: t.adminTotalRevenue, value: formatPrice(245000), icon: TrendingUp, color: "text-emerald-400", change: "+18%" },
    { label: t.adminActiveClients, value: "89", icon: Users, color: "text-purple-400", change: "+5" },
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
    exportToCSV(mockAdminOrders.map(o => ({
      [t.adminThOrderId]: o.id, [t.adminThClient]: o.client, [t.adminThType]: o.type,
      [t.adminThArea]: o.area, [t.adminThDuration]: o.duration,
      [t.adminThTotal]: formatPrice(o.totalSar), [t.adminThStatus]: o.status, [t.thDate]: o.date,
    })), "orders");
  };

  const handleExportOrdersPDF = () => {
    exportToPDF(t.adminManageOrders,
      [t.adminThOrderId, t.adminThClient, t.adminThType, t.adminThArea, t.adminThDuration, t.adminThTotal, t.adminThStatus],
      mockAdminOrders.map(o => [o.id, o.client, o.type, o.area, o.duration, formatPrice(o.totalSar), o.status])
    );
  };

  const handleExportInvoicesCSV = () => {
    exportToCSV(mockAdminOrders.map(o => ({
      [t.thInvoiceId]: `INV-${o.id.split("-")[1]}`,
      [t.adminThClient]: o.client,
      [t.thAmount]: formatPrice(o.totalSar),
      [t.adminThStatus]: o.status,
      [t.thDate]: o.date,
    })), "invoices");
  };

  const handleExportInvoicesPDF = () => {
    exportToPDF(t.invoicesAndPayments || "Invoices",
      [t.thInvoiceId, t.adminThClient, t.thAmount, t.adminThStatus, t.thDate],
      mockAdminOrders.map(o => [`INV-${o.id.split("-")[1]}`, o.client, formatPrice(o.totalSar), o.status, o.date])
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
            {mockAdminOrders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-muted/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-xs md:text-sm">{o.id}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">- {o.client}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground">{o.type} | {formatPrice(o.totalSar)}</span>
                </div>
                <Badge className={`${statusColor(o.status)} border-none text-[10px] md:text-xs`}>{o.status}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="font-bold text-foreground text-sm md:text-base mb-3 md:mb-4">{t.adminSpaceStatus}</h3>
          <div className="space-y-3 md:space-y-4">
            {mockSpaces.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span className="text-foreground font-medium">{lang === "ar" ? s.nameAr || s.name : s.name}</span>
                  <span className="text-muted-foreground">{s.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.percent > 85 ? "bg-red-500" : s.percent > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${s.percent}%` }}
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
    const selectedOrderData = selectedOrder ? mockAdminOrders.find(o => o.id === selectedOrder) : null;

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
              <div><span className="text-xs text-muted-foreground">{t.adminThOrderId}</span><p className="text-sm font-mono font-medium text-primary mt-1">{selectedOrderData.id}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderClient}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.client}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderDate}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.date}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderStorageType}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.type}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderArea}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.area}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderDuration}</span><p className="text-sm font-medium text-foreground mt-1">{selectedOrderData.duration}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderTotal}</span><p className="text-sm font-bold text-emerald-400 mt-1">{formatPrice(selectedOrderData.totalSar)}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminOrderStatus}</span><p className="mt-1"><Badge className={`${statusColor(selectedOrderData.status)} border-none text-xs`}>{selectedOrderData.status}</Badge></p></div>
            </div>
          </div>

          {/* Additional Services */}
          {selectedOrderData.extras.length > 0 && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> {t.adminOrderExtras}
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedOrderData.extras.map((extra, i) => (
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
          {selectedOrderData.status === t.adminUnderReview && (
            <div className="flex gap-3">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle className="w-4 h-4" /> {t.adminApproved}
              </Button>
              <Button variant="destructive" className="gap-2">
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
          {mockAdminOrders.map((o) => (
            <div key={o.id} className="glass rounded-xl p-4 space-y-2 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedOrder(o.id)}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary text-sm">{o.id}</span>
                <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThClient}</span><p className="text-foreground mt-0.5">{o.client}</p></div>
                <div><span className="text-muted-foreground">{t.adminThType}</span><p className="text-foreground mt-0.5">{o.type}</p></div>
                <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area}</p></div>
                <div><span className="text-muted-foreground">{t.adminThDuration}</span><p className="text-foreground mt-0.5">{o.duration}</p></div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-sm font-bold text-foreground">{formatPrice(o.totalSar)}</span>
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
              {mockAdminOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setSelectedOrder(o.id)}>
                  <td className="p-4 font-medium text-primary text-sm">{o.id}</td>
                  <td className="p-4 text-foreground text-sm">{o.client}</td>
                  <td className="p-4 text-muted-foreground text-sm">{o.type}</td>
                  <td className="p-4 text-muted-foreground text-sm">{o.area}</td>
                  <td className="p-4 text-muted-foreground text-sm">{o.duration}</td>
                  <td className="p-4 text-foreground font-bold text-sm">{formatPrice(o.totalSar)}</td>
                  <td className="p-4"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const toggleSpaceActive = (id: string) => {
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleAddSpace = () => {
    setEditingSpace(null);
    setSpaceFormData({ name: "", nameAr: "", type: "", capacity: "" });
    setShowSpaceForm(true);
  };

  const handleEditSpace = (s: SpaceItem) => {
    setEditingSpace(s);
    setSpaceFormData({ name: s.name, nameAr: s.nameAr, type: s.type, capacity: s.capacity });
    setShowSpaceForm(true);
  };

  const handleSaveSpace = () => {
    if (!spaceFormData.name) return;
    if (editingSpace) {
      setSpaces(prev => prev.map(s => s.id === editingSpace.id ? { ...s, name: spaceFormData.name, nameAr: spaceFormData.nameAr, type: spaceFormData.type, capacity: spaceFormData.capacity } : s));
    } else {
      const newId = `S-${String(spaces.length + 1).padStart(2, "0")}`;
      setSpaces(prev => [...prev, { id: newId, name: spaceFormData.name, nameAr: spaceFormData.nameAr, type: spaceFormData.type, capacity: spaceFormData.capacity, used: "0", percent: 0, status: t.adminAvailable, active: true }]);
    }
    setShowSpaceForm(false);
    toast({ title: t.settingsSaved });
  };

  // ─── Space Details View ───
  const SpaceDetailsContent = () => {
    const space = spaces.find(s => s.id === selectedSpace);
    if (!space) return null;
    const items = mockStoredItems[space.id] || [];

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedSpace(null)} className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base md:text-xl font-bold text-foreground">{lang === "ar" ? space.nameAr || space.name : space.name}</h2>
            <p className="text-xs text-muted-foreground">{t.adminSpaceDetails}</p>
          </div>
        </div>

        {/* Space Info Card */}
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="font-bold text-foreground text-sm md:text-base mb-4">{t.adminSpaceInfo}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
            <div><span className="text-muted-foreground block">{t.adminSpaceName}</span><span className="text-foreground font-medium">{lang === "ar" ? space.nameAr || space.name : space.name}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceType}</span><span className="text-foreground font-medium">{space.type}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceCapacity}</span><span className="text-foreground font-medium">{space.capacity}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceUsed}</span><span className="text-foreground font-medium">{space.used}</span></div>
            <div><span className="text-muted-foreground block">{t.adminSpaceOccupancy}</span><span className="text-primary font-bold">{space.percent}%</span></div>
            <div><span className="text-muted-foreground block">{t.adminThStatus}</span>
              <Badge className={`${statusColor(space.status)} border-none text-[10px] md:text-xs mt-1`}>{space.status}</Badge>
            </div>
            <div><span className="text-muted-foreground block">{t.adminActivateSpace}</span>
              <Badge className={`${space.active ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"} border-none text-[10px] md:text-xs mt-1`}>
                {space.active ? t.adminSpaceActive : t.adminSpaceInactive}
              </Badge>
            </div>
          </div>
          <div className="mt-4 h-2 md:h-3 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${space.percent > 85 ? "bg-red-500" : space.percent > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${space.percent}%` }} />
          </div>
        </div>

        {/* Related Items Table */}
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="font-bold text-foreground text-sm md:text-base mb-4">{t.adminRelatedItems} ({items.length})</h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{lang === "ar" ? "لا توجد عناصر مخزنة" : "No stored items"}</p>
          ) : isMobile ? (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-muted/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary text-xs">{item.id}</span>
                    <Badge className={`${item.remainingDays <= 15 ? "bg-red-500/20 text-red-400" : item.remainingDays <= 30 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"} border-none text-[10px]`}>
                      {item.remainingDays} {t.adminDays}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">{t.adminThItem}</span><p className="text-foreground mt-0.5">{item.item}</p></div>
                    <div><span className="text-muted-foreground">{t.adminThOwner}</span><p className="text-foreground mt-0.5">{item.owner}</p></div>
                    <div><span className="text-muted-foreground">{t.adminThStartDate}</span><p className="text-foreground mt-0.5">{item.startDate}</p></div>
                    <div><span className="text-muted-foreground">{t.adminThEndDate}</span><p className="text-foreground mt-0.5">{item.endDate}</p></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[t.adminThItemId, t.adminThItem, t.adminThOwner, t.adminThRemainingDuration, t.adminThStartDate, t.adminThEndDate].map(h => (
                    <th key={h} className={`${textAlign} p-3 text-sm font-medium text-muted-foreground`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/10">
                    <td className="p-3 font-medium text-primary text-sm">{item.id}</td>
                    <td className="p-3 text-foreground text-sm">{item.item}</td>
                    <td className="p-3 text-muted-foreground text-sm">{item.owner}</td>
                    <td className="p-3">
                      <Badge className={`${item.remainingDays <= 15 ? "bg-red-500/20 text-red-400" : item.remainingDays <= 30 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"} border-none text-xs`}>
                        {item.remainingDays} {t.adminDays}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-sm">{item.startDate}</td>
                    <td className="p-3 text-muted-foreground text-sm">{item.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                  <SelectItem value={t.adminNormal}>{t.adminNormal}</SelectItem>
                  <SelectItem value={t.adminCold}>{t.adminCold}</SelectItem>
                  <SelectItem value={t.adminHighSecurityType}>{t.adminHighSecurityType}</SelectItem>
                  <SelectItem value={t.adminCars}>{t.adminCars}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t.adminCapacity}</label>
              <Input value={spaceFormData.capacity} onChange={e => setSpaceFormData({ ...spaceFormData, capacity: e.target.value })} placeholder={`100 ${t.adminSqm}`} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowSpaceForm(false)}>{t.adminCancel}</Button>
            <Button size="sm" onClick={handleSaveSpace}>{t.adminSave}</Button>
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
            <div key={s.id} className={`glass rounded-xl p-4 md:p-6 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all ${!s.active ? "opacity-60" : ""}`}
              onClick={() => setSelectedSpace(s.id)}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-bold text-foreground text-sm md:text-base">{lang === "ar" ? s.nameAr || s.name : s.name}</h3>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Badge className={`${statusColor(s.status)} border-none text-[10px] md:text-xs`}>{s.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm mb-3 md:mb-4">
                <div><span className="text-muted-foreground">{t.adminSpaceType}</span> <span className="text-foreground font-medium">{s.type}</span></div>
                <div><span className="text-muted-foreground">{t.adminSpaceCapacity}</span> <span className="text-foreground font-medium">{s.capacity}</span></div>
                <div><span className="text-muted-foreground">{t.adminSpaceUsed}</span> <span className="text-foreground font-medium">{s.used}</span></div>
                <div><span className="text-muted-foreground">{t.adminSpaceOccupancy}</span> <span className="text-primary font-bold">{s.percent}%</span></div>
              </div>
              <div className="h-2 md:h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full transition-all ${s.percent > 85 ? "bg-red-500" : s.percent > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${s.percent}%` }} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Switch checked={s.active} onCheckedChange={() => toggleSpaceActive(s.id)} />
                  <span className={`text-xs ${s.active ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {s.active ? t.adminSpaceActive : t.adminSpaceInactive}
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
      </div>
    );
  };

  // ─── Pricing ───
  const PricingContent = () => {
    if (isMobile) {
      return (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">{t.adminManagePricing}</h2>
          {mockPricing.map((p) => (
            <div key={p.type} className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{p.type}</span>
                <span className="text-primary font-bold text-sm">{formatPrice(p.pricePerM2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThMinArea}</span><p className="text-foreground mt-0.5">{p.minArea} {t.adminSqm}</p></div>
                <div><span className="text-muted-foreground">{t.adminThMinDuration}</span><p className="text-foreground mt-0.5">{p.minDuration} {t.adminMonth}</p></div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs w-full">{t.adminEdit}</Button>
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
              {mockPricing.map((p) => (
                <tr key={p.type} className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium text-foreground text-sm">{p.type}</td>
                  <td className="p-4 text-primary font-bold text-sm">{formatPrice(p.pricePerM2)}</td>
                  <td className="p-4 text-muted-foreground text-sm">{p.minArea} {t.adminSqm}</td>
                  <td className="p-4 text-muted-foreground text-sm">{p.minDuration} {t.adminMonth}</td>
                  <td className="p-4"><Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">{t.adminEdit}</Button></td>
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
    const selectedUserData = selectedUser ? mockUsers.find(u => u.id === selectedUser) : null;
    const userOrders = selectedUser ? (mockUserOrders[selectedUser] || []) : [];

    // User Details View
    if (selectedUserData) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="gap-2 text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" /> {t.adminBackToUsers}
          </Button>
          <h2 className={`text-xl font-bold text-foreground ${isMobile ? "text-base" : ""}`}>{t.adminUserDetails}</h2>

          {/* User Info Card */}
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> {t.adminUserInfo}
            </h3>
            <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 lg:grid-cols-3 gap-4"}`}>
              <div><span className="text-xs text-muted-foreground">{t.adminThName}</span><p className="text-sm font-medium text-foreground mt-1">{selectedUserData.name}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminThEmail}</span><p className="text-sm font-medium text-foreground mt-1">{selectedUserData.email}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminThPhone}</span><p className="text-sm font-medium text-foreground mt-1" dir="ltr">{selectedUserData.phone}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminThUserType}</span><p className="mt-1"><Badge className={`${selectedUserData.type === t.adminCompany ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-xs`}>{selectedUserData.type}</Badge></p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminUserSince}</span><p className="text-sm font-medium text-foreground mt-1">{selectedUserData.joined}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.adminTotalSpent}</span><p className="text-sm font-medium text-emerald-400 mt-1">{formatPrice(selectedUserData.totalSpent)}</p></div>
            </div>
          </div>

          {/* User Orders Table */}
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> {t.adminUserOrders} ({userOrders.length})
            </h3>
            {userOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">{lang === "ar" ? "لا توجد طلبات" : "No orders found"}</p>
            ) : isMobile ? (
              <div className="space-y-3">
                {userOrders.map(o => (
                  <div key={o.id} className="bg-muted/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">{o.id}</span>
                      <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">{t.adminThType}</span><p className="text-foreground mt-0.5">{o.type}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThArea}</span><p className="text-foreground mt-0.5">{o.area}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThDuration}</span><p className="text-foreground mt-0.5">{o.duration}</p></div>
                      <div><span className="text-muted-foreground">{t.adminThTotal}</span><p className="text-foreground mt-0.5">{formatPrice(o.total)}</p></div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{t.thDate}: {o.date}</div>
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
                    {userOrders.map(o => (
                      <tr key={o.id} className="border-b border-border/30 hover:bg-muted/10">
                        <td className="p-3 font-mono text-xs text-primary">{o.id}</td>
                        <td className="p-3 text-sm text-foreground">{o.type}</td>
                        <td className="p-3 text-sm text-muted-foreground">{o.area}</td>
                        <td className="p-3 text-sm text-muted-foreground">{o.duration}</td>
                        <td className="p-3 text-sm font-medium text-foreground">{formatPrice(o.total)}</td>
                        <td className="p-3"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status}</Badge></td>
                        <td className="p-3 text-sm text-muted-foreground">{o.date}</td>
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
          {mockUsers.map((u) => (
            <div key={u.email} className="glass rounded-xl p-4 space-y-2 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedUser(u.id)}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{u.name}</span>
                <Badge className={`${u.type === t.adminCompany ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-[10px]`}>{u.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.adminThEmail}</span><p className="text-foreground mt-0.5 truncate">{u.email}</p></div>
                <div><span className="text-muted-foreground">{t.adminThOrderCount}</span><p className="text-foreground mt-0.5">{u.orders}</p></div>
              </div>
              <div className="text-[10px] text-muted-foreground">{t.adminThJoinDate}: {u.joined}</div>
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
              {mockUsers.map((u) => (
                <tr key={u.email} className="border-b border-border/50 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setSelectedUser(u.id)}>
                  <td className="p-4 font-medium text-foreground text-sm">{u.name}</td>
                  <td className="p-4 text-muted-foreground text-sm">{u.email}</td>
                  <td className="p-4"><Badge className={`${u.type === t.adminCompany ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-xs`}>{u.type}</Badge></td>
                  <td className="p-4 text-muted-foreground text-sm">{u.orders}</td>
                  <td className="p-4 text-muted-foreground text-sm">{u.joined}</td>
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
    const handleSave = () => {
      toast({ title: t.settingsSaved });
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
      </div>
    </div>
  );
};

export default AdminPage;
