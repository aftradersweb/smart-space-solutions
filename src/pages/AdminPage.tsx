import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Warehouse, LayoutDashboard, ClipboardList, MapPin as Space, DollarSign,
  Users, Search, Bell, User, LogOut, ChevronLeft, Eye,
  CheckCircle, XCircle, Clock, MoreVertical, TrendingUp, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Tab = "overview" | "orders" | "spaces" | "pricing" | "users";

const mockAdminOrders = [
  { id: "ORD-001", client: "شركة الأمان", type: "تخزين عادي", area: "20 م²", duration: "3 أشهر", total: "4,500 ر.س", status: "قيد المراجعة", date: "2026-03-20" },
  { id: "ORD-002", client: "أحمد محمد", type: "تخزين مبرد", area: "30 م²", duration: "1 شهر", total: "3,600 ر.س", status: "موافق عليه", date: "2026-03-18" },
  { id: "ORD-003", client: "شركة النخبة", type: "تخزين سيارة", area: "-", duration: "6 أشهر", total: "3,000 ر.س", status: "مكتمل", date: "2026-03-10" },
  { id: "ORD-004", client: "سارة أحمد", type: "مواد حساسة", area: "5 م²", duration: "2 شهر", total: "3,000 ر.س", status: "مرفوض", date: "2026-03-05" },
];

const mockSpaces = [
  { id: "S-01", name: "المستودع A - القسم 1", type: "عادي", capacity: "500 م²", used: "380 م²", percent: 76, status: "متاح" },
  { id: "S-02", name: "المستودع A - التبريد", type: "مبرد", capacity: "200 م²", used: "180 م²", percent: 90, status: "شبه ممتلئ" },
  { id: "S-03", name: "المستودع B - الأمان", type: "عالي الأمان", capacity: "100 م²", used: "45 م²", percent: 45, status: "متاح" },
  { id: "S-04", name: "موقف السيارات", type: "سيارات", capacity: "50 سيارة", used: "32 سيارة", percent: 64, status: "متاح" },
];

const mockPricing = [
  { type: "تخزين عادي", pricePerM2: 50, minArea: 5, minDuration: 1 },
  { type: "تخزين مبرد", pricePerM2: 120, minArea: 5, minDuration: 1 },
  { type: "تخزين عالي الأمان", pricePerM2: 200, minArea: 2, minDuration: 1 },
  { type: "مواد حساسة", pricePerM2: 300, minArea: 2, minDuration: 3 },
  { type: "تخزين سيارات", pricePerM2: 500, minArea: 1, minDuration: 1 },
];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    "قيد المراجعة": "bg-amber-500/20 text-amber-400",
    "موافق عليه": "bg-emerald-500/20 text-emerald-400",
    "مكتمل": "bg-secondary/20 text-secondary",
    "مرفوض": "bg-red-500/20 text-red-400",
    "متاح": "bg-emerald-500/20 text-emerald-400",
    "شبه ممتلئ": "bg-amber-500/20 text-amber-400",
    "ممتلئ": "bg-red-500/20 text-red-400",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const sidebarItems = [
  { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
  { id: "orders" as Tab, label: "الطلبات", icon: ClipboardList },
  { id: "spaces" as Tab, label: "المساحات", icon: Space },
  { id: "pricing" as Tab, label: "التسعير", icon: DollarSign },
  { id: "users" as Tab, label: "المستخدمين", icon: Users },
];

const AdminPage = () => {
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
          {sidebarOpen && (
            <div>
              <span className="font-bold text-foreground text-sm block">Smart Storage</span>
              <span className="text-xs text-primary">لوحة الإدارة</span>
            </div>
          )}
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
        <div className="p-3 border-t border-border">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
            <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
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

        <main className="flex-1 p-6 overflow-auto">
          {tab === "overview" && <AdminOverview />}
          {tab === "orders" && <AdminOrders />}
          {tab === "spaces" && <AdminSpaces />}
          {tab === "pricing" && <AdminPricing />}
          {tab === "users" && <AdminUsers />}
        </main>
      </div>
    </div>
  );
};

