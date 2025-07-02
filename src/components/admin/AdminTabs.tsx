
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OperationsTab from './OperationsTab';
import DataManagementTab from './DataManagementTab';
import SystemHealthTab from './SystemHealthTab';
import SettingsDocumentationTab from './SettingsDocumentationTab';
import SecurityRiskRegisterTab from './SecurityRiskRegisterTab';
import ArchiveManagementTab from './ArchiveManagementTab';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabs = ({ activeTab, onTabChange }: AdminTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="data-management">Data Management</TabsTrigger>
        <TabsTrigger value="system-health">System Health</TabsTrigger>
        <TabsTrigger value="security-risks">Security Risks</TabsTrigger>
        <TabsTrigger value="archive-management">Archive Management</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="operations" className="space-y-4">
        <OperationsTab />
      </TabsContent>
      
      <TabsContent value="data-management" className="space-y-4">
        <DataManagementTab />
      </TabsContent>
      
      <TabsContent value="system-health" className="space-y-4">
        <SystemHealthTab />
      </TabsContent>
      
      <TabsContent value="security-risks" className="space-y-4">
        <SecurityRiskRegisterTab />
      </TabsContent>
      
      <TabsContent value="archive-management" className="space-y-4">
        <ArchiveManagementTab />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <SettingsDocumentationTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
