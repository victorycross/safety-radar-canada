
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import EnhancedCharts from '@/components/analytics/EnhancedCharts';
import ExecutiveSummary from '@/components/analytics/ExecutiveSummary';
import SecurityRiskRegisterTab from '@/components/admin/SecurityRiskRegisterTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useAnalyticsState } from '@/hooks/useAnalyticsState';
import { AnalyticsChartData } from '@/types/analytics';

const AnalyticsPage = () => {
  const { 
    state, 
    updateFilters, 
    resetFilters,
    exportData 
  } = useAnalyticsState();

  // Mock data for now - will be replaced with real data in Phase 3
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
      fallbackMessage="Access to Analytics & Reporting requires Administrator, Power User, or Auditor privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics, risk assessment, and reporting tools for security operations
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Security Analytics</TabsTrigger>
            <TabsTrigger value="risk-register">Risk Register</TabsTrigger>
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="reporting">Reporting Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="risk-register" className="space-y-6">
            <SecurityRiskRegisterTab />
          </TabsContent>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveSummary 
              totalIncidents={60}
              affectedProvinces={13}
              latestIncident="Security alert in Ontario"
              incidentsByAlertLevel={mockChartData.incidentsByAlertLevel}
              provinces={[]}
            />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporting Tools</CardTitle>
                <CardDescription>
                  Advanced reporting and export capabilities for comprehensive analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Advanced reporting tools will be available in a future update.</p>
                  <p className="text-sm mt-2">Features in development: Custom reports, automated scheduling, and advanced export options.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
};

export default AnalyticsPage;
