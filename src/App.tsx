
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityProvider } from "./context/SecurityContext";

// Import layout
import MainLayout from "./components/layout/MainLayout";

// Import pages
import HomePage from "./pages/HomePage";
import IncidentsPage from "./pages/IncidentsPage";
import ReportPage from "./pages/ReportPage";
import SourcesPage from "./pages/SourcesPage";
import EmployeesPage from "./pages/EmployeesPage";
import WidgetPage from "./pages/WidgetPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProvinceDetailPage from "./pages/ProvinceDetailPage";
import AlertReadyPage from "./pages/AlertReadyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="sources" element={<SourcesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="widget" element={<WidgetPage />} />
              <Route path="province/:provinceId" element={<ProvinceDetailPage />} />
              <Route path="alert-ready" element={<AlertReadyPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SecurityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
