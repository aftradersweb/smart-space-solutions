import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { CurrencyProvider } from "@/i18n/CurrencyContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileTopBar from "@/components/MobileTopBar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import ServicesPage from "./pages/ServicesPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import NewRequestPage from "./pages/NewRequestPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <CurrencyProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MobileTopBar />
        <div className="pt-[52px] md:pt-0 pb-[68px] md:pb-0">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/new-request" element={<NewRequestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <MobileBottomNav />
        <PWAInstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
    </CurrencyProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
