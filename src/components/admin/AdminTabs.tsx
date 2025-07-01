
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyOperationsHub from './DailyOperationsHub';
import DataManagementTab from './DataManagementTab';
import SystemHealthTab from './SystemHealthTab';
import SettingsDocumentationTab from './SettingsDocumentationTab';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="operations">Daily Operations</TabsTrigger>
        <TabsTrigger value="data-management">Data Management</TabsTrigger>
        <TabsTrigger value="system-health">System Health</TabsTrigger>
        <TabsTrigger value="settings">Settings & Docs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="operations" className="space-y-4">
        <DailyOperationsHub />
      </TabsContent>
      
      <TabsContent value="data-management" className="space-y-4">
        <DataManagementTab />
      </TabsContent>

      <TabsContent value="system-health" className="space-y-4">
        <SystemHealthTab />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <SettingsDocumentationTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
