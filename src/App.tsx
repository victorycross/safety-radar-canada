
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import UnifiedSourceManagementPage from "./pages/UnifiedSourceManagementPage";
import AlertReadyPage from '@/pages/AlertReadyPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import IncidentsPage from '@/pages/IncidentsPage';
import ReportPage from '@/pages/ReportPage';
import EmployeesPage from '@/pages/EmployeesPage';
import WidgetPage from '@/pages/WidgetPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SupabaseDataProvider } from '@/context/SupabaseDataProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';

const queryClient = new QueryClient();

// Security headers configuration
const setSecurityHeaders = () => {
  // Add security meta tags if not already present
  const addMetaTag = (name: string, content: string) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  };

  // Content Security Policy
  addMetaTag('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.ipify.org https://*.supabase.co");
  
  // Additional security headers
  addMetaTag('X-Content-Type-Options', 'nosniff');
  addMetaTag('X-Frame-Options', 'DENY');
  addMetaTag('X-XSS-Protection', '1; mode=block');
  addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
};

const AppContent = () => {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    // Set security headers
    setSecurityHeaders();

    // Log admin access
    if (user && isAdmin() && window.location.pathname.includes('/admin')) {
      logSecurityEvent({
        action: SecurityEvents.ADMIN_ACCESS,
        new_values: { page: window.location.pathname }
      });
    }
  }, [user, isAdmin]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, use MainLayout with sidebar
  if (user) {
    return (
      <MainLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/source-management" element={<UnifiedSourceManagementPage />} />
          <Route path="/sources" element={<Navigate to="/source-management" replace />} />
          <Route path="/alert-ready" element={<AlertReadyPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/widgets" element={<WidgetPage />} />
        </Routes>
      </MainLayout>
    );
  }

  // If user is not authenticated, use the original layout with header
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/source-management" element={<UnifiedSourceManagementPage />} />
          <Route path="/sources" element={<Navigate to="/source-management" replace />} />
          <Route path="/alert-ready" element={<AlertReadyPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/widgets" element={<WidgetPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SupabaseDataProvider>
            <Toaster />
            <Router>
              <AppContent />
            </Router>
          </SupabaseDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
