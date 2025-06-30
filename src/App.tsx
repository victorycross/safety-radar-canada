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
import HubsPage from '@/pages/HubsPage';
import HubDetailPage from '@/pages/HubDetailPage';
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
import { getBrowserInfo, detectChromeIssues } from '@/utils/browserUtils';
import { SessionSecurityManager } from '@/components/security/SessionSecurityManager';

// Move QueryClient outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const { isChrome } = getBrowserInfo();
        // Chrome gets extra retries due to potential CSP issues
        const maxRetries = isChrome ? 3 : 2;
        return failureCount < maxRetries;
      },
      retryDelay: (attemptIndex) => {
        const { isChrome } = getBrowserInfo();
        // Longer delays for Chrome to handle potential CSP/network issues
        const baseDelay = isChrome ? 2000 : 1000;
        return Math.min(baseDelay * Math.pow(2, attemptIndex), 30000);
      }
    }
  }
});

// Enhanced Chrome-compatible security headers configuration
const setChromeCompatibleSecurityHeaders = () => {
  const { isChrome } = getBrowserInfo();
  
  const securityHeaders = [
    { 
      name: 'Content-Security-Policy', 
      content: isChrome 
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://api.ipify.org https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';"
        : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.ipify.org https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self';"
    },
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'X-XSS-Protection', content: '1; mode=block' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
  ];

  logger.chrome('Setting Chrome-compatible security headers', { headerCount: securityHeaders.length });

  securityHeaders.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`) && !document.querySelector(`meta[http-equiv="${name}"]`)) {
      const meta = document.createElement('meta');
      if (name === 'Content-Security-Policy') {
        meta.httpEquiv = name;
      } else {
        meta.name = name;
      }
      meta.content = content;
      document.head.appendChild(meta);
    }
  });
};

const AppContent = () => {
  const { user, loading, isAdmin } = useAuth();
  const { isChrome } = getBrowserInfo();

  logger.debug('AppContent: Render started', { 
    hasUser: !!user, 
    loading, 
    isAdminUser: user ? isAdmin() : false,
    isChrome
  });

  useEffect(() => {
    logger.debug('AppContent: useEffect triggered for security setup');
    logger.chrome('Chrome-specific app initialization');
    
    // Set up Chrome-specific issue detection
    if (isChrome) {
      detectChromeIssues();
    }
    
    // Set Chrome-compatible security headers
    setChromeCompatibleSecurityHeaders();

    // Log admin access with Chrome-specific info
    if (user && isAdmin() && window.location.pathname.includes('/admin')) {
      logSecurityEvent({
        action: SecurityEvents.ADMIN_ACCESS,
        new_values: { 
          page: window.location.pathname,
          browser: isChrome ? 'Chrome' : 'Other'
        }
      });
    }
  }, [user, isAdmin, isChrome]);

  // Show loading state while auth is being determined
  if (loading) {
    logger.debug('AppContent: Showing loading state');
    logger.chrome('Chrome loading state active');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
          {isChrome && (
            <p className="text-xs text-muted-foreground mt-2">Chrome compatibility mode</p>
          )}
        </div>
      </div>
    );
  }

  logger.debug('AppContent: Auth loading complete, rendering routes');
  logger.chrome('Chrome auth complete, rendering app');

  // If user is authenticated, use MainLayout with sidebar and security manager
  if (user) {
    logger.debug('AppContent: User authenticated, rendering with MainLayout');
    return (
      <>
        <SessionSecurityManager />
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
            <Route path="/hubs" element={<HubsPage />} />
            <Route path="/hub/:hubId" element={<HubDetailPage />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </>
    );
  }

  logger.debug('AppContent: User not authenticated, rendering without MainLayout');

  // If user is not authenticated, show content with header only
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
          <Route path="/hubs" element={<HubsPage />} />
          <Route path="/hub/:hubId" element={<HubDetailPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const { isChrome } = getBrowserInfo();
  
  logger.debug('App: Component render started', { isChrome });
  
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
