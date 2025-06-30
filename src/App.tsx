import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import UnifiedSourceManagementPage from "./pages/UnifiedSourceManagementPage";
import EmployeeDataPage from "./pages/EmployeeDataPage";
import WeatherAlertsPage from "./pages/WeatherAlertsPage";
import SecurityAlertsPage from "./pages/SecurityAlertsPage";
import TravelIntegrationPage from "./pages/TravelIntegrationPage";
import BCSeismicAlertsPage from "./pages/BCSeismicAlertsPage";
import EverbridgeAlertsPage from "./pages/EverbridgeAlertsPage";
import DataIngestionPage from "./pages/DataIngestionPage";
import { QueryClient, QueryClientProvider } from 'react-query';
import { TooltipProvider, Toaster } from 'react-tooltip';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthPage from '@/components/auth/AuthPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import { SupabaseDataProvider } from '@/context/SupabaseDataProvider';
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClient client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/source-management" element={<UnifiedSourceManagementPage />} />
            <Route path="/sources" element={<Navigate to="/source-management" replace />} />
            <Route path="/alert-ready" element={<AlertReadyPage />} />
            <Route path="/employee-data" element={<EmployeeDataPage />} />
            <Route path="/weather-alerts" element={<WeatherAlertsPage />} />
            <Route path="/security-alerts" element={<SecurityAlertsPage />} />
            <Route path="/travel-integration" element={<TravelIntegrationPage />} />
            <Route path="/bc-alerts" element={<BCSeismicAlertsPage />} />
            <Route path="/everbridge-alerts" element={<EverbridgeAlertsPage />} />
            <Route path="/data-ingestion" element={<DataIngestionPage />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClient>
  );
}

export default App;
