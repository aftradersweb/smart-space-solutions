import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Warehouse, LayoutDashboard, Package, FileText, CreditCard,
  Plus, Search, Bell, User, LogOut, ClipboardList, Settings,
  Eye, MoreVertical, Calendar, MapPin, ChevronLeft, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTopBar from "@/components/MobileTopBar";
import MobileBottomNav from "@/components/MobileBottomNav";

type Tab = "overview" | "products" | "orders" | "invoices";

const DashboardPage = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t, lang, setLang, dir } = useLanguage();
  const isMobile = useIsMobile();

  const mockProducts = [
    { id: 1, name: lang === "ar" ? "أثاث مكتبي" : "Office Furniture", type: lang === "ar" ? "أثاث" : "Furniture", qty: 15, size: `20 ${t.sqm}`, storage: lang === "ar" ? "عادي" : "Normal", status: t.stored },
    { id: 2, name: lang === "ar" ? "أجهزة إلكترونية" : "Electronics", type: lang === "ar" ? "معدات" : "Equipment", qty: 50, size: `10 ${t.sqm}`, storage: lang === "ar" ? "عالي الأمان" : "High Security", status: t.stored },
    { id: 3, name: lang === "ar" ? "مواد غذائية" : "Food Products", type: lang === "ar" ? "بضائع" : "Goods", qty: 200, size: `30 ${t.sqm}`, storage: lang === "ar" ? "مبرد" : "Cold", status: t.inTransit },
  ];

  const mockOrders = [
    { id: "ORD-001", date: "2026-03-20", type: lang === "ar" ? "تخزين عادي" : "Normal Storage", duration: lang === "ar" ? "3 أشهر" : "3 months", durationMonths: 3, endDate: "2026-06-20", status: t.active, total: `4,500 ${t.sar}` },
    { id: "ORD-002", date: "2026-03-15", type: lang === "ar" ? "تخزين مبرد" : "Cold Storage", duration: lang === "ar" ? "1 شهر" : "1 month", durationMonths: 1, endDate: "2026-04-15", status: t.underReview, total: `3,600 ${t.sar}` },
    { id: "ORD-003", date: "2026-02-28", type: lang === "ar" ? "تخزين سيارة" : "Car Storage", duration: lang === "ar" ? "6 أشهر" : "6 months", durationMonths: 6, endDate: "2026-08-28", status: t.completed, total: `3,000 ${t.sar}` },
  ];

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRemainingLabel = (days: number) => {
    if (days <= 0) return lang === "ar" ? "منتهي" : "Expired";
    if (days === 1) return lang === "ar" ? "يوم واحد" : "1 day";
    return lang === "ar" ? `${days} يوم` : `${days} days`;
  };

  const getRemainingColor = (days: number, totalMonths: number) => {
    const totalDays = totalMonths * 30;
    if (days <= 0) return "text-destructive font-bold";
    if (days <= totalDays * 0.15 || days <= 7) return "text-destructive font-bold";
    if (days <= totalDays * 0.3 || days <= 14) return "text-orange-500 font-semibold";
    return "text-emerald-500 font-medium";
  };

  const mockInvoices = [
    { id: "INV-001", order: "ORD-001", date: "2026-03-20", amount: `4,500 ${t.sar}`, status: t.paid },
    { id: "INV-002", order: "ORD-002", date: "2026-03-15", amount: `3,600 ${t.sar}`, status: t.pending },
    { id: "INV-003", order: "ORD-003", date: "2026-02-28", amount: `3,000 ${t.sar}`, status: t.paid },
  ];

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      [t.stored]: "bg-emerald-500/20 text-emerald-400",
      [t.inTransit]: "bg-amber-500/20 text-amber-400",
      [t.active]: "bg-emerald-500/20 text-emerald-400",
      [t.underReview]: "bg-amber-500/20 text-amber-400",
      [t.completed]: "bg-secondary/20 text-secondary",
      [t.paid]: "bg-emerald-500/20 text-emerald-400",
      [t.pending]: "bg-amber-500/20 text-amber-400",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  const sidebarItems = [
    { id: "overview" as Tab, label: t.overview, icon: LayoutDashboard },
    { id: "products" as Tab, label: t.products, icon: Package },
    { id: "orders" as Tab, label: t.orders, icon: ClipboardList },
    { id: "invoices" as Tab, label: t.invoices, icon: CreditCard },
  ];

  // Mobile tab bar for dashboard sections
  const MobileTabBar = () => (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
            tab === item.id
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground bg-muted/20"
          }`}
        >
          <item.icon className="w-3.5 h-3.5" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  // Mobile card view for orders
  const MobileOrderCard = ({ o }: { o: typeof mockOrders[0] }) => {
    const days = getRemainingDays(o.endDate);
    return (
      <div className="glass rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-primary text-sm">{o.id}</span>
          <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">{t.thDate}</span>
            <p className="text-foreground mt-0.5">{o.date}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.thStorageType}</span>
            <p className="text-foreground mt-0.5">{o.type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.thDuration}</span>
            <p className="text-foreground mt-0.5">{o.duration}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.thRemaining}</span>
            <p className={`mt-0.5 ${getRemainingColor(days, o.durationMonths)}`}>{getRemainingLabel(days)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{t.thTotal}</span>
          <span className="text-sm font-bold text-foreground">{o.total}</span>
        </div>
      </div>
    );
  };

  // Mobile card view for products
  const MobileProductCard = ({ p }: { p: typeof mockProducts[0] }) => (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground text-sm">{p.name}</span>
        <Badge className={`${statusColor(p.status)} border-none text-[10px]`}>{p.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">{t.thType}</span>
          <p className="text-foreground mt-0.5">{p.type}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t.thQuantity}</span>
          <p className="text-foreground mt-0.5">{p.qty}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t.thArea}</span>
          <p className="text-foreground mt-0.5">{p.size}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t.thStorageType}</span>
          <p className="text-foreground mt-0.5">{p.storage}</p>
        </div>
      </div>
    </div>
  );

  // Mobile card view for invoices
  const MobileInvoiceCard = ({ inv }: { inv: typeof mockInvoices[0] }) => (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground text-sm">{inv.id}</span>
        <Badge className={`${statusColor(inv.status)} border-none text-[10px]`}>{inv.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">{t.thOrder}</span>
          <p className="text-primary mt-0.5">{inv.order}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t.thDate}</span>
          <p className="text-foreground mt-0.5">{inv.date}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-xs text-muted-foreground">{t.thAmount}</span>
        <span className="text-sm font-bold text-foreground">{inv.amount}</span>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-14" dir={dir}>
        <MobileTopBar />
        <main className="p-4 space-y-4">
          <h1 className="text-lg font-bold text-foreground">{t.dashboard}</h1>
          <MobileTabBar />

          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t.totalProducts, value: "65", icon: Package, color: "text-blue-400" },
                  { label: t.activeOrders, value: "3", icon: ClipboardList, color: "text-emerald-400" },
                  { label: t.usedSpace, value: `60 ${t.sqm}`, icon: Warehouse, color: "text-primary" },
                  { label: t.totalPayments, value: `11,100 ${t.sar}`, icon: CreditCard, color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-3">
                    <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                    <div className="text-lg font-black text-foreground">{stat.value}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="glass rounded-xl p-4">
                  <h3 className="font-bold text-foreground text-sm mb-3">{t.latestOrders}</h3>
                  <div className="space-y-2">
                    {mockOrders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                        <div>
                          <span className="font-medium text-foreground text-xs">{o.id}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <Calendar className="w-2.5 h-2.5" /> {o.date}
                          </div>
                        </div>
                        <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <h3 className="font-bold text-foreground text-sm mb-3">{t.storedProducts}</h3>
                  <div className="space-y-2">
                    {mockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                        <div>
                          <span className="font-medium text-foreground text-xs">{p.name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {p.size} - {p.storage}
                          </div>
                        </div>
                        <Badge className={`${statusColor(p.status)} border-none text-[10px]`}>{p.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">{t.productsAndProperties}</h2>
                <Link to="/new-request">
                  <Button size="sm" className="bg-gradient-gold text-primary-foreground font-medium glow-gold hover:opacity-90 text-xs h-8">
                    <Plus className="w-3.5 h-3.5" /> {t.addProduct}
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {mockProducts.map((p) => <MobileProductCard key={p.id} p={p} />)}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">{t.orders}</h2>
                <Link to="/new-request">
                  <Button size="sm" className="bg-gradient-gold text-primary-foreground font-medium glow-gold hover:opacity-90 text-xs h-8">
                    <Plus className="w-3.5 h-3.5" /> {t.newStorageRequest}
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {mockOrders.map((o) => <MobileOrderCard key={o.id} o={o} />)}
              </div>
            </div>
          )}

          {tab === "invoices" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">{t.invoicesAndPayments}</h2>
                <Button size="sm" variant="outline" className="border-border text-foreground text-xs h-8">
                  <FileText className="w-3.5 h-3.5" /> {t.exportInvoices}
                </Button>
              </div>
              <div className="space-y-3">
                {mockInvoices.map((inv) => <MobileInvoiceCard key={inv.id} inv={inv} />)}
              </div>
            </div>
          )}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" dir={dir}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card ${dir === "rtl" ? "border-l" : "border-r"} border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="bg-gradient-gold p-2 rounded-lg shrink-0">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && <span className="font-bold text-foreground text-sm">{t.appName}</span>}
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
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/services" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{t.servicesNav}</span>}
          </Link>
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{t.logout}</span>}
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
            <h1 className="text-lg font-bold text-foreground">{t.dashboard}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input placeholder={t.search} className={`bg-muted/30 border-border ${dir === "rtl" ? "pr-10" : "pl-10"} w-64 h-9`} />
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
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: t.totalProducts, value: "65", icon: Package, color: "text-blue-400" },
                  { label: t.activeOrders, value: "3", icon: ClipboardList, color: "text-emerald-400" },
                  { label: t.usedSpace, value: `60 ${t.sqm}`, icon: Warehouse, color: "text-primary" },
                  { label: t.totalPayments, value: `11,100 ${t.sar}`, icon: CreditCard, color: "text-purple-400" },
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
                  <h3 className="font-bold text-foreground mb-4">{t.latestOrders}</h3>
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
                  <h3 className="font-bold text-foreground mb-4">{t.storedProducts}</h3>
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
          )}

          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{t.productsAndProperties}</h2>
                <Link to="/new-request">
                  <Button className="bg-gradient-gold text-primary-foreground font-medium glow-gold hover:opacity-90">
                    <Plus className={`w-4 h-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} /> {t.addProduct}
                  </Button>
                </Link>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[t.thName, t.thType, t.thQuantity, t.thArea, t.thStorageType, t.thStatus, ""].map((h) => (
                        <th key={h} className={`${dir === "rtl" ? "text-right" : "text-left"} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
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
          )}

          {tab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{t.orders}</h2>
                <Link to="/new-request">
                  <Button className="bg-gradient-gold text-primary-foreground font-medium glow-gold hover:opacity-90">
                    <Plus className={`w-4 h-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} /> {t.newStorageRequest}
                  </Button>
                </Link>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                     <tr className="border-b border-border">
                       {[t.thOrderId, t.thDate, t.thStorageType, t.thDuration, t.thRemaining, t.thTotal, t.thStatus].map((h) => (
                         <th key={h} className={`${dir === "rtl" ? "text-right" : "text-left"} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
                       ))}
                     </tr>
                   </thead>
                   <tbody>
                     {mockOrders.map((o) => {
                       const days = getRemainingDays(o.endDate);
                       return (
                         <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10">
                           <td className="p-4 font-medium text-primary text-sm">{o.id}</td>
                           <td className="p-4 text-muted-foreground text-sm">{o.date}</td>
                           <td className="p-4 text-muted-foreground text-sm">{o.type}</td>
                           <td className="p-4 text-muted-foreground text-sm">{o.duration}</td>
                           <td className={`p-4 text-sm ${getRemainingColor(days, o.durationMonths)}`}>
                             {getRemainingLabel(days)}
                           </td>
                           <td className="p-4 text-foreground font-bold text-sm">{o.total}</td>
                           <td className="p-4"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status}</Badge></td>
                         </tr>
                       );
                     })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "invoices" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{t.invoicesAndPayments}</h2>
                <Button variant="outline" className="border-border text-foreground">
                  <FileText className={`w-4 h-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} /> {t.exportInvoices}
                </Button>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[t.thInvoiceId, t.thOrder, t.thDate, t.thAmount, t.thStatus].map((h) => (
                        <th key={h} className={`${dir === "rtl" ? "text-right" : "text-left"} p-4 text-sm font-medium text-muted-foreground`}>{h}</th>
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
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
