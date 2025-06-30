
import React from 'react';
import { useSourceManagement } from '@/hooks/useSourceManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SourceOverviewTab from '@/components/source-management/SourceOverviewTab';
import ActiveSourcesTab from '@/components/source-management/ActiveSourcesTab';
import SourceConfigurationTab from '@/components/source-management/SourceConfigurationTab';
import SourceMonitoringTab from '@/components/source-management/SourceMonitoringTab';
import AddSourceTab from '@/components/source-management/AddSourceTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const UnifiedSourceManagementPage = () => {
  const sourceManagement = useSourceManagement();

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Source Management requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Source Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all data sources, configurations, and health metrics
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Sources</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="add">Add Source</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <SourceOverviewTab 
              sources={sourceManagement.sources}
              healthMetrics={sourceManagement.healthMetrics}
              loading={sourceManagement.loading}
              error={sourceManagement.error}
            />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <ActiveSourcesTab />
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <SourceConfigurationTab 
              sources={sourceManagement.sources}
              updateSource={sourceManagement.updateSource}
              loading={sourceManagement.loading}
            />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <SourceMonitoringTab 
              sources={sourceManagement.sources}
              healthMetrics={sourceManagement.healthMetrics}
              getSourceHealth={sourceManagement.getSourceHealth}
              getSourceUptime={sourceManagement.getSourceUptime}
              loading={sourceManagement.loading}
            />
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <AddSourceTab />
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
};

export default UnifiedSourceManagementPage;
