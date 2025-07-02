import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import EnhancedCharts from '@/components/analytics/EnhancedCharts';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useAnalyticsState } from '@/hooks/useAnalyticsState';
import { AnalyticsChartData } from '@/types/analytics';

const AnalyticsDashboardPage = () => {
  const { 
    state, 
    updateFilters, 
    resetFilters,
    exportData 
  } = useAnalyticsState();

  // Mock data for operational analytics
  const mockChartData: AnalyticsChartData = {
    incidentsByAlertLevel: [
      { name: 'Normal', value: 45, fill: '#22c55e', color: '#22c55e' },
      { name: 'Warning', value: 12, fill: '#f59e0b', color: '#f59e0b' },
      { name: 'Severe', value: 3, fill: '#ef4444', color: '#ef4444' }
    ],
    incidentsBySource: [
      { name: 'Weather Alerts', value: 25, fill: '#3b82f6', color: '#3b82f6' },
      { name: 'Security Feeds', value: 20, fill: '#8b5cf6', color: '#8b5cf6' },
      { name: 'Manual Reports', value: 15, fill: '#06b6d4', color: '#06b6d4' }
    ],
    provincesByAlertLevel: [
      { name: 'Normal', value: 10, fill: '#22c55e', color: '#22c55e' },
      { name: 'Warning', value: 2, fill: '#f59e0b', color: '#f59e0b' },
      { name: 'Severe', value: 1, fill: '#ef4444', color: '#ef4444' }
    ],
    trendsOverTime: []
  };

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user', 'auditor']}
      fallbackMessage="Access to Analytics Dashboard requires Administrator, Power User, or Auditor privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Operational analytics and real-time security metrics for security operations
          </p>
        </div>

        <div className="space-y-6">
          <AnalyticsFilters
            filters={state.filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            onExport={exportData}
            autoRefresh={state.autoRefresh}
            onAutoRefreshToggle={() => updateFilters({ refreshInterval: state.filters.refreshInterval })}
          />
          
          <EnhancedCharts 
            incidentsByAlertLevel={mockChartData.incidentsByAlertLevel}
            incidentsBySource={mockChartData.incidentsBySource}
            provincesByAlertLevel={mockChartData.provincesByAlertLevel}
          />
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default AnalyticsDashboardPage;