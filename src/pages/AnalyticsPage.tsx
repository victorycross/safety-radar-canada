
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import EnhancedCharts from '@/components/analytics/EnhancedCharts';
import ExecutiveSummary from '@/components/analytics/ExecutiveSummary';
import { useAnalyticsState } from '@/hooks/useAnalyticsState';

const AnalyticsPage = () => {
  const { 
    state, 
    updateFilters, 
    resetFilters,
    exportData 
  } = useAnalyticsState();

  // Helper function to update date range
  const updateDateRange = (dateRange: { from: Date; to: Date }) => {
    updateFilters({ dateRange });
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
            incidentsByAlertLevel={[]}
            incidentsBySource={[]}
            provincesByAlertLevel={[]}
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
                incidentsByAlertLevel={[]}
                incidentsBySource={[]}
                provincesByAlertLevel={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive" className="space-y-6">
          <ExecutiveSummary 
            totalIncidents={0}
            affectedProvinces={0}
            latestIncident=""
            incidentsByAlertLevel={[]}
            provinces={[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
