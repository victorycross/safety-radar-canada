
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from './OverviewTab';
import CommandCenterTab from './CommandCenterTab';
import OperationsTab from './OperationsTab';
import DataSourcesTab from './DataSourcesTab';
import MonitoringTab from './MonitoringTab';
import SystemHealthTab from './SystemHealthTab';
import DocumentationTab from './DocumentationTab';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="command-center">Command Center</TabsTrigger>
        <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="system-health">System Health</TabsTrigger>
        <TabsTrigger value="documentation">Documentation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <OverviewTab />
      </TabsContent>
      
      <TabsContent value="command-center" className="space-y-4">
        <CommandCenterTab />
      </TabsContent>
      
      <TabsContent value="data-sources" className="space-y-4">
        <DataSourcesTab />
      </TabsContent>

      <TabsContent value="operations" className="space-y-4">
        <OperationsTab />
      </TabsContent>

      <TabsContent value="system-health" className="space-y-4">
        <SystemHealthTab />
      </TabsContent>

      <TabsContent value="documentation" className="space-y-4">
        <DocumentationTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
