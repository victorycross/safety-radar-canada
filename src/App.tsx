
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SecurityProvider } from "@/context/SecurityContext";
import { SupabaseDataProvider } from "@/context/SupabaseDataProvider";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import AlertReadyPage from "./pages/AlertReadyPage";
import LocationStatusPage from "./pages/LocationStatusPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import IncidentsPage from "./pages/IncidentsPage";
import ReportPage from "./pages/ReportPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import AdminPage from "./pages/AdminPage";
import AdminOperationsPage from "./pages/AdminOperationsPage";
import AdminDataManagementPage from "./pages/AdminDataManagementPage";
import AdminSystemHealthPage from "./pages/AdminSystemHealthPage";
import AdminArchiveManagementPage from "./pages/AdminArchiveManagementPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SecurityProvider>
          <AuthProvider>
            <SupabaseDataProvider>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="alert-ready" element={<AlertReadyPage />} />
                  <Route path="location-status" element={<LocationStatusPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="incidents" element={<IncidentsPage />} />
                  <Route path="report" element={<ReportPage />} />
                  <Route path="report-incident" element={<ReportIncidentPage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="admin/operations" element={<AdminOperationsPage />} />
                  <Route path="admin/data-management" element={<AdminDataManagementPage />} />
                  <Route path="admin/system-health" element={<AdminSystemHealthPage />} />
                  <Route path="admin/archive-management" element={<AdminArchiveManagementPage />} />
                  <Route path="admin/users" element={<AdminUserManagementPage />} />
                  <Route path="admin/settings" element={<AdminSettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SupabaseDataProvider>
          </AuthProvider>
        </SecurityProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
