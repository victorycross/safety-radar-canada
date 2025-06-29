
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
    updateDateRange, 
    updateFilters, 
    clearFilters,
    exportData 
  } = useAnalyticsState();

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
            dateRange={state.dateRange}
            filters={state.filters}
            onDateRangeChange={updateDateRange}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onExport={exportData}
          />
          
          <EnhancedCharts 
            dateRange={state.dateRange}
            filters={state.filters}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <AnalyticsFilters
            dateRange={state.dateRange}
            filters={state.filters}
            onDateRangeChange={updateDateRange}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onExport={exportData}
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
                dateRange={state.dateRange}
                filters={state.filters}
                detailed={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive" className="space-y-6">
          <ExecutiveSummary 
            dateRange={state.dateRange}
            filters={state.filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
