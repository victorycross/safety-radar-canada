
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
import AuthPage from '@/pages/AuthPage';
import DiagnosticsPage from '@/pages/DiagnosticsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SessionManager } from '@/components/auth/SessionManager';
import { SupabaseDataProvider } from '@/context/SupabaseDataProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { logger } from '@/utils/logger';

// Move QueryClient outside component to prevent recreation
const queryClient = new QueryClient();

// Security headers configuration - moved outside to prevent recreation
const setSecurityHeaders = () => {
  const securityHeaders = [
    { name: 'Content-Security-Policy', content: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.ipify.org https://*.supabase.co" },
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'X-XSS-Protection', content: '1; mode=block' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
  ];

  securityHeaders.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  });
};

const AppContent = () => {
  const { user, loading, isAdmin } = useAuth();

  logger.debug('AppContent: Render started', { user: !!user, loading, isAdmin: isAdmin() });

  useEffect(() => {
    logger.debug('AppContent: useEffect triggered');
    
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
    logger.debug('AppContent: Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  logger.debug('AppContent: Auth loading complete, rendering routes');

  // If user is authenticated, use MainLayout with sidebar
  if (user) {
    logger.debug('AppContent: User authenticated, rendering with MainLayout');
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
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    );
  }

  logger.debug('AppContent: User not authenticated, rendering without MainLayout');

  // If user is not authenticated, show auth page for auth route, otherwise show public content
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
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
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  logger.debug('App: Component render started');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionManager>
            <SupabaseDataProvider>
              <Toaster />
              <Router>
                <AppContent />
              </Router>
            </SupabaseDataProvider>
          </SessionManager>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

logger.debug('App: Component defined');

export default App;