const AdminOverview = () => (
  <div className="space-y-6">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "إجمالي الطلبات", value: "156", icon: ClipboardList, color: "text-blue-400", change: "+12%" },
        { label: "طلبات قيد المراجعة", value: "8", icon: Clock, color: "text-amber-400", change: "-3" },
        { label: "إجمالي الإيرادات", value: "245,000 ر.س", icon: TrendingUp, color: "text-emerald-400", change: "+18%" },
        { label: "العملاء النشطون", value: "89", icon: Users, color: "text-purple-400", change: "+5" },
      ].map((stat) => (
        <div key={stat.label} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
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
          {mockAdminOrders.slice(0, 3).map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{o.id}</span>
                  <span className="text-xs text-muted-foreground">- {o.client}</span>
                </div>
                <span className="text-xs text-muted-foreground">{o.type} | {o.total}</span>
              </div>
              <Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4">حالة المساحات</h3>
        <div className="space-y-4">
          {mockSpaces.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{s.name}</span>
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

const AdminOrders = () => (
  <div>
    <h2 className="text-xl font-bold text-foreground mb-6">إدارة الطلبات</h2>
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["رقم الطلب", "العميل", "النوع", "المساحة", "المدة", "الإجمالي", "الحالة", "إجراءات"].map((h) => (
              <th key={h} className="text-right p-4 text-sm font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockAdminOrders.map((o) => (
            <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10">
              <td className="p-4 font-medium text-primary text-sm">{o.id}</td>
              <td className="p-4 text-foreground text-sm">{o.client}</td>
              <td className="p-4 text-muted-foreground text-sm">{o.type}</td>
              <td className="p-4 text-muted-foreground text-sm">{o.area}</td>
              <td className="p-4 text-muted-foreground text-sm">{o.duration}</td>
              <td className="p-4 text-foreground font-bold text-sm">{o.total}</td>
              <td className="p-4"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status}</Badge></td>
              <td className="p-4">
                <div className="flex items-center gap-1">
                  {o.status === "قيد المراجعة" && (
                    <>
                      <button className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><CheckCircle className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"><XCircle className="w-4 h-4" /></button>
                    </>
                  )}
                  <button className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground"><Eye className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminSpaces = () => (
  <div>
    <h2 className="text-xl font-bold text-foreground mb-6">إدارة المساحات التخزينية</h2>
    <div className="grid sm:grid-cols-2 gap-6">
      {mockSpaces.map((s) => (
        <div key={s.id} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">{s.name}</h3>
            <Badge className={`${statusColor(s.status)} border-none text-xs`}>{s.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-muted-foreground">النوع:</span> <span className="text-foreground font-medium mr-1">{s.type}</span></div>
            <div><span className="text-muted-foreground">السعة:</span> <span className="text-foreground font-medium mr-1">{s.capacity}</span></div>
            <div><span className="text-muted-foreground">مستخدم:</span> <span className="text-foreground font-medium mr-1">{s.used}</span></div>
            <div><span className="text-muted-foreground">الإشغال:</span> <span className="text-primary font-bold mr-1">{s.percent}%</span></div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${s.percent > 85 ? "bg-red-500" : s.percent > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${s.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminPricing = () => (
  <div>
    <h2 className="text-xl font-bold text-foreground mb-6">إدارة التسعير</h2>
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["نوع التخزين", "السعر / م² / شهر", "الحد الأدنى للمساحة", "الحد الأدنى للمدة", "إجراءات"].map((h) => (
              <th key={h} className="text-right p-4 text-sm font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockPricing.map((p) => (
            <tr key={p.type} className="border-b border-border/50 hover:bg-muted/10">
              <td className="p-4 font-medium text-foreground text-sm">{p.type}</td>
              <td className="p-4 text-primary font-bold text-sm">{p.pricePerM2} ر.س</td>
              <td className="p-4 text-muted-foreground text-sm">{p.minArea} م²</td>
              <td className="p-4 text-muted-foreground text-sm">{p.minDuration} شهر</td>
              <td className="p-4">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">تعديل</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminUsers = () => {
  const users = [
    { name: "أحمد محمد", email: "ahmed@email.com", type: "فرد", orders: 3, joined: "2026-01-15" },
    { name: "شركة الأمان", email: "info@alaman.com", type: "شركة", orders: 12, joined: "2025-11-20" },
    { name: "سارة أحمد", email: "sara@email.com", type: "فرد", orders: 1, joined: "2026-03-01" },
    { name: "شركة النخبة", email: "info@nokhba.com", type: "شركة", orders: 8, joined: "2025-12-10" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">إدارة المستخدمين</h2>
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["الاسم", "البريد", "النوع", "عدد الطلبات", "تاريخ الانضمام", ""].map((h) => (
                <th key={h} className="text-right p-4 text-sm font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-border/50 hover:bg-muted/10">
                <td className="p-4 font-medium text-foreground text-sm">{u.name}</td>
                <td className="p-4 text-muted-foreground text-sm">{u.email}</td>
                <td className="p-4"><Badge className={`${u.type === "شركة" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"} border-none text-xs`}>{u.type}</Badge></td>
                <td className="p-4 text-muted-foreground text-sm">{u.orders}</td>
                <td className="p-4 text-muted-foreground text-sm">{u.joined}</td>
                <td className="p-4"><MoreVertical className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
