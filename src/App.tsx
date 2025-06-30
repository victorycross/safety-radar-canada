
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import UnifiedSourceManagementPage from "./pages/UnifiedSourceManagementPage";
import AlertReadyPage from '@/pages/AlertReadyPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/source-management" element={<UnifiedSourceManagementPage />} />
          <Route path="/sources" element={<Navigate to="/source-management" replace />} />
          <Route path="/alert-ready" element={<AlertReadyPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
