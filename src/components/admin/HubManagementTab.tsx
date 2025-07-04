
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHubData } from '@/hooks/useHubData';
import { useBulkHubOperations } from '@/hooks/useBulkHubOperations';
import { useHubManagementUtils } from '@/hooks/useHubManagementUtils';
import { InternationalHub } from '@/types/dashboard';
import BulkHubOperations from './BulkHubOperations';
import HubBulkActions from './HubBulkActions';
import HubEmployeeManagement from './HubEmployeeManagement';
import HubManagementHeader from './hub-management/HubManagementHeader';
import HubMetricsCards from './hub-management/HubMetricsCards';
import HubOverviewCard from './hub-management/HubOverviewCard';
import RecentHubIncidentsCard from './hub-management/RecentHubIncidentsCard';
import HubNotificationTab from './hub-management/HubNotificationTab';

const HubManagementTab = () => {
  const { hubs, incidents, loading, metrics, refreshData } = useHubData();
  const { performBulkUpdate } = useBulkHubOperations();
  const { getAlertLevelColor, getAlertLevelText } = useHubManagementUtils();
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  const handleBulkUpdate = async (hubIds: string[], updates: Partial<InternationalHub>) => {
    const result = await performBulkUpdate(hubIds, updates);
    if (result.success) {
      refreshData();
    }
  };

  const handleNotificationUpdate = async (hubId: string, settings: any) => {
    // In real implementation, this would save to database
    console.log('Updating notification settings for hub:', hubId, settings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-muted-foreground">Loading hub management...</span>
      </div>
    );
  }

  // Create proper DashboardMetrics object with all required properties
  const hubMetrics = {
    totalProvinces: 0, // Hub management doesn't need province data
    visibleProvincesCount: 0,
    alertProvincesCount: 0,
    incidentsCount: incidents.length,
    employeesCount: hubs.reduce((sum, hub) => sum + hub.employeeCount, 0),
    totalHubs: hubs.length,
    alertHubsCount: hubs.filter(hub => hub.alertLevel !== 'normal').length,
    hubEmployeesCount: hubs.reduce((sum, hub) => sum + hub.employeeCount, 0)
  };

  return (
    <div className="space-y-6">
      <HubManagementHeader onRefresh={refreshData} />
      
      <HubMetricsCards metrics={hubMetrics} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Hub Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <HubOverviewCard
            hubs={hubs}
            selectedHub={selectedHub}
            onHubSelect={setSelectedHub}
            getAlertLevelColor={getAlertLevelColor}
            getAlertLevelText={getAlertLevelText}
          />

          <RecentHubIncidentsCard
            incidents={incidents}
            hubs={hubs}
            getAlertLevelColor={getAlertLevelColor}
            getAlertLevelText={getAlertLevelText}
          />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <HubEmployeeManagement onDataUpdated={refreshData} />
        </TabsContent>

        <TabsContent value="bulk-operations" className="space-y-4">
          <BulkHubOperations
            hubs={hubs}
            onBulkUpdate={handleBulkUpdate}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="bulk-actions" className="space-y-4">
          <HubBulkActions onImportComplete={refreshData} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <HubNotificationTab
            selectedHub={selectedHub}
            hubs={hubs}
            onSettingsUpdate={handleNotificationUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HubManagementTab;
