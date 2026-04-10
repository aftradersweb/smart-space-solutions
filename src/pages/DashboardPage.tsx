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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface Order {
  id: string;
  created_at: string;
  status: string;
  area: number;
  duration_months: number;
  total_price: number;
  storage_types: {
    name_en: string;
    name_ar: string;
  };
}

type Tab = "overview" | "products" | "orders" | "invoices";
const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Placeholders for removed mock data to prevent runtime crashes
  const mockProducts: any[] = [];
  const mockInvoices: any[] = [];
  const mockActivities: any[] = [];
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang, setLang, dir } = useLanguage();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          area,
          duration_months,
          total_price,
          storage_types (
            name_en,
            name_ar
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data as any);
      setLoading(false);
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const stats = {
    totalProducts: orders.length, // Rough estimate
    activeOrders: orders.filter(o => o.status === 'approved' || o.status === 'active').length,
    usedSpace: orders.reduce((sum, o) => sum + o.area, 0),
    totalPayments: orders.reduce((sum, o) => sum + o.total_price, 0),
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      'stored': "bg-emerald-500/20 text-emerald-400",
      'in_transit': "bg-amber-500/20 text-amber-400",
      'active': "bg-emerald-500/20 text-emerald-400",
      'under_review': "bg-amber-500/20 text-amber-400",
      'completed': "bg-secondary/20 text-secondary",
      'approved': "bg-emerald-500/20 text-emerald-400",
      'rejected': "bg-destructive/20 text-destructive",
      'paid': "bg-emerald-500/20 text-emerald-400",
      'pending': "bg-amber-500/20 text-amber-400",
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
    <div className="grid grid-cols-4 gap-1 pb-2">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
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
  const MobileOrderCard = ({ o }: { o: Order }) => {
    const date = new Date(o.created_at).toLocaleDateString();
    return (
      <div className="glass rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-primary text-sm">{o.id.split('-')[0].toUpperCase()}</span>
          <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">{t.thDate}</span>
            <p className="text-foreground mt-0.5">{date}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.thStorageType}</span>
            <p className="text-foreground mt-0.5">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.thDuration}</span>
            <p className="text-foreground mt-0.5">{o.duration_months} {t.nrMonth}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.thArea}</span>
            <p className="text-foreground mt-0.5">{o.area} {t.sqm}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{t.thTotal}</span>
          <span className="text-sm font-bold text-foreground">{o.total_price.toLocaleString()} {t.sar}</span>
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
                  { label: t.totalProducts, value: stats.totalProducts.toString(), icon: Package, color: "text-blue-400" },
                  { label: t.activeOrders, value: stats.activeOrders.toString(), icon: ClipboardList, color: "text-emerald-400" },
                  { label: t.usedSpace, value: `${stats.usedSpace} ${t.sqm}`, icon: Warehouse, color: "text-primary" },
                  { label: t.totalPayments, value: `${stats.totalPayments.toLocaleString()} ${t.sar}`, icon: CreditCard, color: "text-purple-400" },
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
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                        <div>
                          <span className="font-medium text-foreground text-xs">{o.id.split('-')[0].toUpperCase()}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <Calendar className="w-2.5 h-2.5" /> {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={`${statusColor(o.status)} border-none text-[10px]`}>{o.status.replace('_', ' ')}</Badge>
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
                {orders.map((o) => <MobileOrderCard key={o.id} o={o} />)}
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
                  { label: t.totalProducts, value: stats.totalProducts.toString(), icon: Package, color: "text-blue-400" },
                  { label: t.activeOrders, value: stats.activeOrders.toString(), icon: ClipboardList, color: "text-emerald-400" },
                  { label: t.usedSpace, value: `${stats.usedSpace} ${t.sqm}`, icon: Warehouse, color: "text-primary" },
                  { label: t.totalPayments, value: `${stats.totalPayments.toLocaleString()} ${t.sar}`, icon: CreditCard, color: "text-purple-400" },
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
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div>
                          <span className="font-medium text-foreground text-sm">{o.id.split('-')[0].toUpperCase()}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" /> {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={`${statusColor(o.status)} border-none`}>{o.status.replace('_', ' ')}</Badge>
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
                    {orders.map((o) => {
                      return (
                        <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="p-4 font-medium text-primary text-sm">{o.id.split('-')[0].toUpperCase()}</td>
                          <td className="p-4 text-muted-foreground text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-muted-foreground text-sm">{lang === 'ar' ? o.storage_types.name_ar : o.storage_types.name_en}</td>
                          <td className="p-4 text-muted-foreground text-sm">{o.duration_months} {t.nrMonth}</td>
                          <td className="p-4 text-sm text-foreground">
                            {o.area} {t.sqm}
                          </td>
                          <td className="p-4 text-foreground font-bold text-sm">{o.total_price.toLocaleString()} {t.sar}</td>
                          <td className="p-4"><Badge className={`${statusColor(o.status)} border-none text-xs`}>{o.status.replace('_', ' ')}</Badge></td>
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
