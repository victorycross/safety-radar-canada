
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import EmployeesPage from '@/pages/EmployeesPage';
import ProvinceDetailPage from '@/pages/ProvinceDetailPage';
import IncidentsPage from '@/pages/IncidentsPage';
import ReportPage from '@/pages/ReportPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SourcesPage from '@/pages/SourcesPage';
import AdminPage from '@/pages/AdminPage';
import AlertReadyPage from '@/pages/AlertReadyPage';
import WidgetPage from '@/pages/WidgetPage';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthPage from '@/components/auth/AuthPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import { SupabaseDataProvider } from '@/context/SupabaseDataProvider';

function App() {
  return (
    <AuthProvider>
      <SupabaseDataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute requireAuth>
                  <MainLayout>
                    <EmployeesPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/province/:id" 
              element={
                <ProtectedRoute requireAuth>
                  <MainLayout>
                    <ProvinceDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/incidents" 
              element={
                <ProtectedRoute requireAuth>
                  <MainLayout>
                    <IncidentsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report" 
              element={
                <ProtectedRoute requiredRole="power_user">
                  <MainLayout>
                    <ReportPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute requireAuth>
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sources" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout>
                    <SourcesPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout>
                    <AdminPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alert-ready" 
              element={
                <ProtectedRoute requireAuth>
                  <MainLayout>
                    <AlertReadyPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/widgets" 
              element={
                <ProtectedRoute requireAuth>
                  <MainLayout>
                    <WidgetPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SupabaseDataProvider>
    </AuthProvider>
  );
}

export default App;
