import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Warehouse, LayoutDashboard, Package, FileText, CreditCard,
  Plus, Search, Bell, User, LogOut, ClipboardList, Settings,
  Eye, MoreVertical, Calendar, MapPin, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Tab = "overview" | "products" | "orders" | "invoices";

const mockProducts = [
  { id: 1, name: "أثاث مكتبي", type: "أثاث", qty: 15, size: "20 م²", storage: "عادي", status: "مخزّن" },
  { id: 2, name: "أجهزة إلكترونية", type: "معدات", qty: 50, size: "10 م²", storage: "عالي الأمان", status: "مخزّن" },
  { id: 3, name: "مواد غذائية", type: "بضائع", qty: 200, size: "30 م²", storage: "مبرد", status: "في الطريق" },
];

const mockOrders = [
  { id: "ORD-001", date: "2026-03-20", type: "تخزين عادي", duration: "3 أشهر", status: "نشط", total: "4,500 ر.س" },
  { id: "ORD-002", date: "2026-03-15", type: "تخزين مبرد", duration: "1 شهر", status: "قيد المراجعة", total: "3,600 ر.س" },
  { id: "ORD-003", date: "2026-02-28", type: "تخزين سيارة", duration: "6 أشهر", status: "مكتمل", total: "3,000 ر.س" },
];

const mockInvoices = [
  { id: "INV-001", order: "ORD-001", date: "2026-03-20", amount: "4,500 ر.س", status: "مدفوعة" },
  { id: "INV-002", order: "ORD-002", date: "2026-03-15", amount: "3,600 ر.س", status: "معلقة" },
  { id: "INV-003", order: "ORD-003", date: "2026-02-28", amount: "3,000 ر.س", status: "مدفوعة" },
];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    "مخزّن": "bg-emerald-500/20 text-emerald-400",
    "في الطريق": "bg-amber-500/20 text-amber-400",
    "نشط": "bg-emerald-500/20 text-emerald-400",
    "قيد المراجعة": "bg-amber-500/20 text-amber-400",
    "مكتمل": "bg-secondary/20 text-secondary",
    "مدفوعة": "bg-emerald-500/20 text-emerald-400",
    "معلقة": "bg-amber-500/20 text-amber-400",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const sidebarItems = [
  { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
  { id: "products" as Tab, label: "المنتجات", icon: Package },
  { id: "orders" as Tab, label: "الطلبات", icon: ClipboardList },
  { id: "invoices" as Tab, label: "الفواتير", icon: CreditCard },
];

const DashboardPage = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card border-l border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="bg-gradient-gold p-2 rounded-lg shrink-0">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && <span className="font-bold text-foreground text-sm">Smart Storage Hub</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/services" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>الخدمات</span>}
          </Link>
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
            <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث..." className="bg-muted/30 border-border pr-10 w-64 h-9" />
            </div>
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {tab === "overview" && <OverviewTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "invoices" && <InvoicesTab />}
        </main>
      </div>
    </div>
  );
};

const OverviewTab = () => (
  <div className="space-y-6">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "إجمالي المنتجات", value: "65", icon: Package, color: "text-blue-400" },
        { label: "الطلبات النشطة", value: "3", icon: ClipboardList, color: "text-emerald-400" },
        { label: "المساحة المستخدمة", value: "60 م²", icon: Warehouse, color: "text-primary" },
        { label: "إجمالي المدفوعات", value: "11,100 ر.س", icon: CreditCard, color: "text-purple-400" },
      ].map((stat) => (
        <div key={stat.label} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-black text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4">آخر الطلبات</h3>
        <div className="space-y-3">
          {mockOrders.slice(0, 3).map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div>
                <span className="font-medium text-foreground text-sm">{o.id}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" /> {o.date}
                </div>
              </div>
              <Badge className={`${statusColor(o.status)} border-none`}>{o.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4">المنتجات المخزنة</h3>
        <div className="space-y-3">
          {mockProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div>
                <span className="font-medium text-foreground text-sm">{p.name}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" /> {p.size} - {p.storage}
                </div>
              </div>
              <Badge className={`${statusColor(p.status)} border-none`}>{p.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProductsTab = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-foreground">المنتجات والممتلكات</h2>
      <Button className="bg-gradient-gold text-primary-foreground font-medium glow-gold hover:opacity-90">
        <Plus className="w-4 h-4 ml-2" /> إضافة منتج
      </Button>
    </div>
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["الاسم", "النوع", "الكمية", "المساحة", "نوع التخزين", "الحالة", ""].map((h) => (
              <th key={h} className="text-right p-4 text-sm font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockProducts.map((p) => (
            <tr key={p.id} className="border-b border-border/50 hover:bg-muted/10">
              <td className="p-4 font-medium text-foreground text-sm">{p.name}</td>
              <td className="p-4 text-muted-foreground text-sm">{p.type}</td>
              <td className="p-4 text-muted-foreground text-sm">{p.qty}</td>
              <td className="p-4 text-muted-foreground text-sm">{p.size}</td>
              <td className="p-4 text-muted-foreground text-sm">{p.storage}</td>
              <td className="p-4"><Badge className={`${statusColor(p.status)} border-none text-xs`}>{p.status}</Badge></td>
              <td className="p-4"><MoreVertical className="w-4 h-4 text-muted-foreground" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OrdersTab = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-foreground">الطلبات</h2>
      <Button className="bg-gradient-gold text-primary-foreground font-medium glow-gold hover:opacity-90">
        <Plus className="w-4 h-4 ml-2" /> طلب تخزين جديد
      </Button>
    </div>
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["رقم الطلب", "التاريخ", "نوع التخزين", "المدة", "الإجمالي", "الحالة"].map((h) => (
              <th key={h} className="text-right p-4 text-sm font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockOrders.map((o) => (
            <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10">
              <td className="p-4 font-medium text-primary text-sm">{o.id}</td>
              <td className="p-4 text-muted-foreground text-sm">{o.date}</td>
              <td className="p-4 text-muted-foreground text-sm">{o.type}</td>
              <td className="p-4 text-muted-foreground text-sm">{o.duration}</td>
              <td className="p-4 text-foreground font-bold text-sm">{o.total}</td>
              <td className="p-4"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const InvoicesTab = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-foreground">الفواتير والمدفوعات</h2>
      <Button variant="outline" className="border-border text-foreground">
        <FileText className="w-4 h-4 ml-2" /> تصدير الفواتير
      </Button>
    </div>
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["رقم الفاتورة", "الطلب", "التاريخ", "المبلغ", "الحالة"].map((h) => (
              <th key={h} className="text-right p-4 text-sm font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockInvoices.map((inv) => (
            <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/10">
              <td className="p-4 font-medium text-foreground text-sm">{inv.id}</td>
              <td className="p-4 text-primary text-sm">{inv.order}</td>
              <td className="p-4 text-muted-foreground text-sm">{inv.date}</td>
              <td className="p-4 text-foreground font-bold text-sm">{inv.amount}</td>
              <td className="p-4"><Badge className={`${statusColor(inv.status)} border-none text-xs`}>{inv.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DashboardPage;
