
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import EnhancedCharts from '@/components/analytics/EnhancedCharts';
import ExecutiveSummary from '@/components/analytics/ExecutiveSummary';
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
      { name: 'Normal', value: 45, fill: '#22c55e' },
      { name: 'Warning', value: 12, fill: '#f59e0b' },
      { name: 'Severe', value: 3, fill: '#ef4444' }
    ],
    incidentsBySource: [
      { name: 'Weather Alerts', value: 25, fill: '#3b82f6' },
      { name: 'Security Feeds', value: 20, fill: '#8b5cf6' },
      { name: 'Manual Reports', value: 15, fill: '#06b6d4' }
    ],
    provincesByAlertLevel: [
      { name: 'Normal', value: 10, fill: '#22c55e' },
      { name: 'Warning', value: 2, fill: '#f59e0b' },
      { name: 'Severe', value: 1, fill: '#ef4444' }
    ],
    trendsOverTime: []
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Security Analytics</h1>
        <p className="text-muted-foreground">
          Analyze security incidents and trends across your organization
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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

        <TabsContent value="detailed" className="space-y-6">
          <AnalyticsFilters
            filters={state.filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            onExport={exportData}
            autoRefresh={state.autoRefresh}
            onAutoRefreshToggle={() => updateFilters({ refreshInterval: state.filters.refreshInterval })}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Comprehensive breakdown of security metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedCharts 
                incidentsByAlertLevel={mockChartData.incidentsByAlertLevel}
                incidentsBySource={mockChartData.incidentsBySource}
                provincesByAlertLevel={mockChartData.provincesByAlertLevel}
              />
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
