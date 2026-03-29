import { Home, Box, PlusCircle, LayoutDashboard, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: t.navHome },
    { to: "/services", icon: Box, label: t.navServices },
    { to: "/new-request", icon: PlusCircle, label: t.navNewRequest, accent: true },
    { to: "/dashboard", icon: LayoutDashboard, label: t.navDashboard },
    { to: "/contact", icon: Phone, label: t.navContact },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden glass border-t border-border/50">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                item.accent && !isActive && "text-primary/70"
              )}
            >
              {item.accent ? (
                <div className={cn(
                  "p-2 rounded-full -mt-5 shadow-lg",
                  isActive ? "bg-gradient-gold" : "bg-gradient-gold/80"
                )}>
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_hsl(38,90%,55%,0.5)]")} />
              )}
              <span className={cn("text-[10px] leading-tight", isActive && "font-bold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
