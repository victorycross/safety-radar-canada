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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute requireAuth>
                <EmployeesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/province/:id" 
            element={
              <ProtectedRoute requireAuth>
                <ProvinceDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/incidents" 
            element={
              <ProtectedRoute requireAuth>
                <IncidentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute requiredRole="power_user">
                <ReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requireAuth>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sources" 
            element={
              <ProtectedRoute requiredRole="admin">
                <SourcesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alert-ready" 
            element={
              <ProtectedRoute requireAuth>
                <AlertReadyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/widgets" 
            element={
              <ProtectedRoute requireAuth>
                <WidgetPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
